# ATR → OWASP Agentic Top 10 Mapping

Last updated: 2026-03-26
ATR version: v0.3.1 (61 rules)
OWASP framework: Top 10 for Agentic Applications 2026

## Coverage Summary

| OWASP Category | ATR Coverage | Rules | Status |
|---|---|---|---|
| ASI01: Agent Goal Hijack | 22 rules | ATR-001~005, 080~094, 097, 104 | STRONG |
| ASI02: Tool Misuse & Exploitation | 11 rules | ATR-010~013, 095, 096, 100, 101, 103, 105, 106 | STRONG |
| ASI03: Identity & Privilege Abuse | 3 rules | ATR-040, 041, 107 | PARTIAL |
| ASI04: Agentic Supply Chain | 7 rules | ATR-060~066 | STRONG |
| ASI05: Unexpected Code Execution (RCE) | 2 rules | ATR-012, 083 | PARTIAL |
| ASI06: Memory & Context Poisoning | 5 rules | ATR-020, 021, 070, 075, 102 | MODERATE |
| ASI07: Insecure Inter-Agent Communication | 2 rules | ATR-076, 108 | PARTIAL |
| ASI08: Cascading Failures | 3 rules | ATR-050, 051, 052 | MODERATE |
| ASI09: Human-Agent Trust Exploitation | 2 rules | ATR-077, 098 | PARTIAL |
| ASI10: Rogue Agents | 4 rules | ATR-030, 032, 074, 099 | MODERATE |

**Overall: 8/10 categories covered. 61 rules mapped.**

---

## Detailed Mapping

### ASI01: Agent Goal Hijack

Hidden prompts and injection attacks that redirect agent behavior away from its intended goal.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-001 | Direct Prompt Injection | CRITICAL |
| ATR-2026-002 | Indirect Prompt Injection | CRITICAL |
| ATR-2026-003 | Jailbreak Attempt | HIGH |
| ATR-2026-004 | System Prompt Override | CRITICAL |
| ATR-2026-005 | Multi-Turn Injection | HIGH |
| ATR-2026-080 | Encoding Evasion | MEDIUM |
| ATR-2026-081 | Semantic Multi-Turn | HIGH |
| ATR-2026-082 | Fingerprint Evasion | MEDIUM |
| ATR-2026-083 | Indirect Tool Injection | HIGH |
| ATR-2026-084 | Structured Data Injection | MEDIUM |
| ATR-2026-085 | Audit Evasion | HIGH |
| ATR-2026-086 | Visual Spoofing | MEDIUM |
| ATR-2026-087 | Rule Probing | MEDIUM |
| ATR-2026-088 | Adaptive Countermeasure | HIGH |
| ATR-2026-089 | Polymorphic Skill | HIGH |
| ATR-2026-090 | Threat Intel Exfil | HIGH |
| ATR-2026-091 | Nested Payload | HIGH |
| ATR-2026-092 | Consensus Poisoning | HIGH |
| ATR-2026-093 | Gradual Escalation | HIGH |
| ATR-2026-094 | Audit Bypass | HIGH |
| ATR-2026-097 | CJK Injection Patterns | MEDIUM |
| ATR-2026-104 | Persona Hijacking | HIGH |

### ASI02: Tool Misuse & Exploitation

Agents bending legitimate tools into destructive outputs or using tools beyond their intended scope.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-010 | MCP Malicious Response | CRITICAL |
| ATR-2026-011 | Tool Output Injection | HIGH |
| ATR-2026-012 | Unauthorized Tool Call | HIGH |
| ATR-2026-013 | Tool SSRF | CRITICAL |
| ATR-2026-095 | Supply Chain Poisoning | CRITICAL |
| ATR-2026-096 | Registry Poisoning | HIGH |
| ATR-2026-100 | Consent Bypass Instruction | HIGH |
| ATR-2026-101 | Trust Escalation Override | HIGH |
| ATR-2026-103 | Hidden Safety Bypass Instruction | CRITICAL |
| ATR-2026-105 | Silent Action Concealment | HIGH |
| ATR-2026-106 | Schema-Description Contradiction | MEDIUM |

### ASI03: Identity & Privilege Abuse

Leaked credentials or escalated privileges allowing agents to operate beyond intended scope.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-040 | Privilege Escalation | CRITICAL |
| ATR-2026-041 | Scope Creep | HIGH |
| ATR-2026-107 | Delayed Execution Bypass | HIGH |

**Gap:** No rules for credential rotation detection, OAuth token abuse, or service account misuse.

### ASI04: Agentic Supply Chain Vulnerabilities

Dynamic MCP and A2A ecosystems where runtime components can be poisoned.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-060 | Skill Impersonation | CRITICAL |
| ATR-2026-061 | Description-Behavior Mismatch | HIGH |
| ATR-2026-062 | Hidden Capability | HIGH |
| ATR-2026-063 | Skill Chain Attack | HIGH |
| ATR-2026-064 | Over-Permissioned Skill | MEDIUM |
| ATR-2026-065 | Skill Update Attack | HIGH |
| ATR-2026-066 | Parameter Injection | HIGH |

### ASI05: Unexpected Code Execution (RCE)

Natural-language execution paths that unlock dangerous avenues for remote code execution.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-012 | Unauthorized Tool Call | HIGH |
| ATR-2026-083 | Indirect Tool Injection | HIGH |

**Gap:** Limited coverage. No rules for eval() injection, dynamic import exploitation, or shell escape detection in agent-generated code.

### ASI06: Memory & Context Poisoning

Memory poisoning that reshapes agent behavior long after the initial interaction.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-020 | System Prompt Leak | HIGH |
| ATR-2026-021 | API Key Exposure | CRITICAL |
| ATR-2026-070 | Data Poisoning | HIGH |
| ATR-2026-075 | Agent Memory Manipulation | HIGH |
| ATR-2026-102 | Disguised Analytics Exfiltration | HIGH |

### ASI07: Insecure Inter-Agent Communication

Spoofed inter-agent messages that misdirect entire clusters.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-076 | Inter-Agent Message Spoofing | HIGH |
| ATR-2026-108 | Consensus Sybil Attack | HIGH |

**Gap:** No rules for A2A protocol validation, agent identity verification, or message integrity checks.

### ASI08: Cascading Failures

False signals cascading through automated pipelines with escalating impact.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-050 | Runaway Agent Loop | HIGH |
| ATR-2026-051 | Resource Exhaustion | HIGH |
| ATR-2026-052 | Cascading Failure | CRITICAL |

### ASI09: Human-Agent Trust Exploitation

Exploiting the trust relationship between humans and AI agents.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-077 | Human Trust Exploitation | HIGH |
| ATR-2026-098 | Unauthorized Financial Action | CRITICAL |

**Gap:** No rules for social engineering via agent, deepfake agent impersonation, or approval fatigue exploitation.

### ASI10: Rogue Agents

Agents operating outside their intended boundaries or becoming autonomous threats.

| ATR Rule | Title | Severity |
|---|---|---|
| ATR-2026-030 | Cross-Agent Attack | HIGH |
| ATR-2026-032 | Goal Hijacking | CRITICAL |
| ATR-2026-074 | Cross-Agent Privilege Escalation | CRITICAL |
| ATR-2026-099 | High-Risk Tool Gate | MEDIUM |

---

## Gap Analysis

| OWASP Category | Coverage Level | Key Gaps |
|---|---|---|
| ASI01: Agent Goal Hijack | STRONG (22 rules) | — |
| ASI02: Tool Misuse | STRONG (11 rules) | — |
| ASI03: Identity & Privilege | PARTIAL (3 rules) | Credential management, OAuth, service accounts |
| ASI04: Supply Chain | STRONG (7 rules) | — |
| ASI05: RCE | PARTIAL (2 rules) | eval() injection, shell escape, dynamic import |
| ASI06: Memory Poisoning | MODERATE (5 rules) | Long-term memory persistence attacks |
| ASI07: Inter-Agent Comms | PARTIAL (2 rules) | A2A protocol validation, identity verification |
| ASI08: Cascading Failures | MODERATE (3 rules) | Cross-system cascade detection |
| ASI09: Human Trust | PARTIAL (2 rules) | Social engineering, approval fatigue |
| ASI10: Rogue Agents | MODERATE (4 rules) | Self-replication, autonomous persistence |

**Priority gaps to close (highest impact):**
1. ASI05 (RCE) — only 2 rules for one of the most dangerous categories
2. ASI03 (Identity) — credential and privilege management undertested
3. ASI07 (Inter-Agent) — growing A2A ecosystem needs more coverage
