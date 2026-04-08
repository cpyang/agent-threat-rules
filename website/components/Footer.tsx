import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const prefix = `/${locale}`;
  const zh = locale === "zh";

  return (
    <footer className="border-t border-fog py-12 px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Project */}
          <div>
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "專案" : "Project"}
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`${prefix}/rules`} className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Rules" : "Rules"}
              </Link>
              <Link href={`${prefix}/coverage`} className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Coverage" : "Coverage"}
              </Link>
              <Link href={`${prefix}/research`} className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Research" : "Research"}
              </Link>
            </div>
          </div>

          {/* Developers */}
          <div>
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "開發者" : "Developers"}
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`${prefix}/integrate`} className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Integrate" : "Integrate"}
              </Link>
              <a href="https://www.npmjs.com/package/agent-threat-rules" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                npm
              </a>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                GitHub
              </a>
            </div>
          </div>

          {/* Community */}
          <div>
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "社群" : "Community"}
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`${prefix}/contribute`} className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Contribute" : "Contribute"}
              </Link>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Governance" : "Governance"}
              </a>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/CONTRIBUTORS.md" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "Contributors" : "Contributors"}
              </a>
            </div>
          </div>

          {/* Research */}
          <div>
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "研究" : "Research"}
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://doi.org/10.5281/zenodo.19178002" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                Paper (Zenodo)
              </a>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/LIMITATIONS.md" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                Limitations
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-fog pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5">
              <path d="M20 0L40 36H30L20 18L10 36H0L20 0Z" fill="#6B6B76" />
              <line x1="6" y1="28" x2="34" y2="28" stroke="#6B6B76" strokeWidth="1.5" />
              <line x1="8" y1="31" x2="32" y2="31" stroke="#6B6B76" strokeWidth="1.2" />
              <line x1="10" y1="34" x2="30" y2="34" stroke="#6B6B76" strokeWidth="1" />
            </svg>
            <span className="text-xs text-mist">
              {t(locale, "footer.note")}
            </span>
          </div>
          <span className="font-data text-xs text-mist">MIT License</span>
        </div>
      </div>
    </footer>
  );
}
