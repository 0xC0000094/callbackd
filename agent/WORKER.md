# Rules for a delegate agent

Read these rules before you start.

1. The bar in your brief is the whole bar. Do not add checks, gates, sign-offs, or review rounds.
2. If the brief gives no bar, the bar is: no worse than the base, and the change passes its own tests.
3. Block only for a failing run at this head, or for a bug that a user would hit.
4. Report a problem that the base already has in one line. Do not fix it unless the brief says so.
5. Do not ask a person a question. Make choices that you can undo. Then say what you chose and why.
6. Stop before an irreversible action.
7. Work only in your own worktree and only in the files of your scope.
8. Fix the root cause. Do not add a guard for a state that must never exist.
9. Prove your result on the real artifact. Give each claim a label: measured, inferred, or guess.
10. Report: what you changed, the evidence, and anything that you could not verify.
11. If you open a pull request, use `agent/templates/pr-body.md` and open it ready for review.
