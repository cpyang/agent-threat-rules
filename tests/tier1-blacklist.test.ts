/**
 * Tier 1: Blacklist Provider Tests
 *
 * Tests that known-bad skills are blocked by hash or name lookup.
 */

import { describe, it, expect } from 'vitest';
import {
  InMemoryBlacklist,
  buildBlacklistMatch,
  resolveSkillId,
  type BlacklistEntry,
} from '../src/tier1-blacklist.js';

const SAMPLE_ENTRIES: BlacklistEntry[] = [
  {
    skillHash: 'abc123def456',
    skillName: '@evil/mcp-server',
    reason: 'Credential exfiltration via env vars',
    reportCount: 5,
    severity: 'critical',
  },
  {
    skillHash: 'xyz789ghi012',
    skillName: 'malicious-tool-v2',
    reason: 'Reverse shell in postinstall',
    reportCount: 3,
    severity: 'high',
  },
];

describe('Tier 1: Blacklist', () => {
  describe('InMemoryBlacklist', () => {
    const blacklist = new InMemoryBlacklist(SAMPLE_ENTRIES);

    it('looks up by hash', () => {
      const entry = blacklist.lookup('abc123def456');
      expect(entry).toBeDefined();
      expect(entry!.skillName).toBe('@evil/mcp-server');
    });

    it('looks up by name (case-insensitive)', () => {
      const entry = blacklist.lookup('@Evil/MCP-Server');
      expect(entry).toBeDefined();
      expect(entry!.skillHash).toBe('abc123def456');
    });

    it('returns undefined for clean skill', () => {
      const entry = blacklist.lookup('safe-skill');
      expect(entry).toBeUndefined();
    });

    it('reports correct size', () => {
      expect(blacklist.size()).toBe(2);
    });

    it('empty blacklist returns undefined for everything', () => {
      const empty = new InMemoryBlacklist();
      expect(empty.lookup('anything')).toBeUndefined();
      expect(empty.size()).toBe(0);
    });

    it('withEntries creates new instance', () => {
      const newBlacklist = blacklist.withEntries([SAMPLE_ENTRIES[0]!]);
      expect(newBlacklist.size()).toBe(1);
      expect(blacklist.size()).toBe(2); // original unchanged
    });
  });

  describe('buildBlacklistMatch', () => {
    it('produces ATRMatch with correct severity and confidence', () => {
      const match = buildBlacklistMatch(SAMPLE_ENTRIES[0]!);
      expect(match.rule.severity).toBe('critical');
      expect(match.confidence).toBe(1.0);
      expect(match.rule.id).toContain('tier1-blacklist');
      expect(match.rule.description).toContain('@evil/mcp-server');
      expect(match.rule.description).toContain('5 users');
    });

    it('includes report count in description', () => {
      const match = buildBlacklistMatch(SAMPLE_ENTRIES[1]!);
      expect(match.rule.description).toContain('3 users');
      expect(match.rule.severity).toBe('high');
    });
  });

  describe('resolveSkillId', () => {
    it('prefers metadata.skillHash', () => {
      const id = resolveSkillId({
        metadata: { skillHash: 'hash123', packageName: 'pkg' },
        fields: { tool_name: 'tool' },
      });
      expect(id).toBe('hash123');
    });

    it('falls back to metadata.packageName', () => {
      const id = resolveSkillId({
        metadata: { packageName: '@scope/pkg' },
        fields: { tool_name: 'tool' },
      });
      expect(id).toBe('@scope/pkg');
    });

    it('falls back to fields.package_name', () => {
      const id = resolveSkillId({
        fields: { package_name: '@scope/pkg', tool_name: 'tool' },
      });
      expect(id).toBe('@scope/pkg');
    });

    it('falls back to fields.tool_name as last resort', () => {
      const id = resolveSkillId({ fields: { tool_name: 'my-tool' } });
      expect(id).toBe('my-tool');
    });

    it('returns undefined when no identifier available', () => {
      const id = resolveSkillId({});
      expect(id).toBeUndefined();
    });
  });
});
