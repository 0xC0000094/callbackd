# Agent instructions

## Start rule

Before any task, read `agent/ROUTER.md`. Follow it.

## Always

1. Use files, not memory. To continue earlier work, read `logs/`, `plans/`, the branch, and the pull request.
2. Fix the root cause. Do not add a quick fix at the place where the symptom shows. Other agents copy quick fixes.
3. Prove each result on the real artifact: run the command, use the app, read the stored value. "It compiles" is not evidence.
4. Stop and ask before an irreversible action: a force-push to a shared branch, a deploy, data deletion, or a message to a customer.

## Paths and commands

A file path in backticks is relative to the repository root, for example `agent/playbooks/plan.md`. A token in backticks that starts with `/` is a command, not a path. A path that does not exist yet, for example a folder that a project may create, is written without backticks.

## Project files

These files belong to this project. You can change them:

- `project/rules.md`: the rule table. Each rule comes from a mistake that occurred two or more times.
- `project/candidate-log.md`: mistakes seen one time.
- `project/metrics.md`, `project/verify/`, `project/formal/`, `logs/`, `plans/`, and the application code.
- Tool-specific project files that `agent/ADAPTER.md` names, for example project-level skills or commands. They must not contradict the kit.

## Kit files

`AGENTS.md` and everything in `agent/` belong to the kit. Do not change them. If a kit file is wrong, unclear, or missing a rule, write it in `project/kit-feedback.md`. The kit maintainer reads that file.
