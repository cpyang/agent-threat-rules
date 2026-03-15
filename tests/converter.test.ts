import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { convertRule, convertAllRules } from '../src/converters/index.js';
import { ruleToSPL } from '../src/converters/splunk.js';
import { ruleToElastic } from '../src/converters/elastic.js';
import { loadRuleFile, loadRulesFromDirectory } from '../src/loader.js';
import type { ATRRule } from '../src/types.js';

const RULES_DIR = join(__dirname, '..', 'rules');
const ATR_001_PATH = join(RULES_DIR, 'prompt-injection', 'ATR-2026-001-direct-prompt-injection.yaml');

describe('SIEM Converter', () => {
  describe('Splunk SPL Conversion', () => {
    it('converts ATR-2026-001 to valid SPL', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      const spl = ruleToSPL(rule);

      // Should include rule metadata in comments
      expect(spl).toContain('ATR-2026-001');
      expect(spl).toContain('Direct Prompt Injection');
      expect(spl).toContain('high');

      // Should include a base search
      expect(spl).toContain('index=ai_agent_logs');

      // Should include match() for regex conditions with OR logic
      expect(spl).toContain('match(');
      expect(spl).toContain('OR');

      // Should include a table command
      expect(spl).toContain('| table');
    });

    it('includes the field name from conditions', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      const spl = ruleToSPL(rule);

      expect(spl).toContain('user_input');
    });

    it('handles convertRule wrapper for splunk', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      const result = convertRule(rule, 'splunk');

      expect(result.ruleId).toBe('ATR-2026-001');
      expect(result.title).toContain('Direct Prompt Injection');
      expect(result.severity).toBe('high');
      expect(result.format).toBe('splunk');
      expect(result.query).toContain('index=ai_agent_logs');
    });
  });

  describe('Elastic Query DSL Conversion', () => {
    it('converts ATR-2026-001 to valid Elastic query', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      const elastic = ruleToElastic(rule);

      // Check _meta
      expect(elastic._meta.rule_id).toBe('ATR-2026-001');
      expect(elastic._meta.title).toContain('Direct Prompt Injection');
      expect(elastic._meta.severity).toBe('high');
      expect(elastic._meta.category).toBe('prompt-injection');

      // Should use bool.should for "any" logic
      expect(elastic.query.bool.should).toBeDefined();
      expect(elastic.query.bool.minimum_should_match).toBe(1);
      expect(elastic.query.bool.must).toBeUndefined();

      // Should have regexp clauses (all conditions in ATR-001 are regex)
      const shouldClauses = elastic.query.bool.should as unknown[];
      expect(shouldClauses.length).toBeGreaterThan(0);

      // Each clause should be a regexp query
      for (const clause of shouldClauses) {
        const c = clause as Record<string, unknown>;
        expect(c).toHaveProperty('regexp');
      }
    });

    it('handles convertRule wrapper for elastic', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      const result = convertRule(rule, 'elastic');

      expect(result.ruleId).toBe('ATR-2026-001');
      expect(result.format).toBe('elastic');

      // query should be valid JSON
      const parsed = JSON.parse(result.query);
      expect(parsed._meta.rule_id).toBe('ATR-2026-001');
      expect(parsed.query.bool.should).toBeDefined();
    });
  });

  describe('Condition logic', () => {
    it('uses bool.should for "any" condition logic', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      expect(rule.detection.condition).toBe('any');

      const elastic = ruleToElastic(rule);
      expect(elastic.query.bool.should).toBeDefined();
      expect(elastic.query.bool.must).toBeUndefined();
    });

    it('uses bool.must for "all" condition logic', () => {
      // Create a synthetic rule with "all" logic
      const rule = loadRuleFile(ATR_001_PATH);
      const allRule: ATRRule = {
        ...rule,
        detection: {
          ...rule.detection,
          condition: 'all',
          // Use only 2 conditions to keep the test small
          conditions: (rule.detection.conditions as unknown[]).slice(0, 2) as ATRRule['detection']['conditions'],
        },
      };

      const elastic = ruleToElastic(allRule);
      expect(elastic.query.bool.must).toBeDefined();
      expect(elastic.query.bool.should).toBeUndefined();
    });

    it('chains conditions sequentially for "all" in Splunk', () => {
      const rule = loadRuleFile(ATR_001_PATH);
      const allRule: ATRRule = {
        ...rule,
        detection: {
          ...rule.detection,
          condition: 'all',
          conditions: (rule.detection.conditions as unknown[]).slice(0, 2) as ATRRule['detection']['conditions'],
        },
      };

      const spl = ruleToSPL(allRule);

      // "all" logic should produce sequential | regex lines, not OR
      expect(spl).toContain('| regex user_input=');
      expect(spl).not.toContain('OR');
    });
  });

  describe('Bulk conversion', () => {
    it('converts all 61 rules to Splunk without error', () => {
      const results = convertAllRules(RULES_DIR, 'splunk');

      expect(results.length).toBeGreaterThanOrEqual(61);

      for (const result of results) {
        expect(result.ruleId).toMatch(/^ATR-\d{4}-\d{3}$/);
        expect(result.format).toBe('splunk');
        expect(result.query.length).toBeGreaterThan(0);
        expect(result.severity).toBeTruthy();
        expect(result.title).toBeTruthy();
      }
    });

    it('converts all 61 rules to Elastic without error', () => {
      const results = convertAllRules(RULES_DIR, 'elastic');

      expect(results.length).toBeGreaterThanOrEqual(61);

      for (const result of results) {
        expect(result.ruleId).toMatch(/^ATR-\d{4}-\d{3}$/);
        expect(result.format).toBe('elastic');

        // Each result query should be valid JSON
        const parsed = JSON.parse(result.query);
        expect(parsed._meta).toBeDefined();
        expect(parsed.query.bool).toBeDefined();
      }
    });
  });

  describe('Operator support', () => {
    it('converts contains operator to wildcard in Elastic', () => {
      const rule: ATRRule = {
        title: 'Test',
        id: 'ATR-2026-999',
        status: 'experimental',
        description: 'test',
        author: 'test',
        date: '2026/01/01',
        severity: 'medium',
        tags: { category: 'prompt-injection' },
        agent_source: { type: 'llm_io' },
        detection: {
          conditions: [
            { field: 'user_input', operator: 'contains', value: 'malicious_string' },
          ],
          condition: 'any',
        },
        response: { actions: ['alert'] },
      };

      const elastic = ruleToElastic(rule);
      const clause = (elastic.query.bool.should as Record<string, unknown>[])[0];
      expect(clause).toHaveProperty('wildcard');

      const spl = ruleToSPL(rule);
      expect(spl).toContain('malicious_string');
    });

    it('converts numeric operators to range in Elastic', () => {
      const rule: ATRRule = {
        title: 'Test Numeric',
        id: 'ATR-2026-998',
        status: 'experimental',
        description: 'test',
        author: 'test',
        date: '2026/01/01',
        severity: 'high',
        tags: { category: 'excessive-autonomy' },
        agent_source: { type: 'agent_behavior' },
        detection: {
          conditions: [
            { field: 'call_count', operator: 'gt', value: '100' },
            { field: 'duration', operator: 'lte', value: '5' },
          ],
          condition: 'all',
        },
        response: { actions: ['alert'] },
      };

      const elastic = ruleToElastic(rule);
      const mustClauses = elastic.query.bool.must as Record<string, unknown>[];
      expect(mustClauses).toHaveLength(2);

      const rangeClause1 = mustClauses[0] as { range: Record<string, unknown> };
      expect(rangeClause1.range.call_count).toEqual({ gt: 100 });

      const rangeClause2 = mustClauses[1] as { range: Record<string, unknown> };
      expect(rangeClause2.range.duration).toEqual({ lte: 5 });

      const spl = ruleToSPL(rule);
      expect(spl).toContain('| where call_count > 100');
      expect(spl).toContain('| where duration <= 5');
    });
  });
});
