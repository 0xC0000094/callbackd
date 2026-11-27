# Playbook: Plan of pull requests

**You own a plan that an owner can run box by box. You do not start the work.**

Skip this playbook for one or two obvious files.

## Steps

1. Settle the open questions with `agent/playbooks/prototype.md` first. Do not plan around a question that a run can answer.
2. Write the plan with `agent/templates/plan.md` in `plans/<name>.md`.
3. For each pull request, write what it depends on, the files it may touch, and the one change. Also write the result that a user can see, and the verification: unit, live, and performance if needed. Tests alone are not enough.
4. Show the plan to the human.
5. Wait for "go". A request to state the plan is not a "go".

## Exit

The plan file. Delete it when the last pull request lands.
