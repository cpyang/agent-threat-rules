# Changelog

All notable changes to ATR will be documented in this file.

## [0.2.3] - 2026-03-16

### Added
- 9 new rules from Threat Cloud community promotion (ATR-2026-100~108):
  consent bypass, trust escalation, disguised analytics exfiltration,
  hidden safety bypass, persona hijacking, silent action concealment,
  schema-description contradiction, delayed execution bypass, Sybil attack
- Python engine (pyATR) v0.2.0: validate, test, stats CLI commands, 48 tests
- Splunk SPL converter (`atr convert splunk`)
- Elastic Query DSL converter (`atr convert elastic`)
- Layer 3 LLM-as-judge prompt templates (docs/layer3-prompt-templates.md)
- Automated scan pipeline (scripts/auto-scan-pipeline.sh)
- Deployment guide for external teams (docs/deployment-guide.md)
- MCP ecosystem security audit report: 1,295 packages, 14,299 tools
- npm crawler with pagination (795 → 2,769 discoverable packages)

### Fixed
- CLI test runner: handle tool_description field, fix event type mapping
- All 61 rules pass embedded test cases (556/556, 100%)
- CJK test cases moved to evasion_tests (honest: regex can't match them)
- Removed all PanGuard references for ATR independence
- Fixed pyATR URLs pointing to wrong GitHub org

### Stats
- 61 rules (44 experimental + 17 draft)
- 556 test cases (100% pass rate)
- 164 TypeScript tests + 48 Python tests = 212 engine tests
- 12 SIEM converter tests

## [0.2.2] - 2026-03-14

### Fixed
- ReDoS vulnerability in SSRF rule (ATR-2026-013) — O(n^2) backtracking on long hostnames
- SSRF rule false positive on filesystem paths like /home/user/
- tool_args field extraction fallback for tool_call events

### Added
- True negatives for 21 rules with insufficient test coverage (7 had zero, 14 had only 1)
- Vitest coverage reporting with v8 provider (60%+ threshold on core modules)

## [0.2.1] - 2026-03-10

### Changed
- Standardized 17 predicted rule IDs (ATR-PRED → ATR-2026-080~096)
- Fixed rule validator for skill-compromise category
- Toned down coverage claims to reflect actual verification status

## [0.1.0-rc2] - 2026-03-09

### Added
- 32 initial experimental detection rules across 9 attack categories
- TypeScript reference engine with SessionTracker
- OWASP Top 10 for Agentic Applications (2026) mapping (6 covered, 2 partial, 2 gaps)
- 13 CVE reference mappings across 16 rules (pattern-based, not empirically verified)
- OWASP LLM Top 10 (2025) mapping (7 covered, 3 gaps)
- MITRE ATLAS technique references
- JSON Schema specification (spec/atr-schema.yaml)
- Built-in true positive and true negative test cases for every rule
- Attack corpus validation tests
- Coverage report (COVERAGE.md)

### Attack Categories
- Prompt Injection (5 rules)
- Tool Poisoning (4 rules)
- Context Exfiltration (3 rules)
- Agent Manipulation (3 rules)
- Privilege Escalation (2 rules)
- Excessive Autonomy (2 rules)
- Skill Compromise (7 rules)
- Data Poisoning (1 rule)
- Model Security (2 rules)
