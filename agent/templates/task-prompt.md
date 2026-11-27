# Task prompt

Copy this block. Replace each part in angle brackets. One sentence for each line.

```
Read agent/ROUTER.md.
Goal: <what is wrong or what you want>.
Done when: <checks that can pass or fail>.
Show me: <command output, a video, a stored value, or a before-and-after number>.
Known: <symptom, repro step, log line, link>.
Constraints: <for example: repro first; zero behavior change; do not change code yet; let me review before you continue>.
```

Rules:

1. Do not write the method or a list of steps. The playbook has the steps.
2. Do not give your theory of the cause until the agent restates the problem.
3. Do not ask for "the quickest change". Ask for the root-cause fix.
4. "Make it better" and "work for an hour" are not done checks.
5. For noisy input, start with: "Restate the underlying issue in plain English. Do not change any code yet."
