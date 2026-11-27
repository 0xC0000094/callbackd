# Claude instructions

Read `AGENTS.md` and follow it. It points you to `agent/ROUTER.md`.

These kit files are read-only in this project, and a hook blocks changes to them: `AGENTS.md`, `CLAUDE.md`, `agent/`, `.claude/settings.json`, `.claude/hooks/`, and `.kit/`. If a kit file is wrong, unclear, or missing something, write it in `project/kit-feedback.md` and continue your task.

You can add project-level Claude Code files: skills in .claude/skills/, subagents in .claude/agents/, and slash commands in .claude/commands/. They must not contradict the kit. Put shared knowledge in `project/` and let a skill point to it.
