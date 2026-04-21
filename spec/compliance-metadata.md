# ATR Rule Compliance Metadata Schema

**Status:** Draft v0.1 · Proposed 2026-04-22
**Scope:** Every `rules/**/*.yaml` may optionally include a top-level `compliance:` block that maps the rule to controls / articles / clauses in published AI compliance frameworks.

## Why

ATR rules already include `references:` pointing to OWASP LLM / OWASP Agentic Top 10 / MITRE ATLAS. That is an academic-citation block useful for researchers.

`compliance:` is a separate, audit-grade block whose purpose is different: an enterprise customer's GRC team must be able to take a detection event, trace it back to a specific rule ID, and show an auditor that the rule addresses a specific **published article or control** of:

1. EU AI Act (Regulation 2024/1689) — Articles 9-15, 50, 72, Annex III
2. Colorado AI Act SB24-205 — enforced 2026-06-30
3. NIST AI RMF 1.0 — Govern / Map / Measure / Manage functions + subcategories
4. ISO/IEC 42001:2023 — clauses 6-10 (AIMS)
5. OWASP Agentic Top 10 (2026) — ASI01..ASI10
6. OWASP LLM Top 10 (2025) — LLM01..LLM10

The `references:` block is not sufficient because:
- It does not distinguish "we studied this paper" from "this rule enforces this specific regulatory control."
- It has no structure for "what clause" vs "what context this rule addresses within that clause."
- It cannot carry the prose an auditor needs to accept the mapping.

## Schema

```yaml
compliance:
  # One key per framework the rule maps to. Omit frameworks that do not apply.
  owasp_agentic:
    - id: "ASI01:2026"          # Required. Canonical category ID.
      context: "..."            # Required. One-sentence prose explaining *how*
                                # this rule addresses the category. Auditor-
                                # readable; no jargon-only text.
      strength: primary         # Optional. primary | secondary | partial.

  owasp_llm:
    - id: "LLM01:2025"
      context: "..."
      strength: primary

  eu_ai_act:
    - article: 12               # Required. Article number (integer).
      clause: "Automatic logging for high-risk AI systems"  # Required. Short name.
      context: "..."            # Required. How this rule satisfies the clause.
      strength: primary

  colorado_ai_act:
    - section: "SB24-205.5"     # Required. Section identifier.
      clause: "High-risk disclosure"
      context: "..."
      strength: primary

  nist_ai_rmf:
    - function: "Manage"        # Required. Govern | Map | Measure | Manage.
      subcategory: "MG.2.3"     # Required. Full subcategory ID.
      context: "..."
      strength: primary

  iso_42001:
    - clause: "6.2"             # Required. AIMS clause (e.g. 6.2, 9.1).
      clause_name: "Risk treatment"  # Required. Human-readable name.
      context: "..."
      strength: primary
```

### Field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` / `article` / `section` / `function`+`subcategory` / `clause` | string/int | yes | Framework-specific canonical identifier. Must match the published framework exactly. |
| `clause` (EU/Colorado/ISO) | string | yes | Short human name for the clause. Helps report readers. |
| `context` | string | yes | One sentence, auditor-readable, explaining *why* the rule addresses this control. Not a copy of the clause text. |
| `strength` | enum | no | `primary` (rule is a main control for this clause), `secondary` (supports it), `partial` (covers part of it). Defaults to `primary` if omitted. |

### Multiplicity

A rule MAY map to multiple items within the same framework (a rule that logs event AND enforces policy touches both Article 12 and Article 14 of the EU AI Act). List each separately.

A rule MAY map to zero frameworks (e.g., an experimental research rule). Omit the `compliance:` block entirely in that case — do not include an empty one.

### Deprecation

When a framework publishes a new version, both old and new keys MAY coexist during a transition window (e.g., both `owasp_llm` 2023 and 2025 items), clearly distinguished by the `id` version suffix.

## Relationship to `references:`

The existing `references:` block is preserved unchanged. `references:` is for academic / research citations (MITRE ATLAS technique IDs, papers, blog posts). `compliance:` is for regulatory audit evidence.

A rule can have entries in both blocks — e.g., `references.mitre_atlas` AND `compliance.nist_ai_rmf` — and often will.

## Validation

- `scripts/validate-compliance.mjs` (to be added) validates every `compliance:` block against a per-framework allowlist of valid IDs / articles / subcategories / clauses. Rules with invalid entries fail CI.
- The allowlists live in `data/compliance-frameworks/*.json` — one file per framework — and are updated via PR when a framework publishes revisions.

## Downstream consumers

The primary consumer is **PanGuard Enterprise's AI Compliance Audit Evidence Module**, which generates quarterly reports mapping detection events (via rule IDs) to auditor-grade framework evidence. Other downstream consumers may include:

- ATR-compatible scanners that want to tag each detection with its regulatory context
- GRC platforms (Vanta, Drata, etc.) that integrate ATR rule packs
- Independent auditors verifying AI-system compliance claims

All downstream consumers are welcome — the `compliance:` block is MIT-licensed alongside the rules.

## Out of scope for this spec

- How a scanner renders compliance data in its UI
- How a GRC platform surfaces this in a customer's audit trail
- The legal interpretation of any framework clause — this spec provides the mapping data; auditors and counsel interpret it

## Open questions

1. Should `strength` be required (forcing every mapping to declare its strength)? Argument for: signals rigour. Argument against: extra authoring friction for common `primary` case. **Current answer: optional, default `primary`.**
2. Should framework-specific metadata (e.g., EU AI Act Annex III categories) live alongside article mappings? **Current answer: yes, under a nested `annex:` key within the article object if needed.**
3. How to handle frameworks that don't exist yet but are expected (e.g., Japan AI Safety Act 2027)? **Current answer: add keys as frameworks publish; no speculative schema for unpublished frameworks.**

## Roll-out plan

1. 2026-04-22: this spec document merged
2. 2026-04-W4: 10 sample rules carry `compliance:` block for OWASP Agentic + OWASP LLM (bootstrap from existing `references:` data)
3. 2026-05: 50 rules extended across all 6 frameworks (LLM-assisted authoring + human QA)
4. 2026-Q2-end: all 311 rules mapped across at least the 3 most-requested frameworks (EU AI Act, NIST AI RMF, OWASP Agentic)
5. 2026-Q3: remaining frameworks (Colorado, ISO 42001, OWASP LLM) complete
6. Ongoing: new ATR rules MUST include `compliance:` from day 1 (enforced by contribution checklist)
