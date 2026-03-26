# ATR Ecosystem Scanner — Coworker Instructions

## What This Is

This is the ATR (Agent Threat Rules) repository. It contains:
- ATR detection rules for AI agent security (rules/)
- Ecosystem scanning pipeline (scripts/)
- Post templates for Skills Sec brand (templates/)
- Coworker commands for daily operations (.claude/commands/)

## Available Commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `/scan-daily` | Crawl registries + audit 50 new skills + generate posts | Every morning |
| `/scan-skill <name>` | Scan one specific MCP skill by npm name | Ad-hoc check |
| `/scan-famous` | Scan top-starred MCP skills for content | Weekly, for high-impact posts |
| `/review-posts` | Review and approve generated social media posts | After any scan |
| `/weekly-report` | Generate PanGuard weekly war report | Every Sunday |
| `/status` | Dashboard: scan progress, pending posts, next actions | Anytime |

## Daily Workflow (from phone)

```
Morning:  /status → /scan-daily → /review-posts
Ad-hoc:   /scan-skill mcp-server-xxx
Weekly:   /scan-famous → /review-posts → /weekly-report
```

## Post Templates

Templates are in `templates/post-templates.json`. Five templates:
- T1: Famous Skill Expose (sardonic researcher voice)
- T2: We Did This To Ourselves (self-critique)
- T3: Plain Language Consequences (daily bread and butter)
- T4: Weekly War Report (PanGuard official)
- T5: Provocative Question (engagement bait)

## Two Brands

- **Skills Sec** (@SkillsSec) — security researcher, never mentions PanGuard by name. CTA is always `npx @panguard-ai/panguard audit`
- **PanGuard** (@PanGuard) — official product account. Weekly reports and product updates only.

## Rules

1. **Responsible disclosure**: Always notify skill author 72 hours before public post
2. **No explicit CTA**: The npx command IS the call to action. Never "visit our website"
3. **Consequences over jargon**: "Your API key gets stolen" not "credential exfiltration vector detected"
4. **Screenshots**: Always include terminal output screenshots when possible
5. **Language**: User communicates in Traditional Chinese (繁體中文). Generate both EN and ZH posts.
6. **No emojis in code or posts**

## Three-Layer Data Model

- Layer 1 (PUBLIC): ecosystem-report.csv, ecosystem-stats.json — committed to git
- Layer 2 (THREAT CLOUD): detailed findings via TC API — you control access
- Layer 3 (PRIVATE): scan-cumulative.json — GitHub Actions artifacts only

Never expose Layer 3 data (genuineThreats details, AST analysis) in public posts.
Posts should explain CONSEQUENCES, not technical internals.
