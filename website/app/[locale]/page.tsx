import { HeroEntrance } from "@/components/HeroEntrance";
import { CountUp } from "@/components/CountUp";
import { SpeedLines } from "@/components/SpeedLines";
import { Reveal } from "@/components/Reveal";
import { loadSiteStats } from "@/lib/stats";
import { locales, type Locale } from "@/lib/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const prefix = `/${locale}`;
  const stats = loadSiteStats();
  const zh = locale === "zh";

  return (
    <>
      {/* ── Hero: Mission ── */}
      <section className="min-h-[88vh] flex flex-col items-center justify-center text-center px-6 relative pt-20">
        <HeroEntrance delay={0.3}>
          <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 mx-auto mb-8">
            <path d="M20 0L40 36H30L20 18L10 36H0L20 0Z" fill="#0B0B0F" />
            <line x1="6" y1="28" x2="34" y2="28" stroke="#0B0B0F" strokeWidth="1.5" />
            <line x1="8" y1="31" x2="32" y2="31" stroke="#0B0B0F" strokeWidth="1.2" />
            <line x1="10" y1="34" x2="30" y2="34" stroke="#0B0B0F" strokeWidth="1" />
          </svg>
        </HeroEntrance>

        <HeroEntrance delay={0.5}>
          <h1 className="font-display text-[clamp(32px,5.5vw,68px)] font-black leading-[1.08] tracking-[-3px] max-w-[820px]">
            {zh
              ? "確保每一個 AI agent 都在共享的安全規則下運作。"
              : "Ensuring every AI agent operates under shared security rules."}
          </h1>
        </HeroEntrance>

        <HeroEntrance delay={0.8}>
          <p className="text-base text-stone font-light max-w-[560px] mt-5 leading-relaxed">
            {zh
              ? "ATR 是 AI agent 安全的開放偵測標準。100 條 MIT 授權的 YAML 規則，任何生態系都能直接消費。已被 Cisco AI Defense、OWASP、SAFE-MCP 整合。"
              : "ATR is the open detection standard for AI agent security. 100 MIT-licensed YAML rules that any ecosystem can consume directly. Already integrated by Cisco AI Defense, OWASP, and SAFE-MCP."}
          </p>
        </HeroEntrance>

        <HeroEntrance delay={1.1}>
          <div className="flex gap-3 justify-center flex-wrap mt-8">
            <div className="font-data text-sm text-stone bg-ash border border-fog px-6 py-3">
              $ <span className="text-ink">npm install agent-threat-rules</span>
            </div>
            <Link href={`${prefix}/rules`} className="text-ink px-6 py-3 text-sm font-medium border border-fog hover:border-stone transition-colors">
              {zh ? "瀏覽全部規則 →" : "Explore all rules →"}
            </Link>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.3} className="absolute bottom-8">
          <div className="flex flex-col items-center gap-2">
            <span className="font-data text-[10px] text-mist tracking-[3px] uppercase">scroll</span>
            <div className="w-px h-6 bg-fog relative overflow-hidden">
              <div className="absolute left-0 w-px h-6 bg-stone" style={{ animation: "scrollDown 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* ── The Problem ── */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-[clamp(80px,15vw,180px)] font-bold text-critical/[0.07] leading-[0.85] mb-3">
            <CountUp target={53377} useComma />
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
      </section>

      <SpeedLines />

      {/* ── The Standard ── */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)] bg-ash">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "標準" : "The Standard"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-3 max-w-[700px]">
            {zh
              ? "ATR 讓每個生態系不必從零開始。開放規則，直接消費，共同維護。"
              : "ATR means no ecosystem starts from zero. Open rules. Direct consumption. Shared maintenance."}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper mt-8">
            {[
              { value: stats.ruleCount, label: zh ? "條偵測規則" : "detection rules" },
              { value: 9, label: zh ? "個威脅類別" : "threat categories" },
              { value: stats.pintPrecision, suffix: "%", label: "precision" },
              { value: 13, label: zh ? "個已對應 CVE" : "CVEs mapped" },
            ].map((item, i) => (
              <Reveal key={i} delay={0.2 + i * 0.05}>
                <div className="bg-ash p-6">
                  <div className="font-data text-[clamp(28px,3vw,44px)] font-bold text-ink">
                    <CountUp target={item.value} suffix={item.suffix} />
                  </div>
                  <div className="text-xs text-stone mt-1">{item.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="mt-6 text-sm text-stone">
            {zh
              ? "所有規則都是 MIT 授權的 YAML。複製、消費、擴充。零鎖定。"
              : "All rules are MIT-licensed YAML. Copy, consume, extend. Zero lock-in."}
          </p>
        </Reveal>
      </section>

      {/* ── Proof: Who's Already Using ATR ── */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "已整合 ATR 的生態系" : "Ecosystems Already Using ATR"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-8 max-w-[600px]">
            {zh
              ? "ATR 透過 PR 擴散。每次 merge 都是不可逆的採用。"
              : "ATR spreads through PRs. Every merge is irreversible adoption."}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog">
          {[
            {
              name: "Cisco AI Defense",
              en: "34 rules merged as official community rule pack. Then they built --rule-packs CLI specifically to consume ATR as upstream. PR #79: 1,272 additions, merged in 3 days.",
              zh: "34 條規則作為官方社群規則包合併。然後他們為了消費 ATR 專門建了 --rule-packs CLI。PR #79：1,272 行新增，3 天合併。",
              url: "https://github.com/cisco/ai-defense/pull/79",
            },
            {
              name: "OWASP Top 10 for LLM Applications",
              en: "Official detection mapping merged (PR #14). ATR is now part of the global LLM security standard that 97% of security leaders reference.",
              zh: "官方偵測對應已合併（PR #14）。ATR 現在是全球 97% 資安主管參考的 LLM 安全標準的一部分。",
              url: "https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/pull/14",
            },
            {
              name: "SAFE-MCP (OpenSSF)",
              en: "Covers 78 of 85 techniques (91.8%). PR submitted on the day of the $12.5M announcement. The most comprehensive mapping between detection rules and the MCP security framework.",
              zh: "覆蓋 85 項技術中的 78 項（91.8%）。PR 在 $12.5M 公告當天提交。偵測規則與 MCP 安全框架之間最完整的對應。",
            },
            {
              name: zh ? "11 個生態系 PR" : "11 Ecosystem PRs",
              en: `${stats.ecosystemIntegrations.filter(e => e.type === "merged").length} merged, ${stats.ecosystemIntegrations.filter(e => e.type === "open").length} pending. Covering repositories with 90K+ combined GitHub stars. Including awesome-mcp-servers, awesome-llm-security, OpenClaw Registry, and more.`,
              zh: `${stats.ecosystemIntegrations.filter(e => e.type === "merged").length} 個已合併，${stats.ecosystemIntegrations.filter(e => e.type === "open").length} 個待審。覆蓋 90K+ GitHub stars 的 repositories。包括 awesome-mcp-servers、awesome-llm-security、OpenClaw Registry 等。`,
            },
          ].map((eco, i) => (
            <Reveal key={eco.name} delay={0.1 * i}>
              <div className="bg-paper p-6 h-full">
                <div className="font-display text-base font-semibold mb-2">{eco.name}</div>
                <p className="text-[13px] text-stone leading-[1.6] mb-2">{zh ? eco.zh : eco.en}</p>
                {eco.url && (
                  <a href={eco.url} target="_blank" rel="noopener noreferrer" className="font-data text-[12px] text-blue hover:underline">
                    {zh ? "查看 PR →" : "View PR →"}
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <SpeedLines />

      {/* ── Coverage ── */}
      <section className="py-14 px-[max(24px,10vw)] bg-ash">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper">
            {[
              { name: "OWASP Agentic Top 10", score: "10/10", detail: zh ? "完整覆蓋" : "Full coverage" },
              { name: "SAFE-MCP (OpenSSF)", score: "91.8%", detail: "78/85" },
              { name: "OWASP Skills Top 10", score: "7/10", detail: zh ? "3 項為流程層級" : "3 process-level" },
              { name: "PINT Benchmark", score: `${stats.pintF1}`, detail: `F1 / ${stats.pintSamples} samples` },
            ].map((std, i) => (
              <Reveal key={std.name} delay={i * 0.05}>
                <div className="bg-ash py-8 px-5 text-center">
                  <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">{std.name}</div>
                  <div className="font-data text-[clamp(24px,3vw,40px)] font-bold text-ink">{std.score}</div>
                  <div className="text-xs text-stone mt-1">{std.detail}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── How to Consume ── */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "如何消費 ATR" : "How to Consume ATR"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-fog">
            {[
              { title: "npm", code: "npm install agent-threat-rules", desc: zh ? "作為 dependency 直接引入你的 scanner" : "Add directly as a dependency to your scanner" },
              { title: "GitHub Action", code: "uses: Agent-Threat-Rule/agent-threat-rules@v1", desc: zh ? "每次 PR 自動掃描 MCP configs 和 SKILL.md" : "Auto-scan MCP configs and SKILL.md on every PR" },
              { title: "SIEM Export", code: "atr convert splunk | elastic | sarif", desc: zh ? "匯出成 Splunk SPL、Elasticsearch、或 SARIF v2.1.0" : "Export to Splunk SPL, Elasticsearch, or SARIF v2.1.0" },
              { title: "Raw YAML", code: "git submodule add ...", desc: zh ? "100 條 YAML 規則，任何語言任何 scanner 都能用" : "100 YAML rules, usable by any language and any scanner" },
            ].map((path) => (
              <div key={path.title} className="bg-paper p-6">
                <div className="font-display text-sm font-semibold mb-3">{path.title}</div>
                <div className="font-data text-[12px] text-blue bg-ash border border-fog px-3 py-2 mb-3 break-all">{path.code}</div>
                <p className="text-[13px] text-stone leading-[1.5]">{path.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-6">
            <Link href={`${prefix}/integrate`} className="font-data text-[13px] text-blue hover:underline">
              {zh ? "查看完整整合指南 + Cisco 案例 →" : "Full integration guide + Cisco case study →"}
            </Link>
          </div>
        </Reveal>
      </section>

      <SpeedLines />

      {/* ── The Future ── */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)] bg-ash">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "未來" : "The Future"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] max-w-[700px] mb-4">
            {zh
              ? "新威脅被發現後數小時內，所有消費 ATR 的生態系都會收到新規則。"
              : "Within hours of a new threat, every ecosystem consuming ATR gets the updated rules."}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base text-stone font-light max-w-[600px] mb-8">
            {zh
              ? "Threat Cloud 結晶機制：LLM 分析新攻擊模式 → 自動產生 YAML 規則提案 → 社群審查 + precision 測試 → 合併。其他標準需要委員會和數月審查。ATR 在數小時內結晶。"
              : "Threat Cloud crystallization: LLM analyzes new attack patterns, auto-generates YAML rule proposals, community reviews + precision tests, merged. Other standards need committees and months. ATR crystallizes in hours."}
          </p>
        </Reveal>
      </section>

      {/* ── Contribute ── */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">
            {zh ? "一起打造" : "Build Together"}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(24px,3.5vw,40px)] font-extrabold tracking-[-2px] mb-4 max-w-[700px]">
            {zh
              ? "ATR 不是一個人的專案。這是一個正在成形的全球偵測標準。每一條規則、每一個 evasion report、每一個 PR 都在加固整個生態系的安全。"
              : "ATR is not one person\u0027s project. It\u0027s a global detection standard taking shape. Every rule, every evasion report, every PR strengthens the security of the entire ecosystem."}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-fog mt-8">
            {[
              { title: zh ? "回報繞過方法" : "Report Evasions", desc: zh ? "找到繞過規則的方法？這是最有價值的貢獻。每個確認的繞過都會觸發規則改進。" : "Found a way to bypass a rule? Most valuable contribution. Every confirmed evasion triggers rule improvement." },
              { title: zh ? "提交新規則" : "Submit Rules", desc: zh ? "用 ATR schema 寫偵測規則。有完整教學。也可以用 AI（Claude Code / Cursor + ATR MCP server）自動產生。" : "Write detection rules using the ATR schema. Full walkthrough available. Or use AI (Claude Code / Cursor + ATR MCP server) to auto-generate." },
              { title: zh ? "整合到你的平台" : "Integrate ATR", desc: zh ? "像 Cisco 一樣把 ATR 整合進你的安全產品。npm install、git submodule、或 GitHub Action。" : "Integrate ATR into your security product, like Cisco did. npm install, git submodule, or GitHub Action." },
            ].map((item) => (
              <div key={item.title} className="bg-paper p-6">
                <div className="font-display text-sm font-semibold mb-2">{item.title}</div>
                <p className="text-[13px] text-stone leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <a
            href="https://github.com/Agent-Threat-Rule/agent-threat-rules"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue text-white px-8 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-colors inline-block mt-8"
          >
            {zh ? "在 GitHub 上貢獻 →" : "Contribute on GitHub →"}
          </a>
        </Reveal>
      </section>
    </>
  );
}
