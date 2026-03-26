litellm 今天被投毒了。4 萬星，每月 9500 萬次下載。

怎麼發現的：有人在 Cursor 裡裝了一個 MCP plugin，它依賴了 litellm。惡意的 .pth 檔在每次 Python 啟動時自動執行，fork bomb 把記憶體撐爆了 — 攻擊者自己寫的 bug 才暴露了這件事。

不然可能好幾週都不會被發現。

它偷了什麼：
- SSH 金鑰
- AWS/GCP/Azure 雲端憑證
- Kubernetes secrets
- .env 檔案
- 加密貨幣錢包

你甚至不需要 import litellm。裝了就中。

更諷刺的是：攻擊入口是 Trivy — 一個安全掃描工具。保護你的工具變成了攻擊你的武器。

Karpathy 親自發推警告。他說得對：每裝一個依賴，就是在依賴樹深處埋一顆地雷。

這就是我們為什麼做 ATR。供應鏈攻擊不是理論，是正在發生的事。

檢查你的 MCP skills：
npx @panguard-ai/panguard audit

pip show litellm — 如果是 1.82.7 或 1.82.8，假設所有憑證已洩漏，立即輪換。