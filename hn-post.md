# Show HN: I audited 1,295 MCP packages on npm -- 35% have security issues

MCP (Model Context Protocol) is how AI assistants like Claude, Cursor, and Windsurf connect to external tools. When you install an MCP server, you're giving an AI agent access to your system. I wanted to know: how safe is the MCP ecosystem right now?

I wrote an open-source static analyzer, scanned 1,295 MCP packages on npm, extracted 14,299 tool definitions, and ran 61 detection rules against them.

**Full report:** https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/mcp-ecosystem-audit-2026.md

## Key findings

455 out of 1,295 packages (35.1%) have security signals worth investigating. **If you only count HIGH and CRITICAL, the number is 13.5% (175 packages).** The "35%" includes MEDIUM and LOW, which flag things like outbound network requests -- often legitimate for MCP servers that are supposed to call external APIs. Where you draw the line is up to you. I'm publishing the data so you can decide for yourself.

Breakdown:

- 115 CRITICAL (8.9%)
- 60 HIGH (4.6%)
- 125 MEDIUM (9.7%)
- 149 LOW (11.5%)
- 840 CLEAN (64.9%)

The single most common finding: **49.5% of MCP packages expose destructive operations (delete files, drop tables, terminate processes) with no human confirmation gate.** I know the immediate reaction is "that's a feature, not a bug -- a file manager MCP server needs to delete files." And you're right. The capability itself is intentional. The risk is what happens when a prompt injection attack hijacks your agent and those tools are available with zero friction. A database MCP server _should_ run SQL queries. Whether it should let an AI agent run `DROP TABLE` without asking you first is the question this data raises.

Other findings:

- **94 packages (7.3%)** have shell execution + network requests + filesystem write -- the download-and-execute trifecta
- **50 packages** auto-execute code via postinstall scripts before you've reviewed anything
- **29 packages** combine postinstall with shell execution
- **13 of my 61 detection rules triggered** across the ecosystem

## Reproduce it yourself

Everything is open source (MIT). You can verify these numbers:

```bash
git clone https://github.com/Agent-Threat-Rule/agent-threat-rules
cd agent-threat-rules
npm install

# Crawl the npm MCP registry
npx tsx scripts/crawl-mcp-registry.ts

# Audit 200 packages (~30 min)
npx tsx scripts/audit-npm-skills-v2.ts --limit 200 --output my-audit.json
```

Or run the full automated pipeline:

```bash
./scripts/auto-scan-pipeline.sh --batch-size 200
```

Scoring methodology is fully transparent: https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/mcp-ecosystem-audit-2026.md#scoring-methodology

## Notable packages

These are NOT vulnerability disclosures and NOT accusations of malicious intent. Packages from Cloudflare, Bitwarden, and Cognition scored CRITICAL because they expose many powerful tools (cloud admin, password management, database writes) through MCP without confirmation gates. The score reflects the attack surface available to a prompt injection attacker, not the quality or intent of the code.

Why score 100? A database MCP server exposing DELETE, DROP, INSERT, and UPDATE tools triggers the "high-risk invocation without confirmation" rule multiple times. Each match adds to the score. More tools = more surface = higher score. The scoring logic is open source and linked above -- check it yourself.

## How I scanned

Static analysis only. I did NOT connect to any MCP server or attempt any exploits.

1. Extracted tool definitions from built JS via regex
2. Analyzed tool descriptions and parameter schemas against 61 open-source detection rules
3. Checked supply chain signals (postinstall scripts, typosquatting risk)
4. Scanned code for shell execution, network requests, filesystem writes

Limitations: regex extraction may miss dynamically generated tools. Risk scores are heuristic. CRITICAL means "warrants manual review," not "confirmed malicious." Many flagged capabilities are intentional -- the issue is whether guardrails exist.

## The detection rules

The rules I used are part of ATR (Agent Threat Rules) -- an open YAML-based detection format for AI agent threats. Sigma/YARA-style rules for prompt injection, tool poisoning, and MCP exploitation. 61 rules, TypeScript + Python engines, Splunk/Elastic converters. MIT licensed.

I also publish 30 evasion tests showing what the rules _can't_ catch. Regex has limits and I'd rather be honest about them.

https://github.com/Agent-Threat-Rule/agent-threat-rules

---

_I welcome corrections from package authors. If your package was flagged and you believe it's a false positive, open an issue and I'll update the report. The goal is to improve MCP ecosystem security, not to shame anyone._
