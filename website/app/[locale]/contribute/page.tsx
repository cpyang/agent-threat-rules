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

function getPaths(locale: Locale) {
  const zh = locale === "zh";
  return [
    {
      num: "01",
      title: zh ? "回報繞過方式" : "Report an Evasion",
      time: zh ? "約 15 分鐘" : "~15 minutes",
      impact: zh ? "最有價值的貢獻" : "Most valuable contribution",
      desc: zh
        ? "發現了繞過現有規則的方法？這是你能做的最有影響力的事。每個確認的繞過都會成為新的測試案例，通常也會觸發規則改進。"
        : "Found a way to bypass an existing rule? This is the single most impactful thing you can do. Every confirmed evasion becomes a new test case and often triggers a rule improvement.",
      steps: zh
        ? [
            "檢查該規則現有的 evasion_tests 區段和 LIMITATIONS.md",
            "使用 Evasion Report 模板開一個 issue",
            "附上：rule ID、繞過輸入、使用的技術、為什麼能繞過",
          ]
        : [
            "Check the rule's existing evasion_tests section and LIMITATIONS.md",
            "Open an issue using the Evasion Report template",
            "Include: rule ID, bypass input, technique used, why it works",
          ],
    },
    {
      num: "02",
      title: zh ? "回報誤報" : "Report a False Positive",
      time: zh ? "約 20 分鐘" : "~20 minutes",
      impact: zh ? "提升 Precision" : "Tunes precision",
      desc: zh
        ? "規則誤判了正常內容？確認的誤報會成為新的 true_negatives 測試案例，維持 ATR 99.7% precision 的真實性。"
        : "A rule triggered on legitimate content? Confirmed false positives become new true_negatives test cases, keeping ATR's 99.7% precision real.",
      steps: zh
        ? [
            "使用 False Positive Report 模板開一個 issue",
            "附上：rule ID、觸發的輸入、為什麼是正常內容",
          ]
        : [
            "Open an issue using the False Positive Report template",
            "Include: rule ID, the input that triggered, why it's legitimate",
          ],
    },
    {
      num: "03",
      title: zh ? "提交新規則" : "Submit a New Rule",
      time: zh ? "1-2 小時" : "1-2 hours",
      impact: zh ? "擴展覆蓋範圍" : "Expands coverage",
      desc: zh
        ? "為新的攻擊模式撰寫完整的偵測規則。ATR 規則是遵循文件化 schema 的 YAML 檔案。我們有完整的教學文件。"
        : "Write a full detection rule for a new attack pattern. ATR rules are YAML files following a documented schema. We have a complete walkthrough.",
      steps: zh
        ? [
            "Fork 此 repository",
            "在 rules/<category>/ 建立 YAML 檔案",
            "遵循 ATR schema（spec/atr-schema.yaml）",
            "參考 examples/how-to-write-a-rule.md",
            "執行：npx agent-threat-rules validate && npx agent-threat-rules test",
            "提交 PR",
          ]
        : [
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
      title: zh ? "AI 原生貢獻" : "AI-Native Contribution",
      time: zh ? "不定" : "Variable",
      impact: zh ? "規則撰寫的未來" : "Future of rule writing",
      desc: zh
        ? "使用 Claude Code、Cursor 或任何 AI 編碼 agent 搭配 ATR 的 MCP server。AI 理解規則 schema，產生 YAML，驗證並執行測試。你負責審查結果。"
        : "Use Claude Code, Cursor, or any AI coding agent with ATR's MCP server. The AI understands the rule schema, generates YAML, validates it, and runs tests. You review the output.",
      steps: zh
        ? [
            "安裝：npx agent-threat-rules mcp（啟動 MCP server）",
            "將你的 AI agent 連接到 MCP server",
            "描述你想偵測的攻擊模式",
            "AI 產生規則 YAML + 測試案例",
            "審查、調整、提交 PR",
          ]
        : [
            "Install: npx agent-threat-rules mcp (starts the MCP server)",
            "Connect your AI agent to the MCP server",
            "Describe the attack pattern you want to detect",
            "The AI generates rule YAML + test cases",
            "Review, refine, submit PR",
          ],
    },
  ];
}

export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (locales.includes(raw as Locale) ? raw : "en") as Locale;
  const PATHS = getPaths(locale);
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
              {(locale === "zh"
                ? [
                    "在野外偵測到新的攻擊模式",
                    "LLM 分析攻擊結構和意圖",
                    "自動產生 YAML 規則提案和測試案例",
                    "社群審查 + precision 測試閘門",
                    "合併至 ATR。所有下游引擎自動更新。",
                  ]
                : [
                    "New attack pattern detected in the wild",
                    "LLM analyzes attack structure + intent",
                    "Auto-generates YAML rule proposal with test cases",
                    "Community reviews + precision test gate",
                    "Merged into ATR. Every downstream engine updates.",
                  ]
              ).map((step, i) => (
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
