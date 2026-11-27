# Router

## First steps of every task

1. Restate the goal in plain words. State the smallest change that removes the root cause.
2. Pick one playbook from the table below.
3. Copy the steps of the playbook into your task list. If your tool has no task list, write the steps into `logs/<task>-steps.md` and mark each step when it is done.
4. Do the steps in order.
5. In your reply, name each principle from `agent/PRINCIPLES.md` that changed a decision, and name the decision.

## Routing table

| The task | Playbook | Stage |
|---|---|---|
| A question about the code. No change. | `agent/playbooks/investigation.md` | 2 |
| A defect | `agent/playbooks/bug-fix.md` | 2 |
| New or changed behavior | `agent/playbooks/feature.md` | 2 |
| A change of structure with the same behavior | `agent/playbooks/refactor.md` | later |
| An open design question that a run can answer | `agent/playbooks/prototype.md` | later |
| A measured slowness | `agent/playbooks/perf.md` | later |
| Work that needs more than one pull request | `agent/playbooks/plan.md` | 2 |
| A mistake that occurred two times | `agent/playbooks/correct.md` | 3 |
| Continue earlier work | `agent/playbooks/pickup.md` | later |
| Stop work safely | `agent/playbooks/pause.md` | later |
| The last step of a change | `agent/playbooks/open-pr.md`, then `agent/playbooks/babysit.md`, then `agent/playbooks/ship.md` | 5 |
| No playbook fits, the task is large, or it runs without a human | `agent/playbooks/figure-it-out.md` | later |

The Stage column is the order in which a team adopts the playbooks. It is not a ban. If a task needs a playbook from a later stage, use it, and say so in your reply.

## Rules for every task

1. **Code:** name the data shape first: a state machine, a table, or a typed model.
2. **Choices:** if a run can settle a choice, prototype it. Do not ask.
3. **Numbers:** before you report or act on a measured number, use `agent/templates/benchmark-checklist.md`.
4. **Before a commit:** remove narrating comments, guards that nothing needs, dead paths, and unrelated edits.
5. **Comments:** keep only five types of comment. These are license headers, behavior forced by an external dependency that we cannot change, and style-only lint suppressions. The other two are doc comments of a public API, and issue links for a constraint that code cannot express. For other surprises, change the name or the structure, or add a test.
6. **Decisions:** make reversible choices yourself. Then say what you chose and why. Ask the human only for product choices, approvals, irreversible actions, or access that you do not have.
7. **Delegates:** give each delegate `agent/WORKER.md` first, then the goal, the scope, and file paths. Give each parallel delegate its own worktree. Review each diff yourself. You own the result.
8. **Verification:** only an agent or a person that did not write a change can verify it.
9. **Replies:** start with what changes for the user. Give each claim a label: measured, inferred, or guess. Give the evidence.
10. **Long or unattended work:** keep a decision log with `agent/templates/decision-log.tsv`.
11. **Stops:** when you end a turn and wait, make the last line `STOP: <reason> <details>`. A program reads it, so use only these seven reasons:
    - `ready-for-verifier`: name the pull request and its head commit.
    - `ready-for-final-verifier`: the last pull request of the task is open. Name it and its head commit.
    - `question`: you ask the human. Give the question and the options above the line, with your recommendation first.
    - `approval`: you need an approval that the brief calls for, such as a chart.
    - `waiting-for-delegates`: name what you wait for.
    - `blocked`: name what blocks you.
    - `done`: the task is complete. Name the evidence.
