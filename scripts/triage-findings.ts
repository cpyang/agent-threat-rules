#!/usr/bin/env npx tsx
/**
 * Triage scan findings into actionable categories.
 *
 * Separates "scan report" (content/metrics) from "ATR rule generation" (security).
 * Only confirmed malicious patterns become ATR proposals.
 * Everything else contributes to metrics and content.
 *
 * Usage:
 *   npx tsx scripts/triage-findings.ts --input audit-v2-merged.json [--output triage-report.json]
 *
 * Categories:
 *   confirmed_malicious  -> Auto-propose ATR rule (experimental)
 *   highly_suspicious    -> Submit to TC as draft, needs 3+ reports to promote
 *   general_suspicious   -> Stats/content only, no ATR
 *   quality_issues       -> Report content only, never ATR
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const getArg = (flag: string) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
};

const inputPath = getArg('--input') ?? 'audit-v2-merged.json';
const outputPath = getArg('--output') ?? 'triage-report.json';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScanResult {
  package: string;
  version: string;
  riskScore: number;
  riskLevel: string;
  tools: Array<{ name: string; description: string }>;
  atrMatches: Array<{ ruleId: string; severity: string; title: string; toolName?: string; matchedOn?: string }>;
  threats: string[];
  genuineThreats?: string[];
  connected?: boolean;
  toolCount?: number;
  typosquatRisk?: boolean;
  hasPostInstall?: boolean;
  codeAnalysis?: {
    outboundUrls?: string[];
    shellExecution?: boolean;
    fsWrites?: boolean;
    networkRequests?: boolean;
    envAccess?: boolean;
    dangerousImports?: string[];
  };
}

type TriageCategory = 'confirmed_malicious' | 'highly_suspicious' | 'general_suspicious' | 'quality_issues' | 'clean';

interface TriagedFinding {
  package: string;
  version: string;
  category: TriageCategory;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  /** Only set for confirmed_malicious -- ready for ATR proposal */
  proposedSeverity?: 'critical' | 'high';
  /** Pattern key for deduplication across scans */
  patternKey?: string;
}

interface TriageReport {
  triagedAt: string;
  totalScanned: number;
  summary: {
    confirmed_malicious: number;
    highly_suspicious: number;
    general_suspicious: number;
    quality_issues: number;
    clean: number;
  };
  /**
   * ATR candidates -- patterns already matchable by ATR engine at runtime.
   * These are tool description injection, prompt manipulation, etc.
   * Directly propose as ATR rules.
   */
  atrCandidates: TriagedFinding[];
  /**
   * LLM review candidates -- code-level threats found by AST.
   * Need LLM to determine: can this be expressed as a runtime ATR rule?
   * If yes -> ATR proposal. If no -> blacklist only.
   */
  llmReviewCandidates: TriagedFinding[];
  /**
   * Blacklist-only -- threats that cannot be detected at runtime.
   * Go directly to skill_threats / skill_blacklist in TC.
   */
  blacklistCandidates: TriagedFinding[];
  /** All findings by category -- for content/metrics */
  findings: TriagedFinding[];
  /** Aggregated pattern frequency across all findings */
  patternFrequency: Array<{ pattern: string; count: number; packages: string[] }>;
  /** Content-ready stats for marketing */
  contentStats: {
    totalSkillsScanned: number;
    threatsDetected: number;
    threatCategories: Array<{ category: string; count: number; percentage: string }>;
    topThreats: Array<{ package: string; riskScore: number; reasons: string[] }>;
  };
}

// ---------------------------------------------------------------------------
// Hard indicators -- these are confirmed malicious with high confidence
// ---------------------------------------------------------------------------

/** Patterns that indicate confirmed malicious behavior (not just suspicious) */
const CONFIRMED_MALICIOUS_PATTERNS = {
  reverse_shell: /reverse.?shell|bind.?shell|nc\s+-[le]|ncat\s|socat\s|bash\s+-i\s+>&/i,
  c2_beacon: /c2\s*(?:server|beacon|callback)|command.?(?:and|&).?control|beacon.?interval/i,
  credential_theft: /steal.*(?:password|credential|token|cookie)|exfiltrat.*(?:credential|secret|key)/i,
  crypto_miner: /crypto.?min(?:er|ing)|xmrig|monero.*pool|stratum\+tcp/i,
  data_exfil_confirmed: /(?:curl|wget|fetch)\s+.*\$\{?(?:API_KEY|SECRET|TOKEN|PASSWORD)/i,
  ransomware: /encrypt.*(?:file|document).*(?:ransom|bitcoin|payment)|\.locked\s*extension/i,
  destructive_cmd: /rm\s+-rf\s+(?:\/|\$HOME|~)|format\s+[cC]:|del\s+\/[sS]\s+\/[qQ]/i,
};

/** Patterns that are suspicious but need verification */
const SUSPICIOUS_PATTERNS = {
  shell_plus_network: /(?:exec|spawn|child_process|shell).*(?:fetch|http|request|axios)/i,
  credential_access_plus_network: /(?:password|secret|token|credential|api.?key).*(?:fetch|http|request|send|post)/i,
  instruction_override: /(?:override|overwrite|ignore|disregard|forget)\s+(?:previous|prior|above|existing)\s+(?:instructions?|rules?|constraints?)/i,
  hidden_eval: /eval\s*\(|new\s+Function\s*\(|vm\.run/i,
  download_and_execute: /(?:download|fetch|curl|wget).*(?:exec|eval|spawn|child_process)/i,
  env_exfil: /process\.env.*(?:fetch|http|request|post)|(?:fetch|http).*process\.env/i,
};

/** Quality issues -- not security threats */
const QUALITY_PATTERNS = {
  no_description: (r: ScanResult) => r.tools?.some(t => !t.description || t.description.length < 10),
  no_schema: (r: ScanResult) => r.tools?.length === 0,
  deprecated_deps: (r: ScanResult) => r.threats?.some(t => /deprecated/i.test(t)),
};

// ---------------------------------------------------------------------------
// Triage logic
// ---------------------------------------------------------------------------

function triageFinding(result: ScanResult): TriagedFinding {
  const reasons: string[] = [];
  let category: TriageCategory = 'clean';
  let proposedSeverity: 'critical' | 'high' | undefined;
  let patternKey: string | undefined;

  const allText = [
    ...(result.tools?.map(t => `${t.name} ${t.description}`) ?? []),
    ...(result.threats ?? []),
    ...(result.genuineThreats ?? []),
  ].join(' ');

  // Check confirmed malicious patterns first
  for (const [name, pattern] of Object.entries(CONFIRMED_MALICIOUS_PATTERNS)) {
    if (pattern.test(allText)) {
      category = 'confirmed_malicious';
      proposedSeverity = 'critical';
      patternKey = name;
      reasons.push(`Confirmed malicious: ${name.replace(/_/g, ' ')}`);
    }
  }

  // If not confirmed, check ATR matches for CRITICAL
  if (category !== 'confirmed_malicious' && result.atrMatches?.length > 0) {
    const criticalMatches = result.atrMatches.filter(m => m.severity === 'critical');
    if (criticalMatches.length >= 2) {
      category = 'confirmed_malicious';
      proposedSeverity = 'critical';
      patternKey = `multi-critical-atr-${criticalMatches.map(m => m.ruleId).sort().join('+')}`;
      reasons.push(`Multiple CRITICAL ATR matches: ${criticalMatches.map(m => m.ruleId).join(', ')}`);
    } else if (criticalMatches.length === 1) {
      // Single critical ATR match + other indicators
      const hasNetworkAndShell = result.codeAnalysis?.shellExecution && result.codeAnalysis?.networkRequests;
      if (hasNetworkAndShell) {
        category = 'confirmed_malicious';
        proposedSeverity = 'high';
        patternKey = `critical-atr-plus-indicators-${criticalMatches[0]!.ruleId}`;
        reasons.push(`CRITICAL ATR match (${criticalMatches[0]!.ruleId}) + shell exec + network`);
      }
    }
  }

  // Check suspicious patterns
  if (category === 'clean') {
    for (const [name, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
      if (pattern.test(allText)) {
        if (category !== 'highly_suspicious') {
          category = 'highly_suspicious';
        }
        patternKey = patternKey ?? name;
        reasons.push(`Suspicious: ${name.replace(/_/g, ' ')}`);
      }
    }
  }

  // High risk score without specific pattern
  if (category === 'clean' && result.riskScore >= 50) {
    category = 'general_suspicious';
    reasons.push(`High risk score: ${result.riskScore}`);
  }

  // Quality issues
  if (category === 'clean') {
    for (const [name, check] of Object.entries(QUALITY_PATTERNS)) {
      if (check(result)) {
        category = 'quality_issues';
        reasons.push(`Quality: ${name.replace(/_/g, ' ')}`);
      }
    }
  }

  // Downgrade from highly_suspicious to general_suspicious if only generic regex match
  if (category === 'highly_suspicious' && reasons.length === 1 && result.riskScore < 40) {
    category = 'general_suspicious';
  }

  return {
    package: result.package,
    version: result.version,
    category,
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    reasons,
    proposedSeverity,
    patternKey,
  };
}

function buildPatternFrequency(findings: TriagedFinding[]): Array<{ pattern: string; count: number; packages: string[] }> {
  const freq = new Map<string, { count: number; packages: Set<string> }>();

  for (const f of findings) {
    if (!f.patternKey) continue;
    const entry = freq.get(f.patternKey) ?? { count: 0, packages: new Set<string>() };
    entry.count++;
    entry.packages.add(f.package);
    freq.set(f.patternKey, entry);
  }

  return Array.from(freq.entries())
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      packages: Array.from(data.packages),
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\n  Triage Scan Findings');
  console.log(`  Input:  ${inputPath}`);
  console.log(`  Output: ${outputPath}\n`);

  const data = JSON.parse(readFileSync(resolve(inputPath), 'utf-8')) as { results: ScanResult[] };
  const results = data.results;

  console.log(`  Total packages: ${results.length}`);

  // Triage all findings
  const findings = results.map(triageFinding);

  // Count by category
  const summary = {
    confirmed_malicious: 0,
    highly_suspicious: 0,
    general_suspicious: 0,
    quality_issues: 0,
    clean: 0,
  };
  for (const f of findings) {
    summary[f.category]++;
  }

  // Split findings into three streams:
  //
  // 1. ATR candidates: already have ATR matches -> directly propose as rules
  //    (agent interaction patterns: tool description injection, privilege escalation)
  //
  // 2. LLM review candidates: AST found code-level threats -> LLM decides if
  //    it can be expressed as a runtime ATR rule. If yes -> ATR proposal.
  //    (eval, env-to-network, backdoors, encoded payloads, etc.)
  //
  // 3. Blacklist only: threats that genuinely cannot be detected at runtime.
  //    (typosquatting name similarity, missing schema, quality issues)

  const allConfirmed = findings.filter(f => f.category === 'confirmed_malicious');
  const allSuspicious = findings.filter(f => f.category === 'highly_suspicious');

  // Stream 1: ATR candidates (already matched by ATR engine)
  const atrCandidates = allConfirmed.filter(f =>
    f.reasons.some(r =>
      r.includes('ATR match') ||
      r.includes('instruction override') ||
      r.includes('description contains')
    )
  );

  // Stream 2: LLM review candidates (AST/code findings that MIGHT become ATR rules)
  // These need LLM to translate "code behavior" into "runtime detection pattern"
  const AST_CONVERTIBLE_PATTERNS = [
    'eval', 'exec', 'shell', 'network', 'credential', 'env',
    'backdoor', 'encoded', 'payload', 'prototype', 'Function',
    'setTimeout', 'base64', 'exfil',
  ];
  const llmReviewCandidates = [
    ...allConfirmed.filter(f =>
      !atrCandidates.includes(f) &&
      f.reasons.some(r => AST_CONVERTIBLE_PATTERNS.some(p => r.includes(p)))
    ),
    ...allSuspicious.filter(f =>
      f.reasons.some(r => AST_CONVERTIBLE_PATTERNS.some(p => r.includes(p)))
    ),
  ];

  // Stream 3: Blacklist only (can't be detected at runtime)
  const blacklistCandidates = allConfirmed.filter(f =>
    !atrCandidates.includes(f) &&
    !llmReviewCandidates.includes(f)
  );

  // Pattern frequency -- for identifying cross-skill patterns
  const patternFrequency = buildPatternFrequency(findings);

  // Cross-skill patterns (3+ skills) get promoted
  for (const pf of patternFrequency) {
    if (pf.count >= 3) {
      const best = findings
        .filter(f => f.patternKey === pf.pattern)
        .sort((a, b) => b.riskScore - a.riskScore)[0];
      if (!best) continue;

      const promoted = { ...best, category: 'confirmed_malicious' as const, proposedSeverity: 'high' as const };
      promoted.reasons = [...promoted.reasons, `Pattern "${pf.pattern}" seen in ${pf.count} skills -- auto-promoted`];

      // Agent interaction patterns -> ATR directly
      if (pf.pattern.includes('instruction') || pf.pattern.includes('description')) {
        if (!atrCandidates.some(c => c.patternKey === pf.pattern)) {
          atrCandidates.push(promoted);
        }
      } else {
        // Code-level cross-skill patterns -> LLM review (high value)
        if (!llmReviewCandidates.some(c => c.patternKey === pf.pattern)) {
          llmReviewCandidates.push(promoted);
        }
      }
    }
  }

  // Threat categories for content
  const threatCategoryMap = new Map<string, number>();
  for (const f of findings) {
    if (f.category === 'clean') continue;
    for (const r of f.reasons) {
      const cat = r.split(':')[0]?.trim() ?? 'unknown';
      threatCategoryMap.set(cat, (threatCategoryMap.get(cat) ?? 0) + 1);
    }
  }

  const threatsDetected = findings.filter(f => f.category !== 'clean' && f.category !== 'quality_issues').length;

  const contentStats = {
    totalSkillsScanned: results.length,
    threatsDetected,
    threatCategories: Array.from(threatCategoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: ((count / Math.max(results.length, 1)) * 100).toFixed(1) + '%',
      }))
      .sort((a, b) => b.count - a.count),
    topThreats: findings
      .filter(f => f.category === 'confirmed_malicious' || f.category === 'highly_suspicious')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 20)
      .map(f => ({ package: f.package, riskScore: f.riskScore, reasons: f.reasons })),
  };

  const report: TriageReport = {
    triagedAt: new Date().toISOString(),
    totalScanned: results.length,
    summary,
    atrCandidates,
    llmReviewCandidates,
    blacklistCandidates,
    findings,
    patternFrequency,
    contentStats,
  };

  writeFileSync(resolve(outputPath), JSON.stringify(report, null, 2));

  // Print summary
  console.log('\n  ======================================');
  console.log('  TRIAGE SUMMARY');
  console.log('  ======================================');
  console.log(`  Confirmed malicious:  ${summary.confirmed_malicious} -> ATR rules`);
  console.log(`  Highly suspicious:    ${summary.highly_suspicious} -> TC draft (needs 3+ reports)`);
  console.log(`  General suspicious:   ${summary.general_suspicious} -> Stats/content only`);
  console.log(`  Quality issues:       ${summary.quality_issues} -> Report only`);
  console.log(`  Clean:                ${summary.clean}`);
  console.log('');
  console.log(`  ATR candidates:       ${atrCandidates.length} (direct ATR rule proposal)`);
  console.log(`  LLM review:           ${llmReviewCandidates.length} (AST findings -> LLM decides ATR or blacklist)`);
  console.log(`  Blacklist only:       ${blacklistCandidates.length} (can't detect at runtime)`);
  console.log(`  Cross-skill patterns: ${patternFrequency.filter(p => p.count >= 3).length} patterns in 3+ skills`);
  console.log('');
  console.log(`  Content stats:`);
  console.log(`    Skills scanned:     ${contentStats.totalSkillsScanned}`);
  console.log(`    Threats detected:   ${contentStats.threatsDetected}`);
  for (const tc of contentStats.threatCategories.slice(0, 5)) {
    console.log(`    ${tc.category}: ${tc.count} (${tc.percentage})`);
  }
  console.log('');
  console.log(`  Report: ${outputPath}`);
  console.log('');
}

main();

export type { TriageReport, TriagedFinding, TriageCategory };
