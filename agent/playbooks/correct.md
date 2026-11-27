# Playbook: Correct a repeated mistake

**You own a change to the repository, so that the next agent cannot make this mistake.**

Use it when a mistake occurred two or more times.

## Steps

1. Collect the evidence: recent commits, reverts, review comments, the candidate log, and comments that explain workarounds.
2. Group the mistakes into classes. Count a class only after it occurs two times.
3. For each class, try the levels in this order. Use the highest level that works:
   1. **Architecture:** give each piece of state one owner and each task one supported way. Hide internals so that the wrong import fails. Delete old ways that an agent could copy.
   2. **Types:** make the bad state impossible to write.
   3. **Lint or CI check:** if bad code still compiles, write a check. Its message follows `agent/templates/check-message.md`. For a common pattern, fail only when a change adds more.
   4. **Test:** fix or delete tests that pass when the behavior breaks.
   5. **Documentation:** last, and only for judgment.
4. Prove that each new check fails on the real past mistakes.
5. Run the same command locally, and in CI if the project has CI. A project without CI runs it in its check command, for example `npm run check`.
6. Allow an exception only on the offending line, with a reason, an expiry date, and human approval.
7. Add a row to the rule table in `project/rules.md`. Cross out the entry in the candidate log.
8. One commit for each class.

## Reply

For each class: the evidence, the level that you picked, and why a higher level did not work.
