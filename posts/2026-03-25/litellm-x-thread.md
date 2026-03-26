TWEET 1:
litellm got poisoned today. 40K stars, 95M downloads/month.

Found because an MCP plugin in Cursor pulled it as a dependency. The malicious .pth file fork-bombed the machine. The attacker's own bug exposed the attack.

Otherwise? Weeks undetected.

🧵

TWEET 2:
What it stole:
- SSH keys
- AWS/GCP/Azure creds
- K8s secrets
- .env files
- Crypto wallets

You didn't have to import litellm. Just having it installed was enough. The .pth runs on EVERY Python start.

TWEET 3:
Root cause: Trivy — a security scanning tool — was compromised first on March 19.

The tool meant to protect your code became the attack vector. The attacker used stolen PyPI tokens from Trivy's CI/CD to push poisoned litellm versions.

TWEET 4:
When someone filed a GitHub issue, the attacker used 73 stolen accounts to flood it with 88 spam comments in 102 seconds, then closed it with a stolen maintainer account.

They tried to silence the disclosure.

TWEET 5:
pip show litellm

If you see 1.82.7 or 1.82.8 — assume FULL compromise. Rotate everything.

MCP skills pull in dependencies you never chose. Check yours:
npx @panguard-ai/panguard audit

#litellm #SupplyChainAttack #MCP #AISecurity