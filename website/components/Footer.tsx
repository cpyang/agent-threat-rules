import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const prefix = `/${locale}`;

  return (
    <footer className="py-12 px-6 text-center border-t border-fog">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
          GitHub
        </a>
        <a href="https://www.npmjs.com/package/agent-threat-rules" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
          npm
        </a>
        <a href="https://doi.org/10.5281/zenodo.19178002" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
          Paper
        </a>
        <Link href={`${prefix}/coverage`} className="text-sm text-stone hover:text-ink transition-colors">
          Coverage
        </Link>
        <Link href={`${prefix}/contribute`} className="text-sm text-stone hover:text-ink transition-colors">
          Contribute
        </Link>
      </div>
      <p className="mt-4 text-xs text-mist tracking-wide">
        {t(locale, "footer.note")}
      </p>
    </footer>
  );
}
