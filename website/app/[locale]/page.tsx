import { HeroEntrance } from "@/components/HeroEntrance";
import { CountUp } from "@/components/CountUp";
import { SpeedLines } from "@/components/SpeedLines";
import { Reveal } from "@/components/Reveal";
import { loadSiteStats } from "@/lib/stats";
import { getCategories, loadAllRules } from "@/lib/rules";
import { locales, type Locale } from "@/lib/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const ECOSYSTEM_MERGES = [
  {
    name: "Cisco AI Defense",
    en: "34 rules merged as official community rule pack. Cisco even added --rule-packs CLI support specifically to consume ATR.",
    zh: "34 條規則作為官方社群規則包合併。Cisco 甚至為了消費 ATR 專門新增了 --rule-packs CLI。",
    url: "https://github.com/cisco/ai-defense/pull/79",
  },
  {
    name: "OWASP Top 10 for LLM Applications",
    en: "Official detection rules merged (PR #14). Now part of the global LLM security standard.",
    zh: "官方偵測規則已合併（PR #14）。現在是全球 LLM 安全標準的一部分。",
    url: "https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/pull/14",
  },
  {
    name: "SAFE-MCP (OpenSSF)",
    en: "Covers 78 of 85 techniques. PR submitted on the day of the $12.5M announcement.",
    zh: "覆蓋 85 項技術中的 78 項。PR 在 $12.5M 公告當天提交。",
  },
  {
    name: "awesome-mcp-servers",
    en: "Featured in the official Security section.",
    zh: "被列入官方 Security 分類。",
  },
];

const CATEGORIES_DISPLAY = [
  "Tool Poisoning",
  "Prompt Injection",
  "Multi-Agent Attacks",
  "Data Exfiltration",
  "Credential Theft",
  "Reverse Shells in Responses",
  "Cloud Metadata Leakage",
  "Skill Hijacking",
  "Supply Chain Attacks",
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const prefix = `/${locale}`;
  const stats = loadSiteStats();
  const rules = loadAllRules();
  const categories = getCategories(rules);
  const zh = locale === "zh";

  return (
    <>
      {/* Hero */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 relative pt-20">
        <HeroEntrance delay={0.3}>
          <div className="font-data text-xs text-stone tracking-[3px] uppercase mb-6">ATR — Agent Threat Rules</div>
        </HeroEntrance>

        <HeroEntrance delay={0.5}>
          <h1 className="font-display text-[clamp(32px,5vw,64px)] font-black leading-[1.1] tracking-[-2px] max-w-[800px] mb-6">
            {zh
              ? "AI Agent 生態系的可消費偵測標準"
              : "The consumable detection standard for AI Agent ecosystems"}
          </h1>
        </HeroEntrance>

        <HeroEntrance delay={0.8}>
          <div className="mb-8">
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "已合併至" : "Already merged into"}:
            </div>
            <div className="flex flex-col gap-1 text-sm text-graphite">
              <span>Cisco AI Defense <span className="text-stone">(official rule pack + --rule-packs CLI)</span></span>
              <span>OWASP Top 10 for LLM Applications <span className="text-stone">(PR #14)</span></span>
            </div>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.0}>
          <p className="text-base text-stone font-light max-w-[520px] mb-8">
            {zh
              ? "生態系實際在用的規則 — 不只是另一個安全工具。"
              : "Rules that ecosystems actually use — not just another security tool."}
          </p>
        </HeroEntrance>

        <HeroEntrance delay={1.2}>
          <div className="flex gap-3 justify-center flex-wrap">
            <div className="font-data text-sm text-stone bg-ash border border-fog px-6 py-3">
              $ <span className="text-ink">npm install agent-threat-rules</span>
            </div>
            <Link href={`${prefix}/integrate`} className="text-ink px-6 py-3 text-sm font-medium border border-fog hover:border-stone transition-colors">
              {zh ? "查看所有整合 →" : "View all merges →"}
            </Link>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.4} className="absolute bottom-8">
          <div className="flex flex-col items-center gap-2">
            <span className="font-data text-[10px] text-mist tracking-[3px] uppercase">scroll</span>
            <div className="w-px h-6 bg-fog relative overflow-hidden">
              <div className="absolute left-0 w-px h-6 bg-stone" style={{ animation: "scrollDown 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* Ecosystems Already Consuming ATR */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "已在消費 ATR 的生態系" : "Ecosystems Already Consuming ATR"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-2 max-w-[700px]">
            {zh
              ? "我們不賣安全產品。我們打造生態系選擇消費的標準。"
              : "We don\u0027t sell security products. We build the standard that ecosystems choose to consume."}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mt-10">
            {ECOSYSTEM_MERGES.map((eco) => (
              <div key={eco.name} className="bg-paper p-6">
                <div className="font-display text-base font-semibold mb-2">{eco.name}</div>
                <p className="text-[13px] text-stone leading-[1.6] mb-2">{zh ? eco.zh : eco.en}</p>
                {eco.url && (
                  <a href={eco.url} target="_blank" rel="noopener noreferrer" className="font-data text-[12px] text-blue hover:underline">
                    {zh ? "查看 PR →" : "View PR →"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <SpeedLines />

      {/* What ATR Detects */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "ATR 偵測什麼" : "What ATR Detects"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-2">
            {zh
              ? `${categories.length} 種核心攻擊類別，為任何 MCP 相容系統設計：`
              : `${categories.length} core attack categories designed to be consumed by any MCP-compatible system:`}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-fog mt-8">
            {CATEGORIES_DISPLAY.map((cat) => (
              <Link key={cat} href={`${prefix}/rules`} className="bg-paper p-5 hover:bg-ash transition-colors">
                <span className="font-display text-[15px] font-semibold">{cat}</span>
              </Link>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-6 text-sm text-stone">
            {zh
              ? "所有規則都是 MIT 授權的 YAML — 複製、消費、擴充。"
              : "All rules are MIT-licensed YAML — copy, consume, extend."}
          </p>
        </Reveal>
      </section>

      <SpeedLines />

      {/* Why Ecosystems Choose ATR */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)] bg-ash">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "為什麼生態系選擇 ATR" : "Why Ecosystems Choose ATR"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-3 max-w-[700px]">
            {zh
              ? "生態系不想永遠維護自己的規則集。他們要一個高精度、社群驅動、廠商中立的標準，可以直接消費。"
              : "Ecosystems don\u0027t want to maintain their own rule sets forever. They want a high-precision, community-driven, vendor-neutral standard they can consume directly."}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper mt-8">
            <div className="bg-ash p-6">
              <div className="font-data text-[clamp(28px,3vw,40px)] font-bold text-ink">
                <CountUp target={stats.pintPrecision} suffix="%" />
              </div>
              <div className="text-xs text-stone mt-1">{zh ? "precision（公開對抗 benchmark）" : "precision (public adversarial benchmark)"}</div>
            </div>
            <div className="bg-ash p-6">
              <div className="font-data text-[clamp(28px,3vw,40px)] font-bold text-ink">&lt;50ms</div>
              <div className="text-xs text-stone mt-1">YAML + regex {zh ? "掃描速度" : "scanning"}</div>
            </div>
            <div className="bg-ash p-6">
              <div className="font-data text-[clamp(28px,3vw,40px)] font-bold text-ink">0</div>
              <div className="text-xs text-stone mt-1">{zh ? "鎖定。零廠商依賴。" : "lock-in. No vendor dependency."}</div>
            </div>
            <div className="bg-ash p-6">
              <div className="font-data text-[clamp(28px,3vw,40px)] font-bold text-ink">
                <CountUp target={stats.ruleCount} />
              </div>
              <div className="text-xs text-stone mt-1">{zh ? "條規則，透過 Threat Cloud 自動更新" : "rules, auto-distributed via Threat Cloud"}</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-6 text-sm text-stone">
            {zh
              ? "這就是為什麼 Cisco、OWASP 和 SAFE-MCP 選擇整合 ATR。"
              : "This is why Cisco, OWASP, and SAFE-MCP chose to integrate ATR."}
          </p>
        </Reveal>
      </section>

      {/* How Ecosystems Consume ATR */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "生態系如何消費 ATR" : "How Ecosystems Consume ATR"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-fog">
            {[
              {
                title: "npm install",
                code: "npm install agent-threat-rules",
                desc: zh ? "直接作為 dependency 引入" : "Add as a direct dependency",
              },
              {
                title: zh ? "Cisco 風格" : "Cisco style",
                code: "atr scan --rule-packs community",
                desc: zh ? "用 --rule-packs flag 直接載入 ATR" : "Use --rule-packs flag to load ATR directly",
              },
              {
                title: zh ? "原始 YAML" : "Raw YAML",
                code: "git submodule add ...",
                desc: zh ? "Clone repo，把規則放進任何 scanner" : "Clone the repo and drop rules into any scanner",
              },
              {
                title: "Threat Cloud",
                code: zh ? "掃描 → 貢獻 → 自動更新" : "scan → contribute → auto-update",
                desc: zh ? "你的掃描匿名貢獻 → 新規則自動產生 → 所有人更新" : "Your scans anonymously contribute → new rules auto-generated → everyone gets updated",
              },
            ].map((path) => (
              <div key={path.title} className="bg-paper p-6">
                <div className="font-display text-sm font-semibold mb-3">{path.title}</div>
                <div className="font-data text-[12px] text-blue bg-ash border border-fog px-3 py-2 mb-3">{path.code}</div>
                <p className="text-[13px] text-stone leading-[1.5]">{path.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <SpeedLines />

      {/* The Future */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)] bg-ash">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "未來" : "The Future"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="font-display text-[clamp(20px,3vw,32px)] font-extrabold tracking-[-1px] max-w-[700px] mb-4">
            {zh
              ? "我們正在重新架構 Threat Cloud，實現分散式、企業級擴展能力。"
              : "We are currently re-architecting Threat Cloud for distributed, enterprise-grade scalability."}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base text-stone font-light max-w-[600px]">
            {zh
              ? "目標：每個主要的 AI Agent 生態系都能在新威脅被發現後數小時內消費到高品質的新規則。"
              : "Goal: Every major AI Agent ecosystem can consume fresh, high-quality rules within hours of a new threat being discovered."}
          </p>
        </Reveal>
      </section>

      {/* Contribute */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "貢獻" : "Contribute"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-6">
            {zh
              ? "我們正在一起打造開放偵測標準。"
              : "We are building the open detection standard together."}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-col gap-2 text-base text-graphite mb-8">
            <span>{zh ? "提交新的攻擊模式" : "Submit new attack patterns"}</span>
            <span>{zh ? "改善現有規則" : "Improve existing rules"}</span>
            <span>{zh ? "新增平台支援" : "Add support for new platforms"}</span>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <a
            href="https://github.com/Agent-Threat-Rule/agent-threat-rules"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue text-white px-8 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-colors inline-block"
          >
            {zh ? "在 GitHub 上貢獻 →" : "Contribute on GitHub →"}
          </a>
        </Reveal>
      </section>
    </>
  );
}
