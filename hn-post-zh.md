# 我掃了 npm 上 1,295 個 MCP 套件，35% 有安全問題

MCP（Model Context Protocol）是 Claude、Cursor、Windsurf 等 AI 助理連接外部工具的標準協議。當你安裝一個 MCP server，你就是把系統權限交給 AI agent。我想知道：MCP 生態系現在到底安不安全？

我寫了一個開源靜態分析工具，掃描了 npm 上 1,295 個 MCP 套件，提取了 14,299 個 MCP tool 定義，用 61 條偵測規則逐一比對。

**完整報告：** https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/mcp-ecosystem-audit-2026.md

## 主要發現

1,295 個套件中有 455 個（35.1%）有值得調查的安全信號。**如果只看 HIGH 和 CRITICAL，比例是 13.5%（175 個）。** 35% 包含了 MEDIUM 和 LOW，這些標記的是像「有對外網路請求」這種東西 — MCP server 本來就常需要打外部 API，這些信號是否算「安全問題」取決於你的標準。我把資料公開，你自己判斷。

分佈：

- 115 個 CRITICAL（8.9%）
- 60 個 HIGH（4.6%）
- 125 個 MEDIUM（9.7%）
- 149 個 LOW（11.5%）
- 840 個 CLEAN（64.9%）

最常見的問題：**49.5% 的 MCP 套件讓 AI agent 可以執行破壞性操作（刪除檔案、DROP TABLE、終止 process），完全不需要人類確認。** 我知道你的第一反應是「這是 feature 不是 bug — 檔案管理 MCP server 本來就需要刪檔案」。你說得對。能力本身是設計好的。風險在於：當 prompt injection 攻擊劫持你的 agent 時，這些工具零摩擦就能被呼叫。資料庫 MCP server「應該」能執行 SQL 查詢。但它該不該讓 AI agent 在不問你的情況下執行 `DROP TABLE`？這就是這份資料要讓你思考的問題。

其他發現：

- **94 個套件（7.3%）** 同時具備 shell 執行 + 網路請求 + 檔案寫入 — download-and-execute 三件套
- **50 個套件**在 npm install 時就自動執行程式碼（postinstall）
- **29 個套件**同時有 postinstall + shell 執行
- 61 條偵測規則中有 **13 條被觸發**

## 自己跑一次

全部開源（MIT），你可以驗證這些數字：

```bash
git clone https://github.com/Agent-Threat-Rule/agent-threat-rules
cd agent-threat-rules
npm install

# 爬 npm MCP registry
npx tsx scripts/crawl-mcp-registry.ts

# 掃描 200 個套件（約 30 分鐘）
npx tsx scripts/audit-npm-skills-v2.ts --limit 200 --output my-audit.json
```

或用自動化 pipeline：

```bash
./scripts/auto-scan-pipeline.sh --batch-size 200
```

評分邏輯完全透明：https://github.com/Agent-Threat-Rule/agent-threat-rules/blob/main/docs/mcp-ecosystem-audit-2026.md#scoring-methodology

## 點名的套件

這**不是漏洞揭露**，也**不是指控惡意**。Cloudflare、Bitwarden、Cognition 等組織的套件被標為 CRITICAL，是因為它們透過 MCP 暴露了大量強大的工具（雲端管理、密碼管理、資料庫寫入）而沒有確認機制。分數反映的是 prompt injection 攻擊者可利用的攻擊面，不是程式碼品質或意圖。

為什麼 100 分？資料庫 MCP server 暴露了 DELETE、DROP、INSERT、UPDATE 工具，每個都觸發「高風險呼叫無需確認」規則。每次比對加分。越多工具 = 越大攻擊面 = 越高分。評分邏輯是開源的，連結在上面 — 自己看。

## 怎麼掃的

純靜態分析。我**沒有**連接任何 MCP server，也沒有嘗試任何攻擊。

1. 從打包的 JS 中用 regex 提取 tool 定義
2. 用 61 條開源偵測規則比對 tool descriptions 和 parameter schemas
3. 檢查供應鏈信號（postinstall scripts、typosquatting）
4. 掃描程式碼中的 shell 執行、網路請求、檔案寫入

限制：regex 提取可能漏掉動態生成的 tool。分數是啟發式的。CRITICAL 意思是「值得人工檢查」而非「確認是惡意的」。很多被標記的能力是刻意設計的 — 問題在於有沒有防護措施。

## 偵測規則

我用的規則是 ATR（Agent Threat Rules）— 一個開源的 YAML 偵測格式，專門針對 AI agent 威脅。類似 Sigma/YARA 但用在 prompt injection、tool poisoning、MCP 攻擊上。61 條規則，TypeScript + Python 引擎，Splunk/Elastic 轉換器。MIT 授權。

我也公開了 30 個 evasion tests，展示規則「抓不到什麼」。regex 有極限，我寧可誠實面對。

https://github.com/Agent-Threat-Rule/agent-threat-rules

---

*歡迎套件作者來信更正。如果你的套件被標記但你認為是誤判，開個 issue 我會更新報告。目標是改善 MCP 生態系的安全性，不是點名羞辱任何人。*
