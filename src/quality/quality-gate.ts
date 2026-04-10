/**
 * ATR Quality Standard — Quality Gate
 *
 * Checks whether a rule meets the minimum quality bar for a target maturity
 * level. Used by TC crystallization pipeline to reject weak LLM-generated
 * rules before they enter the proposal pipeline.
 *
 * See docs/proposals/001-atr-quality-standard-rfc.md §3 for the required
 * metadata matrix.
 *
 * @module agent-threat-rules/quality/quality-gate
 */

import type {
  Maturity,
  Provenance,
  QualityGateResult,
  RuleMetadata,
} from "./types.js";

/**
 * Minimum requirements for each maturity level.
 * Thresholds match RFC-001 §3. Adjust here to tune the bar.
 *
 * The experimental gate uses 3/3 (matching Cisco-merge practice) and
 * accepts any provenance (auto-generated OK). The stable gate requires
 * 5/5 with 3 evasion tests AND human-reviewed provenance for MITRE/OWASP.
 */
const REQUIREMENTS = {
  draft: {
    minConditions: 1,
    minTruePositives: 1,
    minTrueNegatives: 1,
    minEvasionTests: 0,
    requireOwasp: false,
    requireMitre: false,
    requireFalsePositiveDocs: false,
    requireHumanReviewedProvenance: false,
  },
  experimental: {
    minConditions: 3,
    minTruePositives: 3, // 3/3 matches Cisco-merge practice
    minTrueNegatives: 3,
    minEvasionTests: 0, // warning, not blocker
    requireOwasp: true,
    requireMitre: true,
    requireFalsePositiveDocs: true,
    requireHumanReviewedProvenance: false, // auto-generated OK for experimental
  },
  stable: {
    minConditions: 3,
    minTruePositives: 5,
    minTrueNegatives: 5,
    minEvasionTests: 3, // hard requirement
    requireOwasp: true,
    requireMitre: true,
    requireFalsePositiveDocs: true,
    requireHumanReviewedProvenance: true, // stable demands verified provenance
  },
} as const;

/** Provenance values that count as "verified" for stable promotion */
const VERIFIED_PROVENANCE: readonly Provenance[] = [
  "human-reviewed",
  "community-contributed",
];

/**
 * Validate a rule against the quality bar for a target maturity level.
 *
 * @param rule - Rule metadata
 * @param target - Target maturity level to validate against (default: rule.maturity)
 * @returns Gate result with passed/failed and human-readable issues
 */
export function validateRuleMeetsStandard(
  rule: RuleMetadata,
  target?: Maturity,
): QualityGateResult {
  const level = target ?? rule.maturity;

  // Deprecated rules are always valid (they're being retired, not used)
  if (level === "deprecated") {
    return { passed: true, issues: [], warnings: [] };
  }

  const req = REQUIREMENTS[level];
  const issues: string[] = [];
  const warnings: string[] = [];

  if (rule.conditions < req.minConditions) {
    issues.push(
      `only ${rule.conditions} detection condition(s) (need ${req.minConditions}+)`,
    );
  }
  if (rule.truePositives < req.minTruePositives) {
    issues.push(
      `only ${rule.truePositives} true_positive(s) (need ${req.minTruePositives}+)`,
    );
  }
  if (rule.trueNegatives < req.minTrueNegatives) {
    issues.push(
      `only ${rule.trueNegatives} true_negative(s) (need ${req.minTrueNegatives}+)`,
    );
  }
  if (req.minEvasionTests > 0 && rule.evasionTests < req.minEvasionTests) {
    issues.push(
      `only ${rule.evasionTests} evasion_test(s) (need ${req.minEvasionTests}+)`,
    );
  } else if (rule.evasionTests < 3 && level === "experimental") {
    warnings.push(
      `only ${rule.evasionTests} evasion_test(s) — recommend 3+ for stable promotion`,
    );
  }
  if (req.requireOwasp && !rule.hasOwaspRef) {
    issues.push("missing OWASP reference (LLM Top 10 or Agentic Top 10)");
  }
  if (req.requireMitre && !rule.hasMitreRef) {
    issues.push("missing MITRE reference (ATLAS or ATT&CK)");
  }
  if (req.requireFalsePositiveDocs && !rule.hasFalsePositiveDocs) {
    issues.push("missing false_positives documentation");
  }

  // Stable promotion requires human-verified provenance on key fields
  if (req.requireHumanReviewedProvenance) {
    const p = rule.provenance ?? {};
    const mitreProvenance = p.mitre_atlas ?? p.mitre_attack;
    const owaspProvenance = p.owasp_llm ?? p.owasp_agentic;

    if (rule.hasMitreRef && mitreProvenance && !isVerified(mitreProvenance)) {
      issues.push(
        `MITRE reference is "${mitreProvenance}" — stable requires human-reviewed or community-contributed`,
      );
    }
    if (rule.hasOwaspRef && owaspProvenance && !isVerified(owaspProvenance)) {
      issues.push(
        `OWASP reference is "${owaspProvenance}" — stable requires human-reviewed or community-contributed`,
      );
    }
  } else {
    // experimental/draft: surface provenance as warning so consumers can see it
    const p = rule.provenance ?? {};
    const autoFields: string[] = [];
    if (p.mitre_atlas === "auto-generated") autoFields.push("mitre_atlas");
    if (p.owasp_llm === "auto-generated") autoFields.push("owasp_llm");
    if (p.owasp_agentic === "auto-generated") autoFields.push("owasp_agentic");
    if (autoFields.length > 0) {
      warnings.push(
        `auto-generated provenance on: ${autoFields.join(", ")} — needs human review for stable`,
      );
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  };
}

function isVerified(p: Provenance): boolean {
  return VERIFIED_PROVENANCE.includes(p);
}

/**
 * Public accessor for the requirements table.
 * Useful for documentation generators and UIs that display the quality bar.
 */
export function getRequirements(): typeof REQUIREMENTS {
  return REQUIREMENTS;
}
