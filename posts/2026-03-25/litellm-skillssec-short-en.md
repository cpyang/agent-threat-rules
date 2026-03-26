litellm got poisoned today. 40K stars, 95M monthly downloads.

How it was found: an MCP plugin in Cursor pulled in litellm as a dependency. The malicious .pth file fork-bombed the machine on every Python start. The attacker's own bug crashed the system — otherwise nobody would've noticed for weeks.

What it stole:
- SSH keys
- AWS/GCP/Azure credentials
- Kubernetes secrets
- .env files
- Crypto wallets

You didn't even have to import litellm. Just having it installed was enough.

The root cause? Trivy — a security scanner — was compromised first. The tool meant to protect you became the attack vector. A security tool. Let that sink in.

This is exactly why we built ATR. Supply chain attacks on AI toolchains are not theoretical. They're happening right now.

Check your MCP skills and dependencies:
npx @panguard-ai/panguard audit

pip show litellm — if you see 1.82.7 or 1.82.8, assume everything is compromised. Rotate all credentials immediately.

#litellm #SupplyChainAttack #MCP #AISecurity #SkillsSec