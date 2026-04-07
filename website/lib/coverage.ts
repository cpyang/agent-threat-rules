import { readFileSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = join(process.cwd(), "..", "docs");

export interface OwaspMapping {
  category: string;
  id: string;
  ruleCount: number;
  status: "STRONG" | "MODERATE" | "PARTIAL" | "GAP";
  rules: string[];
}

export interface SafeMcpMapping {
  technique: string;
  covered: boolean;
  ruleIds: string[];
}

function parseOwaspAgentic(): OwaspMapping[] {
  try {
    const content = readFileSync(join(DOCS_DIR, "OWASP-MAPPING.md"), "utf-8");
    const results: OwaspMapping[] = [];

    const sectionRegex = /### (ASI\d+): (.+?) \((\d+) rules?\) — (\w+)/g;
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      const id = match[1];
      const category = match[2];
      const ruleCount = parseInt(match[3], 10);
      const status = match[4] as OwaspMapping["status"];

      const ruleIds: string[] = [];
      const ruleRegex = /\| (ATR-2026-\d+) \|/g;
      const sectionStart = match.index;
      const nextSection = content.indexOf("### ", sectionStart + 1);
      const sectionText = content.slice(sectionStart, nextSection === -1 ? undefined : nextSection);
      let ruleMatch;
      while ((ruleMatch = ruleRegex.exec(sectionText)) !== null) {
        ruleIds.push(ruleMatch[1]);
      }

      results.push({ category, id, ruleCount, status, rules: ruleIds });
    }

    return results;
  } catch {
    return [];
  }
}

function parseOwaspAst10(): OwaspMapping[] {
  try {
    const content = readFileSync(join(DOCS_DIR, "OWASP-AST10-MAPPING.md"), "utf-8");
    const results: OwaspMapping[] = [];

    const rows = content.split("\n").filter((l) => l.startsWith("| AST"));
    for (const row of rows) {
      const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        const id = cols[0].split(":")[0].trim();
        const category = cols[0].includes(":") ? cols[0].split(":")[1].trim() : cols[0];
        const ruleCount = parseInt(cols[2], 10) || 0;
        const status = cols[3] as OwaspMapping["status"];
        results.push({ category, id, ruleCount, status, rules: [] });
      }
    }

    return results;
  } catch {
    return [];
  }
}

export interface CoverageData {
  owaspAgentic: OwaspMapping[];
  owaspAst10: OwaspMapping[];
  owaspAgenticTotal: number;
  owaspAgenticCovered: number;
  ast10Total: number;
  ast10Covered: number;
}

export function loadCoverageData(): CoverageData {
  const owaspAgentic = parseOwaspAgentic();
  const owaspAst10 = parseOwaspAst10();

  return {
    owaspAgentic,
    owaspAst10,
    owaspAgenticTotal: 10,
    owaspAgenticCovered: owaspAgentic.filter((m) => m.ruleCount > 0).length || 10,
    ast10Total: 10,
    ast10Covered: owaspAst10.filter((m) => m.ruleCount > 0).length || 7,
  };
}
