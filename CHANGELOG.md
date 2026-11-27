# Kit changelog

## 0.4.11 (2026-11-26)

- `CHANGELOG.md`: one long sentence in the 0.4.10 entry split in two. No change to any rule.

## 0.4.10 (2026-11-26)

From agent-task-board pilot 6, approved by the human for pilot 7.

- `agent/ROUTER.md` rule 11: a new stop reason, `ready-for-final-verifier`, for the last pull request. In pilot 6, a worker used `ready-for-verifier` for its own pull request. The manager could tell it from the builder's last stop only by the actor name.

## 0.4.9 (2026-11-26)

- `agent/templates/board-item.md` rule 3: one long sentence split in two (the 0.4.8 preflight warned about it). No change in meaning.

## 0.4.8 (2026-11-26)

From the agent-task-board project (pilot 5). The board rules contradicted a board where every agent reports its work.

- `agent/templates/board-item.md` rules 2, 3, and 5: status and evidence keep the strict rules. Reports (activity, steps, decisions, waits, stops) may come from every agent, and a failed report does not stop the work.

## 0.4.7 (2026-11-25)

From the agent-task-board project (pilot 4). All agents of a project post to the forge with one account. So the account cannot show that the verifier did not write the change.

- `agent/playbooks/ship.md` step 3: a verdict comment has a fixed first line and a `Signed:` line. A pull request body ends with the builder's `Signed:` line.
- `agent/templates/board-item.md`: the actor-name format `<role>/<kind>/<model>/<run>`.
- `agent/ROUTER.md` rule 11: each wait ends with a `STOP:` line with a fixed reason, so that a program can tell why a session stopped. In pilot 4, the factory manager had to guess the reason from free text.
- Claude Code profile: a session asks the human in plain text and ends its turn, not through the question dialog. In pilot 4, the dialog blocked the builder while the human was away, and the factory manager's answer could not reach it.

## 0.4.6 (2026-11-25)

From the agent-task-board project (2026-11-25).

- `project/formal/README.md`: a bug path found before the code exists is a design bug, and it is replayed in the real code when the code exists. This changes only new projects.

## 0.4.5 (2026-11-25)

From the kit-doctor project (2026-11-25).

- Claude Code profile: the hook no longer reads a sed or perl script as a file name, so a block message names the real path.
- Claude Code profile: the hook also blocks `git worktree add`, `git clone`, and `mkdir` into the factory workspace outside the project.

## 0.4.4 (2026-11-25)

From kit-doctor (2026-11-24) and factory-dashboard (2026-11-25).

- `agent/playbooks/correct.md` step 5 no longer assumes that every project has CI. A project without CI runs the check in its check command. Two projects showed that one CI template does not fit all projects, so the kit has none.

## 0.4.3 (2026-11-25)

From the factory-dashboard project. The same problem occurred two times.

- Claude Code profile: the adapter says how to edit a pull request through the API, because `gh pr edit` fails on a retired GitHub API.

## 0.4.2 (2026-11-25)

From kit feedback by the factory-dashboard project, and one defect found by the factory manager.

- Claude Code profile: worktrees go in a temporary folder outside the factory workspace. A worktree inside the projects folder looked like a project to the factory tool.
- `project/metrics.md` has a table for human review time. This changes only new projects.
- Removed a compiled Python cache file that the factory had installed as a kit file by mistake. The factory now skips caches and OS files.

## 0.4.1 (2026-11-24)

Found by the factory manager before the factory-dashboard project started.

- Claude Code profile: the hook also blocks writes in the factory workspace outside the project. This covers the kit source, the fixtures, other projects, and the factory files. A project session can still read them. Its own worktrees stay writable.

## 0.4.0 (2026-11-24)

Decision by the user, from a question by the kit-doctor project.

- Projects can now add tool-specific project files that the adapter names. In the Claude Code profile, these are skills, subagents, and slash commands in .claude/skills/, .claude/agents/, and .claude/commands/, and .claude/settings.local.json.
- `AGENTS.md`: a path that does not exist yet is written without backticks. The factory preflight found this gap.
- The guard files stay kit files: `.claude/settings.json` and `.claude/hooks/`. The deny rules, the hook, and the factory integrity check now protect only these files in `.claude/`.

## 0.3.2 (2026-11-24)

From kit feedback by the kit-doctor verifier session (2026-11-24).

- `agent/playbooks/ship.md`: the verifier changes no files on the branch, posts its verdict as a pull request comment, and keeps its full evidence log in `logs/`.
- Claude Code profile: the adapter names the command for a verdict comment.

## 0.3.1 (2026-11-24)

From kit feedback by the kit-doctor project (2026-11-24).

- Claude Code profile: the kit-file hook now finds the git checkout that holds a path. It protects kit files in every worktree of the repository, also outside the project folder.
- Claude Code profile: the hook reads a path from the folder of the command, including after `cd`. It ignores heredoc text. This removes two false blocks on test fixtures.
- `project/kit-feedback.md` has a Status column. This changes only new projects. An existing project adds the column itself.

## 0.3.0 (2026-11-24)

From kit feedback by the kit-doctor project (2026-11-24). Both items were defects, so they were fixed at the first report.

- All file paths in backticks are now relative to the repository root. `AGENTS.md` states the rule, and says that a token that starts with `/` is a command.
- The plan playbook is now stage 2.
- The Stage column in the router is an adoption order, not a ban. An agent uses a later playbook when a task needs it, and says so.

## 0.2.0 (2026-11-23)

- Split the kit files from the project files. The kit is `AGENTS.md` and `agent/`. The project files are in `project/`, `logs/`, and `plans/`.
- Moved the rule table from `AGENTS.md` to `project/rules.md`.
- Moved the verification skill, the formal models, the candidate log, and the metrics to `project/`.
- Added `project/kit-feedback.md`, where project sessions report problems with the kit.

## 0.1.0 (2026-11-23)

- First version of the starter kit.
