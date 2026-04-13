import { describe, it, expect } from "vitest";
import { validateRuleMeetsStandard } from "../../src/quality/quality-gate.js";
import type { RuleMetadata } from "../../src/quality/types.js";

function rule(overrides: Partial<RuleMetadata> = {}): RuleMetadata {
  return {
    id: "TEST-001",
    title: "Test rule",
    maturity: "experimental",
    conditions: 3,
    truePositives: 5,
    trueNegatives: 5,
    evasionTests: 3,
    hasOwaspRef: true,
    hasMitreRef: true,
    hasFalsePositiveDocs: true,
    ...overrides,
  };
}

describe("validateRuleMeetsStandard", () => {
  describe("draft level", () => {
    it("accepts a minimal valid draft", () => {
      const result = validateRuleMeetsStandard(
        rule({
          maturity: "draft",
          conditions: 1,
          truePositives: 1,
          trueNegatives: 1,
          evasionTests: 0,
          hasOwaspRef: false,
          hasMitreRef: false,
          hasFalsePositiveDocs: false,
        }),
        "draft",
      );
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("rejects a draft with zero test cases", () => {
      const result = validateRuleMeetsStandard(
        rule({
          maturity: "draft",
          conditions: 1,
          truePositives: 0,
          trueNegatives: 0,
        }),
        "draft",
      );
      expect(result.passed).toBe(false);
    });
  });

  describe("experimental level", () => {
    it("accepts a complete experimental rule", () => {
      const result = validateRuleMeetsStandard(rule(), "experimental");
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("accepts 3 TP + 3 TN at experimental (RFC-001 v1.1 lowered bar)", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 3, trueNegatives: 3, evasionTests: 0, hasOwaspRef: false, hasMitreRef: false, hasFalsePositiveDocs: false }),
        "experimental",
      );
      expect(result.passed).toBe(true);
    });

    it("rejects a rule with fewer than 3 TP at experimental", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 2, trueNegatives: 3, evasionTests: 0, hasOwaspRef: false, hasMitreRef: false, hasFalsePositiveDocs: false }),
        "experimental",
      );
      expect(result.passed).toBe(false);
      expect(result.issues.some((i) => i.includes("true_positive"))).toBe(true);
    });

    it("rejects a rule with fewer than 3 TN at experimental", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 3, trueNegatives: 2, evasionTests: 0, hasOwaspRef: false, hasMitreRef: false, hasFalsePositiveDocs: false }),
        "experimental",
      );
      expect(result.passed).toBe(false);
      expect(result.issues.some((i) => i.includes("true_negative"))).toBe(true);
    });

    it("accepts a rule with 1 condition at experimental (RFC-001 v1.1)", () => {
      const result = validateRuleMeetsStandard(
        rule({ conditions: 1, truePositives: 3, trueNegatives: 3, evasionTests: 0, hasOwaspRef: false, hasMitreRef: false, hasFalsePositiveDocs: false }),
        "experimental",
      );
      expect(result.passed).toBe(true);
    });

    it("accepts experimental without OWASP/MITRE/FP docs (RFC-001 v1.1)", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 3, trueNegatives: 3, evasionTests: 0, hasOwaspRef: false, hasMitreRef: false, hasFalsePositiveDocs: false }),
        "experimental",
      );
      expect(result.passed).toBe(true);
    });

    it("accepts experimental without evasion tests (RFC-001 v1.1)", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 3, trueNegatives: 3, evasionTests: 0, hasOwaspRef: false, hasMitreRef: false, hasFalsePositiveDocs: false }),
        "experimental",
      );
      expect(result.passed).toBe(true);
    });

    it("reports multiple issues simultaneously", () => {
      const result = validateRuleMeetsStandard(
        rule({
          conditions: 1,
          truePositives: 1,
          trueNegatives: 1,
          hasOwaspRef: false,
        }),
        "experimental",
      );
      expect(result.passed).toBe(false);
      // TP < 3, TN < 3 = 2 issues
      expect(result.issues.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("stable level", () => {
    it("accepts a complete stable rule", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 5, trueNegatives: 5 }),
        "stable",
      );
      expect(result.passed).toBe(true);
    });

    it("requires 5 TP at stable (not 3)", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 3 }),
        "stable",
      );
      expect(result.passed).toBe(false);
      expect(result.issues.some((i) => i.includes("true_positive"))).toBe(true);
    });

    it("requires evasion tests at stable (not just recommended)", () => {
      const result = validateRuleMeetsStandard(
        rule({ truePositives: 5, trueNegatives: 5, evasionTests: 0 }),
        "stable",
      );
      expect(result.passed).toBe(false);
      expect(result.issues.some((i) => i.includes("evasion_test"))).toBe(true);
    });

    it("rejects stable rule with auto-generated MITRE provenance", () => {
      const result = validateRuleMeetsStandard(
        rule({
          truePositives: 5,
          trueNegatives: 5,
          provenance: { mitre_atlas: "auto-generated" },
        }),
        "stable",
      );
      expect(result.passed).toBe(false);
      expect(result.issues.some((i) => i.includes("MITRE"))).toBe(true);
    });

    it("accepts stable rule with human-reviewed provenance", () => {
      const result = validateRuleMeetsStandard(
        rule({
          truePositives: 5,
          trueNegatives: 5,
          provenance: {
            mitre_atlas: "human-reviewed",
            owasp_llm: "human-reviewed",
          },
        }),
        "stable",
      );
      expect(result.passed).toBe(true);
    });

    it("accepts community-contributed provenance as verified", () => {
      const result = validateRuleMeetsStandard(
        rule({
          truePositives: 5,
          trueNegatives: 5,
          provenance: {
            mitre_atlas: "community-contributed",
            owasp_llm: "community-contributed",
          },
        }),
        "stable",
      );
      expect(result.passed).toBe(true);
    });
  });

  describe("provenance warnings at experimental", () => {
    it("warns about auto-generated MITRE at experimental (but passes)", () => {
      const result = validateRuleMeetsStandard(
        rule({ provenance: { mitre_atlas: "auto-generated" } }),
        "experimental",
      );
      expect(result.passed).toBe(true);
      expect(result.warnings.some((w) => w.includes("auto-generated"))).toBe(
        true,
      );
    });

    it("does not warn if provenance is human-reviewed", () => {
      const result = validateRuleMeetsStandard(
        rule({ provenance: { mitre_atlas: "human-reviewed" } }),
        "experimental",
      );
      const provenanceWarnings = result.warnings.filter((w) =>
        w.includes("auto-generated"),
      );
      expect(provenanceWarnings).toHaveLength(0);
    });
  });

  describe("deprecated level", () => {
    it("always passes deprecated rules", () => {
      const result = validateRuleMeetsStandard(
        rule({
          maturity: "deprecated",
          conditions: 0,
          truePositives: 0,
          trueNegatives: 0,
        }),
        "deprecated",
      );
      expect(result.passed).toBe(true);
    });
  });

  describe("target parameter", () => {
    it("defaults to rule.maturity when target not provided", () => {
      const r = rule({
        maturity: "draft",
        conditions: 1,
        truePositives: 1,
        trueNegatives: 1,
      });
      const result = validateRuleMeetsStandard(r);
      expect(result.passed).toBe(true); // passes draft
    });

    it("uses target when provided, overriding rule.maturity", () => {
      const r = rule({
        maturity: "draft",
        conditions: 1,
        truePositives: 1,
        trueNegatives: 1,
        hasOwaspRef: false,
      });
      const result = validateRuleMeetsStandard(r, "experimental");
      expect(result.passed).toBe(false); // 1 TP < 3 minimum, would fail experimental
    });
  });
});
