import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import yaml from "js-yaml";

export interface RuleSummary {
  id: string;
  title: string;
  severity: string;
  category: string;
  subcategory?: string;
  description: string;
  scanTarget?: string;
  cves: string[];
  owaspAgentic: string[];
  owaspLlm: string[];
  mitreAtlas: string[];
  author: string;
  date: string;
  filePath: string;
  status?: string;
  responseActions?: string[];
  detectionTier?: string;
  confidence?: string;
}

interface RawRule {
  id?: string;
  title?: string;
  severity?: string;
  description?: string;
  author?: string;
  date?: string;
  status?: string;
  detection_tier?: string;
  tags?: {
    category?: string;
    subcategory?: string;
    scan_target?: string;
    confidence?: string;
  };
  references?: {
    cve?: string[];
    owasp_agentic?: string[];
    owasp_llm?: string[];
    mitre_atlas?: string[];
  };
  response?: {
    actions?: string[];
  };
}

function loadRulesRecursive(dir: string, rootDir: string): RuleSummary[] {
  const results: RuleSummary[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...loadRulesRecursive(fullPath, rootDir));
    } else if (stat.isFile() && (extname(entry) === ".yaml" || extname(entry) === ".yml")) {
      try {
        const content = readFileSync(fullPath, "utf-8");
        const raw = yaml.load(content) as RawRule;

        if (!raw?.id || !raw?.title) return results;

        results.push({
          id: raw.id,
          title: raw.title,
          severity: raw.severity ?? "medium",
          category: raw.tags?.category ?? "unknown",
          subcategory: raw.tags?.subcategory,
          description: raw.description ?? "",
          scanTarget: raw.tags?.scan_target,
          cves: raw.references?.cve ?? [],
          owaspAgentic: raw.references?.owasp_agentic ?? [],
          owaspLlm: raw.references?.owasp_llm ?? [],
          mitreAtlas: raw.references?.mitre_atlas ?? [],
          author: raw.author ?? "ATR Community",
          date: raw.date ?? "",
          filePath: relative(rootDir, fullPath),
          status: raw.status,
          responseActions: raw.response?.actions,
          detectionTier: raw.detection_tier,
          confidence: raw.tags?.confidence,
        });
      } catch {
        // Skip malformed files
      }
    }
  }

  return results;
}

export function loadAllRules(): RuleSummary[] {
  const rulesDir = join(process.cwd(), "..", "rules");
  const rules = loadRulesRecursive(rulesDir, join(process.cwd(), ".."));
  return rules.sort((a, b) => a.id.localeCompare(b.id));
}

export function findRuleById(rules: RuleSummary[], id: string): RuleSummary | undefined {
  return rules.find((r) => r.id === id);
}

export function getRelatedRules(rules: RuleSummary[], rule: RuleSummary, limit = 5): RuleSummary[] {
  return rules
    .filter((r) => r.id !== rule.id && r.category === rule.category)
    .slice(0, limit);
}

export function getCategories(rules: RuleSummary[]): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rules) {
    map.set(r.category, (map.get(r.category) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
