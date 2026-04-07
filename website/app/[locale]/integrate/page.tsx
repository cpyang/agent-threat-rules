import { Reveal } from "@/components/Reveal";
import { loadSiteStats } from "@/lib/stats";
import { locales, t, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Integrate - ATR",
  description: "Four integration paths for ATR: TypeScript, Python, raw YAML, or SIEM queries.",
};

const PATHS = [
  {
    title: "TypeScript / Node.js",
    cmd: "npm install agent-threat-rules",
    code: `import { createEngine } from 'agent-threat-rules';

const engine = createEngine();
const verdict = engine.evaluate({
  type: 'llm_input',
  content: userMessage,
  timestamp: new Date().toISOString(),
});

if (verdict.outcome === 'deny') {
  // Block the request
}`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules#quick-start",
  },
  {
    title: "Python (pyATR)",
    cmd: "cd python && pip install -e .",
    code: `from atr import ATREngine

engine = ATREngine()
result = engine.evaluate(event={
    "type": "llm_input",
    "content": user_message,
})

if result.outcome == "deny":
    # Block the request`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules/tree/main/python",
  },
  {
    title: "Raw YAML (any language)",
    cmd: "git submodule add https://github.com/Agent-Threat-Rule/agent-threat-rules.git",
    code: `# Point your scanner at rules/ directory
# Each .yaml file follows ATR schema v1.0
# Parse with any YAML library
# Schema: spec/atr-schema.yaml

rules/
  prompt-injection/    # 22 rules
  tool-poisoning/      # 11 rules
  agent-manipulation/  # 10 rules
  ...`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/ATR-FRAMEWORK-SPEC.md",
  },
  {
    title: "SIEM Integration",
    cmd: "atr convert splunk --output splunk-queries.txt",
    code: `# Convert ATR rules to SIEM query language
atr convert splunk    # Output SPL queries
atr convert elastic   # Output Elasticsearch Query DSL
atr convert sarif     # Output SARIF v2.1.0 for CI/CD`,
    doc: "https://github.com/Agent-Threat-Rule/agent-threat-rules#siem-integration",
  },
];

export default async function IntegratePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const stats = loadSiteStats();

  return (
    <div className="pt-20 pb-16 px-[max(24px,8vw)]">
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">{t(locale, "integrate.label")}</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {t(locale, "integrate.heading")}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base text-stone font-light mb-10">
          {t(locale, "integrate.ready", { count: String(stats.ruleCount) })}
        </p>
      </Reveal>

      <div className="space-y-8">
        {PATHS.map((path, i) => (
          <Reveal key={path.title} delay={0.1 * i}>
            <div className="border border-fog">
              <div className="flex items-center justify-between px-6 py-4 border-b border-fog bg-ash">
                <h2 className="font-display text-lg font-semibold">{path.title}</h2>
                <a href={path.doc} target="_blank" rel="noopener noreferrer" className="font-data text-xs text-blue hover:underline">
                  Docs &rarr;
                </a>
              </div>
              <div className="p-6">
                <div className="font-data text-sm text-stone bg-ash border border-fog px-4 py-3 mb-4">
                  $ <span className="text-ink">{path.cmd}</span>
                </div>
                <pre className="font-data text-[13px] text-graphite bg-ash border border-fog p-4 overflow-x-auto leading-relaxed">
                  {path.code}
                </pre>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Schema Stability & Upstream Guarantee */}
      <Reveal>
        <div className="mt-12 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.schema.title")}</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-graphite leading-relaxed mb-5">
              If you depend on ATR as upstream, you need to know the format won&apos;t break.
              Here&apos;s our commitment:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="font-display text-sm font-semibold mb-1">ATR Schema v1.0 (current)</div>
                  <p className="text-[13px] text-stone leading-[1.6]">
                    Published and stable. All new fields are optional additions. No existing field
                    will be removed or renamed without a major version bump.
                  </p>
                </div>
                <div>
                  <div className="font-display text-sm font-semibold mb-1">Backward Compatibility</div>
                  <p className="text-[13px] text-stone leading-[1.6]">
                    Breaking changes only happen on major version transitions (v1 &rarr; v2).
                    We provide migration guides and a minimum 6-month overlap period where both
                    versions are supported.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="font-display text-sm font-semibold mb-1">Update Frequency</div>
                  <p className="text-[13px] text-stone leading-[1.6]">
                    New rules are added continuously (avg 2-5 per week during active periods).
                    Every rule passes CI validation + precision test before merge. Subscribe to{" "}
                    <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/releases" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">GitHub Releases</a>{" "}
                    for changelogs.
                  </p>
                </div>
                <div>
                  <div className="font-display text-sm font-semibold mb-1">Sync Methods</div>
                  <div className="font-data text-[13px] text-stone leading-[1.8]">
                    <span className="text-ink">git submodule</span> &mdash; pin to tag, update on your schedule<br />
                    <span className="text-ink">npm install</span> &mdash; semver, lockfile controls version<br />
                    <span className="text-ink">GitHub Action</span> &mdash; CI scans with latest rules automatically
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Why ATR vs Internal Rules */}
      <Reveal>
        <div className="mt-8 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.why.title")}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-fog">
              {[
                { label: "Coverage", atr: `${stats.ruleCount} rules, 13 CVEs mapped, OWASP 10/10`, own: "You start from zero" },
                { label: "New attack response", atr: "< 1 hour via Threat Cloud crystallization", own: "Depends on your team's bandwidth" },
                { label: "Evasion testing", atr: "64 documented evasion techniques, tested on every PR", own: "You probably won't test this" },
                { label: "OWASP / MITRE mapping", atr: "Pre-built. 10/10 Agentic + MITRE ATLAS per rule", own: "Hours of manual mapping work" },
                { label: "Maintenance", atr: "Community-maintained. MIT. Zero cost.", own: "Full-time security engineer workload" },
                { label: "Ecosystem", atr: "Cisco, OWASP, OpenSSF already consuming", own: "Isolated. No shared intelligence." },
              ].map((row) => (
                <div key={row.label} className="bg-paper grid grid-cols-[140px_1fr_1fr] text-[13px]">
                  <div className="px-4 py-3 font-semibold text-ink border-r border-fog">{row.label}</div>
                  <div className="px-4 py-3 text-ink border-r border-fog">{row.atr}</div>
                  <div className="px-4 py-3 text-stone">{row.own}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-8 mt-3 text-[11px] font-data text-stone uppercase tracking-wider">
              <span>&nbsp;</span>
              <span className="ml-[140px] text-blue">ATR</span>
              <span className="ml-auto">Internal Rules</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* License */}
      <Reveal>
        <div className="mt-8 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.license.title")}</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px]">
              <div>
                <div className="font-display text-sm font-semibold mb-1">MIT License</div>
                <p className="text-stone leading-[1.6]">Use commercially, modify, distribute, sublicense. No restrictions.</p>
              </div>
              <div>
                <div className="font-display text-sm font-semibold mb-1">No CLA</div>
                <p className="text-stone leading-[1.6]">No Contributor License Agreement. Contributions are MIT-licensed and belong to the community.</p>
              </div>
              <div>
                <div className="font-display text-sm font-semibold mb-1">Vendor Neutral</div>
                <p className="text-stone leading-[1.6]">ATR is not owned by any company. It is a community-governed open standard.</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Cisco Case Study */}
      <Reveal>
        <div className="mt-12 border border-fog">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "integrate.cisco.title")}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-data text-3xl font-bold text-ink mb-1">34</div>
              <div className="text-sm text-stone">ATR rules merged</div>
            </div>
            <div>
              <div className="font-data text-3xl font-bold text-ink mb-1">1,272</div>
              <div className="text-sm text-stone">lines added to Cisco AI Defense</div>
            </div>
            <div>
              <div className="font-data text-3xl font-bold text-ink mb-1">3 days</div>
              <div className="text-sm text-stone">from PR submission to merge</div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <p className="text-sm text-graphite leading-relaxed mb-4">
              Cisco&apos;s DefenseClaw team integrated ATR rules as an upstream dependency.
              Their engineer submitted PR #79, we reviewed it, and it merged in 3 days.
              They then built a <span className="font-data">--rule-packs</span> CLI feature
              (PR #80) specifically to consume ATR as a first-class rule source.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/cisco/ai-defense/pull/79" target="_blank" rel="noopener noreferrer" className="font-data text-[13px] text-blue hover:underline">
                PR #79: Rules integration &rarr;
              </a>
              <a href="https://github.com/cisco/ai-defense/pull/80" target="_blank" rel="noopener noreferrer" className="font-data text-[13px] text-blue hover:underline">
                PR #80: Rule-packs CLI &rarr;
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
