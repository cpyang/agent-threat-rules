# ATR Submission to OWASP AI Security Solutions Landscape Q2 2026

## Submission Target

**Landscape:** AI Security Solutions Landscape for Agentic AI Q2 2026
**URL:** https://genai.owasp.org/resource/ai-security-solutions-landscape-for-agentic-ai-q2-2026/
**Contact:** OWASP GenAI Security Project (genai.owasp.org)

## ATR Profile

- **Name:** ATR (Agent Threat Rules)
- **Type:** Open-source detection rule standard
- **License:** MIT (permanent commitment)
- **URL:** https://github.com/Agent-Threat-Rule/agent-threat-rules
- **Category:** Agentic AI Security / Detection Rules / Supply Chain Security

## Positioning (one-liner)

ATR is an open-source detection rule corpus for AI agent threats -- like Sigma rules for SIEM, but for AI agents. 113 rules, 96K skills scanned, shipped in Cisco AI Defense.

## Key Facts

- 113 detection rules across 9 attack categories
- RFC-001: vendor-neutral quality standard (maturity levels, confidence scoring, community signals)
- OWASP Agentic Top 10: 10/10 coverage
- MITRE ATLAS: 100/113 rules mapped
- 96,096 real-world agent skills scanned, 751 malware discovered
- Cisco AI Defense ships 34 ATR rules in production (PR #79 merged)
- 4 export formats: SARIF, Splunk SPL, Elasticsearch DSL, generic regex
- Avg scan latency: 14ms per file
- 14 runtimes supported: Claude Code, Cursor, Hermes, OpenAI Assistants, Google A2A, etc.

## Agentic SecOps Coverage

| Stage | ATR Coverage |
|-------|-------------|
| Development | Static scan of SKILL.md / agent configs |
| CI/CD | GitHub Action (planned), SARIF output for Security tab |
| Pre-deployment | Wild scan pipeline (96K+ skills scanned) |
| Runtime | MCP event evaluation (tool calls, LLM I/O) |
| Threat Intelligence | Threat Cloud community feed (anonymous, privacy-first) |

## Differentiation

ATR is not a scanner product -- it is the detection rule layer that scanner products consume. Cisco AI Defense already ships ATR rules. Microsoft AGT can import ATR rules via the generic-regex adapter. Any vendor can adopt the RFC-001 quality standard without adopting ATR's rule format.

The closest analogy: ATR is to AI agent security what Sigma rules are to SIEM, what YARA rules are to malware detection, what Snort rules are to network intrusion detection.

## Action Items

1. Email OWASP GenAI Security Project leads (check genai.owasp.org/about for contacts)
2. Reference existing OWASP contribution: PR #814 merged (attack examples for Agentic Top 10)
3. Offer to present ATR at next OWASP GenAI community call
