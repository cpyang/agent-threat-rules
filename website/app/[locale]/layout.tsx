import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = (locales.includes(locale as Locale) ? locale : "en") as Locale;

  return (
    <>
      <Nav locale={lang} />
      <main className="flex-1">{children}</main>
      <Footer locale={lang} />
    </>
  );
}
