# RFC-001: ATR Quality Standard v1.0

**Status:** Proposed
**Date:** 2026-04-10
**Author:** ATR maintainers
**Target:** Public RFC — any AI agent security scanner can adopt
**Reference Implementation:** `src/quality/` in this repo

---

## Summary

Define a vendor-neutral quality standard for AI agent threat detection rules.
Provide a scoring algorithm, a validation library, and a reference pipeline
that any scanner (ATR, Cisco AI Defense, Snyk mcp-scan, Microsoft AGT, etc.)
can adopt. The goal is not to lock in ATR's rule format — it is to make rule
quality measurable and comparable across vendors.

## Motivation

Today, every AI agent security vendor publishes rules without a common quality
bar. A consumer asking "can I trust rule X in production?" has no answer. Each
vendor claims their rules are high quality; none can prove it in a comparable
way.

Existing rule ecosystems solved this:

- **Sigma** — test → stable → finalized maturity levels
- **YARA** — community vetting, per-rule confidence scoring
- **Snort/Suricata** — sandbox → registered → approved tiers
- **OWASP CRS** — early-release → stable → opt-in with FP rate tags

AI agent rules are a new category. There is no equivalent standard. ATR
proposes to define one, publish it as open RFC, and ship a reference
implementation any vendor can adopt.

**Design principle:** the standard must be useful to someone who does not ship
ATR rules. A Cisco rule, a Snyk rule, or a rule written by hand must all pass
through the same validator and receive comparable scores.

## Non-Goals

- **Not a rule format standard.** This RFC does not mandate ATR YAML. A vendor
  using YARA-style rules, Sigma rules, or a proprietary format can still adopt
  the scoring algorithm by providing an adapter that extracts the required
  metadata.
- **Not a certification program.** There is no "ATR certified" badge. Scores
  are published; consumers decide their own threshold.
- **Not a replacement for existing standards.** OWASP LLM Top 10, MITRE ATLAS,
  and OWASP Agentic Top 10 are taxonomies. This RFC is about rule quality, not
  threat classification.

## Specification

### 1. Maturity Levels

Every rule declares exactly one maturity level.

| Level | Meaning | Promotion gate |
|-------|---------|----------------|
| `draft` | Submitted, not yet validated | Valid YAML/JSON, at least 1 TP + 1 TN |
| `experimental` | CI-validated, limited evidence | 5 TP + 5 TN + 3 evasion tests + OWASP/MITRE mapping + CI pass |
| `stable` | Wild-validated, enterprise-ready | 14+ days in experimental + wild scan ≥1000 samples + FP rate ≤0.5% + confidence ≥80 |
| `deprecated` | Superseded or no longer relevant | Replacement rule ID documented |

**Automatic demotion.** A `stable` rule with wild FP rate >2% or 3+ unresolved
FP reports in 30 days is demoted to `experimental` without human review.

### 2. Confidence Score (0–100)

Every rule at `experimental` or above has a numeric confidence score computed
by a well-defined formula. The formula is:

```
confidence = round(
    precision_score     * 0.40
  + wild_validation     * 0.30
  + coverage_score      * 0.20
  + evasion_docs        * 0.10
)
```

Where each component is in [0, 100]:

| Component | Formula | Intuition |
|-----------|---------|-----------|
| `precision_score` | `(1 - measured_fp_rate) * 100` | How often the rule is right when it fires |
| `wild_validation` | `min(wild_samples / 10000, 1) * 100` | How much real-world data has seen this rule |
| `coverage_score` | `min(conditions / 5, 1) * 100` | Defense in depth — more layers = higher |
| `evasion_docs` | `min(documented_evasions / 5, 1) * 100` | Honest acknowledgment of known bypasses |

**Cross-context penalty.** If a rule designed for one scan context (e.g. MCP
runtime) fires in a different context (e.g. SKILL.md static scan), the
contribution is multiplied by `0.7`. This is computed per-match, not baked
into the rule's stored score.

**Score bands and deployment guidance:**

| Score | Label | Recommended deployment |
|-------|-------|------------------------|
| 90–100 | Very High | Blocking mode in production |
| 80–89  | High | Blocking mode with monitoring |
| 60–79  | Medium | Alert-only |
| 40–59  | Low | Evaluation / research |
| <40    | Draft | Do not deploy |

### 2.5 Two-Dimensional Compliance Model

**Differentiator from existing standards.** Traditional rule standards (Sigma,
YARA, OWASP CRS) answer the question "does the rule have the required
metadata?" They treat compliance as binary: present or missing. This creates
a perverse incentive — vendors pad metadata to pass the check without doing
the underlying work.

ATR Quality Standard introduces a second dimension: **who verified the
metadata**. Every field that requires a subjective judgment (MITRE mapping,
OWASP category, false positive documentation) carries a `metadata_provenance`
value:

| Provenance | Meaning | Accepted at |
|-----------|---------|-------------|
| `human-reviewed` | A maintainer verified this mapping | all levels |
| `community-contributed` | Submitted via PR, reviewed by maintainers | all levels |
| `auto-generated` | Filled by a script without human review | draft, experimental only |
| `llm-generated` | Produced by the TC crystallization flywheel | draft, experimental only |

**Why two dimensions matter.**

A rule with `mitre_atlas: "AML.T0051"` and `metadata_provenance.mitre_atlas:
auto-generated` is technically compliant — the field is present. But
downstream consumers know the mapping was not human-verified. They can
filter it out if they need strong guarantees (e.g. for regulated
environments) or accept it if they just want broad coverage.

**Compliance at each level:**

- `draft`: Dimension 1 only (metadata present)
- `experimental`: Dimension 1 only (any provenance accepted)
- `stable`: Dimension 1 **and** Dimension 2 (provenance must be `human-reviewed` or `community-contributed`)

This creates a **progressive trust ladder**:

```
auto-generated metadata        → rule passes experimental
→ human reviews the mapping    → provenance: human-reviewed
→ rule eligible for stable     → deployable in production
```

No existing rule standard has this. It is the mechanism that makes "ship
fast" and "stay honest" compatible.

### 3. Required Metadata

Every rule must expose the following metadata (the exact field names can differ
per vendor; the semantics must match):

**Required for `experimental`:**

- Unique rule ID
- Human-readable title
- Severity (`critical` | `high` | `medium` | `low` | `informational`)
- At least 5 true positives (real attack payloads)
- At least 5 true negatives (similar-looking legitimate content)
- At least 3 evasion tests (documented bypass techniques, each marked as
  expected-not-to-trigger with a description)
- At least 1 OWASP reference (LLM Top 10 or Agentic Top 10)
- At least 1 MITRE reference (ATLAS or ATT&CK)
- At least 1 documented false positive pattern

**Additionally required for `stable`:**

- `wild_validated` date
- `wild_samples` count (≥1000)
- `wild_fp_rate` (≤0.5%)
- `confidence` score (≥80)

### 4. Validation Library

ATR ships `@agent-threat-rules/quality` as a reference implementation. The
library exposes:

```typescript
// Pure functions, no I/O
export function computeConfidence(rule: RuleMetadata): ConfidenceScore;
export function validateMaturity(rule: RuleMetadata, level: Maturity): ValidationResult;
export function canPromote(rule: RuleMetadata, wildStats: WildStats): PromotionDecision;
export function shouldDemote(rule: RuleMetadata, recentFpReports: FpReport[]): DemotionDecision;
```

Where `RuleMetadata` is a minimal interface any vendor can implement:

```typescript
interface RuleMetadata {
  id: string;
  title: string;
  severity: Severity;
  maturity: Maturity;
  conditions: number;          // count of detection layers
  truePositives: number;
  trueNegatives: number;
  evasionTests: number;
  hasOwaspRef: boolean;
  hasMitreRef: boolean;
  hasFalsePositiveDocs: boolean;
  wildSamples?: number;
  wildFpRate?: number;
  wildValidatedAt?: string;
}
```

A vendor using a non-ATR rule format writes an adapter:

```typescript
// Example: Sigma adapter
function sigmaToMetadata(sigmaRule: SigmaRule): RuleMetadata { ... }

// Example: YARA adapter
function yaraToMetadata(yaraRule: YaraRule): RuleMetadata { ... }
```

Once adapted, any rule can be scored with the same formula. A Cisco rule and
an ATR rule become directly comparable.

### 5. Adoption Path

Adoption is voluntary and incremental.

**Level 1 — Compute scores:**
Any vendor imports `@agent-threat-rules/quality`, writes an adapter for their
rule format, and computes confidence scores. Scores can be displayed in scan
output or used internally for tuning.

**Level 2 — Declare maturity:**
Vendor sets `maturity` field on each rule per this RFC's promotion gates.
Consumers can filter rules by minimum maturity.

**Level 3 — Publish wild stats:**
Vendor runs wild validation and publishes per-rule `wild_samples` and
`wild_fp_rate`. This enables `stable` status.

**Level 4 — Cross-vendor federation:**
Multiple vendors publish their rule metadata in a common format (this RFC).
Consumers can compare rules across vendors on the same axes. No vendor is
locked in.

## Reference Implementation

ATR will ship the reference implementation in this repo:

```
src/quality/
  index.ts              // Public API
  types.ts              // RuleMetadata, ConfidenceScore, etc.
  compute-confidence.ts // The scoring formula
  validate-maturity.ts  // Promotion gate checks
  adapters/
    atr.ts              // ATR YAML → RuleMetadata
    sigma.ts            // Sigma YAML → RuleMetadata (optional)
    yara.ts             // YARA → RuleMetadata (optional)
```

Published as part of `agent-threat-rules` on npm. No separate package. Other
vendors import it directly or copy the formula.

## Outreach & Ecosystem

Once the reference implementation ships, ATR will:

1. Open a PR to each of these projects inviting them to adopt the scoring
   algorithm (not the rule format, just the formula):
   - **Cisco AI Defense** (via their OSS scanner repo)
   - **Snyk Invariant / mcp-scan**
   - **Microsoft Agent Governance Toolkit**
   - **Portkey Gateway**
   - **Meta PurpleLlama**

2. Publish the RFC at `atr.dev/rfc/001` (or equivalent) with a public
   comment period.

3. Submit the scoring algorithm as an extension to the OWASP Agentic Top 10
   working group and the MITRE ATLAS project.

## Open Questions

1. **Who maintains the standard?** If multiple vendors adopt it, decisions
   about changes (new fields, threshold adjustments) need a governance model.
   Options: ATR maintainers only / rotating chair / OWASP working group / CSA
   foundation.

2. **Backward compatibility.** Once v1.0 ships and vendors adopt it, how do
   future versions avoid breaking existing rule sets? Proposal: semantic
   versioning, with breaking changes only at major versions, and a migration
   tool that upgrades metadata between versions.

3. **Wild validation fairness.** A vendor with access to large scan corpora
   (53K+ skills) can promote rules to `stable` faster than a vendor without.
   This creates a data moat. Should wild stats from any corpus count, or
   should there be a canonical "reference corpus" all vendors validate
   against? Analogy: PINT benchmark for prompt injection.

4. **LLM-generated rules.** If a rule is generated by an LLM (e.g. via ATR's
   crystallization pipeline), should its initial confidence be capped until
   human review? Proposal: yes, cap at 70 until a human reviewer approves.

## Alternatives Considered

### Alternative 1: Proprietary internal scoring

Keep quality scoring as ATR-internal logic. Simpler, but limits the
standard's impact — other vendors cannot use it, so it never becomes a
common language.

**Rejected because:** the goal is to define the industry standard, not to
build ATR moats.

### Alternative 2: Leave it to OWASP / CSA

Wait for OWASP Agentic Top 10 or CSA Agentic AI Foundation to define a
quality standard. Safer politically, but they are currently focused on
taxonomy (what threats exist), not rule quality (how well a given rule
detects them).

**Rejected because:** someone has to start. ATR has the data and the rule
set. Waiting means the standard gets defined by whoever moves first, and
that may be a vendor with worse positioning for openness.

### Alternative 3: Copy Sigma's model exactly

Sigma has `test → stable → finalized`. Copy it verbatim.

**Rejected because:** Sigma's model assumes human maintainers grade every
rule. ATR's flywheel generates rules at machine speed, so the promotion
gates need wild validation metrics, not just human review. The levels are
similar but the gates are different.

## Changelog

- 2026-04-10: Initial draft
