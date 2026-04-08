import { loadAllRules, findRuleById, getRelatedRules } from "@/lib/rules";
import { locales, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-critical/10 text-critical",
  high: "bg-high/10 text-high",
  medium: "bg-medium/10 text-medium",
  low: "bg-green/10 text-green",
  informational: "bg-blue/10 text-blue",
};

export function generateStaticParams() {
  const rules = loadAllRules();
  const params: { locale: string; ruleId: string }[] = [];
  for (const locale of locales) {
    for (const rule of rules) {
      params.push({ locale, ruleId: rule.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; ruleId: string }>;
}): Promise<Metadata> {
  const { locale, ruleId } = await params;
  const rules = loadAllRules();
  const rule = findRuleById(rules, ruleId);

  if (!rule) return { title: "Rule Not Found" };

  const categoryDisplay = rule.category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const zh = locale === "zh";

  return {
    title: `${rule.id}: ${rule.title}`,
    description: rule.description.slice(0, 160),
    alternates: {
      canonical: `https://agentthreatrule.org/${locale}/rules/${rule.id}`,
      languages: {
        en: `https://agentthreatrule.org/en/rules/${rule.id}`,
        zh: `https://agentthreatrule.org/zh/rules/${rule.id}`,
      },
    },
    openGraph: {
      title: `${rule.id}: ${rule.title} | ATR`,
      description: `${rule.severity.toUpperCase()} severity ${categoryDisplay} detection rule. ${rule.description.slice(0, 120)}`,
    },
    other: {
      "article:section": categoryDisplay,
      "article:tag": [rule.category, rule.severity, ...rule.cves].join(","),
    },
  };
}

export default async function RuleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; ruleId: string }>;
}) {
  const { locale: rawLocale, ruleId } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const zh = locale === "zh";
  const prefix = `/${locale}`;
  const rules = loadAllRules();
  const rule = findRuleById(rules, ruleId);

  if (!rule) notFound();

  const related = getRelatedRules(rules, rule);
  const categoryDisplay = rule.category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const severityClass = SEVERITY_COLORS[rule.severity] ?? "bg-ash text-stone";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    name: `${rule.id}: ${rule.title}`,
    description: rule.description,
    author: { "@type": "Organization", name: "ATR Community" },
    datePublished: rule.date ? rule.date.replace(/\//g, "-") : undefined,
    url: `https://agentthreatrule.org/${locale}/rules/${rule.id}`,
    isPartOf: {
      "@type": "WebSite",
      name: "ATR - Agent Threat Rules",
      url: "https://agentthreatrule.org",
    },
    keywords: [rule.category, rule.severity, "AI agent security", "detection rule", ...rule.cves],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pt-20 pb-16 px-5 md:px-6 max-w-[860px] mx-auto">
        {/* Breadcrumb */}
        <nav className="font-data text-xs text-stone mb-6 flex items-center gap-2">
          <Link href={prefix} className="hover:text-ink transition-colors">ATR</Link>
          <span className="text-fog">/</span>
          <Link href={`${prefix}/rules`} className="hover:text-ink transition-colors">
            {zh ? "規則" : "Rules"}
          </Link>
          <span className="text-fog">/</span>
          <span className="text-ink">{rule.id}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-data text-xs text-mist">{rule.id}</span>
            <span className={`font-data text-xs px-2 py-0.5 rounded-sm uppercase ${severityClass}`}>
              {rule.severity}
            </span>
            <span className="font-data text-xs text-stone bg-ash px-2 py-0.5 rounded-sm">
              {categoryDisplay}
            </span>
            {rule.status && (
              <span className="font-data text-xs text-mist bg-ash px-2 py-0.5 rounded-sm">
                {rule.status}
              </span>
            )}
          </div>
          <h1 className="font-display text-[clamp(22px,3.5vw,36px)] font-extrabold tracking-[-1px] leading-[1.3] text-ink">
            {rule.title}
          </h1>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-sm md:text-base text-graphite leading-[1.8]">
            {rule.description}
          </p>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-fog mb-8">
          <div className="bg-paper p-4">
            <div className="font-data text-xs text-stone mb-1">{zh ? "嚴重度" : "Severity"}</div>
            <div className={`font-data text-sm font-semibold uppercase ${rule.severity === "critical" ? "text-critical" : rule.severity === "high" ? "text-high" : "text-medium"}`}>
              {rule.severity}
            </div>
          </div>
          <div className="bg-paper p-4">
            <div className="font-data text-xs text-stone mb-1">{zh ? "類別" : "Category"}</div>
            <div className="font-data text-sm text-ink">{categoryDisplay}</div>
          </div>
          <div className="bg-paper p-4">
            <div className="font-data text-xs text-stone mb-1">{zh ? "掃描目標" : "Scan Target"}</div>
            <div className="font-data text-sm text-ink">{rule.scanTarget ?? "mcp"}</div>
          </div>
          <div className="bg-paper p-4">
            <div className="font-data text-xs text-stone mb-1">{zh ? "作者" : "Author"}</div>
            <div className="font-data text-sm text-ink">{rule.author}</div>
          </div>
        </div>

        {/* Response actions */}
        {rule.responseActions && rule.responseActions.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-sm font-semibold text-ink mb-3">
              {zh ? "建議回應" : "Response Actions"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {rule.responseActions.map((action) => (
                <span key={action} className="font-data text-xs bg-ash text-ink px-3 py-1.5 rounded-sm">
                  {action.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {(rule.cves.length > 0 || rule.owaspAgentic.length > 0 || rule.owaspLlm.length > 0 || rule.mitreAtlas.length > 0) && (
          <div className="mb-8">
            <h2 className="font-display text-sm font-semibold text-ink mb-3">
              {zh ? "參考資料" : "References"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog">
              {rule.cves.length > 0 && (
                <div className="bg-paper p-4">
                  <div className="font-data text-xs text-stone mb-2">CVE</div>
                  <div className="flex flex-wrap gap-2">
                    {rule.cves.map((cve) => (
                      <a
                        key={cve}
                        href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-data text-xs text-blue hover:underline"
                      >
                        {cve}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {rule.owaspAgentic.length > 0 && (
                <div className="bg-paper p-4">
                  <div className="font-data text-xs text-stone mb-2">OWASP Agentic</div>
                  <div className="flex flex-col gap-1">
                    {rule.owaspAgentic.map((ref) => (
                      <span key={ref} className="font-data text-xs text-ink">{ref}</span>
                    ))}
                  </div>
                </div>
              )}
              {rule.owaspLlm.length > 0 && (
                <div className="bg-paper p-4">
                  <div className="font-data text-xs text-stone mb-2">OWASP LLM</div>
                  <div className="flex flex-col gap-1">
                    {rule.owaspLlm.map((ref) => (
                      <span key={ref} className="font-data text-xs text-ink">{ref}</span>
                    ))}
                  </div>
                </div>
              )}
              {rule.mitreAtlas.length > 0 && (
                <div className="bg-paper p-4">
                  <div className="font-data text-xs text-stone mb-2">MITRE ATLAS</div>
                  <div className="flex flex-col gap-1">
                    {rule.mitreAtlas.map((ref) => (
                      <span key={ref} className="font-data text-xs text-ink">{ref}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Source link */}
        <div className="mb-10">
          <a
            href={`https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/${rule.filePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-data text-xs text-blue hover:underline"
          >
            {zh ? "在 GitHub 上查看完整 YAML →" : "View full YAML on GitHub →"}
          </a>
        </div>

        {/* Related rules */}
        {related.length > 0 && (
          <div className="border-t border-fog pt-8">
            <h2 className="font-display text-sm font-semibold text-ink mb-4">
              {zh ? `更多 ${categoryDisplay} 規則` : `More ${categoryDisplay} Rules`}
            </h2>
            <div className="grid grid-cols-1 gap-px bg-fog">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`${prefix}/rules/${r.id}`}
                  className="bg-paper p-4 hover:bg-ash/50 transition-colors flex items-center gap-4"
                >
                  <span className="font-data text-xs text-mist shrink-0 w-28">{r.id}</span>
                  <span className={`font-data text-xs px-1.5 py-0.5 rounded-sm uppercase shrink-0 ${SEVERITY_COLORS[r.severity] ?? "bg-ash text-stone"}`}>
                    {r.severity}
                  </span>
                  <span className="text-sm text-ink truncate">{r.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
