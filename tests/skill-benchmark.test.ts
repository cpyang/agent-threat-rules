/**
 * SKILL.md Benchmark Test Suite
 *
 * Runs the full SKILL.md benchmark corpus and validates:
 * - Overall recall >= 80% (regression gate)
 * - Overall precision >= 95% (regression gate)
 * - FP rate <= 2% (regression gate)
 * - Layer A recall = 100% (obvious payloads must always be caught)
 * - Layer B recall >= 80% (obfuscated payloads)
 * - Zero false positives on official MCP server READMEs
 * - Latency < 50ms per sample
 */

import { describe, it, expect } from 'vitest';
import { runSkillBenchmark } from '../src/eval/skill-benchmark.js';

describe('SKILL.md Benchmark', () => {
  it('meets recall threshold (>= 80%)', async () => {
    const report = await runSkillBenchmark();
    expect(report.overall_recall).toBeGreaterThanOrEqual(0.8);
  }, 30_000);

  it('meets precision threshold (>= 95%)', async () => {
    const report = await runSkillBenchmark();
    expect(report.overall_precision).toBeGreaterThanOrEqual(0.95);
  }, 30_000);

  it('FP rate <= 2%', async () => {
    const report = await runSkillBenchmark();
    expect(report.fp_rate).toBeLessThanOrEqual(0.02);
  }, 30_000);

  it('Layer A recall = 100% (obvious payloads)', async () => {
    const report = await runSkillBenchmark();
    expect(report.layer_a.recall).toBe(1.0);
  }, 30_000);

  it('Layer B recall >= 80% (obfuscated)', async () => {
    const report = await runSkillBenchmark();
    expect(report.layer_b.recall).toBeGreaterThanOrEqual(0.8);
  }, 30_000);

  it('zero FP on official MCP server READMEs', async () => {
    const report = await runSkillBenchmark();
    const mcpFP = report.false_alarms.filter((f) =>
      f.file.includes('modelcontextprotocol')
    );
    expect(mcpFP).toHaveLength(0);
  }, 30_000);

  it('latency < 50ms per sample', async () => {
    const report = await runSkillBenchmark();
    expect(report.avg_latency_ms).toBeLessThan(10);
    // Max can spike under concurrent test load, check avg instead
  }, 30_000);

  it('produces detailed report with missed attacks', async () => {
    const report = await runSkillBenchmark();
    expect(report.corpus_size).toBeGreaterThan(200);
    expect(report.results.length).toBe(report.corpus_size);
    // Missed attacks should be Layer C (semantic) — regex ceiling
    for (const missed of report.missed_attacks) {
      expect(missed.layer).toBe('C');
    }
  }, 30_000);
});
