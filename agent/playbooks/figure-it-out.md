# Playbook: Figure it out

**You own a plan that a human can audit, for a task that no playbook fits.**

Use it for a large task, a cross-cutting task, or a task that runs without a human.

## Steps

1. **Frame.** Write "done" as a check that can pass or fail. State the scope with numbers. Choose a high level of rigor: rigor means checks and evidence, not more effort.
2. **Design.**
   - Split the work into units that can land on their own. Put the riskiest unknown first.
   - Build the verification harness and capture the baseline before the work, so each check reads "old value against new value".
   - Write the list of phases for the human.
3. **Loop.** For each unit: a hypothesis, the smallest change, a measurement, then keep or revert.
4. **Verdicts.** Each unit is VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Inconclusive is not a pass.
5. **Integrity.** Never change a check, a baseline, or a harness to make it pass. If a check is wrong, fix it in a separate change.
6. **Trail.** Keep a decision log with `agent/templates/decision-log.tsv`.
7. **End.** Check the result against the "done" check on the real product. Turn each repeated correction into a check with `agent/playbooks/correct.md`.
