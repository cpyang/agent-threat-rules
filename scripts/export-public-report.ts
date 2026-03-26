#!/usr/bin/env npx tsx
/**
 * Export PUBLIC ecosystem report from cumulative scan data.
 *
 * Layer 1 (PUBLIC) output — committed to git, visible to everyone:
 *   - data/ecosystem-report.csv  (package, version, riskLevel, riskScore, toolCount, scannedAt)
 *   - data/ecosystem-stats.json  (aggregate statistics only)
 *
 * What is deliberately EXCLUDED (stays in Layer 2/3):
 *   - genuineThreats (specific vulnerability details)
 *   - atrMatches (which rules triggered)
 *   - codeAnalysis (outbound URLs, env access, imports)
 *   - astAnalysis (data flow findings)
 *   - falsePositiveReasons
 *
 * Rationale:
 *   - Public CSV lets anyone check if their skill is flagged
 *   - But "why" requires Threat Cloud API or PanGuard
 *   - This drives adoption without giving away the full analysis
 *
 * Usage:
 *   npx tsx scripts/export-public-report.ts [--input <path>] [--output-dir <path>]
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types (minimal — only what we need)
// ---------------------------------------------------------------------------

interface ScanResult {
  package: string;
  version: string;
  riskScore: number;
  riskLevel: string;
  tools: Array<{ name: string }>;
  auditedAt: string;
  supplyChain?: { typosquatRisk: boolean; hasPostInstall: boolean };
}

interface ScanData {
  auditedAt: string;
  total: number;
  summary: Record<string, number>;
  results: ScanResult[];
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function csvField(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function csvRow(fields: unknown[]): string {
  return fields.map(csvField).join(',');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const inputIdx = process.argv.indexOf('--input');
  const inputPath = inputIdx >= 0
    ? resolve(process.argv[inputIdx + 1]!)
    : resolve('data/scan-cumulative.json');

  const outputIdx = process.argv.indexOf('--output-dir');
  const outputDir = outputIdx >= 0
    ? resolve(process.argv[outputIdx + 1]!)
    : resolve('data');

  if (!existsSync(inputPath)) {
    console.log('  No cumulative data found. Skipping public report.');
    return;
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const data: ScanData = JSON.parse(readFileSync(inputPath, 'utf-8'));
  const results = data.results;

  // --- CSV: one row per package, PUBLIC fields only ---
  const headers = ['package', 'version', 'riskLevel', 'riskScore', 'toolCount', 'hasPostInstall', 'typosquatRisk', 'scannedAt'];
  const rows = results.map(r => csvRow([
    r.package,
    r.version,
    r.riskLevel,
    r.riskScore,
    r.tools?.length ?? 0,
    r.supplyChain?.hasPostInstall ?? false,
    r.supplyChain?.typosquatRisk ?? false,
    r.auditedAt,
  ]));

  const csv = [csvRow(headers), ...rows].join('\n') + '\n';
  const csvPath = resolve(outputDir, 'ecosystem-report.csv');
  writeFileSync(csvPath, csv, 'utf-8');

  // --- Stats JSON: aggregate numbers only ---
  const byLevel: Record<string, number> = {};
  let totalTools = 0;
  let postInstallCount = 0;
  let typosquatCount = 0;

  for (const r of results) {
    byLevel[r.riskLevel] = (byLevel[r.riskLevel] ?? 0) + 1;
    totalTools += r.tools?.length ?? 0;
    if (r.supplyChain?.hasPostInstall) postInstallCount++;
    if (r.supplyChain?.typosquatRisk) typosquatCount++;
  }

  const stats = {
    generatedAt: new Date().toISOString(),
    totalPackages: results.length,
    totalTools,
    riskDistribution: byLevel,
    supplyChain: {
      withPostInstall: postInstallCount,
      typosquatRisk: typosquatCount,
    },
    threatRate: results.length > 0
      ? Math.round(((byLevel['CRITICAL'] ?? 0) + (byLevel['HIGH'] ?? 0)) / results.length * 1000) / 10
      : 0,
    lastScanDate: results.length > 0
      ? results.reduce((latest, r) => r.auditedAt > latest ? r.auditedAt : latest, '')
      : null,
  };

  const statsPath = resolve(outputDir, 'ecosystem-stats.json');
  writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');

  // --- Console summary ---
  console.log('\n  Public Ecosystem Report');
  console.log('  ==============================');
  console.log(`  Packages:     ${stats.totalPackages}`);
  console.log(`  Tools:        ${stats.totalTools}`);
  console.log(`  Threat rate:  ${stats.threatRate}%`);
  console.log(`  PostInstall:  ${postInstallCount}`);
  console.log(`  Typosquat:    ${typosquatCount}`);
  console.log('  Risk distribution:');
  for (const [level, count] of Object.entries(byLevel).sort()) {
    const pct = Math.round(count / results.length * 1000) / 10;
    console.log(`    ${level}: ${count} (${pct}%)`);
  }
  console.log(`\n  CSV:   ${csvPath}`);
  console.log(`  Stats: ${statsPath}\n`);
}

main();
