import { HeroEntrance } from "@/components/HeroEntrance";
import { CountUp } from "@/components/CountUp";
import { SpeedLines } from "@/components/SpeedLines";
import { Reveal } from "@/components/Reveal";
import { loadSiteStats } from "@/lib/stats";
import { getCategories, loadAllRules } from "@/lib/rules";
import { t, locales, type Locale } from "@/lib/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const CATEGORY_DESCS: Record<string, { desc: string; slug: string }> = {
  "prompt-injection": { desc: "Hidden instructions that hijack agent behavior. Persona switching, encoded payloads, CJK attacks.", slug: "prompt-injection" },
  "tool-poisoning": { desc: "Malicious MCP responses, consent bypass, hidden instructions in tool schemas.", slug: "tool-poisoning" },
  "agent-manipulation": { desc: "Cross-agent attacks, goal hijacking, Sybil consensus, orchestrator bypass.", slug: "agent-manipulation" },
  "skill-compromise": { desc: "Typosquatting, description-behavior mismatch, supply chain attacks.", slug: "skill-compromise" },
  "context-exfiltration": { desc: "API key leakage, system prompt theft, disguised analytics.", slug: "context-exfiltration" },
  "privilege-escalation": { desc: "Scope creep, delayed execution bypass, unauthorized elevation.", slug: "privilege-escalation" },
  "excessive-autonomy": { desc: "Runaway loops, resource exhaustion, unauthorized financial actions.", slug: "excessive-autonomy" },
  "model-abuse": { desc: "Behavior extraction, malicious fine-tuning data injection.", slug: "model-security" },
  "data-poisoning": { desc: "RAG and knowledge base tampering.", slug: "data-poisoning" },
};

// CRYSTAL_STEPS and PATHS are i18n-aware — see usage below

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : "en") as Locale;
  const prefix = `/${locale}`;
  const stats = loadSiteStats();
  const rules = loadAllRules();
  const categories = getCategories(rules);

  const NUMBERS = [
    { value: stats.ruleCount, unit: "rules", desc: `Across ${stats.categoryCount} threat categories. Each mapped to real CVEs and OWASP standards.` },
    { value: stats.pintPrecision, unit: "%", desc: `Precision on ${stats.pintSamples} adversarial samples. External PINT benchmark.`, suffix: "%" },
    { value: 5, unit: "ms", desc: "99% of events resolve at Tier 0-2. Zero API cost.", prefix: "<" },
    { value: stats.megaScanTotal, unit: "skills", desc: `Scanned across OpenClaw + Skills.sh. ${stats.megaScanCritical.toLocaleString()} CRITICAL. ${stats.megaScanHigh.toLocaleString()} HIGH.`, useComma: true },
    { value: 10, unit: "/10", desc: "OWASP Agentic Top 10 categories fully covered." },
    { value: 91.8, unit: "%", desc: "SAFE-MCP technique coverage. 78 of 85.", suffix: "%" },
  ];

  const STANDARDS = [
    { name: "OWASP Agentic Top 10", score: 10, suffix: "/10", detail: "Full category coverage" },
    { name: "SAFE-MCP (OpenSSF)", score: 91.8, suffix: "%", detail: "78 of 85 techniques" },
    { name: "OWASP Skills Top 10", score: 7, suffix: "/10", detail: "3 are process-level gaps" },
    { name: "PINT Benchmark", score: stats.pintF1, suffix: "", detail: `F1 on ${stats.pintSamples} external samples` },
  ];

  const mergedCount = stats.ecosystemIntegrations.filter((e) => e.type === "merged").length;
  const openCount = stats.ecosystemIntegrations.filter((e) => e.type === "open").length;

  return (
    <>
      {/* Scene 1: The Shift */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 relative">
        <HeroEntrance delay={0.3}>
          <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 mx-auto mb-10">
            <path d="M20 0L40 36H30L20 18L10 36H0L20 0Z" fill="#0B0B0F" />
            <line x1="6" y1="28" x2="34" y2="28" stroke="#0B0B0F" strokeWidth="1.5" />
            <line x1="8" y1="31" x2="32" y2="31" stroke="#0B0B0F" strokeWidth="1.2" />
            <line x1="10" y1="34" x2="30" y2="34" stroke="#0B0B0F" strokeWidth="1" />
          </svg>
        </HeroEntrance>

        <HeroEntrance delay={0.6}>
          <h1 className="font-display text-[clamp(36px,6vw,76px)] font-black leading-[1.08] tracking-[-3px] max-w-[850px]">
            <span className="text-stone">{t(locale, "hero.past")}</span>
            <br />
            <span className="text-ink">{t(locale, "hero.now")}</span>
          </h1>
        </HeroEntrance>

        <HeroEntrance delay={1.0} className="mt-8">
          <div className="flex gap-12 justify-center font-data">
            <div className="text-center">
              <div className="text-[28px] font-bold text-ink"><CountUp target={stats.ruleCount} /></div>
              <div className="text-[10px] text-stone uppercase tracking-[2px] mt-1.5">{t(locale, "hero.stat.rules")}</div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-bold text-ink"><CountUp target={stats.categoryCount} /></div>
              <div className="text-[10px] text-stone uppercase tracking-[2px] mt-1.5">{t(locale, "hero.stat.categories")}</div>
            </div>
            <div className="text-center">
              <div className="text-[28px] font-bold text-ink"><CountUp target={stats.pintPrecision} suffix="%" /></div>
              <div className="text-[10px] text-stone uppercase tracking-[2px] mt-1.5">{t(locale, "hero.stat.precision")}</div>
            </div>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.4} className="mt-8">
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`${prefix}/integrate`} className="bg-blue text-white px-9 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-colors">
              {t(locale, "hero.cta.primary")}
            </Link>
            <Link href={`${prefix}/rules`} className="text-ink px-9 py-3.5 rounded-sm text-[15px] font-medium border-[1.5px] border-fog hover:border-stone transition-colors">
              {t(locale, "hero.cta.secondary")}
            </Link>
          </div>
        </HeroEntrance>

        <HeroEntrance delay={1.7} className="mt-5">
          <p className="text-sm text-mist">{t(locale, "hero.sub")}</p>
        </HeroEntrance>

        <HeroEntrance delay={1.9} className="absolute bottom-8">
          <div className="flex flex-col items-center gap-2">
            <span className="font-data text-[10px] text-mist tracking-[3px] uppercase">scroll</span>
            <div className="w-px h-6 bg-fog relative overflow-hidden">
              <div className="absolute left-0 w-px h-6 bg-stone" style={{ animation: "scrollDown 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </HeroEntrance>
      </section>

      {/* Scene 2: The Threat */}
      <section className="min-h-[70vh] flex flex-col justify-center px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-[clamp(100px,18vw,240px)] font-bold text-critical/[0.07] leading-[0.85] mb-4">30</div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-6">MCP vulnerabilities in 60 days</div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[clamp(18px,2.5vw,28px)] font-light leading-[1.5] text-graphite max-w-[640px]">
            AI agents now browse the web, execute code, and call external tools. Attackers trick them into{" "}
            <strong className="font-semibold text-critical">leaking credentials</strong>,{" "}
            <strong className="font-semibold text-critical">running reverse shells</strong>, and{" "}
            <strong className="font-semibold text-critical">ignoring safety boundaries</strong>.
            The attack surface grows faster than any team can write rules by hand.
          </p>
        </Reveal>
      </section>

      <SpeedLines />

      {/* Scene 3: The Numbers */}
      <section className="min-h-screen flex flex-col justify-center bg-ash px-[max(24px,10vw)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-paper">
          {NUMBERS.map((n, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-ash p-8 md:p-12">
                <div className="font-data text-[clamp(32px,4.5vw,56px)] font-bold text-ink leading-none">
                  <CountUp target={n.value} suffix={n.suffix} prefix={n.prefix} useComma={n.useComma} />
                  <span className="text-[0.4em] font-normal text-stone ml-1">{n.unit}</span>
                </div>
                <p className="mt-3 text-[13px] text-stone leading-[1.5] max-w-[260px]">{n.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Scene 4: Categories */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">{t(locale, "categories.label")}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-2px] mb-3">
            {t(locale, "categories.heading", { categories: String(stats.categoryCount), rules: String(stats.ruleCount) })}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base text-stone font-light mb-8">{t(locale, "categories.sub")}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-fog">
            {categories.map((cat) => {
              const info = CATEGORY_DESCS[cat.name] ?? { desc: "", slug: cat.name };
              const displayName = cat.name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
              return (
                <Link key={cat.name} href={`${prefix}/rules?category=${info.slug}`} className="bg-paper p-6 hover:bg-ash transition-colors">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-display text-[15px] font-semibold">{displayName}</span>
                    <span className="font-data text-xs text-blue font-medium">{cat.count}</span>
                  </div>
                  <p className="text-[13px] text-stone leading-[1.5]">{info.desc}</p>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      <SpeedLines />

      {/* Scene 5: The Proof */}
      <section className="min-h-[70vh] flex flex-col justify-center px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs text-stone tracking-[3px] uppercase mb-6">{t(locale, "proof.label")}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(28px,4.5vw,52px)] font-extrabold tracking-[-2px] max-w-[750px] leading-[1.15]">
            <span className="text-blue">{t(locale, "proof.heading.pre")}</span>{t(locale, "proof.heading.post")}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-5 text-base text-stone font-light max-w-[520px] leading-[1.7]">
            {t(locale, "proof.body")}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a href="https://github.com/cisco/ai-defense/pull/79" target="_blank" rel="noopener noreferrer" className="inline-block mt-5 font-data text-[13px] text-blue hover:underline tracking-wide">
            {t(locale, "proof.link")} &rarr;
          </a>
        </Reveal>
      </section>

      {/* Scene 6: Standards */}
      <section className="min-h-[60vh] flex flex-col justify-center bg-ash px-[max(24px,10vw)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper">
          {STANDARDS.map((std, i) => (
            <Reveal key={std.name} delay={i * 0.1}>
              <div className="bg-ash py-12 px-7 text-center">
                <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-4">{std.name}</div>
                <div className="font-data text-[clamp(28px,3.5vw,48px)] font-bold text-ink">
                  <CountUp target={std.score} suffix={std.suffix} />
                </div>
                <div className="mt-2 text-xs text-stone">{std.detail}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Scene 6.5: Ecosystem Integrations */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">{t(locale, "ecosystem.label")}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-2px] mb-2">
            {t(locale, "ecosystem.heading", { merged: String(mergedCount), open: String(openCount), total: String(stats.ecosystemIntegrations.length) })}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base text-stone font-light mb-8">
            {t(locale, "ecosystem.sub")}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-fog">
            {stats.ecosystemIntegrations.map((eco) => (
              <div key={eco.name} className="bg-paper p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${eco.type === "merged" ? "bg-green" : "bg-medium"}`} />
                  <span className="font-display text-sm font-semibold">{eco.name}</span>
                  <span className="font-data text-[10px] text-stone uppercase tracking-wider ml-auto">
                    {eco.type}
                  </span>
                </div>
                <p className="text-[12px] text-stone leading-[1.5]">{eco.detail}</p>
                {eco.url && (
                  <a href={eco.url} target="_blank" rel="noopener noreferrer" className="font-data text-[11px] text-blue hover:underline mt-1 inline-block">
                    View PR &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Scene 6.7: Scan Data */}
      <section className="py-12 bg-ash px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">{t(locale, "scan.label")}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-paper">
            <div className="bg-ash p-6 text-center">
              <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">{t(locale, "scan.mega")}</div>
              <div className="font-data text-[clamp(24px,3vw,40px)] font-bold text-ink">
                <CountUp target={stats.megaScanTotal} useComma />
              </div>
              <div className="text-xs text-stone mt-1">{t(locale, "scan.skills_scanned")}</div>
            </div>
            <div className="bg-ash p-6 text-center">
              <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">{t(locale, "scan.threats")}</div>
              <div className="font-data text-[clamp(24px,3vw,40px)] font-bold text-critical">
                <CountUp target={stats.megaScanFlagged} useComma />
              </div>
              <div className="text-xs text-stone mt-1">{t(locale, "scan.flagged")} ({((stats.megaScanFlagged / stats.megaScanTotal) * 100).toFixed(1)}%)</div>
            </div>
            <div className="bg-ash p-6 text-center">
              <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">{t(locale, "scan.sources")}</div>
              <div className="font-data text-sm text-ink leading-relaxed">
                OpenClaw: {stats.megaScanSources.openclaw.toLocaleString()}<br />
                Skills.sh: {stats.megaScanSources.skillsSh.toLocaleString()}
              </div>
            </div>
            <div className="bg-ash p-6 text-center">
              <div className="font-data text-[11px] text-stone tracking-[2px] uppercase mb-3">{t(locale, "scan.latency")}</div>
              <div className="font-data text-[clamp(24px,3vw,40px)] font-bold text-ink">
                <CountUp target={stats.skillAvgLatency} suffix="ms" />
              </div>
              <div className="text-xs text-stone mt-1">{t(locale, "scan.per_skill")}</div>
            </div>
          </div>
        </Reveal>
      </section>

      <SpeedLines />

      {/* Scene 6.8: Why ATR (Comparison) */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">{t(locale, "compare.label")}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-2px] mb-2">
            {t(locale, "compare.heading")}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base text-stone font-light mb-8">{t(locale, "compare.sub")}</p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="border border-fog overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ash border-b border-fog">
                  <th className="px-5 py-3 text-left font-data text-[11px] text-stone uppercase tracking-wider font-semibold w-[180px]"></th>
                  <th className="px-5 py-3 text-left font-data text-[11px] text-blue uppercase tracking-wider font-semibold">ATR</th>
                  <th className="px-5 py-3 text-left font-data text-[11px] text-stone uppercase tracking-wider font-semibold">{locale === "zh" ? "自己寫規則" : "Write Your Own"}</th>
                  <th className="px-5 py-3 text-left font-data text-[11px] text-stone uppercase tracking-wider font-semibold">Sigma</th>
                  <th className="px-5 py-3 text-left font-data text-[11px] text-stone uppercase tracking-wider font-semibold">MS Agent Governance</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {[
                  [locale === "zh" ? "威脅模型" : "Threat model", "AI agent runtime + skill supply chain", locale === "zh" ? "你定義" : "You define", "SIEM logs (network/endpoint)", "Policy engine (allow/deny)"],
                  [locale === "zh" ? "偵測方法" : "Detection", "Regex + behavioral + LLM-as-judge", locale === "zh" ? "你的方法" : "Your approach", "Log correlation", locale === "zh" ? "Policy 評估" : "Policy evaluation"],
                  [locale === "zh" ? "新攻擊反應" : "New attack response", locale === "zh" ? "< 1 小時 (結晶)" : "< 1 hour (crystallization)", locale === "zh" ? "看你的團隊" : "Depends on team", locale === "zh" ? "社群 PR" : "Community PR", locale === "zh" ? "需自己寫 policy" : "Write policy yourself"],
                  [locale === "zh" ? "維護成本" : "Maintenance", locale === "zh" ? "社群維護，零成本" : "Community-maintained, zero cost", locale === "zh" ? "全部你負責" : "All on you", locale === "zh" ? "社群維護" : "Community", locale === "zh" ? "Microsoft 維護" : "Microsoft-maintained"],
                  ["OWASP", "10/10 Agentic + 7/10 AST10", "--", "--", "10/10 Agentic"],
                  [locale === "zh" ? "關係" : "Relationship", "--", "--", locale === "zh" ? "互補（不同威脅面）" : "Complementary (different threat surface)", locale === "zh" ? "互補（ATR 偵測 + MS 執行）" : "Complementary (ATR detects, MS enforces)"],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-fog last:border-b-0">
                    <td className="px-5 py-3 font-semibold text-ink">{row[0]}</td>
                    <td className="px-5 py-3 text-ink font-medium">{row[1]}</td>
                    <td className="px-5 py-3 text-stone">{row[2]}</td>
                    <td className="px-5 py-3 text-stone">{row[3]}</td>
                    <td className="px-5 py-3 text-stone">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <p className="mt-4 text-[13px] text-stone">
            {locale === "zh"
              ? "Sigma 偵測 SIEM log。ATR 偵測 AI agent runtime。Microsoft 執行 policy。三者互補，不競爭。ATR 是偵測層 — 其他工具可以消費 ATR 的規則作為上游。"
              : "Sigma detects SIEM logs. ATR detects AI agent runtime threats. Microsoft enforces policies. These are complementary, not competing. ATR is the detection layer \u2014 other tools consume ATR rules as upstream."}
          </p>
        </Reveal>
      </section>

      <SpeedLines />

      {/* Scene 7: The Future */}
      <section className="py-16 md:py-20 px-[max(24px,10vw)]">
        <Reveal>
          <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-4">{t(locale, "future.label")}</div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-extrabold tracking-[-2px] mb-3">
            {t(locale, "future.heading")}
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-base text-stone font-light mb-8">{t(locale, "future.sub")}</p>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Reveal delay={0.3}>
            <div className="bg-ash border border-fog p-7 font-data text-[13px] leading-[2.2] text-graphite">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  {i > 1 && <div className="text-mist text-center pl-6 py-0.5">|</div>}
                  <div className="flex items-center gap-3">
                    <span className="text-blue font-bold">{i}.</span>
                    <span>{t(locale, `crystal.${i}`)}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] text-stone leading-[1.6]">
              {t(locale, "future.note")}
            </p>
          </Reveal>
          <div>
            {(["01", "02", "03", "04"] as const).map((num, i) => (
              <Reveal key={num} delay={0.3 + i * 0.1}>
                <div className={`py-5 ${i < 3 ? "border-b border-fog" : ""}`}>
                  <div className="font-data text-xs text-blue font-bold mb-1">{num}</div>
                  <div className="font-display text-[15px] font-semibold mb-1">{t(locale, `path.${num}.title`)}</div>
                  <p className="text-[13px] text-stone leading-[1.5]">{t(locale, `path.${num}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SpeedLines />

      {/* Scene 8: CTA */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Reveal>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] font-black tracking-[-3px] mb-4">{t(locale, "cta.heading")}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-base text-stone font-light mb-10 leading-[1.7] whitespace-pre-line">
            {t(locale, "cta.sub")}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`${prefix}/integrate`} className="bg-blue text-white px-9 py-3.5 rounded-sm text-[15px] font-semibold hover:bg-blue-hover transition-colors">
              {t(locale, "cta.primary")}
            </Link>
            <Link href={`${prefix}/rules`} className="text-ink px-9 py-3.5 rounded-sm text-[15px] font-medium border-[1.5px] border-fog hover:border-stone transition-colors">
              {t(locale, "cta.secondary")}
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-8 font-data text-sm text-stone bg-ash border border-fog px-7 py-3.5 inline-block">
            $ <span className="text-ink">npm install agent-threat-rules</span>
          </div>
        </Reveal>
      </section>
    </>
  );
}
