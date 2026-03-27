#!/usr/bin/env bash
#
# auto-scan-pipeline.sh -- Automated ATR scan pipeline
#
# Runs the full flywheel: crawl registry -> audit packages -> extract findings -> push to TC
#
# Usage:
#   ./scripts/auto-scan-pipeline.sh [OPTIONS]
#
# Options:
#   --batch-size N    Number of packages to scan per run (default: 200)
#   --push-tc         Push findings to Threat Cloud
#   --tc-url URL      Threat Cloud URL (default: http://localhost:8234)
#   --dry-run         Show what would happen without executing scans
#   --reset           Reset state file and start fresh
#   -h, --help        Show this help message
#
# State:
#   Tracks progress in scan-state.json at the repo root. Safe to re-run;
#   already-scanned packages are skipped automatically.
#
# Examples:
#   # First scan: 200 packages
#   ./scripts/auto-scan-pipeline.sh --batch-size 200
#
#   # Continue scanning next 200
#   ./scripts/auto-scan-pipeline.sh --batch-size 200
#
#   # Scan and push to Threat Cloud
#   ./scripts/auto-scan-pipeline.sh --batch-size 100 --push-tc
#
#   # Preview what would happen
#   ./scripts/auto-scan-pipeline.sh --dry-run
#

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STATE_FILE="$REPO_ROOT/scan-state.json"
MERGED_FILE="$REPO_ROOT/audit-pipeline-merged.json"
REGISTRY_FILE="$REPO_ROOT/mcp-registry.json"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

BATCH_SIZE=200
PUSH_TC=false
TC_URL="http://localhost:8234"
DRY_RUN=false
RESET=false

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case "$1" in
    --batch-size)
      BATCH_SIZE="$2"
      shift 2
      ;;
    --push-tc)
      PUSH_TC=true
      shift
      ;;
    --tc-url)
      TC_URL="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --reset)
      RESET=true
      shift
      ;;
    -h|--help)
      head -35 "$0" | tail -33
      exit 0
      ;;
    *)
      echo "ERROR: Unknown option: $1"
      echo "Run with --help for usage."
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Validate TC_URL (prevent SSRF)
# ---------------------------------------------------------------------------

if [[ "$PUSH_TC" == "true" ]]; then
  if ! [[ "$TC_URL" =~ ^https?://[a-zA-Z0-9._-]+(:[0-9]+)?(/.*)?$ ]]; then
    echo "FATAL: Invalid TC_URL: $TC_URL" >&2
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------

log()  { echo "[$(date +%H:%M:%S)] $*"; }
warn() { echo "[$(date +%H:%M:%S)] WARNING: $*" >&2; }
die()  { echo "[$(date +%H:%M:%S)] FATAL: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# State management
# ---------------------------------------------------------------------------

init_state() {
  if [[ "$RESET" == "true" ]] && [[ -f "$STATE_FILE" ]]; then
    log "Resetting state file."
    rm -f "$STATE_FILE"
  fi

  if [[ ! -f "$STATE_FILE" ]]; then
    cat > "$STATE_FILE" <<'STATEJSON'
{
  "last_scan_date": null,
  "total_scanned": 0,
  "total_threats_found": 0,
  "total_proposals_submitted": 0,
  "last_output_file": null,
  "scan_history": []
}
STATEJSON
    log "Created new state file: $STATE_FILE"
  fi
}

read_state_field() {
  local field="$1"
  # Simple JSON field extraction without jq dependency
  if command -v jq &>/dev/null; then
    jq -r ".$field // empty" "$STATE_FILE" 2>/dev/null || echo ""
  else
    # Fallback: basic grep/sed extraction for simple fields
    grep "\"$field\"" "$STATE_FILE" | sed 's/.*: *"\{0,1\}\([^",}]*\)"\{0,1\}.*/\1/' | head -1
  fi
}

update_state() {
  local scan_date="$1"
  local scanned="$2"
  local threats="$3"
  local proposals="$4"
  local output_file="$5"

  local prev_total
  local prev_threats
  local prev_proposals
  prev_total="$(read_state_field total_scanned)"
  prev_threats="$(read_state_field total_threats_found)"
  prev_proposals="$(read_state_field total_proposals_submitted)"

  # Default to 0 if empty
  prev_total="${prev_total:-0}"
  prev_threats="${prev_threats:-0}"
  prev_proposals="${prev_proposals:-0}"

  local new_total=$((prev_total + scanned))
  local new_threats=$((prev_threats + threats))
  local new_proposals=$((prev_proposals + proposals))

  # Read existing history (keep last 20 entries)
  local history_entry="{\"date\":\"$scan_date\",\"scanned\":$scanned,\"threats\":$threats,\"proposals\":$proposals,\"output\":\"$output_file\"}"

  if command -v jq &>/dev/null; then
    jq --arg date "$scan_date" \
       --argjson scanned "$new_total" \
       --argjson threats "$new_threats" \
       --argjson proposals "$new_proposals" \
       --arg output "$output_file" \
       --argjson entry "$history_entry" \
       '.last_scan_date = $date |
        .total_scanned = $scanned |
        .total_threats_found = $threats |
        .total_proposals_submitted = $proposals |
        .last_output_file = $output |
        .scan_history = (.scan_history + [$entry] | .[-20:])' \
       "$STATE_FILE" > "${STATE_FILE}.tmp" && mv "${STATE_FILE}.tmp" "$STATE_FILE"
  else
    # Minimal update without jq
    cat > "$STATE_FILE" <<STATEJSON
{
  "last_scan_date": "$scan_date",
  "total_scanned": $new_total,
  "total_threats_found": $new_threats,
  "total_proposals_submitted": $new_proposals,
  "last_output_file": "$output_file",
  "scan_history": [$history_entry]
}
STATEJSON
  fi
}

# ---------------------------------------------------------------------------
# Merge results
# ---------------------------------------------------------------------------

merge_results() {
  local new_file="$1"

  if [[ ! -f "$MERGED_FILE" ]]; then
    cp "$new_file" "$MERGED_FILE"
    log "Created merged file: $MERGED_FILE"
    return
  fi

  if ! command -v jq &>/dev/null; then
    warn "jq not installed. Skipping merge -- results saved only in $new_file"
    return
  fi

  # Merge: add new results, deduplicate by package name (keep latest)
  jq -s '
    {
      auditedAt: now | todate,
      total: ([.[].results[]] | unique_by(.package) | length),
      results: ([.[].results[]] | group_by(.package) | map(sort_by(.auditedAt) | last))
    }
  ' "$MERGED_FILE" "$new_file" > "${MERGED_FILE}.tmp" && mv "${MERGED_FILE}.tmp" "$MERGED_FILE"

  log "Merged results into: $MERGED_FILE"
}

# ---------------------------------------------------------------------------
# Extract findings summary
# ---------------------------------------------------------------------------

extract_findings() {
  local results_file="$1"
  local threats_found=0
  local critical_count=0
  local high_count=0

  if command -v jq &>/dev/null; then
    threats_found="$(jq '[.results[] | select(.riskLevel == "CRITICAL" or .riskLevel == "HIGH")] | length' "$results_file" 2>/dev/null || echo 0)"
    critical_count="$(jq '[.results[] | select(.riskLevel == "CRITICAL")] | length' "$results_file" 2>/dev/null || echo 0)"
    high_count="$(jq '[.results[] | select(.riskLevel == "HIGH")] | length' "$results_file" 2>/dev/null || echo 0)"

    if [[ "$threats_found" -gt 0 ]]; then
      log ""
      log "CRITICAL/HIGH findings:"
      jq -r '.results[] | select(.riskLevel == "CRITICAL" or .riskLevel == "HIGH") | "  [\(.riskLevel)] \(.package) v\(.version) (score: \(.riskScore)) -- \(.genuineThreats | join("; "))"' "$results_file" 2>/dev/null || true
    fi
  else
    # Rough count without jq
    threats_found="$(grep -c '"riskLevel": "CRITICAL"\|"riskLevel": "HIGH"' "$results_file" 2>/dev/null || echo 0)"
  fi

  echo "$threats_found"
}

# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

main() {
  log "============================================"
  log "ATR Auto-Scan Pipeline"
  log "============================================"
  log "Repo:       $REPO_ROOT"
  log "Batch size: $BATCH_SIZE"
  log "Push to TC: $PUSH_TC"
  log "TC URL:     ${TC_URL%%@*}"
  log "Dry run:    $DRY_RUN"
  log ""

  cd "$REPO_ROOT"

  # Initialize state
  init_state

  local prev_total
  prev_total="$(read_state_field total_scanned)"
  prev_total="${prev_total:-0}"
  log "Previously scanned: $prev_total packages"

  # -----------------------------------------------------------------------
  # Step 1: Update MCP registry
  # -----------------------------------------------------------------------
  log ""
  log "[Step 1/5] Updating MCP registry..."

  if [[ "$DRY_RUN" == "true" ]]; then
    log "  [DRY-RUN] Would run: npx tsx scripts/crawl-mcp-registry.ts"
  else
    if npx tsx scripts/crawl-mcp-registry.ts 2>&1 | tail -5; then
      log "  Registry updated: $REGISTRY_FILE"
    else
      warn "Registry crawl failed. Using existing registry if available."
    fi
  fi

  if [[ ! -f "$REGISTRY_FILE" ]] && [[ "$DRY_RUN" == "false" ]]; then
    die "No registry file found at $REGISTRY_FILE. Cannot proceed."
  fi

  # -----------------------------------------------------------------------
  # Step 2: Audit new packages
  # -----------------------------------------------------------------------
  local output_file="$REPO_ROOT/audit-pipeline-${TIMESTAMP}.json"
  local skip_arg=""

  if [[ -f "$MERGED_FILE" ]]; then
    skip_arg="--skip-scanned $MERGED_FILE"
  fi

  log ""
  log "[Step 2/5] Auditing packages (batch=$BATCH_SIZE, skip previously scanned)..."

  if [[ "$DRY_RUN" == "true" ]]; then
    log "  [DRY-RUN] Would run: npx tsx scripts/audit-npm-skills-v2.ts --limit $BATCH_SIZE $skip_arg --output $output_file"

    # For dry-run summary, count how many would be scanned
    if command -v jq &>/dev/null && [[ -f "$REGISTRY_FILE" ]]; then
      local registry_total
      registry_total="$(jq '.entries | map(select(.npmPackage)) | length' "$REGISTRY_FILE" 2>/dev/null || echo "?")"
      local already_scanned=0
      if [[ -f "$MERGED_FILE" ]]; then
        already_scanned="$(jq '.results | length' "$MERGED_FILE" 2>/dev/null || echo 0)"
      fi
      local remaining=$((registry_total - already_scanned))
      if [[ "$remaining" -lt 0 ]]; then remaining=0; fi
      local would_scan=$BATCH_SIZE
      if [[ "$remaining" -lt "$would_scan" ]]; then would_scan=$remaining; fi
      log "  Registry has $registry_total npm packages, $already_scanned already scanned, $remaining remaining."
      log "  Would scan: $would_scan packages."
    fi
  else
    # shellcheck disable=SC2086
    if npx tsx scripts/audit-npm-skills-v2.ts \
        --limit "$BATCH_SIZE" \
        $skip_arg \
        --output "$output_file" 2>&1; then
      log "  Audit complete: $output_file"
    else
      warn "Audit script failed. Continuing with any partial results."
    fi
  fi

  # -----------------------------------------------------------------------
  # Step 3: Extract findings
  # -----------------------------------------------------------------------
  log ""
  log "[Step 3/5] Extracting findings..."

  local threats_found=0
  local packages_scanned=0

  if [[ "$DRY_RUN" == "true" ]]; then
    log "  [DRY-RUN] Would extract CRITICAL/HIGH findings from $output_file"
  else
    if [[ -f "$output_file" ]]; then
      if command -v jq &>/dev/null; then
        packages_scanned="$(jq '.total // (.results | length)' "$output_file" 2>/dev/null || echo 0)"
      else
        packages_scanned="$(grep -c '"package"' "$output_file" 2>/dev/null || echo 0)"
      fi
      threats_found="$(extract_findings "$output_file")"
      log "  Packages scanned: $packages_scanned"
      log "  Threats found (CRITICAL+HIGH): $threats_found"

      # Merge with previous results
      merge_results "$output_file"
    else
      warn "No output file produced. Audit may have scanned 0 new packages."
    fi
  fi

  # -----------------------------------------------------------------------
  # Step 3.5: Triage findings (separate report from ATR candidates)
  # -----------------------------------------------------------------------
  local triage_file="$REPO_ROOT/triage-report-${TIMESTAMP}.json"

  log ""
  log "[Step 3.5] Triaging findings..."

  if [[ "$DRY_RUN" == "true" ]]; then
    log "  [DRY-RUN] Would run: npx tsx scripts/triage-findings.ts --input $MERGED_FILE --output $triage_file"
  else
    if [[ -f "$MERGED_FILE" ]]; then
      if npx tsx scripts/triage-findings.ts \
          --input "$MERGED_FILE" \
          --output "$triage_file" 2>&1; then
        log "  Triage complete: $triage_file"
      else
        warn "Triage failed. Continuing with original pipeline."
      fi
    fi
  fi

  # -----------------------------------------------------------------------
  # Step 4: Push to Threat Cloud (optional)
  # -----------------------------------------------------------------------
  local proposals_submitted=0

  log ""
  log "[Step 4/5] Threat Cloud integration..."

  if [[ "$PUSH_TC" == "true" ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      log "  [DRY-RUN] Would run: npx tsx scripts/push-to-threat-cloud.ts --input $output_file --tc-url $TC_URL --auto-propose --triage $triage_file --dry-run"
    else
      if [[ -f "$output_file" ]] && [[ "$threats_found" -gt 0 || "$packages_scanned" -gt 0 ]]; then
        log "  Pushing findings to Threat Cloud at $TC_URL..."
        local triage_arg=""
        if [[ -f "$triage_file" ]]; then
          triage_arg="--triage $triage_file"
        fi
        # shellcheck disable=SC2086
        if npx tsx scripts/push-to-threat-cloud.ts \
            --input "$output_file" \
            --tc-url "$TC_URL" \
            --auto-propose \
            $triage_arg 2>&1; then
          log "  Push complete."
          # Count proposals (rough estimate from output)
          proposals_submitted=1
        else
          warn "Push to Threat Cloud failed. Findings are still saved locally."
        fi
      else
        log "  Nothing to push (no new results or no threats)."
      fi
    fi
  else
    log "  Skipped (use --push-tc to enable)."
  fi

  # -----------------------------------------------------------------------
  # Step 5: Report scan event to TC for metrics
  # -----------------------------------------------------------------------
  log ""
  log "[Step 5/5] Reporting scan event..."

  if [[ "$PUSH_TC" == "true" ]] && [[ "$DRY_RUN" == "false" ]] && [[ "$packages_scanned" -gt 0 ]]; then
    local confirmed=0 suspicious=0 general=0 clean_count=0
    if command -v jq &>/dev/null && [[ -f "$triage_file" ]]; then
      confirmed="$(jq '.summary.confirmed_malicious // 0' "$triage_file" 2>/dev/null || echo 0)"
      suspicious="$(jq '.summary.highly_suspicious // 0' "$triage_file" 2>/dev/null || echo 0)"
      general="$(jq '.summary.general_suspicious // 0' "$triage_file" 2>/dev/null || echo 0)"
      clean_count="$(jq '.summary.clean // 0' "$triage_file" 2>/dev/null || echo 0)"
    fi

    curl -s -X POST "${TC_URL}/api/scan-events" \
      -H "Content-Type: application/json" \
      -d "{\"source\":\"bulk-pipeline\",\"skillsScanned\":$packages_scanned,\"findingsCount\":$threats_found,\"confirmedMalicious\":$confirmed,\"highlySuspicious\":$suspicious,\"generalSuspicious\":$general,\"cleanCount\":$clean_count}" \
      > /dev/null 2>&1 || warn "Failed to report scan event to TC."
    log "  Scan event reported."
  else
    log "  Skipped."
  fi

  # -----------------------------------------------------------------------
  # Update state
  # -----------------------------------------------------------------------
  if [[ "$DRY_RUN" == "false" ]] && [[ "$packages_scanned" -gt 0 ]]; then
    update_state "$TIMESTAMP" "$packages_scanned" "$threats_found" "$proposals_submitted" "$output_file"
    log ""
    log "State updated: $STATE_FILE"
  fi

  # -----------------------------------------------------------------------
  # Summary
  # -----------------------------------------------------------------------
  log ""
  log "============================================"
  log "PIPELINE SUMMARY"
  log "============================================"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "  Mode:       DRY RUN (no changes made)"
  else
    log "  Mode:       LIVE"
  fi

  log "  Batch size: $BATCH_SIZE"
  log "  Scanned:    $packages_scanned packages"
  log "  Threats:    $threats_found (CRITICAL + HIGH)"
  log "  TC push:    $PUSH_TC"
  log "  Proposals:  $proposals_submitted"

  if [[ "$DRY_RUN" == "false" ]]; then
    local cumulative_total
    cumulative_total="$(read_state_field total_scanned)"
    cumulative_total="${cumulative_total:-0}"
    log ""
    log "  Cumulative: $cumulative_total packages scanned across all runs"

    if [[ -f "$output_file" ]]; then
      log "  Output:     $output_file"
    fi
    log "  Merged:     $MERGED_FILE"
  fi

  log ""
  log "Done."
}

main "$@"
