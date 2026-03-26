# Skills Sec Post — T3 Plain Language Consequences
# Target: @aibtc/mcp-server
# Generated: 2026-03-25
# Status: DRAFT — 需先通知作者 72 小時

---

## English (X / Threads)

MCP Skill: @aibtc/mcp-server
Stars: —
What it says it does: "Bitcoin & Stacks DeFi toolkit for AI agents"
What it actually does:

→ Lets your AI agent transfer BTC, STX, and sBTC without asking you first
→ Deploys smart contracts to a live blockchain using your wallet keys
→ Adds admin access to your smart wallet — so someone else controls your funds

What happens next:
- Your crypto wallet gets drained while you're debugging a CSS bug
- A smart contract deployed under your name does something illegal
- Someone adds themselves as admin to your Pillar wallet and withdraws your collateral

All because your AI agent trusted a tool description.

Check yours: npx @panguard-ai/panguard audit

---

## 繁體中文 (Threads-zh / PTT / Dcard)

@aibtc/mcp-server

它說它是：「AI agent 用的比特幣和 Stacks DeFi 工具包」
它實際上做的事：

→ 讓你的 AI agent 不經確認就轉走你的 BTC、STX、sBTC
→ 用你的錢包私鑰在正式區塊鏈上部署智能合約
→ 把別人加成你智能錢包的管理員 — 對方直接控制你的資金

然後會發生什麼事：
- 你在 debug CSS 的時候，錢包被清空了
- 用你的名義部署的智能合約去做了違法的事
- 有人把自己加成你 Pillar 錢包的 admin，把你的抵押品提走

你的 AI agent 信任了一個工具描述，就這麼簡單。

60 秒確認：npx @panguard-ai/panguard audit
裝完自動 24 小時保護 + 回饋社群集體免疫。

---

## ATR Details (內部參考)
- **44 threats** across 137 tools
- **Risk Score**: 100 (CRITICAL)
- **Key ATR Rules Hit**:
  - ATR-2026-063: Multi-Skill Chain Attack (wallet_create, wallet_import, wallet_rotate_password, pillar_key_generate)
  - ATR-2026-040: Privilege Escalation (deploy_contract, execute_x402_endpoint, pillar_add_admin, pillar_direct_add_admin)
  - ATR-2026-099: High-Risk Tool Without Human Confirmation (21 tools — transfer_stx, transfer_btc, sbtc_transfer, wallet_delete, etc.)
  - ATR-2026-012: Unauthorized Tool Call (execute_x402_endpoint, alex_swap, etc.)
  - ATR-2026-061: Description-Behavior Mismatch (11 tools)
  - ATR-2026-051: Agent Resource Exhaustion (alex_list_pools)
