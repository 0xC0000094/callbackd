# Adapter: Claude Code

This is the only file with tool-specific names. All other files use the general names in the left column.

| General name | In Claude Code |
|---|---|
| instruction file that the tool loads | `CLAUDE.md` (it points to `AGENTS.md`) |
| task list | The built-in todo or task list tool. If it is not available, `logs/<task>-steps.md`. |
| start a delegate (subagent) | The Agent tool, with the brief: "Read agent/WORKER.md before anything else." |
| read-only delegate | The Agent tool with a read-only agent type (for example, Explore). Run `git status` after it ends to confirm that it changed nothing. |
| isolated workspace | The Agent tool option for an isolated worktree, or `git worktree add "${TMPDIR:-/tmp}/<project>-<name>" -b <branch>`. Never put a worktree inside the factory workspace. |
| ask the human a structured question | Plain text: the question, the options, and your recommendation first. Then end your turn with the line `STOP: question`. The answer can come from the human or as a message from the factory manager session. Do not use the AskUserQuestion tool: its dialog can be answered only at this terminal, so it blocks the work when the human is away. |
| drive the app: browser | Playwright (`npx playwright`), wrapped in the project CLI in `project/verify/cli/` |
| drive the app: terminal | The Bash tool, through the project CLI |
| schedule a job | `/loop` for a session, or a GitHub Actions schedule |
| trigger on an event | GitHub Actions events (push, pull_request, issues) |
| task board | GitHub Issues of this repository, through `gh issue` |
| open a pull request | `gh pr create` (without `--draft`), then `gh pr view` to read it back |
| post a verdict | `gh pr comment <number> --body-file logs/<verdict>.md` |
| edit a pull request (title, body, base) | `gh api repos/<owner>/<repo>/pulls/<number> -X PATCH -f body=@<file>`. Do not use `gh pr edit`: it fails on a retired GitHub API. |
| merge a pull request | `gh pr merge --squash`, only after a verdict from a verifier that did not write the change |
| compare a verdict after a rebase | `git patch-id` |
| project-level skills, subagents, commands | .claude/skills/, .claude/agents/, .claude/commands/ (project files; the project can change them) |
| per-user local settings | .claude/settings.local.json (project file; not committed) |

## When the tool cannot do a step

Write one line: "Skipped in Claude Code: <step>. <reason>." Then continue. Do not stop, and do not drop the step without a note.
