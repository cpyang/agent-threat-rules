import { readFileSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "..", "data");

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as T;
  } catch {
    return null;
  }
}

// --- ClawHub Scan ---
interface ClawHubStats {
  scanDate: string;
  atrRules: number;
  totalCrawled: number;
  totalScanned: number;
  summary: { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number };
  flaggedCount: number;
}

// --- Mega Scan (OpenClaw + Skills.sh) ---
interface MegaScanReport {
  scan_date: string;
  engine_rules: number;
  sources: { openclaw: number; skills_sh: number };
  totals: { scanned: number; flagged: number; flagged_rate: string };
  severity: { critical: number; high: number; medium: number };
}

// --- PINT Benchmark ---
interface PintReport {
  report: {
    corpusSize: number;
    overall: {
      precision: number;
      recall: number;
      f1: number;
      confusion: { tp: number; fp: number; tn: number; fn: number };
    };
  };
}

// --- Self-Test Eval ---
interface EvalReport {
  report: {
    corpusSize: number;
    overall: {
      precision: number;
      recall: number;
      f1: number;
    };
  };
}

// --- Skill Scan ---
interface SkillScanReport {
  scan_metadata: {
    total_skills_scanned: number;
    total_publishers: number;
    avg_latency_ms: number;
  };
  summary: {
    flagged: number;
    flagged_rate: string;
    severity_breakdown: { critical: number; high: number; medium: number };
  };
}

// --- Skill Benchmark ---
interface SkillBenchmarkReport {
  corpus_size: number;
  malicious_count: number;
  benign_count: number;
  overall_recall: number;
  overall_precision: number;
  overall_f1: number;
  fp_rate: number;
  avg_latency_ms: number;
}

export interface SiteStats {
  // Rules
  ruleCount: number;
  categoryCount: number;

  // ClawHub scan
  clawHubCrawled: number;
  clawHubScanned: number;
  clawHubCritical: number;
  clawHubHigh: number;
  clawHubScanDate: string;

  // Mega scan (latest, larger)
  megaScanTotal: number;
  megaScanFlagged: number;
  megaScanCritical: number;
  megaScanHigh: number;
  megaScanSources: { openclaw: number; skillsSh: number };
  megaScanDate: string;

  // PINT benchmark
  pintSamples: number;
  pintPrecision: number;
  pintRecall: number;
  pintF1: number;

  // Self-test
  selfTestSamples: number;
  selfTestPrecision: number;
  selfTestRecall: number;

  // Skill scan
  skillsScanned: number;
  skillPublishers: number;
  skillFlagged: number;
  skillAvgLatency: number;

  // Skill benchmark
  skillBenchSamples: number;
  skillBenchRecall: number;
  skillBenchPrecision: number;
  skillBenchF1: number;
  skillBenchFpRate: number;
  skillBenchLatency: number;

  // CVEs
  cveCount: number;

  // Ecosystem integrations
  ecosystemIntegrations: EcosystemIntegration[];

  // Coverage
  owaspAgentic: string;
  safeMcp: string;
  owaspAst10: string;
}

export interface EcosystemIntegration {
  name: string;
  type: "merged" | "open" | "using";
  detail: string;
  url?: string;
}

export function loadSiteStats(): SiteStats {
  const clawhub = readJson<ClawHubStats>(join(DATA_DIR, "clawhub-scan", "ecosystem-stats.json"));
  const mega = readJson<MegaScanReport>(join(DATA_DIR, "mega-scan-report.json"));
  const pint = readJson<PintReport>(join(DATA_DIR, "pint-benchmark", "pint-eval-report.json"));
  const eval_ = readJson<EvalReport>(join(DATA_DIR, "eval-report.json"));
  const skillScan = readJson<SkillScanReport>(join(DATA_DIR, "skill-scan-report-full.json"));
  const skillBench = readJson<SkillBenchmarkReport>(join(DATA_DIR, "skill-benchmark", "benchmark-report.json"));

  // Count rules from filesystem
  const { loadAllRules } = require("./rules");
  const rules = loadAllRules();

  const categories = new Set(rules.map((r: { category: string }) => r.category));

  // Count unique CVEs across all rules
  const cves = new Set<string>();
  for (const rule of rules) {
    const ruleCves = (rule as { cves?: string[] }).cves ?? [];
    for (const cve of ruleCves) {
      if (cve.startsWith("CVE-")) cves.add(cve);
    }
  }

  return {
    ruleCount: rules.length,
    categoryCount: categories.size,

    clawHubCrawled: clawhub?.totalCrawled ?? 36394,
    clawHubScanned: clawhub?.totalScanned ?? 9676,
    clawHubCritical: clawhub?.summary?.CRITICAL ?? 182,
    clawHubHigh: clawhub?.summary?.HIGH ?? 1124,
    clawHubScanDate: clawhub?.scanDate ?? "2026-03-26",

    megaScanTotal: mega?.totals?.scanned ?? 53377,
    megaScanFlagged: mega?.totals?.flagged ?? 5939,
    megaScanCritical: mega?.severity?.critical ?? 3255,
    megaScanHigh: mega?.severity?.high ?? 2656,
    megaScanSources: {
      openclaw: mega?.sources?.openclaw ?? 50285,
      skillsSh: mega?.sources?.skills_sh ?? 3115,
    },
    megaScanDate: mega?.scan_date ?? "2026-04-06",

    pintSamples: pint?.report?.corpusSize ?? 850,
    pintPrecision: Math.round((pint?.report?.overall?.precision ?? 0.9964) * 1000) / 10,
    pintRecall: Math.round((pint?.report?.overall?.recall ?? 0.612) * 1000) / 10,
    pintF1: Math.round((pint?.report?.overall?.f1 ?? 0.758) * 1000) / 10,

    selfTestSamples: eval_?.report?.corpusSize ?? 341,
    selfTestPrecision: Math.round((eval_?.report?.overall?.precision ?? 0.997) * 1000) / 10,
    selfTestRecall: Math.round((eval_?.report?.overall?.recall ?? 0.994) * 1000) / 10,

    skillsScanned: skillScan?.scan_metadata?.total_skills_scanned ?? 3115,
    skillPublishers: skillScan?.scan_metadata?.total_publishers ?? 104,
    skillFlagged: skillScan?.summary?.flagged ?? 26,
    skillAvgLatency: skillScan?.scan_metadata?.avg_latency_ms ?? 5.39,

    skillBenchSamples: skillBench?.corpus_size ?? 498,
    skillBenchRecall: Math.round((skillBench?.overall_recall ?? 0.969) * 1000) / 10,
    skillBenchPrecision: Math.round((skillBench?.overall_precision ?? 1) * 1000) / 10,
    skillBenchF1: Math.round((skillBench?.overall_f1 ?? 0.984) * 1000) / 10,
    skillBenchFpRate: Math.round((skillBench?.fp_rate ?? 0) * 1000) / 10,
    skillBenchLatency: Math.round((skillBench?.avg_latency_ms ?? 3.52) * 10) / 10,

    cveCount: cves.size || 16,

    ecosystemIntegrations: [
      {
        name: "Cisco AI Defense",
        type: "merged",
        detail: "34 ATR rules merged as upstream. Built --rule-packs CLI for ATR.",
        url: "https://github.com/cisco-ai-defense/skill-scanner/pull/79",
      },
      {
        name: "Awesome LM-SSP",
        type: "merged",
        detail: "PR #108 merged into LLM safety/security list.",
        url: "https://github.com/ThuCCSLab/Awesome-LM-SSP/pull/108",
      },
      {
        name: "OWASP LLM Top 10",
        type: "open",
        detail: "PR #814 submitted. Detection mapping for ASI01-ASI10.",
        url: "https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/pull/814",
      },
      {
        name: "SAFE-MCP (OpenSSF)",
        type: "open",
        detail: "PR #187 submitted. 78/85 technique coverage mapping.",
      },
      {
        name: "Awesome LLM Security",
        type: "open",
        detail: "PR #117 submitted to curated security tools list.",
      },
      {
        name: "Awesome MCP Security",
        type: "open",
        detail: "PR #87 submitted to MCP security resource list.",
      },
      {
        name: "OpenClaw Registry",
        type: "open",
        detail: "PR #58172 submitted. Fixed and waiting review.",
      },
      {
        name: "Awesome LLM agent Security",
        type: "open",
        detail: "PR #6 submitted to LLM agent security tools list.",
      },
      {
        name: "Awesome Agentic Patterns",
        type: "open",
        detail: "PR #58 submitted. CI config issue on their end.",
      },
    ],

    owaspAgentic: "10/10",
    safeMcp: "78/85 (91.8%)",
    owaspAst10: "7/10",
  };
}
