# litellm supply chain attack was discovered because an MCP plugin crashed Cursor. This is the AI toolchain security problem we keep warning about.

Today's litellm poisoning (v1.82.7 and v1.82.8) is a case study in everything that's wrong with AI toolchain security.

## The attack chain

1. March 19: TeamPCP compromises Trivy (a security scanner)
2. March 23: They compromise Checkmarx KICS
3. March 24: Using stolen PyPI tokens from Trivy's CI/CD, they push poisoned litellm versions
4. A `.pth` file executes on every Python process start — no import needed
5. It harvests SSH keys, cloud credentials, K8s secrets, .env files, crypto wallets
6. Encrypted payload sent to attacker-controlled domain
7. In K8s environments, it deploys privileged pods across every node

## How it was found

A developer using Cursor had an MCP plugin that depended on litellm. The malicious `.pth` file triggered on every Python subprocess, creating an exponential fork bomb that crashed the machine. **The attacker's own bug exposed the attack.** Without that bug, this could have gone undetected for weeks.

## The MCP connection nobody is talking about

This attack was discovered through an MCP plugin dependency chain. MCP skills in Claude Code, Cursor, and other AI agents pull in npm and Python packages as dependencies. Those dependencies have their own dependencies. Any one of them can be poisoned.

Your AI agent has full filesystem access, shell execution, and network access. A poisoned dependency in an MCP skill gets all of that for free.

## What you can do

1. `pip show litellm` — if you see 1.82.7 or 1.82.8, assume full compromise
2. Rotate ALL credentials (SSH, cloud, API keys, database passwords)
3. Check your MCP skills for dependency chains: `npx @panguard-ai/panguard audit`
4. Pin dependency versions in production
5. Monitor for anomalous outbound network connections

## The bigger picture

Karpathy's take: he's moving toward using LLMs to generate simple code instead of pulling in dependencies. That's one approach.

Another: treat every MCP skill and dependency like an app store submission — scan it before it runs. That's what ATR (Agent Threat Rules) does — an open standard for detecting supply chain attacks, credential theft, and prompt injection in AI agent toolchains.

61 rules, MIT licensed: https://github.com/panguard-ai/agent-threat-rules

The AI toolchain supply chain is the new attack surface. Today it was litellm. Tomorrow it'll be something else in your dependency tree that you didn't even know was there.