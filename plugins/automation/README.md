# Automation Plugin

This is a repo-local Codex plugin scaffold for automation workflows.

What is included:
- Required plugin manifest at `.codex-plugin/plugin.json`
- Starter automation skill at `skills/automation-orchestrator/SKILL.md`
- Placeholder MCP and app manifests
- Stub folders for hooks, scripts, and assets

Recommended next steps:
1. Replace the `[TODO: ...]` values in `.codex-plugin/plugin.json`
2. Point `skills`, `hooks`, `mcpServers`, and `apps` to real paths you want to ship
3. Add any icons or screenshots under `assets/`
4. Expand the starter skill with your domain-specific automation rules
5. Add `.agents/plugins/marketplace.json` only if you want this plugin surfaced in a local marketplace
