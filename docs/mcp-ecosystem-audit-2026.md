# State of MCP Security: Auditing 1,295 Packages on npm

**March 2026 | Agent Threat Rules Project**

---

## Key Findings

We audited **1,295 MCP (Model Context Protocol) packages** on npm using static analysis -- extracting tool descriptions, schemas, code patterns, and supply chain signals. We found:

- **35.1% of packages have security issues** (455 out of 1,295)
- **115 packages (8.9%) are CRITICAL risk** -- including popular tools from well-known organizations
- **14,299 MCP tools** were extracted and analyzed
- **13 ATR detection rules** triggered across the ecosystem
- **50 packages auto-execute code on install** via postinstall scripts
- **94 packages (7.3%) have the "triple threat"**: shell execution + network requests + filesystem write

## Why This Matters

MCP is the protocol that lets AI assistants (Claude, Cursor, Windsurf, Copilot) connect to external tools. When you install an MCP server, you're giving an AI agent access to your system through that tool.

Every MCP package you install is an attack surface.

As of March 2026, the npm MCP ecosystem has 2,769+ packages. Most developers install them with `npm install` and add them to their AI assistant config without security review. Our audit suggests more than 1 in 3 deserve closer inspection.

---

## Methodology

**What we scanned:**
- 1,295 npm packages with MCP-related keywords
- Extracted from registry using 8 search queries with pagination

**How we scanned (static analysis only):**
1. **Tool description extraction** -- regex extraction of MCP `tool()` registrations from built JS
2. **Schema analysis** -- parameter names, types, descriptions that indicate dangerous capabilities
3. **Supply chain signals** -- postinstall scripts, typosquatting risk, suspicious naming
4. **Code behavior** -- outbound URLs, shell execution patterns, filesystem writes, env variable access, dangerous imports
5. **ATR rule matching** -- 61 detection rules applied to tool descriptions and schemas

**What we did NOT scan:**
- Runtime behavior (we did not connect to any MCP server)
- Source code review (we only scanned built/distributed JS)
- Network traffic (no dynamic analysis)

**Limitations:**
- Static analysis has false positives. A "shell execution" finding means the package _contains_ shell execution code, not that it's malicious.
- Risk scores are heuristic. CRITICAL does not mean "malware" -- it means the package has multiple high-risk signals that warrant manual review.
- We scanned npm only. PyPI, GitHub-only, and private MCP servers are not included.

---

## Risk Distribution

| Risk Level | Packages | Percentage | What it means |
|-----------|----------|------------|---------------|
| CLEAN | 840 | 64.9% | No significant findings |
| LOW | 149 | 11.5% | Minor signals (e.g., outbound URLs only) |
| MEDIUM | 125 | 9.7% | Moderate signals (e.g., filesystem write + network) |
| HIGH | 60 | 4.6% | Multiple concerning signals or ATR rule matches |
| CRITICAL | 115 | 8.9% | High-risk tool permissions, ATR matches, or dangerous combinations |

---

## Most Common ATR Rules Triggered

| Rule | What it detects | Packages affected |
|------|----------------|-------------------|
| ATR-2026-099 | High-risk tool invocation without human confirmation (delete, execute, deploy) | **641** (49.5%) |
| ATR-2026-061 | Tool description does not match actual behavior | **291** (22.5%) |
| ATR-2026-040 | Privilege escalation and admin function access | **146** (11.3%) |
| ATR-2026-063 | Multi-skill chain attack potential (tool A feeds tool B) | **134** (10.3%) |
| ATR-2026-012 | Unauthorized tool call patterns | **116** (9.0%) |
| ATR-2026-066 | Parameter injection via tool arguments | **43** (3.3%) |
| ATR-2026-051 | Resource exhaustion potential | **20** (1.5%) |
| ATR-2026-060 | Skill impersonation (typosquatting, trust-implying names) | **3** |
| ATR-2026-098 | Unauthorized financial actions | **3** |
| ATR-2026-032 | Goal hijacking | **2** |
| ATR-2026-062 | Hidden capability in tool | **2** |
| ATR-2026-030 | Cross-agent attack | **1** |
| ATR-2026-064 | Over-permissioned skill | **1** |

**The #1 finding: 49.5% of MCP packages let tools perform destructive actions (delete files, drop database tables, terminate processes) without requiring human confirmation.** This is ATR-2026-099, and it's by far the most common issue.

---

## Code Behavior Analysis

| Behavior | Packages | Percentage | Risk |
|----------|----------|------------|------|
| Network requests | 535 | 41.3% | Can exfiltrate data |
| Shell execution | 329 | 25.4% | Can run arbitrary commands |
| Filesystem write | 305 | 23.6% | Can modify/create files |
| Outbound URLs in code | 608 | 46.9% | Communicates externally |
| Environment variable access | 32 | 2.5% | Can read secrets |
| Postinstall scripts | 50 | 3.9% | Auto-executes on npm install |

### Dangerous Combinations

| Combination | Packages | Percentage | Why it's dangerous |
|-------------|----------|------------|-------------------|
| Shell + Network + FS write ("triple threat") | **94** | **7.3%** | Can download, execute, and persist anything |
| Postinstall + Shell execution | **29** | **2.2%** | Auto-runs shell commands on `npm install` |

---

## Notable Findings

### Well-known packages with CRITICAL ratings

These are not accusations of malicious intent. They are flagged because they expose high-risk capabilities through MCP tools without guardrails:

| Package | Score | Tools | ATR Matches | Key concern |
|---------|-------|-------|-------------|-------------|
| @cloudflare/mcp-server-cloudflare | 100 | 184 | 28 | Admin-level cloud operations without confirmation gates |
| @bitwarden/mcp-server | 100 | 116 | 7 | Password manager access via AI agent |
| @executeautomation/playwright-mcp-server | 100 | 74 | 9 | Browser automation with full page control |
| @cognitionai/metabase-mcp-server | 100 | 166 | 27 | Database query execution, dashboard manipulation |
| @gongrzhe/server-gmail-autoauth-mcp | 100 | 56 | 15 | Gmail access with auto-authentication |
| @berthojoris/mcp-mysql-server | 100 | 156 | 32 | Direct MySQL operations including DROP/DELETE |
| @henkey/postgres-mcp-server | 100 | 118 | 25 | Postgres operations + postinstall script |

**Again: CRITICAL does not mean malicious.** It means the package gives AI agents powerful capabilities that an attacker could abuse through prompt injection or tool poisoning. The question is whether adequate safeguards exist.

---

## Recommendations

### For MCP package authors
1. **Add human confirmation gates** for destructive operations (delete, modify, execute)
2. **Principle of least privilege** -- don't expose admin tools when read-only would suffice
3. **Document capabilities honestly** -- tool descriptions should match actual behavior
4. **Avoid postinstall scripts** -- they auto-execute on install, before users review the code

### For MCP package users
1. **Review tool lists** before adding an MCP server to your AI assistant
2. **Prefer packages with fewer tools** -- 184 tools means 184 potential attack vectors
3. **Check for postinstall scripts** -- `npm pack <package> && tar -tf <package>.tgz` to inspect
4. **Monitor tool invocations** -- use ATR or similar to detect anomalous patterns

### For AI assistant vendors
1. **Require human-in-the-loop for destructive MCP tool calls** by default
2. **Display tool descriptions** to users before granting access
3. **Rate-limit tool invocations** to prevent runaway agent loops
4. **Sandbox MCP servers** -- filesystem and network isolation

---

## Reproduce This Audit

Everything is open source. You can reproduce or extend this audit:

```bash
git clone https://github.com/Agent-Threat-Rule/agent-threat-rules
cd agent-threat-rules
npm install

# Crawl the MCP registry
npx tsx scripts/crawl-mcp-registry.ts

# Audit packages (takes ~30 min for 200 packages)
npx tsx scripts/audit-npm-skills-v2.ts --limit 200 --output my-audit.json

# Or run the full automated pipeline
./scripts/auto-scan-pipeline.sh --batch-size 200
```

ATR detection rules used for this audit: https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/rules

---

## Raw Data

The full audit dataset (1,295 packages, 14,299 tools) is available for security researchers upon request. Contact us via GitHub issues.

---

## About ATR

ATR (Agent Threat Rules) is an open-source detection rule format for AI agent threats. 61 YAML-based rules with regex pattern matching, behavioral fingerprinting, and LLM-as-judge analysis. MIT licensed.

https://github.com/Agent-Threat-Rule/agent-threat-rules

---

*This report was generated from static analysis only. No MCP servers were connected to, no runtime behavior was observed, and no exploits were attempted. Findings represent potential risks that warrant further investigation, not confirmed vulnerabilities. We welcome corrections and context from package authors.*
