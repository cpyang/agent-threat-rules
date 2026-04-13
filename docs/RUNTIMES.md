# ATR Runtime Registry

Canonical list of runtime identifiers for use in ATR rule `runtimes` fields.
Adding a new runtime requires a PR to this file, not an RFC addendum.

**Format:** lowercase, hyphen-separated. One entry per runtime.

| Identifier | Runtime | Scan Target Format |
|---|---|---|
| `claude-code` | Anthropic Claude Code CLI | SKILL.md, MCP config |
| `claude-desktop` | Anthropic Claude Desktop | MCP config |
| `cursor` | Cursor IDE | MCP config |
| `hermes` | Hermes Agent (Nous Research) | SKILL.md, MCP config (YAML) |
| `openclaw` | OpenClaw | SKILL.md, native skills |
| `windsurf` | Codeium Windsurf | MCP config |
| `codex` | OpenAI Codex CLI | MCP config |
| `cline` | Cline (VS Code) | MCP config |
| `zed` | Zed Editor | MCP config |
| `gemini-cli` | Google Gemini CLI | MCP config |
| `continue` | Continue (VS Code) | MCP config |
| `roo-code` | Roo Code (VS Code) | MCP config |
| `vscode-copilot` | VS Code Copilot | MCP config |
| `anthropic-managed` | Claude Managed Agents (April 2026+) | MCP tool descriptions |
| `openai-assistants` | OpenAI Assistants API v2+ | Tool descriptions |
| `openai-gpts` | OpenAI custom GPTs | Tool descriptions |
| `google-gemini-agents` | Google Gemini Agent Builder | Tool descriptions |
| `google-a2a` | Google Agent-to-Agent Protocol | A2A agent cards |
| `microsoft-agt` | Microsoft Agent Framework 1.0 | Semantic Kernel plugins |
| `langgraph` | LangChain LangGraph | Tool definitions |
| `crewai` | CrewAI | Tool definitions |
| `local-llama` | Self-hosted LLaMA-family agent | Varies |
| `local-mistral` | Self-hosted Mistral-family agent | Varies |
| `self-hosted-mcp` | Any self-hosted MCP server/client | MCP tool descriptions |

## How to add a runtime

1. Open a PR adding a row to the table above.
2. Include: identifier, human-readable name, primary scan target format.
3. Identifier must be lowercase, hyphen-separated, unique.
4. No RFC addendum required.
