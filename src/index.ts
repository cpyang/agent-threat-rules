/**
 * ATR (Agent Threat Rules) - Detection format for AI Agent threats
 *
 * ATR is the detection layer: it evaluates agent events against rules
 * and returns match results. It does NOT execute response actions,
 * send notifications, or manage dashboards. Those are the responsibility
 * of products built on ATR (e.g., PanGuard, LlamaFirewall, or your own).
 *
 * ATR 是偵測層：評估 agent 事件、回傳匹配結果。
 * 不執行回應動作、不發通知、不管 dashboard。
 * 那些是建立在 ATR 之上的產品的責任。
 *
 * @module agent-threat-rules
 */

// ── Core Detection Layer (stable API) ───────────────────────────
export { ATREngine } from './engine.js';
export type { ATREngineConfig } from './engine.js';
export { loadRuleFile, loadRulesFromDirectory, validateRule } from './loader.js';
export { SessionTracker } from './session-tracker.js';
export type { SessionStateSnapshot } from './session-tracker.js';

// ── Optional Detection Modules (Layer 2-3, beta) ────────────────
export { ModuleRegistry } from './modules/index.js';
export type { ATRModule, ModuleCondition, ModuleResult } from './modules/index.js';
export { SessionModule } from './modules/session.js';
/** @beta - Experimental, not production-tested */
export { SemanticModule } from './modules/semantic.js';
export type { SemanticModuleConfig } from './modules/semantic.js';
/** @beta - Experimental, not production-tested */
export { SkillFingerprintStore } from './skill-fingerprint.js';
export type {
  SkillFingerprint,
  BehaviorAnomaly,
  SkillFingerprintConfig,
} from './skill-fingerprint.js';
export type { SemanticLayerConfig } from './layer-integration.js';

// ── Tooling (rule authoring and coverage analysis) ──────────────
export { RuleScaffolder } from './rule-scaffolder.js';
export type { ScaffoldInput, ScaffoldResult, ScaffoldOptions } from './rule-scaffolder.js';
export { CoverageAnalyzer } from './coverage-analyzer.js';
export type { CoverageGap, CoverageReport } from './coverage-analyzer.js';

// ── Integration Helpers (for products built on ATR) ─────────────
// These help products like PanGuard, LlamaFirewall, etc. build
// protection layers on top of ATR detection results.
export { computeVerdict, SEVERITY_RANK, isAutoResponseEnabled } from './verdict.js';
export { ActionExecutor } from './action-executor.js';
export type { ActionExecutorConfig } from './action-executor.js';
export { DefaultAdapter } from './adapters/default-adapter.js';
export { StdioAdapter } from './adapters/stdio-adapter.js';
export { HookHandler } from './hook-handler.js';
export type { HookHandlerConfig } from './hook-handler.js';
export type {
  ATRRule,
  ATRMatch,
  AgentEvent,
  AgentEventType,
  ATRAction,
  ATRCategory,
  ATRSeverity,
  ATRStatus,
  ATRConfidence,
  ATRSourceType,
  ATRMatchType,
  ATROperator,
  ATRReferences,
  ATRTags,
  ATRAgentSource,
  ATRDetection,
  ATRResponse,
  ATRTestCases,
  ATRTestCase,
  ATRPatternCondition,
  ATRBehavioralCondition,
  ATRSequenceCondition,
  ATRSequenceStep,
  VerdictOutcome,
  ATRVerdict,
  ActionResult,
  ExecutionContext,
  PlatformAdapter,
  HookInput,
  HookOutput,
} from './types.js';
