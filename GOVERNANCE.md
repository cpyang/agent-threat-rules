# ATR Governance

Version 1.1 · Effective 2026-04-15

## Position in the AI Security Ecosystem

ATR provides **executable detection rules** for AI agent threats. It
complements, rather than replaces, existing frameworks:

- **MITRE ATLAS** maps adversarial tactics and techniques against AI
  systems. ATR provides the detection rules that operationalize those
  tactics into scannable patterns. ATR is to ATLAS what Sigma rules are
  to ATT&CK.
- **OWASP Agentic Top 10** categorizes risk. ATR provides the rules that
  detect those risks in real agent artifacts (SKILL.md, MCP tool
  descriptions, agent configs).
- **NIST AI RMF** defines risk management processes. ATR rules are one
  concrete implementation of detection controls within that framework.

ATR is not a taxonomy, a risk framework, or a governance standard. It is
a **rule corpus** — the executable layer that makes those frameworks
actionable at scan time.

## License Commitment

ATR is licensed under the **MIT License**. This is a permanent,
irrevocable commitment. ATR will never adopt BSL, SSPL, or any other
source-available license that restricts use, modification, or
distribution. The entire rule corpus, engine, and tooling will remain
MIT-licensed indefinitely.

This commitment exists because ATR's value as a standard depends on
unrestricted adoption. A detection standard that restricts who can use
it is not a standard — it is a product. Cisco, NVIDIA, Microsoft, and
every individual developer must be able to embed ATR rules without
license concerns.

## ATR Numbering Authority

Every rule in the official ATR corpus carries a unique identifier in the
format `ATR-YYYY-NNNNN` (e.g. `ATR-2026-00161`). This identifier is
analogous to a CVE number: it is the canonical name by which the entire
ecosystem references a specific detection pattern.

### Who assigns IDs

The **ATR Numbering Authority** is the maintainer team of the
[Agent-Threat-Rule/agent-threat-rules](https://github.com/Agent-Threat-Rule/agent-threat-rules)
repository. As of v1.0, this is a single-maintainer authority. The
governance model will evolve toward a multi-stakeholder committee as
adoption grows (see Roadmap below).

### How IDs are assigned

1. **Community contributions** (pull requests): the contributor proposes
   a rule with `id: ATR-YYYY-DRAFT-<hex>` (draft ID). On merge, the
   maintainer assigns the next available `ATR-YYYY-NNNNN` number.

2. **Threat Cloud crystallization**: the automated pipeline generates
   rules with `id: ATR-YYYY-DRAFT-<hex>`. On promotion through the
   canary gate and PR-back to the main repo, the maintainer assigns a
   permanent number.

3. **Vendor-contributed packs**: when an external vendor (Cisco, Microsoft,
   NVIDIA, etc.) contributes a batch of rules, the maintainer reserves a
   contiguous block of IDs and assigns them on merge.

### What an ID guarantees

- **Uniqueness**: no two rules share the same `ATR-YYYY-NNNNN`.
- **Immutability**: once assigned, the ID is never reused, even if the
  rule is deprecated. Deprecated rules carry `status: deprecated` and a
  `replaced_by` field pointing to the successor.
- **Traceability**: the ID appears in scan output, SARIF reports, Guard
  alerts, Cisco AI Defense logs, and any downstream consumer. A security
  analyst can always trace an alert back to the canonical rule YAML.

### Why this cannot be forked

A fork of the ATR repository can duplicate the rule files, but it
**cannot assign new IDs that the ecosystem recognizes**. If a fork
publishes `ATR-2026-99999`, no ATR-compatible scanner, no Cisco
integration, and no Threat Cloud instance will accept that ID as
official. The numbering authority is the social contract, not the code.

This is the same mechanism that makes CVE numbers meaningful: MITRE is
the numbering authority, and a self-assigned "CVE" from an unrecognized
source has no standing.

---

## Quality Standard

All rules in the official ATR corpus must meet the quality bar defined
in [RFC-001 v1.1](docs/proposals/001-atr-quality-standard-rfc.md).

The quality gate is enforced by:

- **CI**: the `ATR Rule Quality` GitHub Actions check runs
  `validateRuleMeetsStandard()` on every PR.
- **Threat Cloud v2**: the crystallization pipeline runs the same function
  plus self-test (L1) and tool-use deduplication before inserting a
  proposal into the database.
- **Reference implementation**: `src/quality/quality-gate.ts` is the
  canonical code. Any vendor can import it via
  `@agent-threat-rules/quality`.

---

## Rule Contribution Process

### 1. Propose

Open a GitHub Issue with:
- Attack description (what behavior does this detect?)
- At least 1 real-world example payload
- Suggested severity and category
- Research source (blog, CVE, paper, incident report)

### 2. Draft

Open a PR with a rule YAML file under `rules/<category>/`. Use
`id: ATR-YYYY-DRAFT-<hex>` as placeholder. The rule must pass:

- Schema validation (`atr validate`)
- All embedded test cases (`atr test`)
- RFC-001 v1.1 quality gate (`validateRuleMeetsStandard`)
- SKILL.md benchmark regression check (precision/recall must not drop)

### 3. Review

The maintainer (Numbering Authority) reviews the PR for:

- **Deduplication**: does this overlap with an existing rule?
- **Precision**: will this trigger on legitimate skills?
- **Specificity**: is the regex narrow enough for production blocking?
- **References**: are OWASP + MITRE mappings correct?
- **Test coverage**: are the 5+ TPs real attack payloads (not descriptions)?

### 4. Merge + ID assignment

On approval, the maintainer assigns the next available `ATR-YYYY-NNNNN`
and merges. The ID is permanent.

### 5. Publication

Merged rules are automatically:
- Published in the next `npm publish` of `agent-threat-rules`
- Synced to Threat Cloud for distribution to Guard daemons
- Reflected on the ATR website

---

## Contribution paths

| Path | Who | Flow |
|------|-----|------|
| **Pull request** | Anyone | Fork → write rule → open PR → CI validates → maintainer reviews → merge |
| **Threat Cloud v2** | Guard users | Guard detects → TC aggregates → LLM crystallizes (with tool use: dedup + research grounding) → canary 24h → auto-PR → maintainer reviews → merge |
| **Vendor pack** | Cisco, Microsoft, etc. | Vendor writes rules in own format → adapter converts to ATR YAML → vendor opens PR → CI validates → maintainer reviews → merge |
| **Autoresearch** | ATR pipeline | Adversarial generator creates attack samples → TC crystallizes → same as Threat Cloud path |

---

## Decision authority

| Decision | Who decides | Governance document |
|----------|-------------|---------------------|
| Assign rule ID | Numbering Authority (maintainer) | This document |
| Approve/reject rule | Maintainer + CI quality gate | RFC-001 v1.1 |
| Change RFC-001 | Maintainer + public comment period | RFC amendment PR |
| Deprecate a rule | Maintainer | PR with `status: deprecated` |
| Add a new category | Maintainer | PR updating `tags.category` enum |
| Admit TAG member | Maintainer by invitation | This document §Roadmap |

---

## Roadmap

### v1.1 — Technical Advisory Group (Q2 2026)

- [ ] Establish TAG with representatives from 2-3 external organizations
      (target: Cisco AI Defense, NVIDIA garak team, one additional)
- [ ] TAG members gain PR-approve rights (not merge — merge stays with
      numbering authority)
- [ ] Publish annual "ATR Threat Landscape Report" authored by TAG

### v2.0 — Multi-Stakeholder Governance (2027)

- [ ] Transition numbering authority to a multi-stakeholder committee
- [ ] Consider submission to a standards body (OWASP working group,
      Linux Foundation, or CSA Agentic AI Foundation)
- [ ] Federated Threat Cloud: multiple TC instances sync rules through
      a shared protocol
- [ ] ATR Engine Conformance Test Suite: any engine must pass to claim
      "ATR-compatible"
