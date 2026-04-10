# Human Review Queue

Generated: 2026-04-10

This file lists ATR rules with auto-generated metadata that need human review before they can be promoted to stable. Auto-generated fields pass the experimental gate (RFC-001 §4 two-dimensional compliance) but stable promotion requires human-reviewed or community-contributed provenance.

## How to review

For each rule below:

1. Open the file
2. Check the auto-generated reference — is it the most accurate MITRE/OWASP mapping?
   - If YES: change `metadata_provenance: <field>: auto-generated` to `human-reviewed`
   - If NO: replace the reference with a better one, then mark as `human-reviewed`
   - If UNCLEAR: leave as `auto-generated` and add a comment explaining why
3. Commit with message `review: verify metadata for <rule-id>`

## Summary: 58 rules need review

### agent-manipulation (2 rules)

| Rule ID | Title | Auto fields | File |
|---------|-------|-------------|------|
| ATR-2026-00132 | Casual Authority Claim and Scope Escalation | mitre_atlas | `agent-manipulation/ATR-2026-00132-casual-authority-escalation.yaml` |
| ATR-2026-00139 | Casual Authority Data Redirect | mitre_atlas | `agent-manipulation/ATR-2026-00139-casual-authority-redirect.yaml` |

### context-exfiltration (7 rules)

| Rule ID | Title | Auto fields | File |
|---------|-------|-------------|------|
| ATR-2026-00102 | Data Exfiltration via Disguised Analytics Colle... | mitre_atlas | `context-exfiltration/ATR-2026-00102-disguised-analytics-exfiltration.yaml` |
| ATR-2026-00141 | API Key Leakage via Example Format | mitre_atlas | `context-exfiltration/ATR-2026-00141-example-format-key-leak.yaml` |
| ATR-2026-00142 | Data Piggybacking via Casual Transition Words | mitre_atlas | `context-exfiltration/ATR-2026-00142-piggyback-transition-words.yaml` |
| ATR-2026-00145 | Obfuscated API Key Disclosure | mitre_atlas | `context-exfiltration/ATR-2026-00145-obfuscated-key-disclosure.yaml` |
| ATR-2026-00146 | Environment Variable Existence Probing | mitre_atlas | `context-exfiltration/ATR-2026-00146-env-var-existence-probe.yaml` |
| ATR-2026-00150 | Credential Data Leaked in Tool Response | mitre_atlas | `context-exfiltration/ATR-2026-00150-credential-in-tool-response.yaml` |
| ATR-2026-00152 | Obfuscated Credential Exfiltration via Encoding | mitre_atlas | `context-exfiltration/ATR-2026-00152-obfuscated-credential-leak.yaml` |

### privilege-escalation (2 rules)

| Rule ID | Title | Auto fields | File |
|---------|-------|-------------|------|
| ATR-2026-00143 | Casual Unauthorized Privilege Escalation | mitre_atlas | `privilege-escalation/ATR-2026-00143-casual-privilege-escalation.yaml` |
| ATR-2026-00144 | Rationalized Safety Control Bypass | mitre_atlas | `privilege-escalation/ATR-2026-00144-rationalized-safety-bypass.yaml` |

### prompt-injection (26 rules)

| Rule ID | Title | Auto fields | File |
|---------|-------|-------------|------|
| ATR-2026-00080 | Encoding-Based Prompt Injection Evasion | owasp_llm | `prompt-injection/ATR-2026-00080-encoding-evasion.yaml` |
| ATR-2026-00081 | Semantic Evasion via Multi-Turn Prompt Injection | owasp_llm | `prompt-injection/ATR-2026-00081-semantic-multi-turn.yaml` |
| ATR-2026-00082 | Behavioral Fingerprint Detection Evasion | owasp_llm | `prompt-injection/ATR-2026-00082-fingerprint-evasion.yaml` |
| ATR-2026-00083 | Indirect Prompt Injection via Tool Responses | owasp_llm | `prompt-injection/ATR-2026-00083-indirect-tool-injection.yaml` |
| ATR-2026-00084 | Structured Data Injection via JSON/CSV Payloads | owasp_llm | `prompt-injection/ATR-2026-00084-structured-data-injection.yaml` |
| ATR-2026-00085 | Multi-Layer Security Audit Evasion | owasp_llm | `prompt-injection/ATR-2026-00085-audit-evasion.yaml` |
| ATR-2026-00086 | Visual Spoofing via RTL Override, Punycode, and... | owasp_llm | `prompt-injection/ATR-2026-00086-visual-spoofing.yaml` |
| ATR-2026-00087 | Detection Rule Probing and Evasion Testing | owasp_llm | `prompt-injection/ATR-2026-00087-rule-probing.yaml` |
| ATR-2026-00088 | Adaptive Countermeasure Against Behavioral Moni... | owasp_llm | `prompt-injection/ATR-2026-00088-adaptive-countermeasure.yaml` |
| ATR-2026-00089 | Polymorphic Skill and Capability Aliasing Attack | owasp_llm | `prompt-injection/ATR-2026-00089-polymorphic-skill.yaml` |
| ATR-2026-00090 | Threat Intelligence Exfiltration and Rule Enume... | owasp_llm | `prompt-injection/ATR-2026-00090-threat-intel-exfil.yaml` |
| ATR-2026-00091 | Advanced Structured Data Injection with Nested ... | owasp_llm | `prompt-injection/ATR-2026-00091-nested-payload.yaml` |
| ATR-2026-00092 | Multi-Agent Consensus Poisoning and Sybil Attack | owasp_llm | `prompt-injection/ATR-2026-00092-consensus-poisoning.yaml` |
| ATR-2026-00093 | Gradual Capability Escalation via Incremental I... | owasp_llm | `prompt-injection/ATR-2026-00093-gradual-escalation.yaml` |
| ATR-2026-00094 | Systematic Multi-Layer Audit System Bypass | owasp_llm | `prompt-injection/ATR-2026-00094-audit-bypass.yaml` |
| ATR-2026-00130 | Indirect Authority Claim in External Content | mitre_atlas | `prompt-injection/ATR-2026-00130-indirect-authority-claim.yaml` |
| ATR-2026-00131 | Fictional and Academic Framing Attack | mitre_atlas | `prompt-injection/ATR-2026-00131-fictional-academic-framing.yaml` |
| ATR-2026-00133 | Paraphrased Prompt Injection | mitre_atlas | `prompt-injection/ATR-2026-00133-paraphrase-injection.yaml` |
| ATR-2026-00137 | Authority Claim Prompt Injection | mitre_atlas | `prompt-injection/ATR-2026-00137-authority-claim-injection.yaml` |
| ATR-2026-00138 | Fictional Framing Safety Bypass | mitre_atlas | `prompt-injection/ATR-2026-00138-fictional-framing-bypass.yaml` |
| ATR-2026-00140 | Indirect Reference Instruction Reversal | mitre_atlas | `prompt-injection/ATR-2026-00140-indirect-reference-reversal.yaml` |
| ATR-2026-00148 | Multilingual Prompt Injection via Language Switch | mitre_atlas | `prompt-injection/ATR-2026-00148-language-switch-injection.yaml` |
| ATR-2026-00153 | Tool with embedded instruction to bypass user c... | mitre_atlas, owasp_llm | `prompt-injection/ATR-2026-00153-tool-with-embedded-instruction-to-bypass.yaml` |
| ATR-2026-00154 | Unauthorized Background Task Execution via Cron... | mitre_atlas, owasp_llm | `prompt-injection/ATR-2026-00154-unauthorized-background-task-execution-v.yaml` |
| ATR-2026-00155 | Hidden LLM Instructions in Skill Descriptions | mitre_atlas, owasp_llm | `prompt-injection/ATR-2026-00155-hidden-llm-instructions-in-skill-descrip.yaml` |
| ATR-2026-00156 | SSH Remote Command Execution with Credential Ex... | mitre_atlas, owasp_llm | `prompt-injection/ATR-2026-00156-ssh-remote-command-execution-with-creden.yaml` |

### skill-compromise (15 rules)

| Rule ID | Title | Auto fields | File |
|---------|-------|-------------|------|
| ATR-2026-00120 | SKILL.md Prompt Injection | mitre_atlas | `skill-compromise/ATR-2026-00120-skill-instruction-injection.yaml` |
| ATR-2026-00121 | Malicious Code in Skill Package | mitre_atlas | `skill-compromise/ATR-2026-00121-skill-dangerous-script.yaml` |
| ATR-2026-00122 | Weaponized Skill — Agent as Attack Tool | mitre_atlas | `skill-compromise/ATR-2026-00122-skill-weaponized-instruction.yaml` |
| ATR-2026-00123 | Over-Privileged Skill — Excessive Permissions | mitre_atlas | `skill-compromise/ATR-2026-00123-skill-overreach-permissions.yaml` |
| ATR-2026-00124 | Skill Squatting / Typosquatting | mitre_atlas | `skill-compromise/ATR-2026-00124-skill-name-squatting.yaml` |
| ATR-2026-00125 | Context Poisoning via Compaction Survival | mitre_atlas | `skill-compromise/ATR-2026-00125-context-poisoning-compaction.yaml` |
| ATR-2026-00126 | Skill Rug Pull Setup Pattern | mitre_atlas | `skill-compromise/ATR-2026-00126-skill-rug-pull-setup.yaml` |
| ATR-2026-00127 | Subcommand Overflow Bypass | mitre_atlas | `skill-compromise/ATR-2026-00127-subcommand-overflow.yaml` |
| ATR-2026-00128 | Hidden Payload in HTML Comment | mitre_atlas | `skill-compromise/ATR-2026-00128-html-comment-hidden-payload.yaml` |
| ATR-2026-00129 | Unicode Tag Character Smuggling | mitre_atlas | `skill-compromise/ATR-2026-00129-unicode-smuggling.yaml` |
| ATR-2026-00134 | Fork Claim and Community Package Impersonation | mitre_atlas | `skill-compromise/ATR-2026-00134-fork-claim-impersonation.yaml` |
| ATR-2026-00135 | Data Exfiltration URL in Skill Instructions | mitre_atlas | `skill-compromise/ATR-2026-00135-exfil-url-in-instructions.yaml` |
| ATR-2026-00147 | Community Fork Impersonation | mitre_atlas | `skill-compromise/ATR-2026-00147-fork-impersonation.yaml` |
| ATR-2026-00149 | Skill Data Exfiltration via Compound Patterns | mitre_atlas | `skill-compromise/ATR-2026-00149-skill-exfil-compound.yaml` |
| ATR-2026-00151 | Malicious Fork Impersonation via Install Instru... | mitre_atlas | `skill-compromise/ATR-2026-00151-fork-impersonation-install.yaml` |

### tool-poisoning (6 rules)

| Rule ID | Title | Auto fields | File |
|---------|-------|-------------|------|
| ATR-2026-00095 | MCP Tool Supply Chain Poisoning | owasp_llm | `tool-poisoning/ATR-2026-00095-supply-chain-poisoning.yaml` |
| ATR-2026-00096 | Skill Registry Poisoning and Compromised Tool D... | owasp_llm | `tool-poisoning/ATR-2026-00096-registry-poisoning.yaml` |
| ATR-2026-00100 | Consent Bypass via Hidden LLM Instructions in T... | mitre_atlas | `tool-poisoning/ATR-2026-00100-consent-bypass-instruction.yaml` |
| ATR-2026-00101 | Trust Escalation via Authority Override Instruc... | mitre_atlas | `tool-poisoning/ATR-2026-00101-trust-escalation-override.yaml` |
| ATR-2026-00105 | Silent Action Concealment Instructions in Tool ... | mitre_atlas | `tool-poisoning/ATR-2026-00105-silent-action-concealment.yaml` |
| ATR-2026-00106 | Schema-Description Contradiction Attack | mitre_atlas | `tool-poisoning/ATR-2026-00106-schema-description-contradiction.yaml` |
