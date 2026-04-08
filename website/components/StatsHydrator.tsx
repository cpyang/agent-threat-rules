"use client";

import { useEffect } from "react";

const GITHUB_RAW =
  "https://raw.githubusercontent.com/Agent-Threat-Rule/agent-threat-rules/main/data";

/**
 * Client component that fetches latest stats from GitHub on mount
 * and dispatches a custom event. CountUp components listen for this
 * event and update their targets if the live value differs.
 *
 * Drop this anywhere in the page — it renders nothing.
 */
export function StatsHydrator() {
  useEffect(() => {
    // Mark document as JS-ready so reveal animations work.
    // Without this class, CSS shows all content visible (for crawlers/noscript).
    document.documentElement.classList.add("js-ready");

    let cancelled = false;

    async function hydrate() {
      try {
        const [megaRes, pintRes, evalRes, statsRes] = await Promise.all([
          fetch(`${GITHUB_RAW}/mega-scan-report.json`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${GITHUB_RAW}/pint-benchmark/pint-eval-report.json`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${GITHUB_RAW}/eval-report.json`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch(`${GITHUB_RAW}/stats.json`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (cancelled) return;

        const live: Record<string, number> = {};

        // Live rule count + categories from stats.json
        if (statsRes?.rules) {
          live.ruleCount = statsRes.rules.total;
          live.categoryCount = statsRes.rules.categories;
        }

        // Live ecosystem scan data from stats.json (fallback to mega-scan)
        if (statsRes?.ecosystem?.skillsScanned) {
          live.megaScanTotal = statsRes.ecosystem.skillsScanned;
          live.megaScanFlagged = statsRes.ecosystem.skillsFlagged;
        }

        if (megaRes?.totals) {
          live.megaScanTotal = megaRes.totals.scanned;
          live.megaScanFlagged = megaRes.totals.flagged;
          live.megaScanCritical = megaRes.severity?.critical ?? 0;
          live.megaScanHigh = megaRes.severity?.high ?? 0;
        }

        if (pintRes?.report?.overall) {
          live.pintPrecision = Math.round(pintRes.report.overall.precision * 1000) / 10;
          live.pintRecall = Math.round(pintRes.report.overall.recall * 1000) / 10;
          live.pintF1 = Math.round(pintRes.report.overall.f1 * 1000) / 10;
          live.pintSamples = pintRes.report.corpusSize;
        }

        if (evalRes?.report?.overall) {
          live.selfTestPrecision = Math.round(evalRes.report.overall.precision * 1000) / 10;
          live.selfTestRecall = Math.round(evalRes.report.overall.recall * 1000) / 10;
          live.selfTestSamples = evalRes.report.corpusSize;
        }

        if (Object.keys(live).length > 0) {
          window.dispatchEvent(new CustomEvent("atr:live-stats", { detail: live }));
        }
      } catch {
        // Silent fail — build-time data stays
      }
    }

    hydrate();
    return () => { cancelled = true; };
  }, []);

  return null;
}
