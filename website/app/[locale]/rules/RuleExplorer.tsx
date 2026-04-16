"use client";

import { useState, useMemo } from "react";
import type { RuleSummary } from "@/lib/rules";
import { categoryDisplayName } from "@/lib/categories";
import { t, type Locale } from "@/lib/i18n";

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-critical/10 text-critical",
  high: "bg-high/10 text-high",
  medium: "bg-medium/10 text-medium",
  low: "bg-blue/10 text-blue",
  informational: "bg-stone/10 text-stone",
};

interface Props {
  rules: RuleSummary[];
  categories: { name: string; count: number }[];
  locale: Locale;
}

export function RuleExplorer({ rules, categories, locale }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = rules;

    if (selectedCategory) {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (selectedSeverity) {
      result = result.filter((r) => r.severity === selectedSeverity);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.cves.some((c) => c.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 5) - (SEVERITY_ORDER[b.severity] ?? 5));
  }, [rules, search, selectedCategory, selectedSeverity]);

  const severities = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rules) {
      map.set(r.severity, (map.get(r.severity) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => (SEVERITY_ORDER[a.name] ?? 5) - (SEVERITY_ORDER[b.name] ?? 5));
  }, [rules]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder={t(locale, "rules.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] bg-ash border border-fog px-4 py-2.5 font-data text-sm text-ink placeholder:text-mist focus:outline-none focus:border-stone"
        />
        <select
          value={selectedCategory ?? ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="bg-ash border border-fog px-4 py-2.5 text-sm text-stone font-data appearance-none cursor-pointer focus:outline-none"
        >
          <option value="">{t(locale, "rules.all_categories")}</option>
          {categories.map((c) => (
            <option key={c.name} value={c.name}>
              {categoryDisplayName(c.name, locale)} ({c.count})
            </option>
          ))}
        </select>
        <select
          value={selectedSeverity ?? ""}
          onChange={(e) => setSelectedSeverity(e.target.value || null)}
          className="bg-ash border border-fog px-4 py-2.5 text-sm text-stone font-data appearance-none cursor-pointer focus:outline-none"
        >
          <option value="">{t(locale, "rules.all_severities")}</option>
          {severities.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="font-data text-xs text-stone mb-4 tracking-wide">
        {t(locale, "rules.showing", { filtered: String(filtered.length), total: String(rules.length) })}
        {selectedCategory && <span className="ml-2">| {locale === "zh" ? "類別" : "category"}: {categoryDisplayName(selectedCategory, locale)}</span>}
        {selectedSeverity && <span className="ml-2">| severity: {selectedSeverity}</span>}
        {search && <span className="ml-2">| search: &quot;{search}&quot;</span>}
        {(selectedCategory || selectedSeverity || search) && (
          <button
            onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedSeverity(null); }}
            className="ml-3 text-blue hover:underline"
          >
            {t(locale, "rules.clear")}
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-stone text-base">{t(locale, "rules.no_match")}</p>
          <button
            onClick={() => { setSearch(""); setSelectedCategory(null); setSelectedSeverity(null); }}
            className="mt-3 text-blue text-sm hover:underline"
          >
            {t(locale, "rules.clear")}
          </button>
        </div>
      ) : (
        <div className="border border-fog">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[140px_1fr_160px_100px_140px] border-b border-fog bg-ash">
            <div className="px-4 py-3 font-data text-xs text-stone uppercase tracking-wider font-semibold">{t(locale, "rules.col.id")}</div>
            <div className="px-4 py-3 font-data text-xs text-stone uppercase tracking-wider font-semibold">{t(locale, "rules.col.name")}</div>
            <div className="px-4 py-3 font-data text-xs text-stone uppercase tracking-wider font-semibold">{t(locale, "rules.col.category")}</div>
            <div className="px-4 py-3 font-data text-xs text-stone uppercase tracking-wider font-semibold">{t(locale, "rules.col.severity")}</div>
            <div className="px-4 py-3 font-data text-xs text-stone uppercase tracking-wider font-semibold">{t(locale, "rules.col.cves")}</div>
          </div>

          {/* Rows */}
          {filtered.map((rule) => (
            <div key={rule.id}>
              <button
                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-[140px_1fr_160px_100px_140px] border-b border-fog hover:bg-ash/60 transition-colors"
              >
                <div className="px-4 py-3 font-data text-sm text-blue">{rule.id}</div>
                <div className="px-4 py-3 text-sm text-ink">{rule.title}</div>
                <div className="px-4 py-3 font-data text-xs text-stone">{categoryDisplayName(rule.category, locale)}</div>
                <div className="px-4 py-3">
                  <span className={`font-data text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-sm ${SEVERITY_COLORS[rule.severity] ?? "bg-stone/10 text-stone"}`}>
                    {rule.severity}
                  </span>
                </div>
                <div className="px-4 py-3 font-data text-xs text-stone">
                  {rule.cves.length > 0 ? rule.cves.join(", ") : "--"}
                </div>
              </button>

              {/* Expanded detail panel */}
              {expandedRule === rule.id && (
                <div className="bg-ash border-b border-fog px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="font-data text-xs text-stone uppercase tracking-wider mb-1">{t(locale, "rules.col.desc")}</div>
                      <p className="text-sm text-graphite leading-relaxed">{rule.description}</p>
                    </div>
                    <div className="space-y-4">
                      {rule.owaspAgentic.length > 0 && (
                        <div>
                          <div className="font-data text-xs text-stone uppercase tracking-wider mb-1">OWASP Agentic</div>
                          <div className="font-data text-xs text-ink">{rule.owaspAgentic.join(", ")}</div>
                        </div>
                      )}
                      {rule.mitreAtlas.length > 0 && (
                        <div>
                          <div className="font-data text-xs text-stone uppercase tracking-wider mb-1">MITRE ATLAS</div>
                          <div className="font-data text-xs text-ink">{rule.mitreAtlas.join(", ")}</div>
                        </div>
                      )}
                      {rule.cves.length > 0 && (
                        <div>
                          <div className="font-data text-xs text-stone uppercase tracking-wider mb-1">CVEs</div>
                          <div className="font-data text-xs text-ink">{rule.cves.join(", ")}</div>
                        </div>
                      )}
                      <div>
                        <a
                          href={`https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/${rule.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-data text-xs text-blue hover:underline"
                        >
                          {t(locale, "rules.view_yaml")} &rarr;
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
