你的工程師裝了幾個 AI Skill？你知道嗎？

如果你的團隊在用 Claude Code、Cursor、Copilot、Windsurf — 他們幾乎一定從網路上裝了 AI Skill。這些 Skill 可以讀你的檔案、執行命令、存取 API 金鑰。但大多數組織連工程師裝了哪些 Skill 都不知道。

我掃了全球最大的 AI Skill 市集 ClawHub，36,394 個 Skill 全部掃一遍。每 7 個就有 1 個有安全問題。


掃描結果

182 個 CRITICAL — AI 被接管，攻擊者能用你的 agent 做任何事。
1,124 個 HIGH — API 金鑰、SSH 私鑰可能被偷。
1,016 個 MEDIUM — 有可疑行為，需要人工確認。

最常見的手法：在 Skill 描述裡藏隱形指令。你的人看不到，但 AI 會照做。

這不是理論。2025-2026 年已有實際事件：mcp-remote 遠端執行漏洞影響 43 萬次安裝。postmark-mcp 惡意套件潛伏 15 個版本後啟動，每天轉發上萬封 email。SANDWORM_MODE 19 個冒名套件偷 SSH key 和 AWS 憑證。


你的團隊可以做什麼

10 秒確認有沒有問題：panguard.ai/scan

全機掃描：npx @panguard-ai/panguard scan

免費。開源。不用帳號。71 條偵測規則，涵蓋 OWASP AI Agent 安全標準全部 10 個分類。

精確率 99.7%，幾乎不誤報。召回率 62.7%，每 3 個已知攻擊抓到 2 個。剩下 1/3 是改寫式攻擊和非英文載荷。我們公開這個數字，因為在資安領域，透明比完美重要。


完整資料：github.com/Agent-Threat-Rule/agent-threat-rules

PanGuard — AI Agent 安全掃描。100% 免費開源。panguard.ai
