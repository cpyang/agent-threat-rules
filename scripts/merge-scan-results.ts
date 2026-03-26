#!/usr/bin/env npx tsx
/**
 * Merge daily scan batches into a cumulative results file.
 *
 * Reads all data/scan-batch-*.json files and merges them into
 * data/scan-cumulative.json, deduplicating by package name
 * (keeps the most recent scan for each package).
 *
 * Usage:
 *   npx tsx scripts/merge-scan-results.ts [--output <path>]
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

interface AuditResult {
  package: string;
  version: string;
  riskScore: number;
  riskLevel: string;
  auditedAt: string;
  [key: string]: unknown;
}

interface ScanData {
  auditedAt?: string;
  total?: number;
  summary?: Record<string, number>;
  flagged?: number;
  totalTools?: number;
  results: AuditResult[];
}

function main(): void {
  const outputIdx = process.argv.indexOf('--output');
  const outputPath = outputIdx >= 0
    ? resolve(process.argv[outputIdx + 1]!)
    : resolve('data/scan-cumulative.json');

  const dataDir = resolve('data');

  // Load existing cumulative data
  const cumulative = new Map<string, AuditResult>();

  if (existsSync(outputPath)) {
    const existing: ScanData = JSON.parse(readFileSync(outputPath, 'utf-8'));
    for (const r of existing.results) {
      cumulative.set(r.package, r);
    }
    console.log(`  Loaded ${cumulative.size} existing results from cumulative`);
  }

  // Find and merge batch files
  const batchFiles = existsSync(dataDir)
    ? readdirSync(dataDir)
        .filter(f => f.startsWith('scan-batch-') && f.endsWith('.json'))
        .sort()
    : [];

  if (batchFiles.length === 0) {
    console.log('  No batch files found in data/');
    return;
  }

  let newCount = 0;
  let updatedCount = 0;

  for (const file of batchFiles) {
    const filePath = join(dataDir, file);
    const batch: ScanData = JSON.parse(readFileSync(filePath, 'utf-8'));

    for (const r of batch.results) {
      if (cumulative.has(r.package)) {
        // Update if newer scan
        const existing = cumulative.get(r.package)!;
        if (r.auditedAt > (existing.auditedAt ?? '')) {
          cumulative.set(r.package, r);
          updatedCount++;
        }
      } else {
        cumulative.set(r.package, r);
        newCount++;
      }
    }
  }

  // Build summary
  const results = [...cumulative.values()];
  const summary: Record<string, number> = {};
  let totalTools = 0;

  for (const r of results) {
    summary[r.riskLevel] = (summary[r.riskLevel] ?? 0) + 1;
    const tools = r['tools'] as Array<unknown> | undefined;
    if (Array.isArray(tools)) totalTools += tools.length;
  }

  const flagged = results.filter(
    r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH'
  ).length;

  const output: ScanData = {
    auditedAt: new Date().toISOString(),
    total: results.length,
    summary,
    flagged,
    totalTools,
    results,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log('\n  Merge Scan Results');
  console.log(`  Batch files merged: ${batchFiles.length}`);
  console.log(`  New packages:       ${newCount}`);
  console.log(`  Updated packages:   ${updatedCount}`);
  console.log(`  Total cumulative:   ${results.length}`);
  console.log(`  Flagged (C+H):      ${flagged}`);
  console.log(`  Saved: ${outputPath}\n`);
}

main();
