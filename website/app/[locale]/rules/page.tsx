import { loadAllRules, getCategories } from "@/lib/rules";
import { RuleExplorer } from "./RuleExplorer";
import { locales, t, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Rules - ATR",
  description: "Browse all ATR detection rules. Filter by category, severity, and search by name or CVE.",
};

export default async function RulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const rules = loadAllRules();
  const categories = getCategories(rules);

  return (
    <div className="pt-20 pb-16 px-6 max-w-[1120px] mx-auto">
      <div className="mb-8">
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">
          {t(locale, "rules.label")}
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {t(locale, "rules.heading", { count: String(rules.length) })}
        </h1>
        <p className="text-base text-stone font-light">
          {t(locale, "rules.sub")}
        </p>
      </div>

      <RuleExplorer rules={rules} categories={categories} locale={locale} />
    </div>
  );
}
