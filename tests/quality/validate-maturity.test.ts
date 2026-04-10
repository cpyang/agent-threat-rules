import { describe, it, expect } from "vitest";
import {
  canPromote,
  shouldDemote,
} from "../../src/quality/validate-maturity.js";
import type { FpReport, RuleMetadata } from "../../src/quality/types.js";

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
    provenance: {
      mitre_atlas: "human-reviewed",
      owasp_llm: "human-reviewed",
    },
    ...overrides,
  };
}

describe("canPromote", () => {
  describe("to experimental", () => {
    it("accepts a rule that meets experimental gate", () => {
      const decision = canPromote(rule({ maturity: "draft" }), "experimental");
      expect(decision.eligible).toBe(true);
      expect(decision.blockers).toHaveLength(0);
    });

    it("rejects a rule with insufficient test cases", () => {
      const decision = canPromote(
        rule({ maturity: "draft", truePositives: 1, trueNegatives: 1 }),
        "experimental",
      );
      expect(decision.eligible).toBe(false);
    });
  });

  describe("to stable", () => {
    const nowIso = "2026-04-10T00:00:00.000Z";
    const threeWeeksAgo = "2026-03-20T00:00:00.000Z";
    const oneWeekAgo = "2026-04-03T00:00:00.000Z";

    it("accepts a well-validated experimental rule", () => {
      const decision = canPromote(
        rule({
          maturity: "experimental",
          wildSamples: 10000,
          wildFpRate: 0,
          wildValidatedAt: threeWeeksAgo,
        }),
        "stable",
        nowIso,
      );
      expect(decision.eligible).toBe(true);
      expect(decision.blockers).toHaveLength(0);
    });

    it("rejects promotion from draft directly", () => {
      const decision = canPromote(
        rule({
          maturity: "draft",
          wildSamples: 10000,
          wildFpRate: 0,
          wildValidatedAt: threeWeeksAgo,
        }),
        "stable",
        nowIso,
      );
      expect(decision.eligible).toBe(false);
      expect(decision.blockers.some((b) => b.includes("current"))).toBe(true);
    });

    it("rejects with too few wild samples", () => {
      const decision = canPromote(
        rule({
          maturity: "experimental",
          wildSamples: 500,
          wildFpRate: 0,
          wildValidatedAt: threeWeeksAgo,
        }),
        "stable",
        nowIso,
      );
      expect(decision.eligible).toBe(false);
      expect(decision.blockers.some((b) => b.includes("wild_samples"))).toBe(
        true,
      );
    });

    it("rejects with wild FP rate above threshold", () => {
      const decision = canPromote(
        rule({
          maturity: "experimental",
          wildSamples: 10000,
          wildFpRate: 1.0,
          wildValidatedAt: threeWeeksAgo,
        }),
        "stable",
        nowIso,
      );
      expect(decision.eligible).toBe(false);
      expect(decision.blockers.some((b) => b.includes("wild_fp_rate"))).toBe(
        true,
      );
    });

    it("rejects if too soon after wild validation", () => {
      const decision = canPromote(
        rule({
          maturity: "experimental",
          wildSamples: 10000,
          wildFpRate: 0,
          wildValidatedAt: oneWeekAgo,
        }),
        "stable",
        nowIso,
      );
      expect(decision.eligible).toBe(false);
      expect(decision.blockers.some((b) => b.includes("days"))).toBe(true);
    });

    it("rejects if no wild validation timestamp", () => {
      const decision = canPromote(
        rule({
          maturity: "experimental",
          wildSamples: 10000,
          wildFpRate: 0,
        }),
        "stable",
        nowIso,
      );
      expect(decision.eligible).toBe(false);
      expect(decision.blockers.some((b) => b.includes("timestamp"))).toBe(true);
    });
  });
});

describe("shouldDemote", () => {
  const nowIso = "2026-04-10T00:00:00.000Z";

  it("never demotes non-stable rules", () => {
    const decision = shouldDemote(
      rule({ maturity: "experimental", wildFpRate: 50 }),
      [],
      nowIso,
    );
    expect(decision.shouldDemote).toBe(false);
  });

  it("demotes when wild FP rate exceeds threshold", () => {
    const decision = shouldDemote(
      rule({ maturity: "stable", wildFpRate: 3.0 }),
      [],
      nowIso,
    );
    expect(decision.shouldDemote).toBe(true);
    expect(decision.reasons.some((r) => r.includes("wild_fp_rate"))).toBe(true);
  });

  it("does not demote at exactly threshold", () => {
    const decision = shouldDemote(
      rule({ maturity: "stable", wildFpRate: 2.0 }),
      [],
      nowIso,
    );
    expect(decision.shouldDemote).toBe(false);
  });

  it("demotes with 3+ unresolved reports in window", () => {
    const reports: FpReport[] = [
      { reportedAt: "2026-04-01T00:00:00.000Z", resolved: false },
      { reportedAt: "2026-04-02T00:00:00.000Z", resolved: false },
      { reportedAt: "2026-04-03T00:00:00.000Z", resolved: false },
    ];
    const decision = shouldDemote(
      rule({ maturity: "stable", wildFpRate: 0 }),
      reports,
      nowIso,
    );
    expect(decision.shouldDemote).toBe(true);
    expect(decision.reasons.some((r) => r.includes("FP reports"))).toBe(true);
  });

  it("ignores resolved reports", () => {
    const reports: FpReport[] = [
      { reportedAt: "2026-04-01T00:00:00.000Z", resolved: true },
      { reportedAt: "2026-04-02T00:00:00.000Z", resolved: true },
      { reportedAt: "2026-04-03T00:00:00.000Z", resolved: true },
    ];
    const decision = shouldDemote(
      rule({ maturity: "stable", wildFpRate: 0 }),
      reports,
      nowIso,
    );
    expect(decision.shouldDemote).toBe(false);
  });

  it("ignores reports outside the window", () => {
    const reports: FpReport[] = [
      { reportedAt: "2026-01-01T00:00:00.000Z", resolved: false },
      { reportedAt: "2026-01-02T00:00:00.000Z", resolved: false },
      { reportedAt: "2026-01-03T00:00:00.000Z", resolved: false },
    ];
    const decision = shouldDemote(
      rule({ maturity: "stable", wildFpRate: 0 }),
      reports,
      nowIso,
    );
    expect(decision.shouldDemote).toBe(false);
  });
});
