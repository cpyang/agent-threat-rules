import { Reveal } from "@/components/Reveal";
import { loadSiteStats } from "@/lib/stats";
import { locales, t, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Integrate - ATR",
  description: "Four integration paths for ATR: TypeScript, Python, raw YAML, or SIEM queries.",
};

const PATHS = [
  {
    title: "TypeScript / Node.js",
    cmd: "npm install agent-threat-rules",
    code: `import { createEngine } from 'agent-threat-rules';

const engine = createEngine();
const verdict = engine.evaluate({
  type: 'llm_input',
  content: userMessage,
  timestamp: new Date().toISOString(),
});

if (verdict.outcome === 'deny') {
  // Block the request
}`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules#quick-start",
  },
  {
    title: "Python (pyATR)",
    cmd: "cd python && pip install -e .",
    code: `from atr import ATREngine

engine = ATREngine()
result = engine.evaluate(event={
    "type": "llm_input",
    "content": user_message,
})

if result.outcome == "deny":
    # Block the request`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/python",
  },
  {
    title: "Raw YAML (any language)",
    cmd: "git submodule add https://github.com/Agent-Threat-Rule/agent-threat-rules.git",
    code: `# Point your scanner at rules/ directory
# Each .yaml file follows ATR schema v1.0
# Parse with any YAML library
# Schema: spec/atr-schema.yaml

rules/
  prompt-injection/
  tool-poisoning/
  agent-manipulation/
  ... (9 categories)`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/ATR-FRAMEWORK-SPEC.md",
  },
  {
    title: "SIEM Integration",
    cmd: "atr convert splunk --output splunk-queries.txt",
    code: `# Convert ATR rules to SIEM query language
atr convert splunk    # Output SPL queries
atr convert elastic   # Output Elasticsearch Query DSL
atr convert sarif     # Output SARIF v2.1.0 for CI/CD`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules#siem-integration",
  },
];

export default async function IntegratePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const stats = loadSiteStats();

  return (
    <div className="pt-20 pb-16 px-6 max-w-[1120px] mx-auto">
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">{t(locale, "integrate.label")}</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {t(locale, "integrate.heading")}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base text-stone font-light mb-10">
          {t(locale, "integrate.ready", { count: String(stats.ruleCount) })}
        </p>
      </Reveal>

      <div className="space-y-8">
        {PATHS.map((path, i) => (
          <Reveal key={path.title} delay={0.1 * i}>
            <div className="border border-fog">
              <div className="flex items-center justify-between px-6 py-4 border-b border-fog bg-ash">
                <h2 className="font-display text-lg font-semibold">{path.title}</h2>
                <a href={path.doc} target="_blank" rel="noopener noreferrer" className="font-data text-xs text-blue hover:underline">
                  {locale === "zh" ? "文件" : "Docs"} &rarr;
                </a>
              </div>
              <div className="p-6">
                <div className="font-data text-sm text-stone bg-ash border border-fog px-4 py-3 mb-4">
                  $ <span className="text-ink">{path.cmd}</span>
                </div>
                <pre className="font-data text-sm text-graphite bg-ash border border-fog p-4 overflow-x-auto leading-relaxed">
                  {path.code}
                </pre>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Schema Stability & Upstream Guarantee */}
      <Reveal>
        <div className="mt-12 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.schema.title")}</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-graphite leading-relaxed mb-5">
              {locale === "zh"
                ? "如果你把 ATR 當作上游依賴，你需要確保格式不會壞掉。以下是我們的承諾："
                : "If you depend on ATR as upstream, you need to know the format won\u0027t break. Here\u0027s our commitment:"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="font-display text-sm font-semibold mb-1">ATR Schema v1.0 ({locale === "zh" ? "目前版本" : "current"})</div>
                  <p className="text-sm text-stone leading-[1.6]">
                    {locale === "zh"
                      ? "已發布且穩定。所有新增欄位皆為選填。現有欄位不會在主版本升級前被移除或重新命名。"
                      : "Published and stable. All new fields are optional additions. No existing field will be removed or renamed without a major version bump."}
                  </p>
                </div>
                <div>
                  <div className="font-display text-sm font-semibold mb-1">{locale === "zh" ? "向後相容" : "Backward Compatibility"}</div>
                  <p className="text-sm text-stone leading-[1.6]">
                    {locale === "zh"
                      ? "破壞性變更只會發生在主版本轉換時（v1 → v2）。我們提供遷移指南，並至少有 6 個月的重疊期同時支援兩個版本。"
                      : "Breaking changes only happen on major version transitions (v1 \u2192 v2). We provide migration guides and a minimum 6-month overlap period where both versions are supported."}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="font-display text-sm font-semibold mb-1">{locale === "zh" ? "更新頻率" : "Update Frequency"}</div>
                  <p className="text-sm text-stone leading-[1.6]">
                    {locale === "zh"
                      ? <>持續新增規則（活躍期平均每週 2-5 條）。每條規則在合併前都通過 CI 驗證 + precision 測試。訂閱{" "}<a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/releases" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">GitHub Releases</a>{" "}取得更新日誌。</>
                      : <>New rules are added continuously (avg 2-5 per week during active periods). Every rule passes CI validation + precision test before merge. Subscribe to{" "}<a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/releases" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">GitHub Releases</a>{" "}for changelogs.</>}
                  </p>
                </div>
                <div>
                  <div className="font-display text-sm font-semibold mb-1">{locale === "zh" ? "同步方式" : "Sync Methods"}</div>
                  <div className="font-data text-sm text-stone leading-[1.8]">
                    <span className="text-ink">git submodule</span> &mdash; {locale === "zh" ? "鎖定 tag，按你的節奏更新" : "pin to tag, update on your schedule"}<br />
                    <span className="text-ink">npm install</span> &mdash; {locale === "zh" ? "語意版本控制，lockfile 鎖定版本" : "semver, lockfile controls version"}<br />
                    <span className="text-ink">GitHub Action</span> &mdash; {locale === "zh" ? "CI 自動使用最新規則掃描" : "CI scans with latest rules automatically"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Why ATR vs Internal Rules */}
      <Reveal>
        <div className="mt-8 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.why.title")}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog">
              {[
                { label: locale === "zh" ? "覆蓋範圍" : "Coverage", atr: locale === "zh" ? `${stats.ruleCount} 條規則，${stats.cveCount} 個 CVE 對應，9 個威脅類別` : `${stats.ruleCount} rules, ${stats.cveCount} CVEs mapped, 9 threat categories`, own: locale === "zh" ? "需要自行建立規則庫" : "You build your own rule set" },
                { label: locale === "zh" ? "新攻擊反應" : "New attack response", atr: locale === "zh" ? "Threat Cloud 結晶，目標數小時內產出規則" : "Threat Cloud crystallization, targeting hours", own: locale === "zh" ? "取決於你團隊的頻寬" : "Depends on your team's bandwidth" },
                { label: locale === "zh" ? "繞過測試" : "Evasion testing", atr: locale === "zh" ? "64 種已記錄的繞過技術，每個 PR 都測試" : "64 documented evasion techniques, tested on every PR", own: locale === "zh" ? "需要額外投入時間建立" : "Requires dedicated effort to build" },
                { label: locale === "zh" ? "OWASP / MITRE 對應" : "OWASP / MITRE mapping", atr: locale === "zh" ? "內建。Agentic 10/10 + 每條規則對應 MITRE ATLAS" : "Pre-built. 10/10 Agentic + MITRE ATLAS per rule", own: locale === "zh" ? "數小時的手動對應工作" : "Hours of manual mapping work" },
                { label: locale === "zh" ? "維護成本" : "Maintenance", atr: locale === "zh" ? "社群維護。MIT 授權。零成本。" : "Community-maintained. MIT. Zero cost.", own: locale === "zh" ? "需要持續的人力投入" : "Requires ongoing engineering effort" },
                { label: locale === "zh" ? "生態系" : "Ecosystem", atr: locale === "zh" ? "Cisco 已整合，OWASP 和 OpenSSF PR 審查中" : "Cisco integrated, OWASP and OpenSSF PRs under review", own: locale === "zh" ? "獨立維護，無共享規則" : "Maintained independently, no shared rules" },
              ].map((row) => (
                <div key={row.label} className="bg-paper text-sm">
                  {/* Desktop: 3-column */}
                  <div className="hidden md:grid grid-cols-[140px_1fr_1fr]">
                    <div className="px-4 py-3 font-semibold text-ink border-r border-fog">{row.label}</div>
                    <div className="px-4 py-3 text-ink border-r border-fog">{row.atr}</div>
                    <div className="px-4 py-3 text-stone">{row.own}</div>
                  </div>
                  {/* Mobile: stacked */}
                  <div className="md:hidden p-4 space-y-2">
                    <div className="font-semibold text-ink">{row.label}</div>
                    <div className="text-ink"><span className="font-data text-xs text-blue mr-1">ATR</span>{row.atr}</div>
                    <div className="text-stone"><span className="font-data text-xs text-mist mr-1">{locale === "zh" ? "自建" : "DIY"}</span>{row.own}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-8 mt-3 text-xs font-data text-stone uppercase tracking-wider">
              <span>&nbsp;</span>
              <span className="ml-[140px] text-blue">ATR</span>
              <span className="ml-auto">{locale === "zh" ? "自建規則" : "Internal Rules"}</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* License */}
      <Reveal>
        <div className="mt-8 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.license.title")}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-display text-sm font-semibold mb-1">MIT License</div>
                <p className="text-stone leading-[1.6]">{locale === "zh" ? "可商用、修改、分發、再授權。無任何限制。" : "Use commercially, modify, distribute, sublicense. No restrictions."}</p>
              </div>
              <div>
                <div className="font-display text-sm font-semibold mb-1">{locale === "zh" ? "無 CLA" : "No CLA"}</div>
                <p className="text-stone leading-[1.6]">{locale === "zh" ? "無貢獻者授權協議。所有貢獻皆以 MIT 授權，屬於社群所有。" : "No Contributor License Agreement. Contributions are MIT-licensed and belong to the community."}</p>
              </div>
              <div>
                <div className="font-display text-sm font-semibold mb-1">{locale === "zh" ? "廠商中立" : "Vendor Neutral"}</div>
                <p className="text-stone leading-[1.6]">{locale === "zh" ? "ATR 不屬於任何公司。它是社群治理的開放標準。" : "ATR is not owned by any company. It is a community-governed open standard."}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Cisco Case Study */}
      <Reveal>
        <div className="mt-12 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.cisco.title")}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-data text-3xl font-bold text-ink mb-1">34</div>
              <div className="text-sm text-stone">{locale === "zh" ? "條 ATR 規則已合併" : "ATR rules merged"}</div>
            </div>
            <div>
              <div className="font-data text-3xl font-bold text-ink mb-1">1,272</div>
              <div className="text-sm text-stone">{locale === "zh" ? "行程式碼加入 Cisco AI Defense" : "lines added to Cisco AI Defense"}</div>
            </div>
            <div>
              <div className="font-data text-3xl font-bold text-ink mb-1">{locale === "zh" ? "3 天" : "3 days"}</div>
              <div className="text-sm text-stone">{locale === "zh" ? "從提交 PR 到合併" : "from PR submission to merge"}</div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <p className="text-sm text-graphite leading-relaxed mb-4">
              {locale === "zh"
                ? <>Cisco 的 DefenseClaw 團隊將 ATR 規則整合為上游依賴。他們的工程師提交了 PR #79，我們審查後 3 天內合併。隨後他們建置了 <span className="font-data">--rule-packs</span> CLI 功能（PR #80），專門將 ATR 作為第一級規則來源使用。</>
                : <>Cisco&apos;s DefenseClaw team integrated ATR rules as an upstream dependency. Their engineer submitted PR #79, we reviewed it, and it merged in 3 days. They then built a <span className="font-data">--rule-packs</span> CLI feature (PR #80) specifically to consume ATR as a first-class rule source.</>}
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/cisco-ai-defense/skill-scanner/pull/79" target="_blank" rel="noopener noreferrer" className="font-data text-sm text-blue hover:underline">
                PR #79: Rules integration &rarr;
              </a>
              <a href="https://github.com/cisco-ai-defense/skill-scanner/pull/80" target="_blank" rel="noopener noreferrer" className="font-data text-sm text-blue hover:underline">
                PR #80: Rule-packs CLI &rarr;
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
