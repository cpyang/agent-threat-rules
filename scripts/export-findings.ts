#!/usr/bin/env npx tsx
/**
 * Export audit findings to structured CSV files for analysis.
 *
 * Reads the merged audit pipeline JSON and optional triage report,
 * then exports three CSV files:
 *   1. findings-all.csv       -- One row per package (summary)
 *   2. findings-ast.csv       -- One row per AST finding
 *   3. findings-atr-candidates.csv -- One row per ATR candidate (from triage)
 *
 * Usage:
 *   npx tsx scripts/export-findings.ts --input audit-pipeline-merged.json \
 *     [--triage triage-report-*.json] [--output-dir ./exports]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ---------------------------------------------------------------------------
// Types (mirrors from audit-npm-skills-v2.ts and triage-findings.ts)
// ---------------------------------------------------------------------------

interface ASTFinding {
  category: string;
  severity: string;
  file: string;
  line: number;
  description: string;
  snippet: string;
  flow?: string[];
}

interface ASTAnalysisResult {
  findings: ASTFinding[];
  filesAnalyzed: number;
  parseErrors: number;
  summary: Record<string, number>;
}

interface AuditV2Result {
  package: string;
  version: string;
  url: string;
  tools: Array<{ name: string; description: string; schemaProperties?: string[]; dangerousPatterns?: string[] }>;
  supplyChain: { typosquatRisk: boolean; similarTo?: string; suspiciousName: boolean; hasPostInstall: boolean };
  codeAnalysis: {
    outboundUrls: string[];
    shellExecution: boolean;
    fileSystemWrite: boolean;
    networkRequests: boolean;
    envAccess: string[];
    dangerousImports: string[];
  };
  astAnalysis?: ASTAnalysisResult;
  atrMatches: Array<{ ruleId: string; severity: string; title: string; matchedOn: string }>;
  riskScore: number;
  riskLevel: string;
  genuineThreats: string[];
  falsePositiveReasons: string[];
  auditedAt: string;
}

interface MergedAuditData {
  auditedAt: string;
  total: number;
  summary: Record<string, number>;
  flagged: number;
  totalTools: number;
  results: AuditV2Result[];
}

interface TriagedFinding {
  package: string;
  version: string;
  category: string;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  proposedSeverity?: string;
  patternKey?: string;
}

interface TriageReport {
  triagedAt: string;
  totalScanned: number;
  summary: Record<string, number>;
  atrCandidates: TriagedFinding[];
  findings: TriagedFinding[];
  patternFrequency: Array<{ pattern: string; count: number; packages: string[] }>;
}

// ---------------------------------------------------------------------------
// CSV helpers (no external library)
// ---------------------------------------------------------------------------

/** Escape a single CSV field: wrap in quotes if it contains comma, quote, or newline. */
function csvField(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/** Join fields into a CSV row. */
function csvRow(fields: unknown[]): string {
  return fields.map(csvField).join(',');
}

/** Build a complete CSV string from headers and rows. */
function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [csvRow(headers)];
  for (const row of rows) {
    lines.push(csvRow(row));
  }
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && idx + 1 < process.argv.length ? process.argv[idx + 1] : undefined;
}

// ---------------------------------------------------------------------------
// Export: findings-all.csv
// ---------------------------------------------------------------------------

function exportFindingsAll(
  results: AuditV2Result[],
  triageMap: Map<string, TriagedFinding>,
): { csv: string; rowCount: number } {
  const headers = [
    'package', 'version', 'riskScore', 'riskLevel', 'toolCount',
    'l1Threats', 'l2Findings', 'l2Critical', 'l2High',
    'triageCategory', 'atrMatches', 'genuineThreats', 'topASTCategories',
  ];

  const rows: unknown[][] = [];

  for (const r of results) {
    const astFindings = r.astAnalysis?.findings ?? [];
    const l2Critical = astFindings.filter(f => f.severity === 'critical').length;
    const l2High = astFindings.filter(f => f.severity === 'high').length;

    // Count L1 threats: genuineThreats that are NOT AST-based
    const l1Threats = r.genuineThreats.filter(t => !t.startsWith('[AST-L2]')).length;

    // Top AST categories (deduplicated, sorted by frequency)
    const catCounts = new Map<string, number>();
    for (const f of astFindings) {
      catCounts.set(f.category, (catCounts.get(f.category) ?? 0) + 1);
    }
    const topASTCategories = Array.from(catCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => `${cat}(${count})`)
      .join('; ');

    const triage = triageMap.get(r.package);

    rows.push([
      r.package,
      r.version,
      r.riskScore,
      r.riskLevel,
      r.tools.length,
      l1Threats,
      astFindings.length,
      l2Critical,
      l2High,
      triage?.category ?? '',
      r.atrMatches.length,
      r.genuineThreats.length,
      topASTCategories,
    ]);
  }

  return { csv: buildCsv(headers, rows), rowCount: rows.length };
}

// ---------------------------------------------------------------------------
// Export: findings-ast.csv
// ---------------------------------------------------------------------------

function exportFindingsAST(results: AuditV2Result[]): { csv: string; rowCount: number } {
  const headers = [
    'package', 'version', 'file', 'line', 'category', 'severity', 'description', 'flow',
  ];

  const rows: unknown[][] = [];

  for (const r of results) {
    const astFindings = r.astAnalysis?.findings ?? [];
    for (const f of astFindings) {
      rows.push([
        r.package,
        r.version,
        f.file,
        f.line,
        f.category,
        f.severity,
        f.description,
        f.flow ? f.flow.join(' -> ') : '',
      ]);
    }
  }

  return { csv: buildCsv(headers, rows), rowCount: rows.length };
}

// ---------------------------------------------------------------------------
// Export: findings-atr-candidates.csv
// ---------------------------------------------------------------------------

function exportATRCandidates(candidates: TriagedFinding[]): { csv: string; rowCount: number } {
  const headers = [
    'package', 'version', 'category', 'riskScore', 'proposedSeverity', 'patternKey', 'reasons',
  ];

  const rows: unknown[][] = [];

  for (const c of candidates) {
    rows.push([
      c.package,
      c.version,
      c.category,
      c.riskScore,
      c.proposedSeverity ?? '',
      c.patternKey ?? '',
      c.reasons.join('; '),
    ]);
  }

  return { csv: buildCsv(headers, rows), rowCount: rows.length };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const inputPath = resolve(getArg('--input') ?? 'audit-pipeline-merged.json');
  const triagePath = getArg('--triage') ? resolve(getArg('--triage')!) : undefined;
  const outputDir = resolve(getArg('--output-dir') ?? './exports');

  // Validate input
  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('\n  Export Findings to CSV');
  console.log(`  Input:      ${inputPath}`);
  if (triagePath) {
    console.log(`  Triage:     ${triagePath}`);
  }
  console.log(`  Output dir: ${outputDir}\n`);

  // Read audit data
  const auditData = JSON.parse(readFileSync(inputPath, 'utf-8')) as MergedAuditData;
  const results = auditData.results;

  // Read triage data (optional)
  let triageReport: TriageReport | null = null;
  const triageMap = new Map<string, TriagedFinding>();

  if (triagePath && existsSync(triagePath)) {
    triageReport = JSON.parse(readFileSync(triagePath, 'utf-8')) as TriageReport;
    for (const f of triageReport.findings) {
      triageMap.set(f.package, f);
    }
    console.log(`  Triage loaded: ${triageReport.findings.length} findings`);
  } else if (triagePath) {
    console.warn(`  Warning: triage file not found: ${triagePath}`);
  }

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Export 1: findings-all.csv
  const allResult = exportFindingsAll(results, triageMap);
  const allPath = join(outputDir, 'findings-all.csv');
  writeFileSync(allPath, allResult.csv, 'utf-8');

  // Export 2: findings-ast.csv
  const astResult = exportFindingsAST(results);
  const astPath = join(outputDir, 'findings-ast.csv');
  writeFileSync(astPath, astResult.csv, 'utf-8');

  // Export 3: findings-atr-candidates.csv
  const atrCandidates = triageReport?.atrCandidates ?? [];
  const atrResult = exportATRCandidates(atrCandidates);
  const atrPath = join(outputDir, 'findings-atr-candidates.csv');
  writeFileSync(atrPath, atrResult.csv, 'utf-8');

  // Summary
  console.log('  ======================================');
  console.log('  EXPORT SUMMARY');
  console.log('  ======================================');
  console.log(`  findings-all.csv:            ${allResult.rowCount} rows`);
  console.log(`  findings-ast.csv:            ${astResult.rowCount} rows`);
  console.log(`  findings-atr-candidates.csv: ${atrResult.rowCount} rows`);
  console.log('');
  console.log(`  Output: ${outputDir}`);
  console.log('');
}

main();
