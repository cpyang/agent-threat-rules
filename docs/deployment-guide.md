# ATR Deployment Guide

Deploy ATR in your AI agent pipeline and help validate it as a detection standard.

ATR 部署指南 -- 在你的 AI Agent 管道中部署 ATR，幫助驗證它作為偵測標準的實用性。

---

## Why Deploy?

ATR needs real-world data to become a standard. Every deployment report -- even "nothing fired" or "too many false positives" -- is valuable feedback.

ATR 需要實戰數據才能成為標準。每一份部署報告 -- 即使是「沒有觸發」或「太多誤判」 -- 都是有價值的回饋。

---

## Option 1: Quick Scan (5 minutes)

Test ATR against a sample of your agent traffic without integrating into your pipeline.

```bash
# Install
npm install -g agent-threat-rules

# Create a sample event file
cat > sample-events.json << 'EOF'
[
  {
    "type": "llm_input",
    "content": "Your actual user prompt here",
    "timestamp": "2026-03-16T00:00:00Z"
  },
  {
    "type": "tool_call",
    "content": "The tool name and arguments your agent used",
    "timestamp": "2026-03-16T00:00:01Z"
  },
  {
    "type": "tool_response",
    "content": "The response your tool returned",
    "timestamp": "2026-03-16T00:00:02Z"
  }
]
EOF

# Scan
atr scan sample-events.json --json
```

Replace the placeholder content with real (anonymized) agent traffic.

---

## Option 2: TypeScript Integration (30 minutes)

Add ATR as a middleware in your agent pipeline.

```bash
npm install agent-threat-rules
```

```typescript
import { ATREngine } from 'agent-threat-rules';

// Initialize once at startup
const engine = new ATREngine({ rulesDir: 'node_modules/agent-threat-rules/rules' });
await engine.loadRules();

// Evaluate every user input before sending to LLM
function checkInput(userMessage: string) {
  const matches = engine.evaluate({
    type: 'llm_input',
    timestamp: new Date().toISOString(),
    content: userMessage,
  });

  if (matches.length > 0) {
    const worst = matches[0]; // sorted by severity
    console.log(`[ATR] ${worst.rule.severity}: ${worst.rule.title}`);

    if (worst.rule.severity === 'critical') {
      return { blocked: true, reason: worst.rule.title };
    }
  }

  return { blocked: false };
}

// Evaluate tool responses before agent processes them
function checkToolResponse(toolName: string, response: string) {
  return engine.evaluate({
    type: 'tool_response',
    timestamp: new Date().toISOString(),
    content: response,
    fields: { tool_name: toolName },
  });
}
```

---

## Option 3: Python Integration (30 minutes)

```bash
pip install pyatr
```

```python
from pyatr import ATREngine, AgentEvent

engine = ATREngine()
engine.load_rules_from_directory("./rules")  # or path to installed rules

# Check user input
matches = engine.evaluate(AgentEvent(
    content="user message here",
    event_type="llm_input",
))

for match in matches:
    print(f"[{match.severity.upper()}] {match.rule_id}: {match.title}")
```

---

## Option 4: Claude Code Hook (10 minutes)

Protect your Claude Code sessions with ATR as a pre-execution guard.

```bash
npm install -g agent-threat-rules
atr init --global
```

This adds ATR as a hook in `~/.claude/settings.json`. Every tool call and LLM exchange is checked against ATR rules in real time.

---

## Option 5: MCP Server (15 minutes)

Add ATR as an MCP tool available to any MCP-compatible AI assistant.

```json
{
  "mcpServers": {
    "atr": {
      "command": "npx",
      "args": ["agent-threat-rules", "mcp"]
    }
  }
}
```

Your AI assistant can then call `atr_scan` to check suspicious content on demand.

---

## What to Report

After deploying, open a GitHub issue with the **Deployment Report** template. Include:

### Required
- **Framework**: What agent framework do you use? (LangChain, CrewAI, AutoGen, custom, etc.)
- **Scale**: Approximate events per day
- **Duration**: How long did you run ATR?
- **Rules triggered**: Which rule IDs fired? How many times?
- **False positives**: Which rules triggered on legitimate content? Include anonymized examples.
- **Missed detections**: Any attacks you know about that ATR did not catch?

### Optional but valuable
- **Detection latency**: How long does `engine.evaluate()` take in your setup?
- **Integration friction**: What was hard about integrating ATR?
- **Missing event types**: Does your agent produce events ATR can't consume?
- **Rule suggestions**: Patterns you see in your traffic that ATR should detect

### Anonymization
- Replace real user data with representative examples
- Replace API keys/tokens with placeholders
- Replace internal URLs with generic ones
- Keep the structure and pattern intact

---

## Reporting Template

```markdown
## Deployment Report

**Framework:** [e.g., LangChain 0.3.x + Claude]
**Agent type:** [e.g., customer support bot, code assistant, research agent]
**Events/day:** [e.g., ~5,000]
**Duration:** [e.g., 2 weeks]
**ATR version:** [e.g., 0.2.2]
**Integration:** [TypeScript engine / Python engine / CLI / MCP]

### Rules triggered
| Rule ID | Count | True positive? | Notes |
|---------|-------|----------------|-------|
| ATR-2026-001 | 12 | 10 yes, 2 false | FP on security training content |
| ATR-2026-013 | 3 | 3 yes | SSRF attempts via tool calls |

### False positives
[Anonymized examples of legitimate content that triggered rules]

### Missed detections
[Known attacks that were not caught, if any]

### Integration notes
[Any friction, suggestions, or missing features]
```

---

## What Happens Next

1. Your report helps calibrate rule severity and false positive rates
2. Confirmed false positives become new `true_negatives` test cases
3. Missed detections inform new rules or evasion tests
4. Integration friction informs API/CLI improvements
5. You get credited in CONTRIBUTORS.md

**Goal: 10+ independent deployment reports before ATR v1.0.**

---

## Questions?

Open an issue or start a discussion at https://github.com/Agent-Threat-Rule/agent-threat-rules/discussions
