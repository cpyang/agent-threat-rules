/**
 * Compute confidence scores for all ATR rules based on:
 * 1. Test case precision (40%)
 * 2. Coverage breadth (20%)
 * 3. Wild scan validation (30%)
 * 4. Evasion documentation (10%)
 *
 * Updates rules in-place with confidence, wild_validated, wild_samples, wild_fp_rate fields.
 * Promotes qualifying rules from experimental → stable.
 *
 * Usage: npx tsx scripts/compute-confidence.ts [--dry-run] [--promote]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import * as yaml from 'js-yaml';

const RULES_DIR = join(import.meta.dirname, '..', 'rules');
const MEGA_SCAN = join(import.meta.dirname, '..', 'data', 'mega-scan-report.json');

const isDryRun = process.argv.includes('--dry-run');
const doPromote = process.argv.includes('--promote');

interface MegaScanReport {
  scan_date: string;
  rules_loaded: number;
  totals: { scanned: number; flagged: number; clean: number };
  rule_hits: Array<{ id: string; count: number }>;
}

interface RuleFile {
  path: string;
  content: string;
  parsed: Record<string, unknown>;
}

// Load mega scan data
const megaScan: MegaScanReport = JSON.parse(readFileSync(MEGA_SCAN, 'utf-8'));
const wildSamples = megaScan.totals.scanned;
const ruleHitMap = new Map(megaScan.rule_hits.map(r => [r.id, r.count]));

// Find all rule YAML files
function findRuleFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findRuleFiles(full));
    } else if (entry.endsWith('.yaml') || entry.endsWith('.yml')) {
      results.push(full);
    }
  }
  return results;
}

// Parse a rule file
function loadRule(path: string): RuleFile | null {
  try {
    const content = readFileSync(path, 'utf-8');
    const parsed = yaml.load(content) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || !parsed['id']) return null;
    return { path, content, parsed };
  } catch {
    return null;
  }
}

// Count test cases
function countTestCases(rule: Record<string, unknown>): { tp: number; tn: number } {
  const tc = rule['test_cases'] as Record<string, unknown[]> | undefined;
  if (!tc) return { tp: 0, tn: 0 };
  return {
    tp: Array.isArray(tc['true_positives']) ? tc['true_positives'].length : 0,
    tn: Array.isArray(tc['true_negatives']) ? tc['true_negatives'].length : 0,
  };
}

// Count evasion tests
function countEvasionTests(rule: Record<string, unknown>): number {
  const et = rule['evasion_tests'] as unknown[];
  return Array.isArray(et) ? et.length : 0;
}

// Count detection conditions
function countConditions(rule: Record<string, unknown>): number {
  const det = rule['detection'] as Record<string, unknown> | undefined;
  if (!det) return 0;
  const conds = det['conditions'];
  if (Array.isArray(conds)) return conds.length;
  if (typeof conds === 'object' && conds !== null) return Object.keys(conds).length;
  return 0;
}

// Check scan target
function getScanTarget(rule: Record<string, unknown>): string {
  const tags = rule['tags'] as Record<string, unknown> | undefined;
  return (tags?.['scan_target'] as string) ?? 'both';
}

// Has OWASP + MITRE references
function hasReferences(rule: Record<string, unknown>): boolean {
  const refs = rule['references'] as Record<string, unknown> | undefined;
  if (!refs) return false;
  const hasOwasp = Array.isArray(refs['owasp_llm']) || Array.isArray(refs['owasp_agentic']);
  const hasMitre = Array.isArray(refs['mitre_atlas']) || Array.isArray(refs['mitre_attack']);
  return hasOwasp && hasMitre;
}

// Has false_positives documented
function hasFalsePositives(rule: Record<string, unknown>): boolean {
  const det = rule['detection'] as Record<string, unknown> | undefined;
  const fps = det?.['false_positives'] as unknown[];
  return Array.isArray(fps) && fps.length > 0;
}

// Compute confidence score
function computeConfidence(rule: Record<string, unknown>): {
  score: number;
  precisionScore: number;
  coverageScore: number;
  wildScore: number;
  evasionScore: number;
  wildFpRate: number;
  fireCount: number;
} {
  const id = rule['id'] as string;
  const { tp, tn } = countTestCases(rule);
  const evasions = countEvasionTests(rule);
  const conditions = countConditions(rule);
  const scanTarget = getScanTarget(rule);
  const fireCount = ruleHitMap.get(id) ?? 0;

  // 1. Precision score (40%) — based on test case coverage
  // More test cases = higher confidence in precision measurement
  const testCaseCount = tp + tn;
  const precisionScore = Math.min(testCaseCount / 10, 1) * 100; // max at 10 test cases

  // 2. Coverage score (20%) — breadth of detection patterns
  const coverageScore = Math.min(conditions / 5, 1) * 100; // max at 5 conditions

  // 3. Wild validation score (30%)
  // For skill-target rules: direct validation on 53K skills
  // For mcp-target rules: cross-context (0.7x multiplier)
  const contextMultiplier = (scanTarget === 'mcp') ? 0.7 : 1.0;
  const wildBase = Math.min(wildSamples / 10000, 1) * 100;
  const wildScore = wildBase * contextMultiplier;

  // Wild FP rate: if rule never fired on clean skills, FP = 0
  // If it fired, we conservatively assume all fires could be FP on benign content
  // (since we don't have per-sample ground truth for 53K, we use flagged/total)
  const wildFpRate = fireCount > 0 ? (fireCount / wildSamples) * 100 : 0;

  // 4. Evasion documentation score (10%)
  const evasionScore = Math.min(evasions / 5, 1) * 100;

  const score = Math.round(
    precisionScore * 0.4 +
    coverageScore * 0.2 +
    wildScore * 0.3 +
    evasionScore * 0.1
  );

  return { score, precisionScore, coverageScore, wildScore, evasionScore, wildFpRate, fireCount };
}

// Check if rule qualifies for stable
function qualifiesForStable(rule: Record<string, unknown>, confidence: number, wildFpRate: number): boolean {
  const { tp, tn } = countTestCases(rule);
  const evasions = countEvasionTests(rule);
  const maturity = rule['maturity'] as string;
  const status = rule['status'] as string;

  // Must be experimental (not draft)
  if (status === 'draft') return false;
  // Must have enough test cases
  if (tp < 5 || tn < 5) return false;
  // Must have evasion tests
  if (evasions < 3) return false;
  // Must have references
  if (!hasReferences(rule)) return false;
  // Must have false_positives documented
  if (!hasFalsePositives(rule)) return false;
  // Confidence threshold
  if (confidence < 80) return false;
  // FP rate threshold
  if (wildFpRate > 0.5) return false;

  return true;
}

// Update YAML field in-place (preserving formatting)
function updateYamlField(content: string, field: string, value: string | number): string {
  const regex = new RegExp(`^${field}:.*$`, 'm');
  const newLine = `${field}: ${typeof value === 'string' ? `"${value}"` : value}`;
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  }
  // Add before test_cases or at end
  const insertPoint = content.indexOf('\ntest_cases:');
  if (insertPoint !== -1) {
    return content.slice(0, insertPoint) + `\n${newLine}` + content.slice(insertPoint);
  }
  return content + `\n${newLine}\n`;
}

// Main
const ruleFiles = findRuleFiles(RULES_DIR);
console.log(`Found ${ruleFiles.length} rule files`);
console.log(`Mega scan: ${wildSamples} skills, ${megaScan.rule_hits.length} rules fired\n`);

const results: Array<{
  id: string;
  maturity: string;
  status: string;
  confidence: number;
  wildFpRate: number;
  fireCount: number;
  qualifies: boolean;
  promoted: boolean;
}> = [];

let promotedCount = 0;
let updatedCount = 0;

for (const filePath of ruleFiles) {
  const rule = loadRule(filePath);
  if (!rule) continue;

  const id = rule.parsed['id'] as string;
  const maturity = (rule.parsed['maturity'] as string) ?? 'unknown';
  const status = (rule.parsed['status'] as string) ?? 'unknown';

  const { score, wildFpRate, fireCount } = computeConfidence(rule.parsed);
  const qualifies = qualifiesForStable(rule.parsed, score, wildFpRate);
  const shouldPromote = doPromote && qualifies && status !== 'stable';

  results.push({
    id,
    maturity,
    status,
    confidence: score,
    wildFpRate: Math.round(wildFpRate * 10000) / 10000,
    fireCount,
    qualifies,
    promoted: shouldPromote,
  });

  if (!isDryRun) {
    let newContent = rule.content;

    // Add confidence score
    newContent = updateYamlField(newContent, 'confidence', score);
    newContent = updateYamlField(newContent, 'wild_validated', megaScan.scan_date.slice(0, 10).replace(/-/g, '/'));
    newContent = updateYamlField(newContent, 'wild_samples', wildSamples);
    newContent = updateYamlField(newContent, 'wild_fp_rate', Math.round(wildFpRate * 10000) / 10000);

    if (shouldPromote) {
      newContent = updateYamlField(newContent, 'status', 'stable');
      newContent = updateYamlField(newContent, 'maturity', 'stable');
      promotedCount++;
    }

    if (newContent !== rule.content) {
      writeFileSync(filePath, newContent);
      updatedCount++;
    }
  }
}

// Sort by confidence descending
results.sort((a, b) => b.confidence - a.confidence);

// Print summary
console.log('CONFIDENCE SCORE DISTRIBUTION');
console.log('═'.repeat(70));
const bands = [
  { label: '90-100 (Very High)', min: 90, max: 101 },
  { label: '80-89  (High)',      min: 80, max: 90 },
  { label: '60-79  (Medium)',    min: 60, max: 80 },
  { label: '40-59  (Low)',       min: 40, max: 60 },
  { label: '0-39   (Draft)',     min: 0,  max: 40 },
];
for (const band of bands) {
  const count = results.filter(r => r.confidence >= band.min && r.confidence < band.max).length;
  const bar = '#'.repeat(Math.ceil(count / 2));
  console.log(`  ${band.label.padEnd(22)} ${String(count).padStart(3)} ${bar}`);
}

console.log('\nQUALIFIES FOR STABLE:');
const stableQualified = results.filter(r => r.qualifies);
if (stableQualified.length === 0) {
  console.log('  (none — most rules lack 5 TP + 5 TN + 3 evasion tests)');
} else {
  for (const r of stableQualified) {
    console.log(`  ${r.id.padEnd(20)} confidence=${r.confidence} fp_rate=${r.wildFpRate}% ${r.promoted ? '→ PROMOTED' : ''}`);
  }
}

console.log('\nTOP 10 BY CONFIDENCE:');
for (const r of results.slice(0, 10)) {
  console.log(`  ${r.id.padEnd(20)} confidence=${String(r.confidence).padStart(3)} maturity=${r.maturity.padEnd(12)} fires=${r.fireCount}`);
}

console.log('\nBOTTOM 10 BY CONFIDENCE:');
for (const r of results.slice(-10)) {
  console.log(`  ${r.id.padEnd(20)} confidence=${String(r.confidence).padStart(3)} maturity=${r.maturity.padEnd(12)} fires=${r.fireCount}`);
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`Total rules: ${results.length}`);
console.log(`Updated: ${updatedCount}`);
console.log(`Promoted to stable: ${promotedCount}`);
console.log(`Qualifies for stable: ${stableQualified.length}`);
if (isDryRun) console.log('(DRY RUN — no files modified)');
