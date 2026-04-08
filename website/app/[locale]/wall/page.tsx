import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { PledgeWall } from "@/components/PledgeWall";
import { loadContributors, getCountryStats } from "@/lib/contributors";
import { locales, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Wall — ATR Community",
  description: "ATR contributors by country. Sign the pledge. Protect AI agents.",
};

export default async function WallPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const zh = locale === "zh";
  const contributors = loadContributors();
  const countries = getCountryStats(contributors);
  const maxContributions = Math.max(...countries.map((c) => c.contributions), 1);

  const COUNTRY_NAMES: Record<string, string> = {
    TW: zh ? "台灣" : "Taiwan",
    US: zh ? "美國" : "United States",
    DE: zh ? "德國" : "Germany",
    JP: zh ? "日本" : "Japan",
    IN: zh ? "印度" : "India",
    GB: zh ? "英國" : "United Kingdom",
    FR: zh ? "法國" : "France",
    KR: zh ? "韓國" : "South Korea",
    BR: zh ? "巴西" : "Brazil",
    CA: zh ? "加拿大" : "Canada",
    AU: zh ? "澳洲" : "Australia",
    SG: zh ? "新加坡" : "Singapore",
    IL: zh ? "以色列" : "Israel",
    CN: zh ? "中國" : "China",
  };

  return (
    <div className="pt-20 pb-16 px-6 max-w-[1120px] mx-auto">
      {/* Header */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">
          {zh ? "社群" : "Community"}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {zh ? "保護 AI Agent 的人。" : "The people protecting AI agents."}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base text-stone font-light mb-10 max-w-[560px]">
          {zh
            ? "每個貢獻都讓你的國家在這面牆上更大。加入我們。"
            : "Every contribution makes your country bigger on this wall. Join us."}
        </p>
      </Reveal>

      {/* Stats bar */}
      <Reveal delay={0.3}>
        <div className="grid grid-cols-3 gap-px bg-fog mb-10">
          <div className="bg-ash p-5 md:p-8 text-center">
            <div className="font-data text-[clamp(28px,4vw,48px)] font-bold text-ink">
              <CountUp target={contributors.length} />
            </div>
            <div className="font-data text-xs text-stone mt-1">{zh ? "貢獻者" : "contributors"}</div>
          </div>
          <div className="bg-ash p-5 md:p-8 text-center">
            <div className="font-data text-[clamp(28px,4vw,48px)] font-bold text-ink">
              <CountUp target={countries.length} />
            </div>
            <div className="font-data text-xs text-stone mt-1">{zh ? "國家" : "countries"}</div>
          </div>
          <div className="bg-ash p-5 md:p-8 text-center">
            <div className="font-data text-[clamp(28px,4vw,48px)] font-bold text-ink">
              <CountUp target={countries.reduce((sum, c) => sum + c.contributions, 0)} />
            </div>
            <div className="font-data text-xs text-stone mt-1">{zh ? "總貢獻" : "contributions"}</div>
          </div>
        </div>
      </Reveal>

      {/* Country leaderboard */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[2px] uppercase mb-4">
          {zh ? "國家排行榜" : "Country Leaderboard"}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="border border-fog divide-y divide-fog mb-10">
          {countries.map((country, i) => {
            const name = COUNTRY_NAMES[country.code] ?? country.code;
            const barWidth = Math.max((country.contributions / maxContributions) * 100, 8);
            const countryContributors = contributors.filter((c) => c.country === country.code);

            return (
              <div key={country.code} className="flex items-center gap-4 md:gap-6 px-5 md:px-6 py-4 md:py-5">
                {/* Rank */}
                <div className="font-data text-lg font-bold text-mist w-6 text-right shrink-0">
                  {i + 1}
                </div>

                {/* Flag */}
                <span className="text-3xl md:text-4xl leading-none shrink-0">{country.flag}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1.5">
                    <span className="font-display text-sm font-semibold text-ink">{name}</span>
                    <span className="font-data text-xs text-mist">
                      {country.count} {zh ? "人" : (country.count === 1 ? "contributor" : "contributors")}
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-2 bg-ash rounded-sm overflow-hidden mb-2">
                    <div className="h-full bg-blue rounded-sm" style={{ width: `${barWidth}%` }} />
                  </div>

                  {/* Avatars */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {countryContributors.map((c) => (
                      <a
                        key={c.github}
                        href={`https://github.com/${c.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-1"
                      >
                        <img
                          src={`https://github.com/${c.github}.png?size=32`}
                          alt={c.github}
                          width={20}
                          height={20}
                          className="rounded-sm ring-1 ring-fog group-hover:ring-blue transition-all"
                        />
                        <span className="font-data text-xs text-stone group-hover:text-ink transition-colors">
                          @{c.github}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Count */}
                <div className="text-right shrink-0">
                  <div className="font-data text-2xl font-bold text-ink">{country.contributions}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Add yourself CTA */}
      <Reveal>
        <div className="border border-blue/20 bg-blue/[0.03] px-6 py-5 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-display text-sm font-semibold text-ink mb-1">
              {zh ? "把自己加到牆上" : "Add yourself to the wall"}
            </div>
            <p className="text-sm text-stone">
              {zh
                ? "提一個 PR 加進 contributors.yaml — 你的國旗會變大。"
                : "Submit a PR to contributors.yaml — your country's flag gets bigger."}
            </p>
          </div>
          <a
            href="https://github.com/Agent-Threat-Rule/agent-threat-rules/issues/new?template=add-contributor.md&title=Add+contributor:+MY_GITHUB_USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue text-white px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-blue-hover transition-colors shrink-0"
          >
            {zh ? "加入 →" : "Join →"}
          </a>
        </div>
      </Reveal>

      {/* Pledge wall (giscus) */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[2px] uppercase mb-3">
          {zh ? "宣誓牆" : "The Pledge"}
        </div>
        <h2 className="font-display text-2xl font-extrabold tracking-[-1px] mb-2">
          {zh ? "我保護 AI Agent。" : "I protect AI agents."}
        </h2>
        <p className="text-sm text-stone mb-6 max-w-[480px]">
          {zh
            ? "簽名宣誓你對 AI agent 安全的承諾。用你的 GitHub 帳號。"
            : "Sign your commitment to AI agent security. Uses your GitHub account."}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <PledgeWall />
      </Reveal>
    </div>
  );
}
