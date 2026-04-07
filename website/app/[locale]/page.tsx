import { HeroEntrance } from "@/components/HeroEntrance";
import { CountUp } from "@/components/CountUp";
import { SpeedLines } from "@/components/SpeedLines";
import { Reveal } from "@/components/Reveal";
import { TypedTerminal } from "@/components/TypedTerminal";
import { StatsHydrator } from "@/components/StatsHydrator";
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

  return (
    <>
      <StatsHydrator />
      {/* ── Scene 1: The Shift (Dark Hero) ── */}
      <section className="hero-dark min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Animated grid background */}
        <div className="hero-grid absolute inset-0 pointer-events-none" />
        {/* Radial fade overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, #08080C 80%)"
        }} />

        <div className="relative z-10">
          <HeroEntrance delay={0.3}>
            <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 mx-auto mb-10 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]">
              <path d="M20 0L40 36H30L20 18L10 36H0L20 0Z" fill="#FAFAF8" />
              <line x1="6" y1="28" x2="34" y2="28" stroke="#FAFAF8" strokeWidth="1.5" />
              <line x1="8" y1="31" x2="32" y2="31" stroke="#FAFAF8" strokeWidth="1.2" />
              <line x1="10" y1="34" x2="30" y2="34" stroke="#FAFAF8" strokeWidth="1" />
            </svg>
          </HeroEntrance>

          <HeroEntrance delay={0.5}>
            <p className="font-display text-[clamp(32px,5.5vw,72px)] font-black leading-[1.05] tracking-[-3px] text-[#6B6B76]">
              {zh ? "我們過去保護人。" : "We used to protect people."}
            </p>
          </HeroEntrance>

          <HeroEntrance delay={0.8}>
            <h1 className="font-display text-[clamp(32px,5.5vw,72px)] font-black leading-[1.05] tracking-[-3px] hero-headline">
              {zh ? "現在我們保護 Agent。" : "Now we protect agents."}
            </h1>
          </HeroEntrance>

          <HeroEntrance delay={1.1}>
            <div className="flex gap-8 justify-center mt-10">
              {[
                { value: stats.ruleCount, label: zh ? "條規則" : "Rules", key: undefined },
                { value: stats.categoryCount, label: zh ? "個類別" : "Categories", noCount: true, key: undefined },
                { value: stats.pintPrecision, label: "Precision", suffix: "%", key: "pintPrecision" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-data text-[clamp(20px,2.5vw,28px)] font-bold text-white">
                    {s.noCount ? s.value : <CountUp target={s.value} suffix={s.suffix} liveKey={s.key} />}
                  </div>
                  <div className="font-data text-xs text-[#6B6B76] mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </HeroEntrance>

          <HeroEntrance delay={1.3}>
            <div className="flex gap-3 justify-center flex-wrap mt-10">
              <Link
                href={`${prefix}/integrate`}
                className="cta-glow bg-blue text-white px-8 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-all"
              >
                {zh ? "整合 ATR" : "Integrate ATR"}
              </Link>
              <Link
                href={`${prefix}/rules`}
                className="text-[#FAFAF8] px-8 py-3.5 text-[15px] font-medium border border-[#2A2A35] hover:border-[#6B6B76] transition-colors rounded-sm"
              >
                {zh ? "瀏覽規則" : "Explore Rules"}
              </Link>
            </div>
          </HeroEntrance>
        </div>

        <HeroEntrance delay={1.5} className="absolute bottom-8 z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="font-data text-[10px] text-[#6B6B76] tracking-[3px] uppercase">scroll</span>
            <div className="w-px h-6 bg-[#2A2A35] relative overflow-hidden">
              <div className="absolute left-0 w-px h-6 bg-[#6B6B76]" style={{ animation: "scrollDown 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* ── Scene 2: The Threat ── */}
      <section className="py-[120px] px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[clamp(80px,15vw,180px)] font-bold text-critical/[0.07] leading-[0.85] mb-3">
              <CountUp target={stats.megaScanTotal} useComma liveKey="megaScanTotal" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-5">
              {zh ? `MCP skills 已掃描。${stats.megaScanFlagged.toLocaleString()} 個有威脅。` : `MCP skills scanned. ${stats.megaScanFlagged.toLocaleString()} flagged with threats.`}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[clamp(18px,2.5vw,26px)] font-light leading-[1.5] text-graphite max-w-[620px]">
              {zh
                ? (<>AI agent 正在瀏覽網頁、執行程式碼、呼叫外部工具。攻擊者誘騙它們<strong className="font-semibold text-critical">洩漏憑證</strong>、<strong className="font-semibold text-critical">執行反向 shell</strong>、<strong className="font-semibold text-critical">無視安全邊界</strong>。但沒有一個共享的偵測標準。每個生態系都在獨自面對同樣的威脅。</>)
                : (<>AI agents browse the web, execute code, and call external tools. Attackers trick them into <strong className="font-semibold text-critical">leaking credentials</strong>, <strong className="font-semibold text-critical">running reverse shells</strong>, and <strong className="font-semibold text-critical">ignoring safety boundaries</strong>. But there is no shared detection standard. Every ecosystem faces the same threats alone.</>)}
            </p>
          </Reveal>
        </div>
      </section>

      <SpeedLines />

      {/* ── Scene 3: The Numbers ── */}
      <section className="py-[120px] px-6 bg-ash">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
              {zh ? "數據" : "The Numbers"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] bg-paper">
              {[
                { value: stats.ruleCount, suffix: "", label: zh ? "條偵測規則" : "detection rules", desc: zh ? `橫跨 ${stats.categoryCount} 個威脅類別` : `Across ${stats.categoryCount} threat categories`, liveKey: undefined },
                { value: stats.pintPrecision, suffix: "%", label: "precision", desc: zh ? `${stats.pintSamples} 個外部對抗樣本` : `${stats.pintSamples} external adversarial samples`, liveKey: "pintPrecision" },
                { value: 5, suffix: "", label: zh ? "ms 以下延遲" : "ms latency", desc: zh ? "99% 事件在 Tier 0-2 解決" : "99% of events resolve at Tier 0-2", liveKey: undefined },
                { value: stats.megaScanTotal, suffix: "", label: zh ? "skills 已掃描" : "skills scanned", desc: zh ? `${stats.megaScanCritical} CRITICAL, ${stats.megaScanHigh} HIGH` : `${stats.megaScanCritical} CRITICAL, ${stats.megaScanHigh} HIGH`, useComma: true, liveKey: "megaScanTotal" },
                { value: 10, suffix: "/10", label: "OWASP Agentic", desc: zh ? "完整覆蓋所有類別" : "Full coverage of all categories", liveKey: undefined },
                { value: 91.8, suffix: "%", label: "SAFE-MCP", desc: "78/85", liveKey: undefined },
              ].map((item, i) => (
                <Reveal key={i} delay={0.1 + i * 0.05}>
                  <div className="bg-ash p-8 md:p-12">
                    <div className="font-data text-[clamp(36px,5vw,64px)] font-bold text-ink leading-none">
                      <CountUp target={item.value} suffix={item.suffix} useComma={item.useComma} liveKey={item.liveKey} />
                    </div>
                    <div className="font-data text-sm text-stone mt-2">{item.label}</div>
                    <div className="text-xs text-mist mt-1">{item.desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Scene 4: The Categories ── */}
      <section className="py-[120px] px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
              {zh ? "ATR 偵測什麼" : "What ATR Detects"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-8 max-w-[700px]">
              {zh
                ? `${stats.categoryCount} 個威脅類別。${stats.ruleCount} 條規則。真實 CVE。`
                : `${stats.categoryCount} threat categories. ${stats.ruleCount} rules. Real CVEs.`}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 border border-fog">
              {categories.map((cat, i) => {
                const desc = CATEGORY_DESC[cat.name];
                const displayName = cat.name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                return (
                  <div
                    key={cat.name}
                    className={`p-6 hover:bg-ash/50 transition-colors ${i < categories.length - 1 ? "border-b md:border-b-0 border-fog" : ""} ${(i + 1) % 3 !== 0 ? "md:border-r md:border-fog" : ""} ${i >= 3 ? "md:border-t md:border-fog" : ""}`}
                  >
                    <div className="font-display text-[15px] font-semibold text-ink">{displayName}</div>
                    <div className="font-data text-xs text-blue mt-1">{cat.count} {zh ? "條規則" : "rules"}</div>
                    <p className="text-[13px] text-stone leading-[1.5] mt-2">
                      {desc ? (zh ? desc.zh : desc.en) : cat.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-6">
              <Link href={`${prefix}/rules`} className="font-data text-[13px] text-blue hover:underline">
                {zh ? "瀏覽所有規則 + YAML 詳情 →" : "Browse all rules + YAML details →"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SpeedLines />

      {/* ── Scene 5: The Proof ── */}
      <section className="py-[120px] px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
              {zh ? "已在生產環境運行" : "Already in Production"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[clamp(24px,3.5vw,48px)] font-extrabold tracking-[-2px] max-w-[800px]">
              <span className="text-blue">Cisco AI Defense</span>
              {zh ? " 將 34 條 ATR 規則作為上游依賴。" : " ships 34 ATR rules as upstream."}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-base text-graphite max-w-[600px] mt-4 leading-relaxed">
              {zh
                ? "他們的工程師提了 PR。我們 review 完。3 天合併。1,272 行新增。然後他們建了 --rule-packs CLI 專門消費 ATR。"
                : "Their engineer submitted a PR. We reviewed it. It merged in 3 days. 1,272 additions. Then they built a --rule-packs CLI specifically to consume ATR."}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <a
              href="https://github.com/cisco-ai-defense/skill-scanner/pull/79"
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-[13px] text-blue hover:underline inline-block mt-4"
            >
              {zh ? "在 GitHub 查看 PR #79 →" : "View PR #79 on GitHub →"}
            </a>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-fog mt-12">
              {[
                {
                  name: "OWASP LLM Top 10",
                  en: "Detection mapping for ASI01-ASI10 submitted. PR #814.",
                  zh: "ASI01-ASI10 偵測對應已提交。PR #814。",
                },
                {
                  name: "SAFE-MCP (OpenSSF)",
                  en: "78/85 techniques covered (91.8%). PR #187 submitted.",
                  zh: "覆蓋 78/85 項技術（91.8%）。PR #187 已提交。",
                },
                {
                  name: zh ? `${stats.ecosystemIntegrations.length} 個生態系 PR` : `${stats.ecosystemIntegrations.length} Ecosystem PRs`,
                  en: `${stats.ecosystemIntegrations.filter(e => e.type === "merged").length} merged, ${stats.ecosystemIntegrations.filter(e => e.type === "open").length} under review.`,
                  zh: `${stats.ecosystemIntegrations.filter(e => e.type === "merged").length} 個已合併，${stats.ecosystemIntegrations.filter(e => e.type === "open").length} 個審查中。`,
                },
              ].map((eco) => (
                <Reveal key={eco.name} delay={0.1}>
                  <div className="bg-paper p-6">
                    <div className="font-display text-sm font-semibold mb-2">{eco.name}</div>
                    <p className="text-[13px] text-stone leading-[1.6]">{zh ? eco.zh : eco.en}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Scene 6: The Standards ── */}
      <section className="py-[100px] px-6 bg-ash">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper">
              {[
                { name: "OWASP Agentic Top 10", score: "10/10", detail: zh ? "完整覆蓋" : "Full coverage" },
                { name: "SAFE-MCP (OpenSSF)", score: "91.8%", detail: "78/85" },
                { name: "OWASP Skills Top 10", score: "7/10", detail: zh ? "3 項為流程層級" : "3 process-level" },
                { name: "PINT Benchmark", score: `${stats.pintF1}`, detail: `F1 / ${stats.pintSamples} samples` },
              ].map((std, i) => (
                <Reveal key={std.name} delay={i * 0.05}>
                  <div className="bg-ash py-10 px-5 text-center">
                    <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">{std.name}</div>
                    <div className="font-data text-[clamp(24px,3vw,40px)] font-bold text-ink">{std.score}</div>
                    <div className="text-xs text-stone mt-1">{std.detail}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <SpeedLines />

      {/* ── Scene 7: The Future ── */}
      <section className="py-[120px] px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
              {zh ? "未來" : "The Future"}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-[clamp(24px,3.5vw,48px)] font-extrabold tracking-[-2px] max-w-[700px] mb-3">
              {zh
                ? "ATR 規則不需要手寫。"
                : "ATR rules don\u0027t have to be written by hand."}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-base text-stone font-light max-w-[600px] mb-8">
              {zh
                ? "傳統規則由人工撰寫，週期以週計。Threat Cloud 讓新規則的產出從數週縮短到數小時。"
                : "Traditional rules are written by hand, on weekly cycles. Threat Cloud shrinks new rule turnaround from weeks to hours."}
            </p>
          </Reveal>

          {/* Crystallization pipeline */}
          <Reveal delay={0.2}>
            <div className="pipeline-card bg-[#0B0B0F] border border-[#2A2A35] p-8 font-data text-[14px] leading-[2.4] text-[#A0A0B0] max-w-[620px]">
              {[
                zh ? "新攻擊模式在野外被偵測到" : "New attack pattern detected in the wild",
                zh ? "LLM 分析攻擊結構 + 意圖" : "LLM analyzes attack structure + intent",
                zh ? "自動產生 YAML 規則提案 + 測試案例" : "Auto-generates YAML rule proposal + test cases",
                zh ? "社群審查 + precision 測試閘門" : "Community reviews + precision test gate",
                zh ? "合併到 ATR。每個下游生態系自動更新。" : "Merged into ATR. Every downstream ecosystem auto-updates.",
              ].map((step, i) => (
                <div key={i}>
                  {i > 0 && <div className="text-[#2A2A35] text-center pl-8 py-0.5">|</div>}
                  <div className="flex items-center gap-3">
                    <span className="text-blue font-bold w-5 text-right">{i + 1}.</span>
                    <span className="text-[#E0E0E8]">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Old Way vs ATR */}
          <Reveal delay={0.3}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mt-12">
              <div className="bg-paper p-6">
                <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-4">
                  {zh ? "傳統方式" : "The Old Way"}
                </div>
                <ul className="space-y-3 text-[13px] text-stone leading-[1.6]">
                  <li>{zh ? "每個廠商自己寫規則，閉源，互不共享" : "Every vendor writes their own rules. Closed source. No sharing."}</li>
                  <li>{zh ? "新攻擊出現 → 委員會開會 → 數週到數月後才有規則" : "New attack appears. Committee meets. Rules arrive weeks to months later."}</li>
                  <li>{zh ? "規則格式不統一，無法跨平台使用" : "Rule formats incompatible. Can\u0027t use across platforms."}</li>
                </ul>
              </div>
              <div className="bg-paper p-6">
                <div className="font-data text-[11px] text-blue tracking-[2px] uppercase mb-4">
                  ATR + Threat Cloud
                </div>
                <ul className="space-y-3 text-[13px] text-ink leading-[1.6]">
                  <li>{zh ? "一套開放規則，所有生態系共享，MIT 授權" : "One set of open rules. Shared by all ecosystems. MIT licensed."}</li>
                  <li>{zh ? "新攻擊出現 → LLM 分析 → YAML 規則 → 社群審查 → 數小時合併" : "New attack appears. LLM analyzes. YAML rule. Community reviews. Merged in hours."}</li>
                  <li>{zh ? "統一 YAML 格式，可匯出 Splunk / Elastic / SARIF" : "Unified YAML format. Export to Splunk, Elastic, SARIF."}</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Scene 8: The CTA (Dark) ── */}
      <section className="cta-dark py-[140px] px-6 relative overflow-hidden">
        <div className="hero-grid absolute inset-0 pointer-events-none opacity-50" />
        <div className="relative z-10 max-w-[1120px] mx-auto text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(28px,4vw,56px)] font-black tracking-[-2px] mb-6 text-white">
              {zh ? "整合 ATR。" : "Integrate ATR."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <TypedTerminal />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-base text-[#808089] font-light max-w-[500px] mx-auto mb-8 mt-6">
              {zh
                ? "四條路徑。TypeScript、Python、原始 YAML、或 SIEM queries。跟 Cisco 走的同一條路。"
                : "Four paths. TypeScript, Python, raw YAML, or SIEM queries. The same path Cisco walked."}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href={`${prefix}/integrate`}
                className="cta-glow bg-blue text-white px-8 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-all"
              >
                {zh ? "整合指南" : "Integration Guide"}
              </Link>
              <Link
                href={`${prefix}/rules`}
                className="text-[#FAFAF8] px-8 py-3.5 text-[15px] font-medium border border-[#2A2A35] hover:border-[#6B6B76] transition-colors rounded-sm"
              >
                {zh ? "瀏覽所有規則" : "Explore All Rules"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
