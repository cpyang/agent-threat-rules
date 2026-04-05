# ATR Governance

## Rule Contribution Process

### 1. Propose

Open a GitHub Issue with:
- Attack description (what behavior does this detect?)
- At least 1 real-world example payload
- Suggested severity and category

### 2. Draft Rule

Submit a PR with:
- YAML rule file in the appropriate `rules/<category>/` directory
- `status: draft`
- `rule_version: 1`
- `schema_version: "1.0"`
- Minimum 3 true positive + 3 true negative test cases
- Test cases MUST use real attack payloads, not descriptions of attacks

### 3. Quality Gate

Before merge, the rule must pass:

| Gate | Requirement |
|------|-------------|
| **Schema validation** | `atr validate <rule.yaml>` passes |
| **Test cases** | `atr test <rule.yaml>` — all TP trigger, all TN don't |
| **Precision test** | Run against full benchmark — FP rate < 0.5% |
| **Regression** | `npm test` passes — no existing tests break |
| **Real payloads** | Test cases contain actual attack content, not descriptions |

### 4. Review

- At least 1 maintainer review
- Severity reviewed against rubric (see below)
- `scan_target` correctly set (`mcp`, `skill`, or `runtime`)
- OWASP/MITRE references where applicable

### 5. Merge

- `status` upgraded from `draft` to `experimental`
- Rule included in next npm release

### 6. Promotion

After 30 days with zero confirmed false positives in production:
- `status` upgraded from `experimental` to `stable`

## Rule Deprecation

- Set `status: deprecated` — rule stays in repo but engines skip it
- Document reason in description
- Never delete or reuse a rule ID

## Rule Versioning

- Bump `rule_version` when detection logic changes (`detection.conditions` or `detection.condition`)
- Metadata-only changes (description, references, severity) do NOT require a bump
- Third-party integrators (Cisco, Microsoft, etc.) use `rule_version` to detect when to re-sync

## Severity Rubric

| Severity | Criteria | Action |
|----------|----------|--------|
| **critical** | Direct code execution, credential exfiltration, reverse shell, malware delivery. Immediate harm with no user interaction needed. | `block_input` + `alert` |
| **high** | Data leakage, behavior hijacking, context poisoning, jailbreak, rug pull setup. Significant harm, may require user interaction. | `alert` + `block_input` or `escalate` |
| **medium** | Permission overreach, supply chain risk (squatting, impersonation), suspicious but not directly harmful patterns. | `alert` |
| **low** | Anomalous behavior that needs context. High false positive risk. Useful for investigation, not blocking. | `alert` |
| **informational** | Noteworthy pattern with no direct security impact. Best practice violations. | `alert` (optional) |

### Severity Assignment Rules

1. If in doubt, assign one level LOWER than your instinct. False negatives are recoverable; false blocks damage trust.
2. A rule that detects `curl | bash` in a SKILL.md is `critical`. The same pattern in a DevOps tutorial is a false positive — that's why `scan_target` exists.
3. Supply chain attacks (squatting, impersonation) are `medium` unless they include a payload, which escalates to `high` or `critical`.

## Maintainers

- ATR Community (open governance)

## License

All ATR rules are MIT licensed. Contributions are accepted under MIT.
