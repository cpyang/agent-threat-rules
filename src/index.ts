/**
 * ATR (Agent Threat Rules) - Detection rules for AI Agent threats
 *
 * ATR is an open standard for writing detection rules specifically
 * for AI agent threats. Think "Sigma for AI Agents."
 *
 * @module agent-threat-rules
 */

export { ATREngine } from './engine.js';
export type { ATREngineConfig } from './engine.js';
export { SessionTracker } from './session-tracker.js';
export type { SessionStateSnapshot } from './session-tracker.js';
export { loadRuleFile, loadRulesFromDirectory, validateRule } from './loader.js';
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
export { RuleScaffolder } from './rule-scaffolder.js';
export type { ScaffoldInput, ScaffoldResult, ScaffoldOptions } from './rule-scaffolder.js';
export { CoverageAnalyzer } from './coverage-analyzer.js';
export type { CoverageGap, CoverageReport } from './coverage-analyzer.js';
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
