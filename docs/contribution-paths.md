# Integration and Contribution Paths

ATR is designed to be consumed by any AI agent security tool, regardless of size or stack.
Pick the path that fits you.

---

## For Consumers (use ATR rules in your product)

### Path 1: npm Package (Node.js / TypeScript)

Best for: Node.js apps, TypeScript projects, MCP servers, Claude Code extensions.

```bash
npm install agent-threat-rules
```

```typescript
import { ATREngine } from 'agent-threat-rules';

const engine = new ATREngine();
const matches = engine.evaluate({
  type: 'tool_response',
  content: toolOutput,
  timestamp: new Date().toISOString(),
});

if (matches.length > 0) {
  // Threat detected
}
```

Time to integrate: ~30 minutes.

### Path 2: Python (pyATR)

Best for: Python apps, FastAPI services, LangChain/CrewAI agents.

```bash
pip install git+https://github.com/Agent-Threat-Rule/agent-threat-rules.git#subdirectory=python
```

```python
from pyatr import ATREngine

engine = ATREngine()
result = engine.evaluate(event={
    "type": "tool_response",
    "content": tool_output,
})

if result.outcome == "deny":
    # Block the request
```

Time to integrate: ~30 minutes.

### Path 3: Raw YAML (any language)

Best for: Go, Rust, Java, or any language. Parse the YAML yourself.

```bash
# Add as git submodule
git submodule add https://github.com/Agent-Threat-Rule/agent-threat-rules.git vendor/atr

# Rules are at vendor/atr/rules/
# Schema spec at vendor/atr/spec/atr-schema.yaml
# Each .yaml file has regex patterns you can compile natively
```

Directory structure:
```
rules/
  prompt-injection/      (29 rules)
  skill-compromise/      (20 rules)
  agent-manipulation/    (12 rules)
  context-exfiltration/  (12 rules)
  tool-poisoning/        (11 rules)
  privilege-escalation/  (8 rules)
  excessive-autonomy/    (5 rules)
  data-poisoning/        (2 rules)
  model-security/        (1 rule)
```

Time to integrate: ~2 hours (parse YAML + compile regex).

### Path 4: SIEM / Security Pipeline

Best for: SOC teams, Splunk/Elastic deployments, CI/CD security scanning.

```bash
# Install CLI
npm install -g agent-threat-rules

# Convert to your SIEM format
atr convert splunk --output splunk-queries.txt
atr convert elastic --output elastic-queries.json

# Or export as SARIF for GitHub Security tab
atr scan my-config.json --format sarif --output results.sarif
```

Time to integrate: ~1 hour.

### Path 5: GitHub Action (CI/CD)

Best for: scanning MCP configs and SKILL.md files on every PR.

```yaml
# .github/workflows/atr-scan.yml
name: ATR Security Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: panguard-ai/atr-action@v1
```

Time to integrate: ~5 minutes.

### Path 6: Generic Regex Export (platform integration)

Best for: security platforms that want ATR patterns without the ATR engine.
This is how Cisco AI Defense integrated 34 ATR rules.

```typescript
import { loadRulesFromDirectory } from 'agent-threat-rules';
import { rulesToGenericRegex } from 'agent-threat-rules/converters';

const rules = loadRulesFromDirectory('./node_modules/agent-threat-rules/rules');
const exported = rulesToGenericRegex(rules);
// Returns: [{ id, title, severity, category, patterns: [{ field, regex, flags }] }]
```

Or use the CLI:
```bash
atr convert generic-regex --output atr-patterns.json
```

Time to integrate: ~1 hour.

---

## For Contributors (write new detection rules)

### Path A: Manual Rule Writing

Best for: security researchers, red teamers, developers who discovered an attack pattern.

1. **Scaffold** a rule template:
   ```bash
   atr scaffold
   ```

2. **Edit** the YAML:
   - Define detection conditions (regex patterns)
   - Write 5+ true positive test cases
   - Write 5+ true negative test cases
   - Add 3+ evasion tests documenting known bypasses
   - Map to OWASP LLM Top 10, OWASP Agentic Top 10, or MITRE ATLAS

3. **Validate and test**:
   ```bash
   atr validate my-rule.yaml
   atr test my-rule.yaml
   ```

4. **Submit** a PR to [agent-threat-rules](https://github.com/Agent-Threat-Rule/agent-threat-rules):
   - Place in `rules/<category>/`
   - Include attack pattern description
   - Reference CVEs, papers, or blog posts

Time: 1-2 hours for a well-researched rule.

### Path B: Report an Evasion

Found a way to bypass an existing rule? This is the most valuable contribution.

1. Check the rule's existing `evasion_tests` section
2. Open an issue using the **Evasion Report** template
3. Include: rule ID, bypass input, technique used, why it works

Every confirmed evasion becomes a new test case. You get credited in CONTRIBUTORS.md.

Time: ~15 minutes.

### Path C: Report a False Positive

A rule triggered on legitimate content?

1. Open an issue using the **False Positive Report** template
2. Include: rule ID, the input that triggered it, why it is legitimate

Confirmed false positives become new `true_negatives` test cases.

Time: ~20 minutes.

### Path D: Runtime Detection Auto-Draft

Best for: operators running ATR in production who encounter novel attacks.

When your ATR-compatible runtime monitor detects anomalous behavior that no existing rule covers:

1. The ATR Drafter captures the event and generates a draft rule YAML
2. An issue is opened automatically with the `auto-drafted` label
3. Community reviews, adds test cases, maps to OWASP/MITRE
4. Once it passes the quality gate, it merges into the rule set

---

## For Platform Partners (deep integration + data exchange)

### Ecosystem Integration PR

Want ATR rules in your scanner/platform? We will write the integration PR for you.

What we provide:
- ATR rules converted to your platform's format
- Test cases adapted to your test framework
- Documentation for your users

What we ask:
- Mention ATR in your README or integrations page
- (Optional) Feed anonymized scan results back to ATR Threat Cloud

Current integrations:
| Platform | Integration | Reference |
|----------|------------|-----------|
| Cisco AI Defense | 34 rules in skill-scanner | [PR #79](https://github.com/cisco-ai-defense/skill-scanner/pull/79) |
| OWASP Agentic Top 10 | Detection mapping | [PR #14](https://github.com/precize/Agentic-AI-Top10-Vulnerability/pull/14) |

Contact: Open an issue with the `ecosystem-integration` label, or email the maintainers.

---

## Unified Quality Gate

All contributed rules must pass this gate. No exceptions.

### Automated checks (CI)

| Check | Requirement |
|-------|-------------|
| Schema validation | `atr validate` passes with zero errors |
| True positives | Minimum 5 test cases, all pass |
| True negatives | Minimum 5 test cases, all pass |
| Framework reference | At least one OWASP LLM, OWASP Agentic, or MITRE ATLAS reference |
| Regex safety | No overly broad patterns (`.+` or `.*` alone) |
| Regex complexity | No patterns vulnerable to ReDoS |
| ID format | Matches `ATR-YYYY-NNN` pattern |
| Required fields | All schema-required fields present |

### Human review

| Check | Requirement |
|-------|-------------|
| Detection specificity | Patterns target actual attack indicators, not generic language |
| False positive documentation | `false_positives` section lists realistic scenarios |
| Evasion honesty | At least 3 evasion tests with known bypasses documented |
| Severity justification | Severity matches real-world impact |
| Description accuracy | States what IS detected and what IS NOT |
| Reviewer approval | At least one maintainer approval |
