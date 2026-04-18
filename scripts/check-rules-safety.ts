#!/usr/bin/env node
/**
 * check-rules-safety.ts — Auto-merge safety gate for TC-crystallized rules
 *
 * Per auto-merge policy (B2 variant):
 *   1. Every new rule must have test_cases.true_positives AND true_negatives
 *   2. Every new rule must have a non-empty author that is not "MiroFish Predicted"
 *   3. Every new rule, when evaluated against data/skill-benchmark/benign/*.md,
 *      MUST match 0 files (no false positives on known-clean corpus)
 *   4. Number of new rule files must be ≤ MAX_NEW_PER_PR (default 10)
 *
 * Exit 0 = safe to auto-merge
 * Exit 1 = any check failed → PR stays in human-review queue
 *
 * Usage (in tc-pr-back workflow):
 *   npx tsx scripts/check-rules-safety.ts --base origin/main
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import { ATREngine } from '../src/engine.js';
import type { AgentEvent } from '../src/types.js';

const MAX_NEW_PER_PR = Number(process.env.MAX_NEW_PER_PR ?? 10);
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BENIGN_DIR = join(REPO_ROOT, 'data/skill-benchmark/benign');
const RULES_DIR = join(REPO_ROOT, 'rules');

interface Failure {
  file: string;
  reason: string;
}

function parseArgs(): { base: string } {
  const argv = process.argv.slice(2);
  const baseIdx = argv.indexOf('--base');
  const base = baseIdx >= 0 ? (argv[baseIdx + 1] ?? 'origin/main') : 'origin/main';
  return { base };
}

/** Diff against base to find newly added rule files. */
function getNewRuleFiles(base: string): string[] {
  try {
    const out = execFileSync(
      'git',
      ['diff', '--name-only', '--diff-filter=A', `${base}...HEAD`, '--', 'rules/'],
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    ).trim();
    return out
      .split('\n')
      .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
      .filter(Boolean);
  } catch (err) {
    console.error(
      `[safety-gate] git diff failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return [];
  }
}

function loadDoc(file: string): Record<string, unknown> | null {
  const abs = join(REPO_ROOT, file);
  if (!existsSync(abs)) return null;
  try {
    return yamlLoad(readFileSync(abs, 'utf-8')) as Record<string, unknown>;
  } catch (err) {
    console.error(
      `[safety-gate] Cannot parse ${file}: ${err instanceof Error ? err.message : String(err)}`
    );
    return null;
  }
}

/** Check 1+2: structure + author. */
function checkMetadata(file: string, doc: Record<string, unknown>): Failure | null {
  const author = typeof doc.author === 'string' ? doc.author : '';
  if (!author) return { file, reason: 'missing author field' };
  if (/MiroFish\s+Predicted/i.test(author)) {
    return {
      file,
      reason: `blocked author "${author}" (MiroFish Predicted rules require human review)`,
    };
  }
  const testCases = doc.test_cases as Record<string, unknown> | undefined;
  if (!testCases) return { file, reason: 'missing test_cases block' };
  const tp = Array.isArray(testCases.true_positives) ? testCases.true_positives : [];
  const tn = Array.isArray(testCases.true_negatives) ? testCases.true_negatives : [];
  if (tp.length === 0) return { file, reason: 'missing test_cases.true_positives (need ≥1)' };
  if (tn.length === 0) return { file, reason: 'missing test_cases.true_negatives (need ≥1)' };
  return null;
}

/**
 * Check 3: scan benign corpus. For each sample, collect all matching rule IDs;
 * if any new rule ID appears, that rule FP'd.
 */
async function checkFalsePositives(newRuleIds: Set<string>): Promise<Map<string, string[]>> {
  const fps = new Map<string, string[]>();
  if (!existsSync(BENIGN_DIR)) {
    console.error(`[safety-gate] benign corpus not found at ${BENIGN_DIR} — skipping FP check`);
    return fps;
  }
  const engine = new ATREngine({ rulesDir: RULES_DIR });
  await engine.loadRules();

  const samples = readdirSync(BENIGN_DIR).filter((f) => f.endsWith('.md'));
  for (const sample of samples) {
    const content = readFileSync(join(BENIGN_DIR, sample), 'utf-8');
    const asEvent: AgentEvent = {
      type: 'mcp_exchange',
      timestamp: new Date().toISOString(),
      content,
      fields: {
        tool_name: 'benign-sample',
        tool_input: content,
        tool_response: content,
        user_input: content,
      },
    };
    const matched = new Set<string>();
    for (const m of engine.evaluate(asEvent)) matched.add(m.rule.id);
    for (const m of engine.scanSkill(content)) matched.add(m.rule.id);

    for (const id of matched) {
      if (newRuleIds.has(id)) {
        if (!fps.has(id)) fps.set(id, []);
        fps.get(id)!.push(sample);
      }
    }
  }
  return fps;
}

async function main(): Promise<void> {
  const { base } = parseArgs();
  const newFiles = getNewRuleFiles(base);

  console.log(`[safety-gate] base=${base}`);
  console.log(`[safety-gate] ${newFiles.length} new rule file(s) detected`);

  if (newFiles.length === 0) {
    console.log('[safety-gate] No new rule files — nothing to check, treating as safe.');
    process.exit(0);
  }

  if (newFiles.length > MAX_NEW_PER_PR) {
    console.log(
      `[safety-gate] FAIL — ${newFiles.length} new rules exceeds MAX_NEW_PER_PR=${MAX_NEW_PER_PR}. Human review required.`
    );
    process.exit(1);
  }

  const failures: Failure[] = [];
  const newRuleIds = new Set<string>();
  const fileToId = new Map<string, string>();

  for (const file of newFiles) {
    const doc = loadDoc(file);
    if (!doc) {
      failures.push({ file, reason: 'could not parse rule file' });
      continue;
    }
    const metaFail = checkMetadata(file, doc);
    if (metaFail) {
      failures.push(metaFail);
      continue;
    }
    const id = typeof doc.id === 'string' ? doc.id : '';
    if (!id) {
      failures.push({ file, reason: 'missing id field' });
      continue;
    }
    newRuleIds.add(id);
    fileToId.set(id, file);
  }

  if (newRuleIds.size > 0) {
    const fps = await checkFalsePositives(newRuleIds);
    for (const [id, samples] of fps) {
      failures.push({
        file: fileToId.get(id) ?? id,
        reason: `false positive on ${samples.length} benign sample(s): ${samples.slice(0, 3).join(', ')}${samples.length > 3 ? ', ...' : ''}`,
      });
    }
  }

  if (failures.length === 0) {
    console.log(`[safety-gate] PASS — ${newFiles.length} rule(s) safe to auto-merge`);
    newFiles.forEach((f) => console.log(`  ✓ ${f}`));
    process.exit(0);
  }

  console.log(`[safety-gate] FAIL — ${failures.length} rule(s) need human review:`);
  failures.forEach((f) => console.log(`  ✗ ${f.file} — ${f.reason}`));
  process.exit(1);
}

void main();
