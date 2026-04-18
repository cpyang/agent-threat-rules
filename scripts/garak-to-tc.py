#!/usr/bin/env python3
"""
garak-to-tc.py — feed NVIDIA garak red-team findings into ATR Threat Cloud

Turns garak eval artefacts into ATR proposals on tc.panguard.ai. Every attack
prompt that garak confirmed bypassed a target model (either via garak's native
JSONL report or the ATR-style missed_samples format already produced by
`scripts/eval-garak.sh`) becomes a pending proposal on TC. The TC
crystallisation loop then LLM-drafts a regex-based detection rule from the
evidence; the 24h canary + safety gate + auto-merge pipeline ships it to
npm `agent-threat-rules` without further human touch.

Accepted input shapes
---------------------
1. garak native report (JSONL): one JSON object per line, `entry_type` in
   {"config","init","attempt","eval","end"}. We filter to attempts where at
   least one detector fired, i.e. the target model failed the probe.

2. ATR eval report (JSON, produced by scripts/eval-garak.sh): top-level
   dict with `missed_samples` (list of prompt strings that ATR did NOT
   detect but garak flagged as malicious). These are the highest-signal
   candidates — garak says malicious, ATR has no pattern yet, perfect
   crystallisation input.

Proposal shape sent to /api/atr-proposals
-----------------------------------------
    patternHash:     sha256(prompt text)[:16] — stable, de-dupes repeat runs
    ruleContent:     draft YAML stub carrying the attack payload + metadata
                     for the TC crystallisation LLM to expand into a real rule
    llmProvider:     "garak"
    llmModel:        "{garak_version}-via-{script_version}"
    selfReviewVerdict: JSON blob identifying NVIDIA AIRT as the red-team
                     source; crystallisation prompt lifts this for provenance

Usage
-----
    # Native garak JSONL
    python garak-to-tc.py \\
        --input garak-report.jsonl \\
        --tc-url https://tc.panguard.ai \\
        --key "$ATR_PARTNER_KEY"

    # ATR-style missed_samples JSON (from scripts/eval-garak.sh)
    python garak-to-tc.py \\
        --input data/garak-benchmark/garak-eval-report.json \\
        --tc-url https://tc.panguard.ai \\
        --key "$ATR_PARTNER_KEY" \\
        --dry-run

    # Tag provenance — shows up on every resulting ATR rule
    python garak-to-tc.py \\
        --input garak-report.jsonl \\
        --partner-name "nvidia-airt" \\
        --target-model "claude-3-7-sonnet" \\
        ...

MIT licensed. No side effects other than HTTPS POSTs to the TC URL provided.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator

SCRIPT_VERSION = "0.1.0"


@dataclass(frozen=True)
class GarakFinding:
    """Single garak probe/prompt that indicates a real attack vector."""
    prompt: str
    detector: str  # e.g. "dan.DAN", "promptinject.HijackHateHumans", or "atr:missed"
    probe: str     # e.g. "promptinject.HijackHateHumans", or "atr:missed-sample"
    severity: str  # "critical" | "high" | "medium" | "low"
    target_model: str
    evidence: dict[str, Any]  # free-form extra context for the crystallisation LLM


# ---------------------------------------------------------------------------
# Input parsers: native garak JSONL + ATR eval JSON
# ---------------------------------------------------------------------------

def iter_atr_missed_samples(
    report: dict[str, Any], target_model: str
) -> Iterator[GarakFinding]:
    """
    Pull high-signal candidates from an ATR eval report (format produced by
    scripts/eval-garak.sh). missed_samples are prompts garak flagged malicious
    but ATR failed to detect — those are exactly the rules we want crystallised.
    """
    missed = report.get("missed_samples") or []
    benchmark = report.get("benchmark", "unknown-garak-benchmark")
    source = report.get("source", "")

    for sample in missed:
        prompt = sample if isinstance(sample, str) else sample.get("prompt", "")
        if not prompt:
            continue
        yield GarakFinding(
            prompt=prompt,
            detector="atr:missed",
            probe="atr:missed-sample",
            severity="high",  # ATR missed + garak-flagged malicious = strong signal
            target_model=target_model,
            evidence={
                "source_file": source,
                "benchmark": benchmark,
                "why": "garak considered this prompt malicious; ATR had no detection pattern",
            },
        )


def iter_garak_native(
    lines: Iterator[str], target_model: str
) -> Iterator[GarakFinding]:
    """
    Parse a native garak report.jsonl. Yields one GarakFinding per attempt
    where at least one detector fired (i.e. the model failed the probe).
    """
    model_name = target_model or "unknown-model"
    for raw in lines:
        raw = raw.strip()
        if not raw:
            continue
        try:
            entry = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if not isinstance(entry, dict):
            continue

        entry_type = entry.get("entry_type") or entry.get("entry", "")

        # Capture the target model name from garak's config/init records for
        # later attempt records that don't carry it directly.
        if entry_type in ("config", "init"):
            for key in ("model_name", "target_model", "model"):
                v = entry.get(key)
                if isinstance(v, str) and v:
                    model_name = v
                    break

        if entry_type != "attempt":
            continue

        prompt = entry.get("prompt") or entry.get("notes", {}).get("prompt")
        if not isinstance(prompt, str) or not prompt:
            continue

        # garak detector_results: dict of detector_name -> list[float] (per
        # response variant). Any score > 0.5 means that detector fired.
        det_results = entry.get("detector_results") or {}
        failing: list[str] = []
        for det_name, scores in det_results.items():
            if not isinstance(scores, list):
                continue
            if any(isinstance(s, (int, float)) and s > 0.5 for s in scores):
                failing.append(det_name)

        if not failing:
            continue

        probe = entry.get("probe_classname") or entry.get("probe") or "unknown-probe"
        yield GarakFinding(
            prompt=prompt,
            detector=",".join(failing[:3]),
            probe=str(probe),
            severity=_severity_from_probe(str(probe)),
            target_model=model_name,
            evidence={
                "failing_detectors": failing,
                "generations": (entry.get("outputs") or entry.get("generations") or [])[:1],
                "attempt_uuid": entry.get("uuid") or entry.get("seq"),
            },
        )


def _severity_from_probe(probe: str) -> str:
    """
    Map garak probe classnames to ATR severity. Heuristic, conservative.
    Anything with data-exfil / encoding / privilege / malware is critical;
    classic jailbreak / dan → high; others default to medium.
    """
    p = probe.lower()
    if any(k in p for k in ("exfil", "leak", "privilege", "malware", "exploit")):
        return "critical"
    if any(k in p for k in ("jailbreak", "dan", "hijack", "inject", "override")):
        return "high"
    if any(k in p for k in ("toxicity", "bias", "misinfo")):
        return "medium"
    return "medium"


# ---------------------------------------------------------------------------
# Proposal construction
# ---------------------------------------------------------------------------

DRAFT_TEMPLATE = """\
title: "Red-Team: {title}"
id: ATR-GARAK-DRAFT-{pattern_hash_short}
status: draft
description: |
  Auto-generated from NVIDIA garak red-team finding. Target model: {target_model}.
  garak probe: {probe}, detectors fired: {detector}.
  This payload bypassed {target_model} defences; ATR needs a regex pattern to
  detect such inputs at tool/skill boundaries.
author: "{partner_name} (via garak v{garak_version})"
date: "{date}"
schema_version: "0.1"
detection_tier: pattern
maturity: experimental
severity: {severity}
tags:
  category: prompt-injection
  subcategory: red-team-garak
  confidence: medium
  source: garak-airt
metadata_provenance:
  garak_probe: {probe}
  garak_detector: {detector}
  target_model: {target_model}
  nvidia_airt: red-team-automated
detection:
  conditions:
    # Raw attack payload below. Crystallisation LLM will turn this into a
    # generalised regex that survives simple paraphrase.
    - field: content
      operator: literal
      value: |
        {prompt_truncated}
  condition: any
response:
  actions: [alert, snapshot]
"""


def build_proposal(
    finding: GarakFinding,
    partner_name: str,
    garak_version: str,
) -> dict[str, str]:
    """Turn a GarakFinding into the payload POST /api/atr-proposals expects."""
    import datetime as _dt

    prompt_bytes = finding.prompt.encode("utf-8")
    pattern_hash = hashlib.sha256(prompt_bytes).hexdigest()[:16]

    # Keep the draft rule content bounded — crystallisation reads this as
    # evidence and the full prompt is also provided via selfReviewVerdict.
    prompt_truncated = finding.prompt[:500].replace("\n", " ")
    title = finding.probe.split(".")[-1][:60] or "garak-finding"

    rule_content = DRAFT_TEMPLATE.format(
        title=title,
        pattern_hash_short=pattern_hash[:8],
        target_model=finding.target_model or "unknown",
        probe=finding.probe,
        detector=finding.detector,
        partner_name=partner_name,
        garak_version=garak_version,
        date=_dt.datetime.now(_dt.timezone.utc).strftime("%Y/%m/%d"),
        severity=finding.severity,
        prompt_truncated=prompt_truncated,
    )

    self_review = json.dumps(
        {
            "source": "garak-airt",
            "partner": partner_name,
            "garak_probe": finding.probe,
            "garak_detector": finding.detector,
            "target_model": finding.target_model,
            "evidence": finding.evidence,
            "full_prompt": finding.prompt,  # crystallisation LLM reads this
            "script_version": SCRIPT_VERSION,
        },
        ensure_ascii=False,
    )

    return {
        "patternHash": pattern_hash,
        "ruleContent": rule_content,
        "llmProvider": "garak",
        "llmModel": f"garak-{garak_version}-via-garak-to-tc-{SCRIPT_VERSION}",
        "selfReviewVerdict": self_review,
    }


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def post_proposal(
    tc_url: str,
    key: str,
    payload: dict[str, str],
    timeout: float = 15.0,
) -> tuple[int, str]:
    """POST a single proposal. Returns (status_code, body_snippet)."""
    req = urllib.request.Request(
        f"{tc_url.rstrip('/')}/api/atr-proposals",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
            "User-Agent": f"garak-to-tc/{SCRIPT_VERSION}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            return resp.status, body[:300]
    except urllib.error.HTTPError as e:
        return e.code, (e.read().decode("utf-8", errors="replace")[:300])
    except Exception as e:  # noqa: BLE001 — surface network errors as 599
        return 599, f"{type(e).__name__}: {e}"


def post_drafter(
    tc_url: str,
    key: str,
    finding: GarakFinding,
    partner_name: str,
    timeout: float = 120.0,
) -> tuple[int, dict]:
    """
    POST to /api/atr-proposals/from-payload — the TC drafter endpoint.
    Server-side runs the tool-use LLM drafter that generates a full ATR YAML
    rule from the raw attack payload, then inserts it into atr_proposals.

    The drafter uses a multi-round tool-use loop (grep_existing_rules for
    dedup + fetch_research for grounding + write YAML) so latency per call
    is typically 30-60s. Caller should pass a generous timeout.

    Returns (status_code, parsed_body).
    """
    body = {
        "payload": finding.prompt,
        "probe": finding.probe,
        "detector": finding.detector,
        "targetModel": finding.target_model,
        "partnerName": partner_name,
        "severity": finding.severity,
    }
    req = urllib.request.Request(
        f"{tc_url.rstrip('/')}/api/atr-proposals/from-payload",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
            "User-Agent": f"garak-to-tc/{SCRIPT_VERSION}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                return resp.status, json.loads(raw)
            except json.JSONDecodeError:
                return resp.status, {"raw": raw[:500]}
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, {"raw": raw[:500]}
    except Exception as e:  # noqa: BLE001
        return 599, {"error": f"{type(e).__name__}: {e}"}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Feed garak red-team findings into ATR Threat Cloud"
    )
    ap.add_argument("--input", required=True, help="garak report.jsonl OR ATR eval .json")
    ap.add_argument(
        "--tc-url", default="https://tc.panguard.ai", help="TC base URL"
    )
    # Key is env-only — never accepted as CLI arg. CLI args are visible in
    # `ps -ef` / /proc/PID/cmdline / process audit logs, so accepting a
    # long-lived bearer token there is a leak surface. Use $ATR_PARTNER_KEY
    # (or $TC_ADMIN_API_KEY for admin mode). Scripts that pipe this command
    # through `railway run` get the env injected automatically.
    ap.add_argument(
        "--partner-name",
        default="nvidia-airt",
        help="Shows up as rule author + provenance.partner in every proposal",
    )
    ap.add_argument(
        "--target-model",
        default="",
        help="Target model probed. For ATR-style input only; native garak picks it up from config record.",
    )
    ap.add_argument(
        "--garak-version",
        default=os.environ.get("GARAK_VERSION", "unknown"),
        help="Garak version string to stamp on proposals",
    )
    ap.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Cap total proposals submitted (0 = no cap). Useful for dry-run sampling.",
    )
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be POSTed; do not contact TC",
    )
    ap.add_argument(
        "--rate-delay-ms",
        type=int,
        default=100,
        help="Sleep between POSTs to stay under TC rate limit",
    )
    ap.add_argument(
        "--mode",
        choices=["drafter", "proposal"],
        default="drafter",
        help=(
            "drafter (default): POST raw payload to /api/atr-proposals/from-payload, "
            "server-side LLM drafts a full ATR YAML rule. Needs admin/static key. "
            "proposal (legacy): POST a client-built literal draft to /api/atr-proposals. "
            "Fast but produces low-quality rules that the LLM reviewer typically rejects."
        ),
    )
    ap.add_argument(
        "--drafter-timeout",
        type=int,
        default=120,
        help="Per-request timeout for drafter mode (tool-use loop takes ~30-60s)",
    )

    args = ap.parse_args()

    path = Path(args.input).expanduser()
    if not path.exists():
        print(f"error: input not found: {path}", file=sys.stderr)
        return 2

    # Auto-detect shape: JSON dict with "missed_samples" vs JSONL
    text = path.read_text(encoding="utf-8", errors="replace")
    findings: Iterator[GarakFinding]
    shape: str
    if text.lstrip().startswith("{") and '"missed_samples"' in text:
        try:
            report = json.loads(text)
        except json.JSONDecodeError as e:
            print(f"error: cannot parse ATR-style report: {e}", file=sys.stderr)
            return 2
        shape = "atr-missed_samples"
        findings = iter_atr_missed_samples(
            report, target_model=args.target_model or "unspecified"
        )
    else:
        shape = "garak-jsonl"
        findings = iter_garak_native(
            iter(text.splitlines()), target_model=args.target_model
        )

    print(
        f"[garak-to-tc] input={path} shape={shape} partner={args.partner_name} "
        f"tc={args.tc_url} dry_run={args.dry_run}",
        file=sys.stderr,
    )

    # Key lives in env only — never a CLI arg (process-list leak avoidance).
    key = (
        os.environ.get("ATR_PARTNER_KEY")
        or os.environ.get("TC_ADMIN_API_KEY")
        or ""
    )
    if not args.dry_run and not key:
        print(
            "error: set $ATR_PARTNER_KEY or $TC_ADMIN_API_KEY in env unless --dry-run",
            file=sys.stderr,
        )
        return 2

    submitted = 0
    drafted = 0
    declined = 0
    errors = 0
    seen_prompts: set[str] = set()

    for finding in findings:
        if args.limit and submitted >= args.limit:
            break

        dedup_key = hashlib.sha256(finding.prompt.encode("utf-8")).hexdigest()[:16]
        if dedup_key in seen_prompts:
            continue
        seen_prompts.add(dedup_key)

        if args.dry_run:
            print(
                f"[dry-run] mode={args.mode} dedup={dedup_key} probe={finding.probe} "
                f"severity={finding.severity} prompt={finding.prompt[:80]!r}"
            )
            submitted += 1
            continue

        if args.mode == "drafter":
            status, resp = post_drafter(
                args.tc_url,
                key,
                finding,
                args.partner_name,
                timeout=args.drafter_timeout,
            )
            submitted += 1
            data = resp.get("data") if isinstance(resp, dict) else None
            if status in (200, 201) and isinstance(data, dict):
                if data.get("drafted"):
                    drafted += 1
                    print(
                        f"  drafted: patternHash={data.get('patternHash')} "
                        f"toolCalls={data.get('toolCalls')} probe={finding.probe}"
                    )
                else:
                    declined += 1
                    print(
                        f"  declined: dedup={dedup_key} probe={finding.probe} "
                        f"reason={str(data.get('reason', ''))[:100]}"
                    )
            else:
                errors += 1
                err_msg = (
                    resp.get("error") if isinstance(resp, dict) else str(resp)[:200]
                )
                print(
                    f"  error: status={status} err={err_msg!r} probe={finding.probe}",
                    file=sys.stderr,
                )
        else:  # legacy proposal mode
            payload = build_proposal(finding, args.partner_name, args.garak_version)
            h = payload["patternHash"]
            status, body = post_proposal(args.tc_url, key, payload)
            submitted += 1
            if status in (200, 201):
                drafted += 1
            elif status == 409 or (isinstance(body, str) and "duplicate" in body.lower()):
                declined += 1
            else:
                errors += 1
                print(
                    f"  error: patternHash={h} status={status} body={body[:120]!r}",
                    file=sys.stderr,
                )

        if args.rate_delay_ms > 0:
            time.sleep(args.rate_delay_ms / 1000.0)

    print(
        f"\n[garak-to-tc] mode={args.mode} submitted={submitted} "
        f"drafted={drafted} declined={declined} errors={errors}"
    )
    return 0 if errors == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
