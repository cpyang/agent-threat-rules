/**
 * Quality Gate Sanity Check — run the ATR Quality Gate against all 108
 * shipped rules and report how many pass at each maturity level.
 *
 * This validates that the gate thresholds are calibrated correctly:
 * - If most existing rules FAIL the experimental gate, the gate is too strict
 * - If all rules PASS at stable with zero effort, the gate is too loose
 *
 * Usage: npx tsx scripts/quality-gate-audit.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  parseATRRule,
  validateRuleMeetsStandard,
  computeConfidence,
} from "../src/quality/index.js";
import type { Maturity } from "../src/quality/types.js";

const RULES_DIR = join(import.meta.dirname, "..", "rules");

function findYamlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...findYamlFiles(full));
    } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
      out.push(full);
    }
  }
  return out;
}

interface Result {
  file: string;
  id: string;
  currentMaturity: Maturity;
  confidence: number;
  passesDraft: boolean;
  passesExperimental: boolean;
  passesStable: boolean;
  experimentalIssues: readonly string[];
  stableIssues: readonly string[];
}

const files = findYamlFiles(RULES_DIR);
console.log(`Auditing ${files.length} rule files against ATR Quality Gate\n`);

const results: Result[] = [];
for (const file of files) {
  try {
    const content = readFileSync(file, "utf-8");
    const metadata = parseATRRule(content);
    const draftGate = validateRuleMeetsStandard(metadata, "draft");
    const expGate = validateRuleMeetsStandard(metadata, "experimental");
    const stableGate = validateRuleMeetsStandard(metadata, "stable");
    const confidence = computeConfidence(metadata);

    results.push({
      file: file.replace(RULES_DIR + "/", ""),
      id: metadata.id,
      currentMaturity: metadata.maturity,
      confidence: confidence.total,
      passesDraft: draftGate.passed,
      passesExperimental: expGate.passed,
      passesStable: stableGate.passed,
      experimentalIssues: expGate.issues,
      stableIssues: stableGate.issues,
    });
  } catch (err) {
    console.error(
      `  Failed to parse ${file}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// Summary
const draft = results.filter((r) => r.passesDraft).length;
const exp = results.filter((r) => r.passesExperimental).length;
const stable = results.filter((r) => r.passesStable).length;

console.log("═".repeat(72));
console.log("QUALITY GATE SANITY CHECK");
console.log("═".repeat(72));
console.log(`Rules audited:         ${results.length}`);
console.log(`Passes draft gate:     ${draft} (${pct(draft, results.length)})`);
console.log(`Passes experimental:   ${exp} (${pct(exp, results.length)})`);
console.log(
  `Passes stable:         ${stable} (${pct(stable, results.length)})`,
);
console.log();

// Current maturity distribution
const byMaturity: Record<string, number> = {};
for (const r of results) {
  byMaturity[r.currentMaturity] = (byMaturity[r.currentMaturity] ?? 0) + 1;
}
console.log("Current maturity distribution:");
for (const [m, n] of Object.entries(byMaturity).sort()) {
  console.log(`  ${m.padEnd(14)} ${n}`);
}
console.log();

// Top experimental gate failures
const expFailures: Record<string, number> = {};
for (const r of results) {
  if (!r.passesExperimental) {
    for (const issue of r.experimentalIssues) {
      const key = issue.replace(/\d+/g, "N");
      expFailures[key] = (expFailures[key] ?? 0) + 1;
    }
  }
}
console.log("Top experimental gate failures:");
for (const [issue, count] of Object.entries(expFailures).sort(
  (a, b) => b[1] - a[1],
)) {
  console.log(`  ${String(count).padStart(4)} ${issue}`);
}
console.log();

// Confidence distribution
const bands = [
  { label: "90-100", min: 90, max: 101 },
  { label: "80-89 ", min: 80, max: 90 },
  { label: "60-79 ", min: 60, max: 80 },
  { label: "40-59 ", min: 40, max: 60 },
  { label: "0-39  ", min: 0, max: 40 },
];
console.log("Confidence score distribution:");
for (const b of bands) {
  const n = results.filter(
    (r) => r.confidence >= b.min && r.confidence < b.max,
  ).length;
  console.log(`  ${b.label} ${String(n).padStart(4)}`);
}
console.log();

// Rules that could be promoted if they filled test cases
const almostExp = results.filter((r) => !r.passesExperimental && r.passesDraft);
console.log(
  `Rules that could pass experimental with more test cases: ${almostExp.length}`,
);

// Interpretation
console.log();
console.log("INTERPRETATION");
console.log("─".repeat(72));
const expPct = (exp / results.length) * 100;
if (expPct < 20) {
  console.log(
    "WARNING: Gate is TOO STRICT. <20% of existing rules pass experimental.",
  );
  console.log("Recommendation: lower threshold or mark fields as optional.");
} else if (expPct < 50) {
  console.log(
    "MODERATE: Gate is appropriately strict. ~30-50% pass experimental.",
  );
  console.log("Existing rules need to be upgraded, but the bar is achievable.");
} else if (expPct < 90) {
  console.log(
    "GOOD: Gate matches rule quality. >50% pass, but there is room to improve.",
  );
} else {
  console.log("LOOSE: Gate may be too permissive. >90% of rules pass easily.");
  console.log("Recommendation: raise threshold for more differentiation.");
}

function pct(n: number, total: number): string {
  return `${((n / total) * 100).toFixed(1)}%`;
}
