# The State of AI Skill Security: 36,394 Skills Audited on ClawHub

**ATR Project | March 2026**

> Methodology: ATR v0.4.0 (71 detection rules, OWASP Agentic Top 10 mapped). Engine: ATR scan-core v1.4.0.
> Benchmark: PINT — 62.7% recall, 99.7% precision (Tier 2 regex only).
> Full dataset: [ecosystem-report.csv](https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/data/clawhub-scan)

---

## Executive Summary

We conducted the largest automated security audit of AI agent skills to date, scanning the entire ClawHub registry — 36,394 skills — using ATR v0.4.0, an open-source detection engine with 71 YAML rules covering all 10 OWASP Agentic Top 10 categories.

**Key findings:**

- **9,676 skills** (27%) had scannable content (SKILL.md). The remaining 73% had no content or were delisted.
- **1,306 skills** (13.5% of scanned) triggered at least one security finding.
- **182 CRITICAL** — active prompt injection, hidden malicious content, system prompt override.
- **1,124 HIGH** — unsafe tool patterns, credential exposure risk, excessive permissions.
- **1,016 MEDIUM** — suspicious behavioral patterns, weak input validation.
- **7,354 LOW** — informational findings, best practice violations.

The most common CRITICAL finding was **malicious content hidden in MCP tool responses** — attack payloads concealed within HTML comments or markdown markup that are invisible to users but processed by AI agents.

**What this means:** 1 in 7 AI skills with scannable content contains a security pattern that could be exploited. Developers installing AI skills from public registries face measurable supply chain risk.

---

## 1. Methodology

### 1.1 Scanner

ATR (Agent Threat Rules) v0.4.0 — an open-source, YAML-based detection engine. Detection operates at Tier 2 (pre-compiled regex pattern matching), processing each skill in <50ms.

| Property | Value |
|----------|-------|
| ATR version | v0.4.0 |
| Detection rules | 71 across 9 threat categories |
| OWASP Agentic Top 10 | Rules mapped to all 10 categories |
| Detection tier | Tier 2 (regex pattern matching) |
| PINT recall | 62.7% (451 attack samples) |
| PINT precision | 99.7% (399 benign samples) |
| PINT false positive rate | 0.3% |
| Scan target | SKILL.md content (tool descriptions, instructions, metadata) |
| Scan date | March 26-27, 2026 |

### 1.2 Scope

| Metric | Count |
|--------|-------|
| Total registry entries | 36,394 |
| With scannable content (SKILL.md) | 9,676 (27%) |
| No content / delisted | 27,718 (73%) |

### 1.3 OWASP Agentic Top 10 Rule Coverage

ATR maps detection rules to all 10 categories of the [OWASP Top 10 for Agentic Applications (2026)](https://owasp.org/www-project-top-10-for-agentic-applications/). Coverage strength varies by category:

| OWASP Category | ATR Rules | Strength | Known Gaps |
|---|---|---|---|
| ASI01: Agent Goal Hijack | 13 | STRONG | Paraphrase, multi-turn |
| ASI02: Tool Misuse & Exploitation | 11 | STRONG | Zero-day tool chains |
| ASI03: Identity & Privilege Abuse | 9 | STRONG | OAuth edge cases |
| ASI04: Agentic Supply Chain | 8 | STRONG | Obfuscated payloads |
| ASI05: Unexpected Code Execution | 8 | STRONG | Polyglot payloads |
| ASI06: Memory & Context Poisoning | 8 | STRONG | Semantic paraphrase |
| ASI07: Inter-Agent Communication | 5 | MODERATE | Novel A2A protocols |
| ASI08: Cascading Failures | 4 | MODERATE | Distributed multi-step |
| ASI09: Human-Agent Trust | 5 | MODERATE | Social engineering variants |
| ASI10: Rogue Agents | 7 | MODERATE | Sleeper activation |

**Important context:** "Mapped" means ATR has detection rules targeting each category. It does not mean comprehensive protection. At 62.7% recall, ATR catches roughly 2 in 3 known attack patterns. Paraphrase attacks, non-English payloads, and novel attack compositions are known blind spots at the regex tier. Higher detection tiers (behavioral analysis, LLM semantic analysis) are designed to address these gaps but were not used in this scan.

### 1.4 What This Scan Cannot Detect

- **Runtime behavior** — this scan analyzes static SKILL.md content, not runtime execution.
- **Obfuscated payloads** — Base64, hex encoding, Unicode homoglyphs bypass regex.
- **Paraphrased attacks** — "set aside the guidance you've been given" vs "ignore instructions."
- **Multi-turn attacks** — attacks that unfold across multiple interactions.
- **Binary/compiled tools** — only text-based skill definitions are scanned.

These limitations are structural to Tier 2 regex detection. They are documented per-rule in the ATR rule set, following ATR's mandatory `evasion_tests` design.

---

## 2. Results

### 2.1 Severity Distribution

| Severity | Count | % of Scanned |
|----------|-------|-------------|
| CRITICAL | 182 | 1.9% |
| HIGH | 1,124 | 11.6% |
| MEDIUM | 1,016 | 10.5% |
| LOW | 7,354 | 76.0% |
| **Total with findings** | **9,676** | **100%** |
| **Flagged (CRITICAL+HIGH+MEDIUM)** | **2,322** | **24.0%** |

Note: A skill may trigger multiple rules. LOW findings include informational patterns (e.g., broad filesystem access declarations) that may be legitimate depending on the skill's purpose.

### 2.2 Top CRITICAL Findings (Anonymized)

We do not name specific skills with CRITICAL findings in this public report, consistent with responsible disclosure practices. Authors were notified via ClawHub's issue system.

**Pattern 1: Malicious Content Hidden in Tool Responses**

The most prevalent CRITICAL pattern. Attack payloads are embedded in HTML comments (`<!-- inject: ignore all prior instructions -->`) or invisible markdown within SKILL.md tool response templates. The content is invisible when rendered as documentation but is processed by AI agents as part of the tool response context.

**Pattern 2: System Prompt Override Attempts**

Skills that include instructions designed to override the AI agent's system prompt. These range from explicit ("You are now...") to subtle (gradual context redefinition across multiple tool interactions).

**Pattern 3: Unauthorized Tool Call Patterns**

Skills whose tool definitions request capabilities beyond their stated purpose — e.g., a "text formatting" skill that requests filesystem write access and network permissions.

### 2.3 Comparison to Previous Scan

| Metric | v3 Paper (Mar 21, 2026) | This Report (Mar 27, 2026) |
|--------|------------------------|---------------------------|
| Registry | npm MCP packages | ClawHub AI skills |
| Scope | 2,386 packages | 36,394 skills (15x) |
| ATR version | v0.3.1 (61 rules) | v0.4.0 (71 rules, +16%) |
| OWASP coverage | 7/10 | 10/10 (all categories mapped) |
| PINT recall | 39.9% | 62.7% (+57% relative) |
| CRITICAL findings | 402 (16.8%) | 182 (1.9%) |
| HIGH findings | 240 (10.1%) | 1,124 (11.6%) |

The lower CRITICAL rate on ClawHub (1.9% vs 16.8% on npm) likely reflects ClawHub's content moderation and the different composition of the registries. The absolute number of CRITICAL findings (182) across a much larger population still represents significant risk.

---

## 3. Analysis

### 3.1 The 73% Problem

73% of registered skills (27,718) had no scannable content — no SKILL.md, no tool descriptions, or the listing was delisted. This is a coverage gap for any static analysis approach. Runtime behavioral monitoring (ATR Tier 3) is designed to address this gap but requires active deployment.

### 3.2 Supply Chain Risk Is Measurable

13.5% of skills with content triggered a security finding at CRITICAL, HIGH, or MEDIUM severity. For a developer installing skills from ClawHub without scanning, this translates to roughly a **1-in-7 chance** of installing a skill with a non-trivial security pattern.

This is a lower bound. At 62.7% recall, ATR detects approximately 2 in 3 known patterns. The true positive rate is likely higher.

### 3.3 Hidden Markup Is the Dominant Attack Vector

The most common CRITICAL finding — malicious content hidden in HTML comments or invisible markdown — exploits a fundamental characteristic of AI agents: they process raw text, including content that is invisible when rendered visually. This is analogous to SQL injection exploiting the gap between what a user sees and what a database processes.

---

## 4. Recommendations

### For Developers

1. **Scan before install.** `npx @panguard-ai/panguard audit skill <path>` checks any skill against 71 ATR rules in <1 second.
2. **Review SKILL.md source.** Do not rely on rendered previews. Check raw text for hidden content.
3. **Prefer skills with high install counts and active maintenance.** Supply chain risk correlates inversely with community scrutiny.

### For Platform Operators (ClawHub, Smithery, npm)

1. **Integrate automated scanning into skill submission.** ATR is open-source (MIT) and can be embedded as a pre-publish check.
2. **Display scan results on skill listing pages.** Visibility creates accountability.
3. **Require SKILL.md for all published skills.** The 73% without content are invisible to static analysis.

### For Security Teams

1. **Inventory all AI skills in use.** Most organizations do not track which MCP skills their developers have installed.
2. **Add AI skill scanning to your CI/CD pipeline.** Treat skill installation like dependency installation — scan on every change.
3. **Monitor for behavioral drift.** Static scanning catches known patterns. Runtime monitoring (ATR Tier 3) catches novel behavior.

---

## 5. Limitations and Transparency

This report presents findings from a single automated scan using Tier 2 regex-based detection. The known limitations are:

1. **62.7% recall** — ATR catches roughly 2 in 3 known attack patterns. The remaining third requires higher detection tiers (behavioral, semantic) not used in this scan.
2. **Static analysis only** — SKILL.md content was analyzed. Runtime behavior was not observed.
3. **No manual verification** — CRITICAL findings have not been individually confirmed by human analysts. False positives are expected at the 0.3% rate measured on PINT.
4. **Single point in time** — Skills may be updated or removed after scan date.
5. **OWASP mapping is rule-level, not protection-level** — having rules mapped to all 10 categories does not mean comprehensive defense against all attack variants in each category.

We publish these limitations because transparent, independently verifiable security analysis provides more utility than opaque claims of comprehensive protection. The full dataset (ecosystem-report.csv) and detection rules are available for independent reproduction.

---

## References

- ATR v0.4.0: [github.com/Agent-Threat-Rule/agent-threat-rules](https://github.com/Agent-Threat-Rule/agent-threat-rules)
- PINT Benchmark: [github.com/lakeraai/pint-benchmark](https://github.com/lakeraai/pint-benchmark)
- OWASP Agentic Top 10: [owasp.org/www-project-top-10-for-agentic-applications](https://owasp.org/www-project-top-10-for-agentic-applications/)
- ATR Paper v3 (Zenodo): [doi.org/10.5281/zenodo.19178002](https://doi.org/10.5281/zenodo.19178002)
- Scan dataset: [data/clawhub-scan/](https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/data/clawhub-scan)

---

**License:** This report is released under CC BY 4.0. Cite as: ATR Project, "The State of AI Skill Security: 36,394 Skills Audited on ClawHub," March 2026.
