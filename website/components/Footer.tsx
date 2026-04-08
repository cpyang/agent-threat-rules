import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { loadSiteStats } from "@/lib/stats";

export function Footer({ locale }: { locale: Locale }) {
  const prefix = `/${locale}`;
  const zh = locale === "zh";
  const stats = loadSiteStats();

  return (
    <footer className="border-t border-fog py-12 px-6">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Project */}
          <div>
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "專案" : "Project"}
            </div>
            <div className="flex flex-col gap-2">
              <Link href={`${prefix}/rules`} className="text-sm text-stone hover:text-ink transition-colors">
                Rules
              </Link>
              <Link href={`${prefix}/coverage`} className="text-sm text-stone hover:text-ink transition-colors">
                Coverage
              </Link>
              <Link href={`${prefix}/research`} className="text-sm text-stone hover:text-ink transition-colors">
                Research
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
                Integrate
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
                Contribute
              </Link>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                Governance
              </a>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/CONTRIBUTORS.md" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                Contributors
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
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                Security Policy
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="font-data text-xs text-stone tracking-[2px] uppercase mb-3">
              {zh ? "聯絡" : "Contact"}
            </div>
            <div className="flex flex-col gap-2">
              <a href="mailto:contact@agentthreatrule.org" className="text-sm text-stone hover:text-ink transition-colors">
                contact@agentthreatrule.org
              </a>
              <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-stone hover:text-ink transition-colors">
                {zh ? "回報問題" : "Report an Issue"}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-fog pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/atr-logo-black.png" alt="ATR" className="h-5 opacity-40" />
            <span className="text-xs text-mist">
              {t(locale, "footer.note")}
            </span>
          </div>
          <div className="flex items-center gap-4 font-data text-xs text-mist">
            <span>ATR v1.0 · {stats.ruleCount} {zh ? "條規則" : "rules"}</span>
            <span className="text-fog">|</span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
