# Overnight contract

Use this only after the trust gate is true:

1. You did the task one time by hand, or watched an agent do it, so you know what good looks like.
2. The agent has the tools and signals that you use: the verification skill, the profiler, the logs.
3. Every stage proves its work and can stop the line.
4. You read some transcripts and changed the repeated failures into tools, skills, or checks.

```
Read agent/ROUTER.md. Use playbooks/figure-it-out.md.
Goal: <goal>. Work in a fresh worktree off <base>.
Done when: <checks that each iteration can run>.
Keep a decision log in logs/<task>.tsv. Do not ask me before you commit.
Stop before irreversible actions.
Never relax the done check to declare success.
If you are stuck for a long time, stop and write up why.
```
