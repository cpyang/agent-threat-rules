/**
 * DefaultAdapter tests.
 *
 * Validates that every method returns a success ActionResult
 * and that the adapter name is 'default'.
 */

import { describe, it, expect } from 'vitest';
import { DefaultAdapter } from '../src/adapters/default-adapter.js';
import type {
  ATRAction,
  ATRVerdict,
  AgentEvent,
  ExecutionContext,
  ActionResult,
} from '../src/types.js';

/** Build a minimal ExecutionContext for adapter tests */
function makeContext(): ExecutionContext {
  const verdict: ATRVerdict = {
    outcome: 'deny',
    reason: 'test verdict',
    matchCount: 1,
    highestSeverity: 'critical',
    highestConfidence: 0.95,
    actions: Object.freeze(['alert' as ATRAction]),
    matches: Object.freeze([]),
    timestamp: new Date().toISOString(),
  };

  const event: AgentEvent = {
    type: 'tool_call',
    timestamp: new Date().toISOString(),
    content: 'test_tool',
  };

  return Object.freeze({
    event,
    matches: Object.freeze([]),
    verdict,
  });
}

describe('DefaultAdapter', () => {
  const adapter = new DefaultAdapter();
  const ctx = makeContext();

  it('has name "default"', () => {
    expect(adapter.name).toBe('default');
  });

  const methodActionPairs: Array<[keyof DefaultAdapter, ATRAction]> = [
    ['blockInput', 'block_input'],
    ['blockOutput', 'block_output'],
    ['blockTool', 'block_tool'],
    ['quarantineSession', 'quarantine_session'],
    ['resetContext', 'reset_context'],
    ['alert', 'alert'],
    ['snapshot', 'snapshot'],
    ['escalate', 'escalate'],
    ['reducePermissions', 'reduce_permissions'],
    ['killAgent', 'kill_agent'],
  ];

  for (const [methodName, actionName] of methodActionPairs) {
    it(`${methodName}() returns ActionResult with success: true`, async () => {
      const method = adapter[methodName] as (ctx: ExecutionContext) => Promise<ActionResult>;
      const result = await method.call(adapter, ctx);

      expect(result.action).toBe(actionName);
      expect(result.success).toBe(true);
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
      expect(typeof result.timestamp).toBe('string');
    });

    it(`${methodName}() message indicates no-op/logging`, async () => {
      const method = adapter[methodName] as (ctx: ExecutionContext) => Promise<ActionResult>;
      const result = await method.call(adapter, ctx);

      expect(result.message).toContain('logged');
      expect(result.message).toContain('no-op');
    });

    it(`${methodName}() returns a frozen result`, async () => {
      const method = adapter[methodName] as (ctx: ExecutionContext) => Promise<ActionResult>;
      const result = await method.call(adapter, ctx);

      expect(Object.isFrozen(result)).toBe(true);
    });
  }
});
