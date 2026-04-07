import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { StatsHydrator } from "@/components/StatsHydrator";
import { loadSiteStats } from "@/lib/stats";
import { locales, t, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Research - ATR",
  description: "ATR research: academic paper, benchmark results, limitations, and ecosystem scan data.",
};

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const stats = loadSiteStats();

  return (
    <div className="pt-20 pb-16 px-6 max-w-[1120px] mx-auto">
      <StatsHydrator />
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">{t(locale, "research.label")}</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {t(locale, "research.heading")}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base text-stone font-light mb-10">
          {t(locale, "research.sub")}
        </p>
      </Reveal>

      {/* Paper */}
      <Reveal>
        <div className="border border-fog mb-8">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "research.paper")}</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-graphite leading-relaxed mb-4">
              Pan, Y. (2026). <em>Agent Threat Rules: A Community-Driven Detection Standard for AI Agent Security Threats.</em>
            </p>
            <div className="font-data text-sm text-ink bg-ash border border-fog px-4 py-3 mb-4">
              DOI: <a href="https://doi.org/10.5281/zenodo.19178002" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">10.5281/zenodo.19178002</a>
            </div>
            <div className="flex gap-4">
              <a href="https://doi.org/10.5281/zenodo.19178002" target="_blank" rel="noopener noreferrer" className="font-data text-[13px] text-blue hover:underline">
                Zenodo ({locale === "zh" ? "已發布" : "published"}) &rarr;
              </a>
              <span className="font-data text-[13px] text-stone">SSRN: Abstract ID 6457179 ({locale === "zh" ? "審查中" : "pending review"})</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Benchmarks */}
      <Reveal>
        <h2 className="font-display text-2xl font-extrabold tracking-[-1px] mb-1 mt-10">{t(locale, "research.benchmarks")}</h2>
        <p className="text-sm text-stone mb-6">{t(locale, "research.benchmarks.sub")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mb-8">
          {/* PINT */}
          <div className="bg-paper p-6">
            <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-4">{t(locale, "research.pint")}</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.pintPrecision} suffix="%" liveKey="pintPrecision" /></div>
                <div className="text-xs text-stone">{t(locale, "research.precision")}</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.pintRecall} suffix="%" liveKey="pintRecall" /></div>
                <div className="text-xs text-stone">{t(locale, "research.recall")}</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.pintF1} liveKey="pintF1" /></div>
                <div className="text-xs text-stone">F1</div>
              </div>
            </div>
            <div className="font-data text-xs text-stone mt-3">{stats.pintSamples} {locale === "zh" ? "個樣本" : "samples"}</div>
          </div>
          {/* Self-test */}
          <div className="bg-paper p-6">
            <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-4">{t(locale, "research.self")}</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.selfTestPrecision} suffix="%" liveKey="selfTestPrecision" /></div>
                <div className="text-xs text-stone">Precision</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.selfTestRecall} suffix="%" liveKey="selfTestRecall" /></div>
                <div className="text-xs text-stone">Recall</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold text-ink">{stats.selfTestSamples}</div>
                <div className="text-xs text-stone">{locale === "zh" ? "樣本數" : "Samples"}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-sm text-stone mb-8">
          {t(locale, "research.gap_note", { precision: String(stats.pintPrecision), recall: String(stats.pintRecall) })}
        </p>
      </Reveal>

      {/* Ecosystem Scan Data */}
      <Reveal>
        <h2 className="font-display text-2xl font-extrabold tracking-[-1px] mb-1 mt-10">{t(locale, "research.scan")}</h2>
        <p className="text-sm text-stone mb-6">{t(locale, "research.scan.sub")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mb-8">
          <div className="bg-paper p-6">
            <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">Mega Scan (OpenClaw + Skills.sh)</div>
            <div className="font-data text-3xl font-bold text-ink mb-1"><CountUp target={stats.megaScanTotal} useComma liveKey="megaScanTotal" /></div>
            <div className="text-sm text-stone mb-3">{locale === "zh" ? "個 skill 已掃描" : "skills scanned"}</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="font-data text-lg font-bold text-critical"><CountUp target={stats.megaScanCritical} useComma liveKey="megaScanCritical" /></div>
                <div className="text-xs text-stone">CRITICAL</div>
              </div>
              <div>
                <div className="font-data text-lg font-bold text-high"><CountUp target={stats.megaScanHigh} useComma liveKey="megaScanHigh" /></div>
                <div className="text-xs text-stone">HIGH</div>
              </div>
              <div>
                <div className="font-data text-lg font-bold text-ink"><CountUp target={stats.megaScanFlagged} useComma liveKey="megaScanFlagged" /></div>
                <div className="text-xs text-stone">{locale === "zh" ? "總標記數" : "Total flagged"}</div>
              </div>
            </div>
          </div>
          <div className="bg-paper p-6">
            <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">ClawHub Registry Scan</div>
            <div className="font-data text-3xl font-bold text-ink mb-1"><CountUp target={stats.clawHubCrawled} useComma /></div>
            <div className="text-sm text-stone mb-3">{locale === "zh" ? "個 skill 已爬取" : "skills crawled"}</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="font-data text-lg font-bold text-critical"><CountUp target={stats.clawHubCritical} /></div>
                <div className="text-xs text-stone">CRITICAL</div>
              </div>
              <div>
                <div className="font-data text-lg font-bold text-high"><CountUp target={stats.clawHubHigh} useComma /></div>
                <div className="text-xs text-stone">HIGH</div>
              </div>
              <div>
                <div className="font-data text-lg font-bold text-ink"><CountUp target={stats.clawHubScanned} useComma /></div>
                <div className="text-xs text-stone">{locale === "zh" ? "含原始碼" : "With source code"}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="flex gap-4 mb-8">
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/data/clawhub-scan/ecosystem-report.csv" target="_blank" rel="noopener noreferrer" className="font-data text-[13px] text-blue hover:underline">
            {t(locale, "research.download.csv")} &rarr;
          </a>
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/data/clawhub-scan/ecosystem-stats.json" target="_blank" rel="noopener noreferrer" className="font-data text-[13px] text-blue hover:underline">
            {t(locale, "research.download.json")} &rarr;
          </a>
        </div>
      </Reveal>

      {/* Limitations */}
      <Reveal>
        <h2 className="font-display text-2xl font-extrabold tracking-[-1px] mb-1 mt-10">{t(locale, "research.limits")}</h2>
        <p className="text-sm text-stone mb-6">{t(locale, "research.limits.sub")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="space-y-4">
          {(["paraphrase", "multilang", "context", "protocol", "multiturn", "novel"] as const).map((key) => (
            { title: t(locale, `research.limit.${key}`), desc: t(locale, `research.limit.${key}.desc`) }
          )).map((limitation) => (
            <div key={limitation.title} className="border-b border-fog pb-4">
              <div className="font-display text-sm font-semibold mb-1">{limitation.title}</div>
              <p className="text-[13px] text-stone leading-[1.6]">{limitation.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <div className="mt-6">
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/LIMITATIONS.md" target="_blank" rel="noopener noreferrer" className="font-data text-[13px] text-blue hover:underline">
            {t(locale, "research.limits.full")} &rarr;
          </a>
        </div>
      </Reveal>
    </div>
  );
}
