# ATR Deployment Reports

Known deployments of Agent Threat Rules (ATR) in production or staging environments.

This file tracks real-world usage to validate rule effectiveness, surface false positives, and guide future rule development.

---

## 1. PanGuard Guard (Self-Dogfood)

| Field | Value |
|-------|-------|
| **Deployer** | PanGuard AI |
| **Framework** | PanGuard Guard v0.2.x (Node.js) |
| **Integration method** | npm library (`@panguard-ai/atr` via `GuardATREngine`) |
| **Rules loaded** | 52 stable rules across 9 categories |
| **Since** | v0.2.0 |
| **Status** | Active |

### Integration Architecture

PanGuard Guard wraps the ATR engine in a `GuardATREngine` class that bridges ATR with the Guard's four-stage detection pipeline:

```
SecurityEvent
  -> ATR Layer 1 (regex pattern matching, 52 rules)
  -> DetectAgent (merge ATR matches with Sigma/YARA detections)
  -> AnalyzeAgent (LLM triage for complex cases; skipped for whitelisted skills)
  -> RespondAgent (action execution: block_tool, kill_agent, quarantine_session, revoke_skill, reduce_permissions)
  -> ReportAgent (notification, Threat Cloud sync, dashboard)
```

### Rule Loading

Rules are loaded from two sources at startup:

1. **Bundled rules** -- shipped with the `@panguard-ai/atr` npm package (52 rules)
2. **Cloud rules** -- fetched from Threat Cloud and added via `addCloudRule()` (community-contributed)

Hot-reload is enabled for local custom rules.

### Session Tracking

The `SessionTracker` correlates events across agent sessions, enabling behavioral detection rules that span multiple events. Sessions idle for 30+ minutes are automatically evicted.

### Skill Fingerprinting and Whitelist

The integration includes a `SkillFingerprintStore` that tracks tool invocation patterns. When a skill's fingerprint stabilizes (consistent behavior over time), it is auto-promoted to the whitelist. If behavioral drift is detected post-promotion, the skill is automatically revoked from the whitelist and a synthetic `ATR-DRIFT-DETECT` match enters the detection pipeline.

### ATR-Specific Response Actions

Five ATR response actions are implemented:

- `block_tool` -- prevent tool invocation
- `kill_agent` -- terminate agent process (SIGTERM, fallback SIGKILL)
- `quarantine_session` -- isolate session, write quarantine marker
- `revoke_skill` -- remove skill from whitelist
- `reduce_permissions` -- restrict session capabilities (deny_write, deny_exec, deny_network)

### Observations

- ATR rules run synchronously on every security event; latency is negligible for 52 rules.
- Rule matches merge cleanly with Sigma/YARA detections in a unified `DetectionResult`.
- Whitelisted skills with no ATR matches skip LLM analysis, reducing cost and latency.
- Cloud rule sync runs on a 1-hour interval, adding new ATR rules without restart.

---

## 2. Batch Skill Audit

| Field | Value |
|-------|-------|
| **Deployer** | PanGuard AI |
| **Framework** | PanGuard Skill Auditor (Node.js, batch mode) |
| **Integration method** | Direct ATR engine evaluation |
| **Rules loaded** | 52 stable rules |
| **Date** | 2026-03-14 |
| **Status** | Completed |

### Scan Summary

| Metric | Value |
|--------|-------|
| Skills/commands/agents scanned | 97 |
| CRITICAL findings | 1 |
| HIGH findings | 15 |
| MEDIUM findings | 66 |
| LOW findings | 15 |
| Auto-whitelisted skills | 15 |

### Methodology

All 97 skills were evaluated against the full ATR rule set. Each skill's declared capabilities, permission requests, and behavioral patterns were converted to `AgentEvent` format and run through Layer 1 regex detection.

Skills that passed all checks with zero findings were candidates for auto-whitelist promotion based on fingerprint stability.

### Findings Distribution

- The single CRITICAL finding involved a skill requesting unrestricted filesystem and network access with no declared scope.
- HIGH findings were concentrated in the `privilege-escalation` and `excessive-autonomy` categories.
- MEDIUM findings were primarily informational scope warnings.
- LOW findings flagged minor hygiene issues (e.g., overly broad tool descriptions).

---

## Submit a Deployment Report

If you are using ATR rules in your project, we welcome deployment reports. They help us:

- Validate rule effectiveness across diverse frameworks
- Identify false positives and coverage gaps
- Prioritize new rule development based on real-world usage

### How to Submit

1. Open an issue using the **Deployment Report** template: [Submit Report](https://github.com/Agent-Threat-Rule/agent-threat-rules/issues/new?template=deployment-report.yml)
2. Include at minimum:
   - Framework name and language
   - Integration method (npm, YAML loader, API, etc.)
   - Number of rules loaded
   - Any false positives or missed detections observed
3. Optionally, submit a PR to add your deployment to this file.

### Template

```markdown
## [Your Project Name]

| Field | Value |
|-------|-------|
| **Deployer** | [Organization or individual] |
| **Framework** | [Framework name and version] |
| **Integration method** | [npm / YAML parser / REST API / MCP / etc.] |
| **Rules loaded** | [Number] |
| **Since** | [Version or date] |
| **Status** | [Active / Testing / Deprecated] |

### Integration Notes
[How ATR rules are loaded and evaluated in your system]

### Observations
[False positives, missed detections, performance notes, etc.]
```

---

## Deployment Count

| # | Project | Method | Rules | Status |
|---|---------|--------|-------|--------|
| 1 | PanGuard Guard | npm (`@panguard-ai/atr`) | 52 | Active |
| 2 | Batch Skill Audit | Direct engine | 52 | Completed |
