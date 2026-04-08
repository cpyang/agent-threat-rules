"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface Contributor {
  github: string;
  country: string;
  role: "maintainer" | "contributor" | "reporter";
  contributions: string[];
}

interface CountryStats {
  code: string;
  flag: string;
  count: number;
  contributions: number;
}

interface Integration {
  name: string;
  type: "merged" | "open" | "using";
  detail: string;
  url?: string;
  logo?: string;
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const COUNTRY_NAMES: Record<string, { en: string; zh: string }> = {
  TW: { en: "Taiwan", zh: "台灣" },
  US: { en: "United States", zh: "美國" },
  DE: { en: "Germany", zh: "德國" },
  JP: { en: "Japan", zh: "日本" },
  IN: { en: "India", zh: "印度" },
  GB: { en: "United Kingdom", zh: "英國" },
  FR: { en: "France", zh: "法國" },
  KR: { en: "South Korea", zh: "韓國" },
  BR: { en: "Brazil", zh: "巴西" },
  CA: { en: "Canada", zh: "加拿大" },
  AU: { en: "Australia", zh: "澳洲" },
  SG: { en: "Singapore", zh: "新加坡" },
  IL: { en: "Israel", zh: "以色列" },
  NL: { en: "Netherlands", zh: "荷蘭" },
  SE: { en: "Sweden", zh: "瑞典" },
  CN: { en: "China", zh: "中國" },
};

function scaleSize(value: number, max: number, minPx: number, maxPx: number): number {
  const ratio = Math.min(value / Math.max(max, 1), 1);
  const eased = Math.pow(ratio, 0.5);
  return minPx + (maxPx - minPx) * eased;
}

export function CommunityWall({
  contributors,
  countries,
  integrations,
  locale = "en",
}: {
  contributors: Contributor[];
  countries: CountryStats[];
  integrations: Integration[];
  locale?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const zh = locale === "zh";

  const merged = integrations.filter((i) => i.type === "merged");
  const open = integrations.filter((i) => i.type === "open");
  const maxContributions = Math.max(...countries.map((c) => c.contributions), 1);

  return (
    <div ref={ref}>
      {/* Combined wall: flags + ecosystem logos, all sized by contribution */}
      <div className="flex flex-wrap items-end justify-center gap-4 md:gap-6">
        {/* Country flags — sized by contribution, hover shows details */}
        {countries.map((country, i) => {
          const size = scaleSize(country.contributions, maxContributions, 1.5, 4);
          const name = COUNTRY_NAMES[country.code]?.[zh ? "zh" : "en"] ?? country.code;
          const countryContributors = contributors.filter((c) => c.country === country.code);
          return (
            <motion.div
              key={`flag-${country.code}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              className="flex flex-col items-center group relative cursor-default"
            >
              <span style={{ fontSize: `${size}rem`, lineHeight: 1 }}>
                {country.flag}
              </span>
              <span className="font-data text-xs text-mist mt-1">{country.contributions}</span>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-ink text-white px-4 py-3 rounded-sm text-left whitespace-nowrap shadow-lg">
                  <div className="font-display text-sm font-semibold mb-1">{name}</div>
                  <div className="font-data text-xs text-[#A0A0B0] mb-2">
                    {country.count} {zh ? "位貢獻者" : (country.count === 1 ? "contributor" : "contributors")} · {country.contributions} {zh ? "項貢獻" : "contributions"}
                  </div>
                  {countryContributors.map((c) => (
                    <div key={c.github} className="flex items-center gap-2 mt-1.5">
                      <img
                        src={`https://github.com/${c.github}.png?size=32`}
                        alt={c.github}
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
                      <span className="font-data text-xs">@{c.github}</span>
                      <span className="font-data text-xs text-[#6B6B76]">{c.role}</span>
                    </div>
                  ))}
                </div>
                {/* Arrow */}
                <div className="w-2 h-2 bg-ink rotate-45 mx-auto -mt-1" />
              </div>
            </motion.div>
          );
        })}

        {/* Ecosystem logos — merged projects */}
        {merged.map((item, i) => {
          // Use a weight based on detail text (extract number of rules if present)
          const rulesMatch = item.detail.match(/(\d+)\s*ATR\s*rules/i);
          const weight = rulesMatch ? parseInt(rulesMatch[1], 10) : 5;
          const maxWeight = 34; // Cisco has 34
          const size = scaleSize(weight, maxWeight, 36, 72);
          return (
            <motion.a
              key={`eco-${item.name}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.5,
                delay: countries.length * 0.1 + i * 0.1,
                ease: EASE,
              }}
              className="flex flex-col items-center group"
              title={`${item.name}: ${item.detail}`}
            >
              {item.logo ? (
                <img
                  src={item.logo}
                  alt={item.name}
                  style={{ width: `${size}px`, height: `${size}px` }}
                  className="rounded-sm ring-1 ring-fog group-hover:ring-blue transition-all"
                />
              ) : (
                <div
                  style={{ width: `${size}px`, height: `${size}px` }}
                  className="bg-ash rounded-sm ring-1 ring-fog flex items-center justify-center font-data text-xs text-stone"
                >
                  {item.name.slice(0, 2)}
                </div>
              )}
              <span className="font-data text-xs text-mist mt-1 group-hover:text-blue transition-colors max-w-[80px] text-center truncate">
                {item.name.split(" ")[0]}
              </span>
            </motion.a>
          );
        })}
      </div>

      {/* Under review — compact */}
      {open.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="font-data text-xs text-mist tracking-[1px] mr-2">
            {zh ? "審查中" : "Under review"}:
          </span>
          {open.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-data text-xs text-stone border border-fog px-2 py-1 hover:border-stone hover:text-ink transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
      )}

      {/* Contributor avatars */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {contributors.map((c, i) => (
          <motion.a
            key={c.github}
            href={`https://github.com/${c.github}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.08, ease: EASE }}
            className="group relative"
            title={`@${c.github} (${c.role})`}
          >
            <img
              src={`https://github.com/${c.github}.png?size=64`}
              alt={c.github}
              width={44}
              height={44}
              className={`rounded-sm ${
                c.role === "maintainer" ? "ring-2 ring-blue" : "ring-1 ring-fog"
              } group-hover:ring-ink transition-all`}
            />
            <span className="absolute -bottom-1 -right-1 text-xs leading-none">
              {countries.find((co) => co.code === c.country)?.flag}
            </span>
          </motion.a>
        ))}
      </div>

      {/* Stats + CTA */}
      <div className="text-center mt-6">
        <span className="font-data text-xs text-stone tracking-[1px]">
          {contributors.length} {zh ? "位貢獻者" : "contributors"} · {countries.length}{" "}
          {zh ? "個國家" : "countries"} · {merged.length}{" "}
          {zh ? "個整合" : "integrations"}
        </span>
      </div>
      <div className="text-center mt-3">
        <a
          href="https://github.com/Agent-Threat-Rule/agent-threat-rules/issues/new?template=add-contributor.md&title=Add+contributor:+MY_GITHUB_USERNAME"
          target="_blank"
          rel="noopener noreferrer"
          className="font-data text-xs text-blue hover:underline tracking-wide"
        >
          {zh ? "加入社群 →" : "Join the community →"}
        </a>
      </div>
    </div>
  );
}
