"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function Nav({ locale }: { locale: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
      setAtTop(window.scrollY < window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  const prefix = `/${locale}`;
  const otherLocale = locale === "en" ? "zh" : "en";
  const pages = ["rules", "coverage", "integrate", "contribute", "research"] as const;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-500 ${
          atTop
            ? "bg-transparent border-b border-transparent"
            : "bg-paper/92 backdrop-blur-md border-b border-fog"
        } ${scrolled && !atTop ? "shadow-[0_1px_8px_rgba(0,0,0,0.04)]" : ""}`}
      >
        <Link href={prefix} className="flex items-center gap-3">
          <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7">
            <path d="M20 0L40 36H30L20 18L10 36H0L20 0Z" fill={atTop ? "#FAFAF8" : "#0B0B0F"} className="transition-[fill] duration-500" />
            <line x1="6" y1="28" x2="34" y2="28" stroke={atTop ? "#FAFAF8" : "#0B0B0F"} strokeWidth="1.5" className="transition-[stroke] duration-500" />
            <line x1="8" y1="31" x2="32" y2="31" stroke={atTop ? "#FAFAF8" : "#0B0B0F"} strokeWidth="1.2" className="transition-[stroke] duration-500" />
            <line x1="10" y1="34" x2="30" y2="34" stroke={atTop ? "#FAFAF8" : "#0B0B0F"} strokeWidth="1" className="transition-[stroke] duration-500" />
          </svg>
          <span className={`font-data text-sm font-bold tracking-widest transition-colors duration-500 ${atTop ? "text-white" : "text-ink"}`}>ATR</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {pages.map((page) => {
            const isActive = pathname === `${prefix}/${page}`;
            return (
              <Link
                key={page}
                href={`${prefix}/${page}`}
                className={`text-sm font-medium transition-colors duration-500 ${
                  isActive
                    ? (atTop ? "text-white" : "text-ink")
                    : (atTop ? "text-[#808089] hover:text-white" : "text-stone hover:text-ink")
                }`}
              >
                {t(locale, `nav.${page}`)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${otherLocale}`}
            className={`font-data text-xs transition-colors duration-500 tracking-wide ${atTop ? "text-[#808089] hover:text-white" : "text-stone hover:text-ink"}`}
            aria-label={otherLocale === "zh" ? "Switch to Chinese" : "Switch to English"}
          >
            {otherLocale === "zh" ? "ZH" : "EN"}
          </Link>
          <Link
            href={`${prefix}/integrate`}
            className="bg-blue text-white px-5 py-2 rounded-sm text-sm font-semibold hover:bg-blue-hover transition-colors hidden sm:inline-block"
          >
            {t(locale, "nav.cta")}
          </Link>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px transition-all duration-300 ${atTop ? "bg-white" : "bg-ink"} ${menuOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
            <span className={`block w-5 h-px transition-all duration-300 ${atTop ? "bg-white" : "bg-ink"} ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-px transition-all duration-300 ${atTop ? "bg-white" : "bg-ink"} ${menuOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/10" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-16 right-0 w-64 bg-paper border-l border-fog shadow-lg p-6 flex flex-col gap-4">
            {pages.map((page) => (
              <Link
                key={page}
                href={`${prefix}/${page}`}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-ink py-2 border-b border-fog"
              >
                {t(locale, `nav.${page}`)}
              </Link>
            ))}
            <Link
              href={`${prefix}/integrate`}
              onClick={() => setMenuOpen(false)}
              className="bg-blue text-white px-5 py-3 rounded-sm text-sm font-semibold text-center mt-2"
            >
              {t(locale, "nav.cta")}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
