/**
 * Compute confidence scores for all ATR rules using the Quality Standard
 * reference implementation (src/quality/).
 *
 * This script dogfoods the library: any bug here means the library is broken.
 * Third-party adopters use the same API.
 *
 * Writes confidence, wild_validated, wild_samples, wild_fp_rate back to each
 * rule's YAML. Optionally promotes rules that meet the stable gate.
 *
 * Usage: npx tsx scripts/compute-confidence.ts [--dry-run] [--promote]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  parseATRRule,
  computeConfidence,
  canPromote,
  type RuleMetadata,
} from "../src/quality/index.js";

const RULES_DIR = join(import.meta.dirname, "..", "rules");
const MEGA_SCAN = join(
  import.meta.dirname,
  "..",
  "data",
  "mega-scan-report.json",
);

const isDryRun = process.argv.includes("--dry-run");
const doPromote = process.argv.includes("--promote");

interface MegaScanReport {
  scan_date: string;
  rules_loaded: number;
  totals: { scanned: number; flagged: number; clean: number };
  rule_hits: Array<{ id: string; count: number }>;
}

const megaScan: MegaScanReport = JSON.parse(readFileSync(MEGA_SCAN, "utf-8"));
const wildSampleCount = megaScan.totals.scanned;
const ruleHitMap = new Map(megaScan.rule_hits.map((r) => [r.id, r.count]));
const wildValidatedDate = megaScan.scan_date.slice(0, 10).replace(/-/g, "/");

function findRuleFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...findRuleFiles(full));
    else if (e.endsWith(".yaml") || e.endsWith(".yml")) out.push(full);
  }
  return out;
}

/**
 * Parse a rule, enrich its metadata with wild scan stats, and compute
 * a confidence score.
 */
function scoreRule(filePath: string): {
  file: string;
  metadata: RuleMetadata;
  confidence: number;
  wildFpRate: number;
  fireCount: number;
  content: string;
} | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const baseMetadata = parseATRRule(content);
    const fireCount = ruleHitMap.get(baseMetadata.id) ?? 0;
    // Conservative: treat any fire on wild data as potential FP until verified
    const wildFpRate = fireCount > 0 ? (fireCount / wildSampleCount) * 100 : 0;

    // Enrich with wild stats from mega scan
    const metadata: RuleMetadata = {
      ...baseMetadata,
      wildSamples: wildSampleCount,
      wildFpRate: Math.round(wildFpRate * 10000) / 10000,
      wildValidatedAt: wildValidatedDate,
    };

    const score = computeConfidence(metadata);

    return {
      file: filePath,
      metadata,
      confidence: score.total,
      wildFpRate: metadata.wildFpRate!,
      fireCount,
      content,
    };
  } catch {
    return null;
  }
}

/**
 * Update or insert a top-level field in YAML content.
 * Simple string manipulation — matches the behavior of the previous script.
 */
function updateYamlField(
  content: string,
  field: string,
  value: string | number,
): string {
  const newLine = `${field}: ${typeof value === "string" ? `"${value}"` : value}`;
  const regex = new RegExp(`^${field}:.*$`, "m");
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  }
  const insertPoint = content.indexOf("\ntest_cases:");
  if (insertPoint !== -1) {
    return (
      content.slice(0, insertPoint) +
      `\n${newLine}` +
      content.slice(insertPoint)
    );
  }
  return content + `\n${newLine}\n`;
}

// Main
const files = findRuleFiles(RULES_DIR);
console.log(`Found ${files.length} rule files`);
console.log(
  `Mega scan: ${wildSampleCount} skills, ${megaScan.rule_hits.length} rules fired\n`,
);

const results = files
  .map(scoreRule)
  .filter((r): r is NonNullable<typeof r> => r !== null);

let promotedCount = 0;
let updatedCount = 0;

for (const r of results) {
  if (isDryRun) continue;

  let newContent = r.content;
  newContent = updateYamlField(newContent, "confidence", r.confidence);
  newContent = updateYamlField(newContent, "wild_validated", wildValidatedDate);
  newContent = updateYamlField(newContent, "wild_samples", wildSampleCount);
  newContent = updateYamlField(newContent, "wild_fp_rate", r.wildFpRate);

  if (doPromote) {
    const decision = canPromote(r.metadata, "stable");
    if (decision.eligible) {
      newContent = updateYamlField(newContent, "status", "stable");
      newContent = updateYamlField(newContent, "maturity", "stable");
      promotedCount++;
    }
  }

  if (newContent !== r.content) {
    writeFileSync(r.file, newContent);
    updatedCount++;
  }
}

// Sort by confidence descending
results.sort((a, b) => b.confidence - a.confidence);

// Report
console.log("CONFIDENCE SCORE DISTRIBUTION");
console.log("═".repeat(70));
const bands = [
  { label: "90-100 (Very High)", min: 90, max: 101 },
  { label: "80-89  (High)     ", min: 80, max: 90 },
  { label: "60-79  (Medium)   ", min: 60, max: 80 },
  { label: "40-59  (Low)      ", min: 40, max: 60 },
  { label: "0-39   (Draft)    ", min: 0, max: 40 },
];
for (const b of bands) {
  const n = results.filter(
    (r) => r.confidence >= b.min && r.confidence < b.max,
  ).length;
  const bar = "#".repeat(Math.ceil(n / 2));
  console.log(`  ${b.label}  ${String(n).padStart(3)} ${bar}`);
}

console.log("\nTOP 10 BY CONFIDENCE:");
for (const r of results.slice(0, 10)) {
  console.log(
    `  ${r.metadata.id.padEnd(18)} confidence=${String(r.confidence).padStart(3)} ` +
      `maturity=${r.metadata.maturity.padEnd(12)} fires=${r.fireCount}`,
  );
}

console.log(`\n${"═".repeat(70)}`);
console.log(`Total rules: ${results.length}`);
console.log(`Updated: ${updatedCount}`);
console.log(`Promoted to stable: ${promotedCount}`);
if (isDryRun) console.log("(DRY RUN — no files modified)");
