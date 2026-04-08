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

      {/* Papers */}
      <Reveal>
        <div className="grid grid-cols-1 gap-px bg-fog mb-8 border border-fog">
          {/* Main paper */}
          <div className="bg-paper p-5 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-data text-xs bg-blue/10 text-blue px-2 py-0.5 rounded-sm">v4</span>
              <span className="font-data text-xs text-mist">April 2026 · 23 pages · 65 references</span>
            </div>
            <div className="font-display text-base font-semibold text-ink mb-1">
              {locale === "zh"
                ? "信任的崩塌：自主 AI Agent 時代的安全架構"
                : "The Collapse of Trust: Security Architecture for the Age of Autonomous AI Agents"}
            </div>
            <p className="text-sm text-stone mb-3">
              {locale === "zh"
                ? "108 條偵測規則、雙 benchmark（PINT 99.6% precision + SKILL.md 96.9% recall）、53K mega scan、Cisco 採用。ATR 標準的完整論述。"
                : "108 detection rules, dual benchmarks (PINT 99.6% precision + SKILL.md 96.9% recall), 53K mega scan, Cisco adoption. The complete ATR thesis."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://doi.org/10.5281/zenodo.19178002" target="_blank" rel="noopener noreferrer" className="font-data text-xs text-blue hover:underline">Zenodo DOI</a>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/paper/ATR-Paper-v4.pdf" target="_blank" rel="noopener noreferrer" className="font-data text-xs text-blue hover:underline">PDF (GitHub)</a>
              <span className="font-data text-xs text-stone">SSRN: 6457179</span>
            </div>
          </div>

          {/* Mega scan paper */}
          <div className="bg-paper p-5 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-data text-xs bg-critical/10 text-critical px-2 py-0.5 rounded-sm">{locale === "zh" ? "新" : "NEW"}</span>
              <span className="font-data text-xs text-mist">April 2026 · 10 pages · 25 references</span>
            </div>
            <div className="font-display text-base font-semibold text-ink mb-1">
              53,577 Skills, 946 Threats: The First Large-Scale Security Audit of the AI Agent Ecosystem
            </div>
            <p className="text-sm text-stone mb-3">
              {locale === "zh"
                ? "史上最大規模 AI agent 安全掃描。53,577 個 skill、946 個威脅、875 嚴重、0% 誤報。工具描述下毒佔偵測的 71%。"
                : "The largest AI agent security scan to date. 53,577 skills, 946 threats, 875 critical, 0% false positive. Tool description poisoning accounts for 71% of detections."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/paper/ATR-MegaScan-2026.pdf" target="_blank" rel="noopener noreferrer" className="font-data text-xs text-blue hover:underline">PDF (GitHub)</a>
            </div>
          </div>

          {/* MCP attack surface paper */}
          <div className="bg-paper p-5 md:p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-data text-xs bg-critical/10 text-critical px-2 py-0.5 rounded-sm">{locale === "zh" ? "新" : "NEW"}</span>
              <span className="font-data text-xs text-mist">April 2026 · 14 pages · 22 references</span>
            </div>
            <div className="font-display text-base font-semibold text-ink mb-1">
              30 CVEs in 60 Days: The Model Context Protocol Attack Surface
            </div>
            <p className="text-sm text-stone mb-3">
              {locale === "zh"
                ? "MCP 攻擊面實證分析。60 天 30 個 CVE、38% 零認證、7 類攻擊分類學、53K 生態系掃描。比 Docker 前兩年快 15 倍。"
                : "Empirical analysis of the MCP attack surface. 30 CVEs in 60 days, 38% zero authentication, 7-class attack taxonomy, 53K ecosystem scan. 15x faster than Docker's first two years."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/paper/MCP-Attack-Surface-2026.pdf" target="_blank" rel="noopener noreferrer" className="font-data text-xs text-blue hover:underline">PDF (GitHub)</a>
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
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-4">{t(locale, "research.pint")}</div>
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
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-4">{t(locale, "research.self")}</div>
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

      {/* SKILL.md Benchmark */}
      <Reveal>
        <h2 className="font-display text-2xl font-extrabold tracking-[-1px] mb-1 mt-10">
          {locale === "zh" ? "SKILL.md 偵測基準" : "SKILL.md Detection Benchmark"}
        </h2>
        <p className="text-sm text-stone mb-6">
          {locale === "zh"
            ? "使用 498 個真實世界的 OpenClaw SKILL.md 檔案測試（32 個惡意 + 466 個正常）。Layer A = 明確惡意指令，Layer C = 混淆/隱藏攻擊。"
            : "Tested against 498 real-world OpenClaw SKILL.md files (32 malicious + 466 benign). Layer A = explicit malicious instructions. Layer C = obfuscated / hidden attacks."}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mb-8">
          <div className="bg-paper p-6">
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-4">
              {locale === "zh" ? "整體表現" : "Overall Performance"}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.skillBenchRecall} suffix="%" /></div>
                <div className="text-xs text-stone">Recall</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.skillBenchPrecision} suffix="%" /></div>
                <div className="text-xs text-stone">Precision</div>
              </div>
              <div>
                <div className="font-data text-2xl font-bold text-ink"><CountUp target={stats.skillBenchF1} /></div>
                <div className="text-xs text-stone">F1</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-fog">
              <div>
                <div className="font-data text-lg font-bold text-green"><CountUp target={stats.skillBenchFpRate} suffix="%" /></div>
                <div className="text-xs text-stone">{locale === "zh" ? "誤報率" : "False positive rate"}</div>
              </div>
              <div>
                <div className="font-data text-lg font-bold text-ink">{stats.skillBenchSamples}</div>
                <div className="text-xs text-stone">{locale === "zh" ? "真實樣本" : "Real-world samples"}</div>
              </div>
            </div>
          </div>
          <div className="bg-paper p-6">
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-4">
              {locale === "zh" ? "按攻擊層分析" : "By Attack Layer"}
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-data text-sm font-semibold">Layer A</span>
                  <span className="font-data text-sm font-bold text-ink">100%</span>
                </div>
                <div className="text-xs text-stone">
                  {locale === "zh" ? "明確惡意指令 — 24/24 全部偵測" : "Explicit malicious instructions — 24/24 detected"}
                </div>
                <div className="mt-1.5 h-1.5 bg-fog"><div className="h-full bg-blue" style={{ width: "100%" }} /></div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-data text-sm font-semibold">Layer C</span>
                  <span className="font-data text-sm font-bold text-ink">87.5%</span>
                </div>
                <div className="text-xs text-stone">
                  {locale === "zh" ? "混淆/隱藏攻擊 — 7/8 偵測（1 個 rug-pull timebomb 未偵測）" : "Obfuscated attacks — 7/8 detected (1 rug-pull timebomb missed)"}
                </div>
                <div className="mt-1.5 h-1.5 bg-fog"><div className="h-full bg-blue" style={{ width: "87.5%" }} /></div>
              </div>
              <div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-data text-sm font-semibold">{locale === "zh" ? "正常樣本" : "Benign"}</span>
                  <span className="font-data text-sm font-bold text-green">0 FP</span>
                </div>
                <div className="text-xs text-stone">
                  {locale === "zh" ? "466 個正常 SKILL.md — 零誤報" : "466 benign SKILL.md files — zero false positives"}
                </div>
                <div className="mt-1.5 h-1.5 bg-fog"><div className="h-full bg-green" style={{ width: "100%" }} /></div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Ecosystem Scan Data */}
      <Reveal>
        <h2 className="font-display text-2xl font-extrabold tracking-[-1px] mb-1 mt-10">{t(locale, "research.scan")}</h2>
        <p className="text-sm text-stone mb-6">{t(locale, "research.scan.sub")}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mb-8">
          <div className="bg-paper p-6">
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">Mega Scan (OpenClaw + Skills.sh)</div>
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
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">ClawHub Registry Scan</div>
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
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/data/clawhub-scan/ecosystem-report.csv" target="_blank" rel="noopener noreferrer" className="font-data text-sm text-blue hover:underline">
            {t(locale, "research.download.csv")} &rarr;
          </a>
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/data/clawhub-scan/ecosystem-stats.json" target="_blank" rel="noopener noreferrer" className="font-data text-sm text-blue hover:underline">
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
              <p className="text-sm text-stone leading-[1.6]">{limitation.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <div className="mt-6">
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/LIMITATIONS.md" target="_blank" rel="noopener noreferrer" className="font-data text-sm text-blue hover:underline">
            {t(locale, "research.limits.full")} &rarr;
          </a>
        </div>
      </Reveal>
    </div>
  );
}
