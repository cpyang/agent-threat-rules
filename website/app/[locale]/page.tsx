import { HeroEntrance } from "@/components/HeroEntrance";
import { CountUp } from "@/components/CountUp";
import { SpeedLines } from "@/components/SpeedLines";
import { Reveal } from "@/components/Reveal";
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
      {/* ── Scene 1: The Shift (Hero) ── */}
      <section className="min-h-[92vh] flex flex-col items-center justify-center text-center px-6 relative pt-20">
        <HeroEntrance delay={0.3}>
          <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 mx-auto mb-8">
            <path d="M20 0L40 36H30L20 18L10 36H0L20 0Z" fill="#0B0B0F" />
            <line x1="6" y1="28" x2="34" y2="28" stroke="#0B0B0F" strokeWidth="1.5" />
            <line x1="8" y1="31" x2="32" y2="31" stroke="#0B0B0F" strokeWidth="1.2" />
            <line x1="10" y1="34" x2="30" y2="34" stroke="#0B0B0F" strokeWidth="1" />
          </svg>
        </HeroEntrance>

        <HeroEntrance delay={0.5}>
          <p className="font-display text-[clamp(36px,6vw,80px)] font-black leading-[1.05] tracking-[-3px] text-stone">
            {zh ? "我們過去保護人。" : "We used to protect people."}
          </p>
        </HeroEntrance>

        <HeroEntrance delay={0.8}>
          <h1 className="font-display text-[clamp(36px,6vw,80px)] font-black leading-[1.05] tracking-[-3px] text-ink">
            {zh ? "現在我們保護 Agent。" : "Now we protect agents."}
          </h1>
        </HeroEntrance>

        <HeroEntrance delay={1.1}>
          <div className="flex gap-8 justify-center mt-8">
            <div className="text-center">
              <div className="font-data text-[clamp(20px,2.5vw,28px)] font-bold text-ink">
                <CountUp target={stats.ruleCount} />
              </div>
              <div className="font-data text-xs text-stone mt-1">{zh ? "條規則" : "Rules"}</div>
            </div>
            <div className="text-center">
              <div className="font-data text-[clamp(20px,2.5vw,28px)] font-bold text-ink">
                {stats.categoryCount}
              </div>
              <div className="font-data text-xs text-stone mt-1">{zh ? "個類別" : "Categories"}</div>
            </div>
            <div className="text-center">
              <div className="font-data text-[clamp(20px,2.5vw,28px)] font-bold text-ink">
                <CountUp target={stats.pintPrecision} suffix="%" />
              </div>
              <div className="font-data text-xs text-stone mt-1">Precision</div>
            </div>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.3}>
          <div className="flex gap-3 justify-center flex-wrap mt-8">
            <Link
              href={`${prefix}/integrate`}
              className="bg-blue text-white px-8 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-colors"
            >
              {zh ? "整合 ATR" : "Integrate ATR"}
            </Link>
            <Link
              href={`${prefix}/rules`}
              className="text-ink px-8 py-3.5 text-[15px] font-medium border border-fog hover:border-stone transition-colors rounded-sm"
            >
              {zh ? "瀏覽規則" : "Explore Rules"}
            </Link>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.5} className="absolute bottom-8">
          <div className="flex flex-col items-center gap-2">
            <span className="font-data text-[10px] text-mist tracking-[3px] uppercase">scroll</span>
            <div className="w-px h-6 bg-fog relative overflow-hidden">
              <div className="absolute left-0 w-px h-6 bg-stone" style={{ animation: "scrollDown 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* ── Scene 2: The Threat ── */}
      <section className="py-[120px] px-6">
        <div className="max-w-[1120px] mx-auto">
          <Reveal>
            <div className="font-data text-[clamp(80px,15vw,180px)] font-bold text-critical/[0.07] leading-[0.85] mb-3">
              <CountUp target={stats.megaScanTotal} useComma />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-5">
              {zh ? "MCP skills 已掃描。5,939 個有威脅。" : "MCP skills scanned. 5,939 flagged with threats."}
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
                { value: stats.ruleCount, suffix: "", label: zh ? "條偵測規則" : "detection rules", desc: zh ? `橫跨 ${stats.categoryCount} 個威脅類別` : `Across ${stats.categoryCount} threat categories` },
                { value: stats.pintPrecision, suffix: "%", label: "precision", desc: zh ? `${stats.pintSamples} 個外部對抗樣本` : `${stats.pintSamples} external adversarial samples` },
                { value: 5, suffix: "", label: zh ? "ms 以下延遲" : "ms latency", desc: zh ? "99% 事件在 Tier 0-2 解決" : "99% of events resolve at Tier 0-2" },
                { value: stats.megaScanTotal, suffix: "", label: zh ? "skills 已掃描" : "skills scanned", desc: zh ? `${stats.megaScanCritical} CRITICAL, ${stats.megaScanHigh} HIGH` : `${stats.megaScanCritical} CRITICAL, ${stats.megaScanHigh} HIGH`, useComma: true },
                { value: 10, suffix: "/10", label: "OWASP Agentic", desc: zh ? "完整覆蓋所有類別" : "Full coverage of all categories" },
                { value: 91.8, suffix: "%", label: "SAFE-MCP", desc: "78/85" },
              ].map((item, i) => (
                <Reveal key={i} delay={0.1 + i * 0.05}>
                  <div className="bg-ash p-8 md:p-12">
                    <div className="font-data text-[clamp(36px,5vw,64px)] font-bold text-ink leading-none">
                      <CountUp target={item.value} suffix={item.suffix} useComma={item.useComma} />
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
                    className={`p-6 ${i < categories.length - 1 ? "border-b md:border-b-0 border-fog" : ""} ${(i + 1) % 3 !== 0 ? "md:border-r md:border-fog" : ""} ${i >= 3 ? "md:border-t md:border-fog" : ""}`}
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
              {zh ? " 將\n34 條 ATR 規則作為上游依賴。" : " ships\n34 ATR rules as upstream."}
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
              href="https://github.com/cisco/ai-defense/pull/79"
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-[13px] text-blue hover:underline inline-block mt-4"
            >
              {zh ? "在 GitHub 查看 PR #79 →" : "View PR #79 on GitHub →"}
            </a>
          </Reveal>

          {/* Other ecosystem integrations */}
          <Reveal delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-fog mt-12">
              {[
                {
                  name: "OWASP Top 10 for LLM",
                  en: "Official detection mapping merged. PR #14.",
                  zh: "官方偵測對應已合併。PR #14。",
                },
                {
                  name: "SAFE-MCP (OpenSSF)",
                  en: "78/85 techniques covered (91.8%). PR submitted.",
                  zh: "覆蓋 78/85 項技術（91.8%）。PR 已提交。",
                },
                {
                  name: zh ? "11 個生態系 PR" : "11 Ecosystem PRs",
                  en: `${stats.ecosystemIntegrations.filter(e => e.type === "merged").length} merged, ${stats.ecosystemIntegrations.filter(e => e.type === "open").length} pending. Covering 90K+ GitHub stars.`,
                  zh: `${stats.ecosystemIntegrations.filter(e => e.type === "merged").length} 個已合併，${stats.ecosystemIntegrations.filter(e => e.type === "open").length} 個待審。覆蓋 90K+ stars。`,
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
                ? "其他標準需要委員會和數月審查。ATR 在數小時內結晶新規則。"
                : "Other standards need committees and months of review. ATR crystallizes new rules in hours."}
            </p>
          </Reveal>

          {/* Crystallization pipeline */}
          <Reveal delay={0.2}>
            <div className="bg-ash border border-fog p-6 font-data text-[13px] leading-[2.2] text-graphite max-w-[600px]">
              {[
                zh ? "新攻擊模式在野外被偵測到" : "New attack pattern detected in the wild",
                zh ? "LLM 分析攻擊結構 + 意圖" : "LLM analyzes attack structure + intent",
                zh ? "自動產生 YAML 規則提案 + 測試案例" : "Auto-generates YAML rule proposal + test cases",
                zh ? "社群審查 + precision 測試閘門" : "Community reviews + precision test gate",
                zh ? "合併到 ATR。每個下游生態系自動更新。" : "Merged into ATR. Every downstream ecosystem auto-updates.",
              ].map((step, i) => (
                <div key={i}>
                  {i > 0 && <div className="text-mist text-center pl-6 py-0.5">|</div>}
                  <div className="flex items-center gap-3">
                    <span className="text-blue font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Old Way vs ATR (merged from separate section) */}
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

      {/* ── Scene 8: The CTA ── */}
      <section className="py-[120px] px-6 bg-ash">
        <div className="max-w-[1120px] mx-auto text-center">
          <Reveal>
            <h2 className="font-display text-[clamp(28px,4vw,56px)] font-black tracking-[-2px] mb-4">
              {zh ? "整合 ATR。" : "Integrate ATR."}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="font-data text-sm text-stone bg-paper border border-fog px-6 py-3 inline-block mb-6">
              $ <span className="text-ink">npm install agent-threat-rules</span>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-base text-stone font-light max-w-[500px] mx-auto mb-8">
              {zh
                ? "四條路徑。TypeScript、Python、原始 YAML、或 SIEM queries。跟 Cisco 走的同一條路。"
                : "Four paths. TypeScript, Python, raw YAML, or SIEM queries. The same path Cisco walked."}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href={`${prefix}/integrate`}
                className="bg-blue text-white px-8 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-colors"
              >
                {zh ? "整合指南" : "Integration Guide"}
              </Link>
              <Link
                href={`${prefix}/rules`}
                className="text-ink px-8 py-3.5 text-[15px] font-medium border border-fog hover:border-stone transition-colors rounded-sm"
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
