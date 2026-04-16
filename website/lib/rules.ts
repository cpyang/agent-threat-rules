import { readFileSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
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
        const raw = yaml.load(content, { schema: yaml.CORE_SCHEMA }) as RawRule;

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

export interface DetectionCondition {
  field?: string;
  operator?: string;
  description?: string;
  value?: string;
}

export interface TestCase {
  input: string;
  expected?: string;
  description?: string;
  matched_condition?: string;
}

export interface EvasionTest {
  input: string;
  expected?: string;
  bypass_technique?: string;
  notes?: string;
}

function normalizeTestCase<T extends { input?: unknown }>(
  tc: T,
): Omit<T, "input"> & { input: string } {
  const { input, ...rest } = tc;
  if (typeof input === "string") {
    return { ...(rest as Omit<T, "input">), input };
  }
  if (input === undefined || input === null) {
    return { ...(rest as Omit<T, "input">), input: "" };
  }
  try {
    return {
      ...(rest as Omit<T, "input">),
      input: yaml.dump(input, { lineWidth: 100 }).trimEnd(),
    };
  } catch {
    return { ...(rest as Omit<T, "input">), input: String(input) };
  }
}

export interface RuleDetail extends RuleSummary {
  rawYaml: string;
  detectionConditions: DetectionCondition[];
  detectionCombinator?: string;
  falsePositives: string[];
  truePositives: TestCase[];
  trueNegatives: TestCase[];
  evasionTests: EvasionTest[];
  wildValidated?: string;
  wildSamples?: number;
  wildFpRate?: number;
  messageTemplate?: string;
  lastModified?: string;
}

interface RawRuleDetail {
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
    message_template?: string;
  };
  detection?: {
    conditions?: DetectionCondition[];
    condition?: string;
    false_positives?: string[];
  };
  test_cases?: {
    true_positives?: Array<Record<string, unknown>>;
    true_negatives?: Array<Record<string, unknown>>;
  };
  evasion_tests?: Array<Record<string, unknown>>;
  wild_validated?: string;
  wild_samples?: number;
  wild_fp_rate?: number;
}

function gitLastModified(filePath: string): string | undefined {
  try {
    const repoRoot = join(process.cwd(), "..");
    const iso = execSync(`git log -1 --format=%cs -- "${filePath}"`, {
      cwd: repoRoot,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return iso || undefined;
  } catch {
    return undefined;
  }
}

function findRuleFilePath(id: string): string | undefined {
  const rulesDir = join(process.cwd(), "..", "rules");
  function walk(dir: string): string | undefined {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else if (
        st.isFile() &&
        (extname(entry) === ".yaml" || extname(entry) === ".yml") &&
        entry.includes(id)
      ) {
        return full;
      }
    }
    return undefined;
  }
  return walk(rulesDir);
}

export function loadRuleDetail(id: string): RuleDetail | undefined {
  const filePath = findRuleFilePath(id);
  if (!filePath) return undefined;
  const rawYaml = readFileSync(filePath, "utf-8");
  let parsed: RawRuleDetail;
  try {
    parsed = yaml.load(rawYaml, { schema: yaml.CORE_SCHEMA }) as RawRuleDetail;
  } catch {
    return undefined;
  }
  if (!parsed?.id || !parsed?.title) return undefined;

  const repoRoot = join(process.cwd(), "..");
  const relFile = relative(repoRoot, filePath);

  return {
    id: parsed.id,
    title: parsed.title,
    severity: parsed.severity ?? "medium",
    category: parsed.tags?.category ?? "unknown",
    subcategory: parsed.tags?.subcategory,
    description: parsed.description ?? "",
    scanTarget: parsed.tags?.scan_target,
    cves: parsed.references?.cve ?? [],
    owaspAgentic: parsed.references?.owasp_agentic ?? [],
    owaspLlm: parsed.references?.owasp_llm ?? [],
    mitreAtlas: parsed.references?.mitre_atlas ?? [],
    author: parsed.author ?? "ATR Community",
    date: parsed.date ?? "",
    filePath: relFile,
    status: parsed.status,
    responseActions: parsed.response?.actions,
    detectionTier: parsed.detection_tier,
    confidence: parsed.tags?.confidence,
    rawYaml,
    detectionConditions: parsed.detection?.conditions ?? [],
    detectionCombinator: parsed.detection?.condition,
    falsePositives: parsed.detection?.false_positives ?? [],
    truePositives: (parsed.test_cases?.true_positives ?? []).map((tc) =>
      normalizeTestCase(tc as { input?: unknown }),
    ) as TestCase[],
    trueNegatives: (parsed.test_cases?.true_negatives ?? []).map((tc) =>
      normalizeTestCase(tc as { input?: unknown }),
    ) as TestCase[],
    evasionTests: (parsed.evasion_tests ?? []).map((tc) =>
      normalizeTestCase(tc as { input?: unknown }),
    ) as EvasionTest[],
    wildValidated: parsed.wild_validated,
    wildSamples: parsed.wild_samples,
    wildFpRate: parsed.wild_fp_rate,
    messageTemplate: parsed.response?.message_template,
    lastModified: gitLastModified(relFile),
  };
}
