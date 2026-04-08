import { Reveal } from "@/components/Reveal";
import { loadSiteStats } from "@/lib/stats";
import { locales, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Ecosystem — ATR Integrations",
  description: "Projects and platforms that integrate ATR detection rules. Add your project.",
};

export default async function EcosystemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const zh = locale === "zh";
  const stats = loadSiteStats();

  const merged = stats.ecosystemIntegrations.filter((i) => i.type === "merged");
  const open = stats.ecosystemIntegrations.filter((i) => i.type === "open");

  return (
    <div className="pt-20 pb-16 px-6 max-w-[1120px] mx-auto">
      {/* Header */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">
          {zh ? "生態系" : "Ecosystem"}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {zh ? "正在使用 ATR 的專案。" : "Projects shipping ATR."}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base text-stone font-light mb-10 max-w-[560px]">
          {zh
            ? "整合 ATR 規則的專案會出現在這面牆上。Merge PR 就上牆。"
            : "Projects that integrate ATR rules appear on this wall. Merge a PR to get listed."}
        </p>
      </Reveal>

      {/* Integrated — full cards */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[2px] uppercase mb-4">
          {zh ? `已整合 (${merged.length})` : `Integrated (${merged.length})`}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 gap-px bg-fog mb-10">
          {merged.map((item) => (
            <div key={item.name} className="bg-paper p-6 md:p-8">
              <div className="flex items-start gap-4">
                {item.logo && (
                  <img
                    src={item.logo}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-sm ring-1 ring-fog shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <h2 className="font-display text-lg font-semibold text-ink">{item.name}</h2>
                    <span className="font-data text-xs text-green bg-green/10 px-2 py-0.5 rounded-sm uppercase">
                      {zh ? "已整合" : "integrated"}
                    </span>
                  </div>
                  <p className="text-sm text-stone mb-3">{item.detail}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-data text-xs text-blue hover:underline"
                    >
                      {zh ? "查看 PR →" : "View PR →"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Under review */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[2px] uppercase mb-4">
          {zh ? `審查中 (${open.length})` : `Under Review (${open.length})`}
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog mb-10">
          {open.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-paper px-5 py-4 hover:bg-ash/50 transition-colors"
            >
              <div className="font-display text-sm font-semibold text-ink mb-1">{item.name}</div>
              <p className="text-xs text-stone">{item.detail}</p>
            </a>
          ))}
        </div>
      </Reveal>

      {/* Badge */}
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[2px] uppercase mb-4">
          {zh ? "徽章" : "Badge"}
        </div>
        <p className="text-sm text-stone mb-4 max-w-[480px]">
          {zh
            ? "你的專案整合了 ATR？把這個徽章加到你的 README。"
            : "Your project integrates ATR? Add this badge to your README."}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="border border-fog p-6">
          {/* Badge preview */}
          <div className="mb-4">
            <img
              src="https://img.shields.io/badge/ATR-Integrated-2563EB?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCAzNiIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMCAwTDQwIDM2SDMwTDIwIDE4TDEwIDM2SDBMMjAgMFoiLz48L3N2Zz4=&logoColor=white"
              alt="ATR Integrated"
              className="h-6"
            />
          </div>

          {/* Markdown code */}
          <div className="font-data text-xs text-stone mb-2">{zh ? "Markdown:" : "Markdown:"}</div>
          <div className="bg-ash border border-fog px-4 py-3 font-data text-xs text-ink overflow-x-auto">
            [![ATR Integrated](https://img.shields.io/badge/ATR-Integrated-2563EB?style=flat)](https://agentthreatrule.org/ecosystem)
          </div>

          <div className="font-data text-xs text-stone mt-4 mb-2">HTML:</div>
          <div className="bg-ash border border-fog px-4 py-3 font-data text-xs text-ink overflow-x-auto">
            {'<a href="https://agentthreatrule.org/ecosystem"><img src="https://img.shields.io/badge/ATR-Integrated-2563EB?style=flat" alt="ATR Integrated" /></a>'}
          </div>
        </div>
      </Reveal>

      {/* Add your project CTA */}
      <Reveal>
        <div className="mt-10 border border-blue/20 bg-blue/[0.03] px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-display text-sm font-semibold text-ink mb-1">
              {zh ? "把你的專案加上來" : "Add your project"}
            </div>
            <p className="text-sm text-stone">
              {zh
                ? "整合 ATR 規則並提 PR — merge 後就會出現在牆上。"
                : "Integrate ATR rules and submit a PR — you'll appear on the wall after merge."}
            </p>
          </div>
          <a
            href="https://github.com/Agent-Threat-Rule/agent-threat-rules/issues/new?title=Ecosystem+integration:+PROJECT_NAME&body=We+integrated+ATR+rules+in+our+project.%0A%0AProject:+%0APR:+%0ARules+used:+"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue text-white px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-blue-hover transition-colors shrink-0"
          >
            {zh ? "提交 →" : "Submit →"}
          </a>
        </div>
      </Reveal>
    </div>
  );
}
