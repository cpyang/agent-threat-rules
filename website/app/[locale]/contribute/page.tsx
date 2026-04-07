import { Reveal } from "@/components/Reveal";
import { locales, t, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Contribute - ATR",
  description: "Four ways to contribute to ATR: report evasions, false positives, submit rules, or use AI-native workflows.",
};

const PATHS = [
  {
    num: "01",
    title: "Report an Evasion",
    time: "~15 minutes",
    impact: "Most valuable contribution",
    desc: "Found a way to bypass an existing rule? This is the single most impactful thing you can do. Every confirmed evasion becomes a new test case and often triggers a rule improvement.",
    steps: [
      "Check the rule's existing evasion_tests section and LIMITATIONS.md",
      "Open an issue using the Evasion Report template",
      "Include: rule ID, bypass input, technique used, why it works",
    ],
  },
  {
    num: "02",
    title: "Report a False Positive",
    time: "~20 minutes",
    impact: "Tunes precision",
    desc: "A rule triggered on legitimate content? Confirmed false positives become new true_negatives test cases, keeping ATR's 99.7% precision real.",
    steps: [
      "Open an issue using the False Positive Report template",
      "Include: rule ID, the input that triggered, why it's legitimate",
    ],
  },
  {
    num: "03",
    title: "Submit a New Rule",
    time: "1-2 hours",
    impact: "Expands coverage",
    desc: "Write a full detection rule for a new attack pattern. ATR rules are YAML files following a documented schema. We have a complete walkthrough.",
    steps: [
      "Fork the repository",
      "Create a YAML file in rules/<category>/",
      "Follow the ATR schema (spec/atr-schema.yaml)",
      "See examples/how-to-write-a-rule.md",
      "Run: npx agent-threat-rules validate && npx agent-threat-rules test",
      "Submit a PR",
    ],
  },
  {
    num: "04",
    title: "AI-Native Contribution",
    time: "Variable",
    impact: "Future of rule writing",
    desc: "Use Claude Code, Cursor, or any AI coding agent with ATR's MCP server. The AI understands the rule schema, generates YAML, validates it, and runs tests. You review the output.",
    steps: [
      "Install: npx agent-threat-rules mcp (starts the MCP server)",
      "Connect your AI agent to the MCP server",
      "Describe the attack pattern you want to detect",
      "The AI generates rule YAML + test cases",
      "Review, refine, submit PR",
    ],
  },
];

export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  return (
    <div className="pt-20 pb-16 px-[max(24px,8vw)]">
      <Reveal>
        <div className="font-data text-xs font-medium text-stone tracking-[3px] uppercase mb-3">{t(locale, "contribute.label")}</div>
      </Reveal>
      <Reveal delay={0.1}>
        <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-2px] mb-2">
          {t(locale, "contribute.heading")}
        </h1>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-base text-stone font-light mb-10">
          {t(locale, "contribute.sub")}
        </p>
      </Reveal>

      {/* Crystallization */}
      <Reveal delay={0.3}>
        <div className="border border-fog mb-10">
          <div className="px-6 py-4 border-b border-fog bg-ash">
            <h2 className="font-display text-lg font-semibold">{t(locale, "contribute.crystal.title")}</h2>
            <p className="text-sm text-stone mt-1">{t(locale, "contribute.crystal.sub")}</p>
          </div>
          <div className="p-6">
            <div className="font-data text-[13px] leading-[2.4] text-graphite">
              {[
                "New attack pattern detected in the wild",
                "LLM analyzes attack structure + intent",
                "Auto-generates YAML rule proposal with test cases",
                "Community reviews + precision test gate",
                "Merged into ATR. Every downstream engine updates.",
              ].map((step, i) => (
                <div key={i}>
                  {i > 0 && <div className="text-mist text-center pl-6">|</div>}
                  <div className="flex items-center gap-3">
                    <span className="text-blue font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Four paths */}
      <div className="space-y-6">
        {PATHS.map((path, i) => (
          <Reveal key={path.num} delay={0.1 * i}>
            <div className="border border-fog">
              <div className="flex items-center justify-between px-6 py-4 border-b border-fog bg-ash">
                <div className="flex items-center gap-3">
                  <span className="font-data text-sm text-blue font-bold">{path.num}</span>
                  <h2 className="font-display text-lg font-semibold">{path.title}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-data text-xs text-stone">{path.time}</span>
                  <span className="font-data text-[10px] text-green uppercase tracking-wider">{path.impact}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-graphite leading-relaxed mb-4">{path.desc}</p>
                <ol className="space-y-1.5">
                  {path.steps.map((step, j) => (
                    <li key={j} className="flex gap-2 text-sm text-stone">
                      <span className="font-data text-xs text-mist mt-0.5">{j + 1}.</span>
                      <span className="font-data text-[13px]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Governance */}
      <Reveal>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-fog">
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/GOVERNANCE.md" target="_blank" rel="noopener noreferrer" className="bg-paper p-6 hover:bg-ash transition-colors">
            <div className="font-display text-sm font-semibold mb-1">{t(locale, "contribute.governance")}</div>
            <p className="text-[13px] text-stone">{t(locale, "contribute.governance.desc")}</p>
          </a>
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/CONTRIBUTORS.md" target="_blank" rel="noopener noreferrer" className="bg-paper p-6 hover:bg-ash transition-colors">
            <div className="font-display text-sm font-semibold mb-1">{t(locale, "contribute.contributors")}</div>
            <p className="text-[13px] text-stone">{t(locale, "contribute.contributors.desc")}</p>
          </a>
          <a href="https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/examples/how-to-write-a-rule.md" target="_blank" rel="noopener noreferrer" className="bg-paper p-6 hover:bg-ash transition-colors">
            <div className="font-display text-sm font-semibold mb-1">{t(locale, "contribute.guide")}</div>
            <p className="text-[13px] text-stone">{t(locale, "contribute.guide.desc")}</p>
          </a>
        </div>
      </Reveal>
    </div>
  );
}
