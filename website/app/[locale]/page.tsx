/* ATR Homepage — 8-scene narrative per DESIGN.md */
import { HeroEntrance } from "@/components/HeroEntrance";
import { CountUp } from "@/components/CountUp";
import { SpeedLines } from "@/components/SpeedLines";
import { Reveal } from "@/components/Reveal";
import { StatsHydrator } from "@/components/StatsHydrator";
import { NumberScramble } from "@/components/NumberScramble";
import { Flywheel } from "@/components/Flywheel";
import { loadSiteStats } from "@/lib/stats";
import { loadAllRules, getCategories } from "@/lib/rules";
import { locales, type Locale } from "@/lib/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const CATEGORY_DESC: Record<string, { en: string; zh: string }> = {
  "prompt-injection": {
    en: "Hijacking agent behavior through crafted inputs",
    zh: "透過精心構造的輸入劫持 agent 行為",
  },
  "skill-compromise": {
    en: "Malicious or vulnerable MCP skills and SKILL.md",
    zh: "惡意或有漏洞的 MCP skill 和 SKILL.md",
  },
  "context-exfiltration": {
    en: "Stealing conversation context and sensitive data",
    zh: "竊取對話上下文和敏感資料",
  },
  "agent-manipulation": {
    en: "Social engineering and behavioral manipulation of agents",
    zh: "對 agent 的社交工程和行為操控",
  },
  "tool-poisoning": {
    en: "Poisoned tool descriptions and malicious tool responses",
    zh: "被下毒的工具描述和惡意工具回應",
  },
  "privilege-escalation": {
    en: "Unauthorized elevation of agent capabilities",
    zh: "未授權提升 agent 權限",
  },
  "excessive-autonomy": {
    en: "Agents exceeding intended operational boundaries",
    zh: "Agent 超越預期的操作邊界",
  },
  "model-security": {
    en: "Direct attacks on the underlying language model",
    zh: "對底層語言模型的直接攻擊",
  },
  "data-poisoning": {
    en: "Corrupting training data or knowledge sources",
    zh: "污染訓練資料或知識來源",
  },
};

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const prefix = `/${locale}`;
  const stats = loadSiteStats();
  const zh = locale === "zh";
  const rules = loadAllRules();
  const categories = getCategories(rules);
  const mergedCount = stats.ecosystemIntegrations.filter(e => e.type === "merged").length;

  return (
    <>
      <StatsHydrator />

      {/* ── Scene 1: The Shift (Hero) ── */}
      <section className="bg-paper min-h-screen flex flex-col items-center justify-center text-center px-5 md:px-6 relative">
        <div className="relative z-10 max-w-[900px]">
          <HeroEntrance delay={0.5}>
            <p className="font-display text-[20px] md:text-[clamp(28px,4vw,52px)] font-black leading-[1.15] tracking-[-1px] md:tracking-[-2px] text-stone">
              {zh ? "我們曾經保護人。" : "We used to protect people."}
            </p>
          </HeroEntrance>

          <HeroEntrance delay={0.8}>
            <h1 className="font-display text-[28px] md:text-[clamp(36px,6vw,80px)] font-black leading-[1.05] tracking-[-2px] md:tracking-[-3px] text-ink mt-1 md:mt-2">
              {zh ? "現在我們保護 agent。" : "Now we protect agents."}
            </h1>
          </HeroEntrance>

          <HeroEntrance delay={1.0}>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-7 md:mt-9 font-data text-sm md:text-base text-ink tracking-wide">
              <span><span className="font-data font-bold">{stats.ruleCount}</span> <span className="text-stone">{zh ? "條規則" : "rules"}</span></span>
              <span className="text-fog">·</span>
              <span><span className="font-data font-bold">{stats.categoryCount}</span> <span className="text-stone">{zh ? "個類別" : "categories"}</span></span>
              <span className="text-fog">·</span>
              <span><span className="font-data font-bold">{stats.pintPrecision}%</span> <span className="text-stone">{zh ? "精準度" : "precision"}</span></span>
            </div>
          </HeroEntrance>

          {/* Terminal block — light bg per DESIGN.md */}
          <HeroEntrance delay={1.15}>
            <div className="mt-7 md:mt-8 bg-ash border border-fog rounded-[2px] overflow-hidden max-w-[520px] mx-auto text-left">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-fog">
                <span className="font-data text-xs text-mist">{zh ? "一行指令。即時結果。" : "One command. Instant results."}</span>
              </div>
              <div className="p-3 md:p-4 font-data text-[11px] md:text-sm leading-[1.8]">
                <div className="text-stone">$ <span className="text-ink">npx agent-threat-rules scan .</span></div>
                <div className="text-mist mt-2"># {zh ? "結果" : "results"}</div>
                <div className="text-green">{zh ? "  3 個 SKILL.md 已掃描" : "  3 SKILL.md scanned"}</div>
                <div className="text-green">{zh ? "  12 個工具描述已檢查" : "  12 tool descriptions checked"}</div>
                <div className="text-critical mt-1">{zh ? "  1 CRITICAL: 工具描述中的憑證竊取" : "  1 CRITICAL: credential theft"}</div>
                <div className="text-critical">{zh ? "    ATR-2026-00121" : "    rule ATR-2026-00121"}</div>
                <div className="text-stone mt-2">{zh ? "47ms 完成。" : "Done in 47ms."}</div>
              </div>
            </div>
          </HeroEntrance>

          <HeroEntrance delay={1.3}>
            <div className="flex gap-3 justify-center flex-wrap mt-7 md:mt-8">
              <Link
                href={`${prefix}/integrate`}
                className="bg-blue text-white px-6 md:px-8 py-3 md:py-3.5 rounded-[2px] text-sm font-semibold hover:bg-blue-hover transition-colors"
              >
                {zh ? "開始整合" : "Integrate ATR"}
              </Link>
              <Link
                href={`${prefix}/rules`}
                className="text-ink px-6 md:px-8 py-3 md:py-3.5 text-sm font-medium border border-fog hover:border-stone transition-colors rounded-[2px]"
              >
                {zh ? "瀏覽規則" : "Explore Rules"}
              </Link>
            </div>
          </HeroEntrance>

          {/* Credibility bar */}
          <HeroEntrance delay={1.5}>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-8 md:mt-10 font-data text-[11px] md:text-xs text-stone tracking-wide">
              <span>Cisco AI Defense</span>
              <span className="text-fog">·</span>
              <span>OWASP 10/10</span>
              <span className="text-fog">·</span>
              <span>MITRE ATLAS</span>
              <span className="text-fog">·</span>
              <span>MIT License</span>
            </div>
          </HeroEntrance>
        </div>

        <HeroEntrance delay={1.6} className="absolute bottom-6 md:bottom-8 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="font-data text-xs text-stone tracking-[3px] uppercase">scroll</span>
            <div className="w-px h-5 md:h-6 bg-fog relative overflow-hidden">
              <div className="absolute left-0 w-px h-5 md:h-6 bg-stone" style={{ animation: "scrollDown 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </HeroEntrance>
      </section>

      <SpeedLines />

      {/* ── Scene 2: The Threat ── */}
      <section className="py-14 md:py-[120px] px-5 md:px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[clamp(64px,14vw,180px)] font-bold text-critical/[0.12] leading-[0.85] mb-2 md:mb-3">
              <NumberScramble target={stats.megaScanTotal.toLocaleString()} duration={2000} liveKey="megaScanTotal" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="font-data text-[11px] md:text-xs font-medium text-stone tracking-[1.5px] md:tracking-[3px] uppercase mb-4 md:mb-5 leading-[1.8]">
              {zh
                ? <>skills 已掃描<br className="sm:hidden" /> — 史上最大規模的 AI agent 安全掃描</>
                : <>skills scanned<br className="sm:hidden" /> — the largest AI agent security scan ever conducted</>}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="font-data text-[clamp(48px,10vw,120px)] font-bold text-critical/[0.18] leading-[0.9] mb-3 md:mb-4">
              751
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="font-display text-[20px] md:text-[clamp(22px,3vw,32px)] font-extrabold tracking-[-1px] leading-[1.35] mb-3 md:mb-4 max-w-[620px]">
              {zh
                ? <>惡意 AI agent skill。<br />三個協同攻擊者。<br />史上最大的 AI agent 惡意軟體行動。</>
                : <>malicious AI agent skills.<br />Three coordinated threat actors.<br />The largest AI agent malware campaign ever documented.</>}
            </h2>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-fog max-w-[700px]">
              {[
                { actor: "hightower6eu", count: 354, desc: zh ? "Solana / Google Workspace 偽裝" : "Solana / Google Workspace disguise" },
                { actor: "sakaen736jih", count: 212, desc: zh ? "C2 伺服器 91.92.242.30" : "C2 server at 91.92.242.30" },
                { actor: "52yuanchangxing", count: 137, desc: zh ? "偽冒開發工具 + npm typosquat" : "Fake dev tools + npm typosquatting" },
              ].map((a) => (
                <div key={a.actor} className="bg-paper p-4 md:p-5">
                  <div className="font-data text-xs text-stone mb-1">{a.actor}</div>
                  <div className="font-data text-2xl font-bold text-critical">{a.count}</div>
                  <div className="text-xs text-mist mt-1">{a.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-sm md:text-base text-graphite max-w-[520px] mt-5 leading-[1.8]">
              {zh
                ? <>ATR 掃描 ClawHub、OpenClaw、<br className="sm:hidden" />Skills.sh 等六個 registry，<br className="sm:hidden" />共 96,096 個 skill 時<br className="sm:hidden" />發現了這些攻擊者。<br /><br className="sm:hidden" />751 個惡意 skill 全數加入黑名單，<br className="sm:hidden" />並已通報 NousResearch。</>
                : <>ATR found these threat actors<br className="sm:hidden" /> scanning 96,096 skills across six registries<br className="sm:hidden" /> — ClawHub, OpenClaw, Skills.sh,<br className="sm:hidden" /> and three others.<br /><br className="sm:hidden" />All 751 blacklisted<br className="sm:hidden" /> and reported to NousResearch.</>}
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <Link href={`${prefix}/research`} className="font-data text-xs md:text-sm text-blue hover:underline inline-block mt-4">
              {zh ? "閱讀完整研究報告 →" : "Read the full research report →"}
            </Link>
          </Reveal>
        </div>
      </section>

      <SpeedLines />

      {/* ── Scene 3: The Numbers ── */}
      <section className="py-14 md:py-[120px] px-5 md:px-6 bg-ash">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[11px] md:text-xs font-medium text-stone tracking-[1.5px] md:tracking-[3px] uppercase mb-5 md:mb-6">
              {zh ? "數據一覽" : "The Numbers"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] bg-paper">
              {[
                { value: stats.ruleCount, suffix: "", label: zh ? "條偵測規則" : "detection rules", desc: zh ? `${stats.categoryCount} 個威脅類別` : `${stats.categoryCount} threat categories`, liveKey: undefined },
                { value: stats.pintPrecision, suffix: "%", label: zh ? "MCP 精準度" : "MCP precision", desc: zh ? `recall ${stats.pintRecall}%` : `${stats.pintRecall}% recall`, liveKey: "pintPrecision" },
                { value: stats.skillBenchRecall, suffix: "%", label: zh ? "SKILL.md 召回率" : "SKILL.md recall", desc: zh ? `${stats.skillBenchSamples} 個真實樣本` : `${stats.skillBenchSamples} real-world samples`, liveKey: undefined },
                { value: stats.megaScanTotal, suffix: "", label: zh ? "skills 已掃描" : "skills scanned", desc: zh ? `${stats.megaScanFlagged.toLocaleString()} 個有風險` : `${stats.megaScanFlagged.toLocaleString()} flagged`, useComma: true, liveKey: "megaScanTotal" },
                { value: 10, suffix: "/10", label: "OWASP Agentic", desc: zh ? "完整覆蓋" : "Full coverage", liveKey: undefined },
                { value: 91.8, suffix: "%", label: "SAFE-MCP", desc: zh ? "MCP 安全框架" : "MCP security framework", liveKey: undefined },
              ].map((item, i) => (
                <Reveal key={i} delay={0.1 + i * 0.05}>
                  <div className="bg-ash p-5 md:p-10">
                    <div className="font-data text-[clamp(28px,5vw,56px)] font-bold text-ink leading-none">
                      <CountUp target={item.value} suffix={item.suffix} useComma={item.useComma} liveKey={item.liveKey} />
                    </div>
                    <div className="font-data text-sm text-stone mt-2 md:mt-3">{item.label}</div>
                    <div className="text-xs text-mist mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Scene 4: The Categories ── */}
      <section className="py-14 md:py-[120px] px-5 md:px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[11px] md:text-xs font-medium text-stone tracking-[1.5px] md:tracking-[3px] uppercase mb-3 md:mb-4">
              {zh ? "ATR 偵測什麼" : "What ATR Detects"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[20px] md:text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-1px] md:tracking-[-2px] leading-[1.3] mb-6 md:mb-8 max-w-[700px]">
              {zh
                ? <>{stats.categoryCount} 個威脅類別。<br className="sm:hidden" />{stats.ruleCount} 條規則。真實 CVE。</>
                : <>{stats.categoryCount} threat categories.<br className="sm:hidden" /> {stats.ruleCount} rules. Real CVEs.</>}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-fog">
              {categories.map((cat) => {
                const desc = CATEGORY_DESC[cat.name];
                const displayName = cat.name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                return (
                  <div key={cat.name} className="bg-paper p-5 md:p-6 hover:bg-ash/50 transition-colors">
                    <div className="font-display text-sm font-semibold text-ink">{displayName}</div>
                    <div className="font-data text-xs text-blue mt-1.5">{cat.count} {zh ? "條規則" : "rules"}</div>
                    <p className="text-sm text-stone mt-2">
                      {desc ? (zh ? desc.zh : desc.en) : cat.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-5 md:mt-6">
              <Link href={`${prefix}/rules`} className="font-data text-xs md:text-sm text-blue hover:underline">
                {zh ? "瀏覽所有規則 + YAML 詳情 →" : "Browse all rules + YAML details →"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SpeedLines />

      {/* ── Scene 5: The Proof ── */}
      <section className="py-14 md:py-[120px] px-5 md:px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[11px] md:text-xs font-medium text-stone tracking-[1.5px] md:tracking-[3px] uppercase mb-3 md:mb-4">
              {zh ? "已在生產環境運行" : "Already in Production"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[20px] md:text-[clamp(24px,3.5vw,48px)] font-extrabold tracking-[-1px] md:tracking-[-2px] leading-[1.35] max-w-[800px]">
              <span className="text-blue">Cisco AI Defense</span>
              {zh
                ? <><br className="md:hidden" />將 34 條 ATR 規則<br className="sm:hidden" />作為上游依賴。</>
                : <><br className="md:hidden" /> ships 34 ATR rules<br className="sm:hidden" /> as upstream.</>}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm md:text-base text-graphite max-w-[560px] mt-3 md:mt-4 leading-[1.7]">
              {zh
                ? <>他們的工程師提了 PR。<br className="sm:hidden" />我們審查完，3 天合併。<br className="sm:hidden" />1,272 行新增。<br /><br className="sm:hidden" />然後他們專門建了 CLI<br className="sm:hidden" /> 來消費 ATR 規則。</>
                : <>Their engineer submitted a PR.<br className="sm:hidden" /> We reviewed it. Merged in 3 days.<br className="sm:hidden" /> 1,272 additions.<br /><br className="sm:hidden" />Then they built a CLI<br className="sm:hidden" /> specifically to consume ATR rules.</>}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <a
              href="https://github.com/cisco-ai-defense/skill-scanner/pull/79"
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-xs md:text-sm text-blue hover:underline inline-block mt-3 md:mt-4"
            >
              {zh ? "在 GitHub 查看 PR #79 →" : "View PR #79 on GitHub →"}
            </a>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-fog mt-10 md:mt-12">
              {[
                { num: "34", label: zh ? "條規則已合併" : "rules merged", sub: "Cisco AI Defense" },
                { num: String(stats.ruleCount), label: zh ? "條偵測規則" : "detection rules", sub: zh ? "跨 9 個類別" : "across 9 categories" },
                { num: stats.megaScanTotal.toLocaleString(), label: zh ? "skills 已掃描" : "skills scanned", sub: zh ? "跨多個 registry" : "across registries" },
                { num: `${mergedCount}/${stats.ecosystemIntegrations.length}`, label: zh ? "生態系 PR" : "ecosystem PRs", sub: zh ? "已合併" : "merged" },
              ].map((item) => (
                <div key={item.label} className="bg-paper p-5 md:p-6">
                  <div className="font-data text-2xl sm:text-[clamp(24px,4vw,36px)] font-bold text-ink leading-none">{item.num}</div>
                  <div className="font-data text-xs text-stone mt-2">{item.label}</div>
                  <div className="text-xs text-mist mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Scene 6: The Standards ── */}
      <section className="py-14 md:py-[100px] px-5 md:px-6 bg-ash">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[11px] md:text-xs font-medium text-stone tracking-[1.5px] md:tracking-[3px] uppercase mb-5 md:mb-6">
              {zh ? "標準覆蓋" : "Standards Coverage"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper">
              {[
                { name: "OWASP Agentic", score: "10/10", desc: zh ? "完整覆蓋" : "Full coverage" },
                { name: "SAFE-MCP", score: "91.8%", desc: zh ? "78/85 技術" : "78/85 techniques" },
                { name: "OWASP AST10", score: "7/10", desc: zh ? "3 個是流程層級" : "3 are process-level" },
                { name: "PINT F1", score: "76.7", desc: zh ? "850 個樣本" : "850 samples" },
              ].map((s) => (
                <div key={s.name} className="bg-ash p-6 md:p-8 text-center">
                  <div className="font-data text-[10px] md:text-xs font-medium text-stone tracking-[2px] uppercase mb-2 md:mb-3">{s.name}</div>
                  <div className="font-data text-[clamp(28px,4vw,48px)] font-bold text-ink leading-none">{s.score}</div>
                  <div className="text-xs text-mist mt-2">{s.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm text-graphite max-w-[520px] mt-5 leading-[1.8]">
              {zh
                ? <>框架告訴你威脅存在。<br className="sm:hidden" />ATR 告訴你怎麼偵測。<br /><br className="sm:hidden" />ATR 對 MITRE ATLAS 的關係，<br className="sm:hidden" />就像 Sigma 規則對 ATT&CK 的關係。</>
                : <>Frameworks tell you threats exist.<br className="sm:hidden" /> ATR tells you how to detect them.<br /><br className="sm:hidden" />ATR is to MITRE ATLAS<br className="sm:hidden" /> what Sigma rules are to ATT&CK.</>}
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <Link href={`${prefix}/coverage`} className="font-data text-xs md:text-sm text-blue hover:underline inline-block mt-3">
              {zh ? "查看完整覆蓋對照表 →" : "View full coverage mapping →"}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Scene 7: The Network (Flywheel + Crystallization) ── */}
      <section className="py-14 md:py-[120px] px-5 md:px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[11px] md:text-xs font-medium text-stone tracking-[1.5px] md:tracking-[3px] uppercase mb-3 md:mb-4">
              {zh ? "未來" : "THE FUTURE"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[20px] md:text-[clamp(24px,3.5vw,48px)] font-extrabold tracking-[-1px] md:tracking-[-2px] leading-[1.35] max-w-[700px] mb-3">
              {zh ? <>ATR 規則不需要手寫。</> : <>ATR rules don&apos;t have to be written by hand.</>}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-sm md:text-base text-graphite font-light max-w-[560px] mb-6 md:mb-8 leading-[1.8]">
              {zh
                ? <>Threat Cloud 分析新攻擊模式，<br className="sm:hidden" />自動結晶偵測規則 YAML，<br className="sm:hidden" />社群審查後合併。<br /><br className="sm:hidden" />從發現到全球防護，不到 48 小時。<br className="sm:hidden" />沒有其他偵測標準<br className="sm:hidden" />有自動化規則生成。</>
                : <>Threat Cloud analyzes new attack patterns,<br className="sm:hidden" /> crystallizes detection rule YAML,<br className="sm:hidden" /> community reviews and merges.<br /><br className="sm:hidden" />Discovery to global protection<br className="sm:hidden" /> in under 48 hours.<br className="sm:hidden" /> No other detection standard<br className="sm:hidden" /> has automated rule generation.</>}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <Flywheel locale={locale} />
          </Reveal>

          {/* Real case — light bg */}
          <Reveal delay={0.25}>
            <div className="mt-8 md:mt-10 border border-fog p-4 md:p-5 max-w-[620px]">
              <div className="font-data text-[10px] text-stone tracking-[2px] uppercase mb-3">
                {zh ? "真實案例 — 飛輪運轉記錄" : "Real case — flywheel in action"}
              </div>
              <div className="space-y-2 font-data text-xs leading-[1.7]">
                <div className="flex gap-3">
                  <span className="text-mist shrink-0">T+0h</span>
                  <span className="text-ink">{zh ? "新攻擊模式觸發 TC 結晶（隱藏優先指令）" : "New attack pattern triggers TC crystallization (hidden priority instructions)"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-mist shrink-0">T+12h</span>
                  <span className="text-ink">{zh ? "自動 PR 開啟，通過 CI + 品質閘門" : "Auto-PR opened, passed CI + quality gate"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-mist shrink-0">T+24h</span>
                  <span className="text-ink">{zh ? "再結晶 2 條相關規則" : "2 more related rules crystallized"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-mist shrink-0">T+48h</span>
                  <span className="text-green">{zh ? "人工審查 → 合併 → 全球端點更新" : "Human review → merged → global endpoint update"}</span>
                </div>
              </div>
              <div className="text-[10px] text-mist mt-3">
                {zh ? "從發現到全球防護：48 小時。" : "Discovery to global protection: 48 hours."}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SpeedLines />

      {/* ── Scene 8: The CTA ── */}
      <section className="py-14 md:py-[120px] px-5 md:px-6 bg-ash">
        <div className="max-w-[1120px] mx-auto text-center">
          <Reveal>
            <h2 className="font-display text-[24px] md:text-[clamp(28px,4vw,56px)] font-black tracking-[-1.5px] md:tracking-[-2px] mb-5 md:mb-6 text-ink">
              {zh ? "開始整合 ATR。" : "Integrate ATR."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="font-data text-sm bg-paper text-ink px-6 py-4 border border-fog inline-block rounded-[2px]">
              <span className="text-stone">$</span>{" "}
              <span className="font-bold">npm install agent-threat-rules</span>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm md:text-base text-stone font-light max-w-[480px] mx-auto mb-7 md:mb-8 mt-5 md:mt-6 leading-[1.8]">
              {zh
                ? <>TypeScript、Python、Raw YAML、SIEM 轉換器。四種整合路徑。</>
                : <>TypeScript, Python, Raw YAML, SIEM converters. Four integration paths.</>}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href={`${prefix}/integrate`}
                className="bg-blue text-white px-6 md:px-8 py-3 md:py-3.5 rounded-[2px] text-sm font-semibold hover:bg-blue-hover transition-colors"
              >
                {zh ? "整合指南" : "Integration Guide"}
              </Link>
              <Link
                href={`${prefix}/threats`}
                className="text-ink px-6 md:px-8 py-3 md:py-3.5 text-sm font-medium border border-fog hover:border-stone transition-colors rounded-[2px]"
              >
                {zh ? "查看威脅清單" : "View Threat Feed"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
