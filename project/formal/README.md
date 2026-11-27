# Formal models (stage 6)

One model for each important subsystem: state machines, retries, concurrency, parsers. Start without this folder. Add it at stage 6.

## Layout

```
project/formal/<subsystem>/
  model.<ext>             the model (for example, TLA+)
  check.md                how to run the check: one command, the tool version, the bounds
  covers.md               the files and functions that the model describes, and the sync commit
  chart.mmd               the chart, generated from the model. Never edit it by hand.
  coverage.md             the transition coverage table (agent/templates/transition-coverage.md)
```

## Choose the tool by the question

| Question | Tool type |
|---|---|
| Can events happen in a bad order (races, retries, flows)? | A model checker on a small model of the design |
| Does the code behave for every input? | A verifier that runs on the code |
| No verifier exists for the language | Tests with generated inputs on the real code |
| Must it hold at every size? | A proof |

Prefer a tool that the team can install and run.

## Rules

1. Write each rule of the reader as an invariant. Never weaken a rule to make it hold.
2. Show each property failing on a broken variant of the code. A check that you have never seen fail proves nothing.
3. A pass covers the model or the bound, not the whole system.
4. When the model describes code that exists, replay each bug path in the real code before you report it as a code bug. Use one step for each action. If a step cannot occur in the code, the model is wrong.
5. When the model comes before the code, report a bug path as a design bug. Replay every bug path in the real code when the code exists.
6. Move the sync commit only after you confirm that the model describes the code at the new commit.
7. The chart is for humans: about 20 arrows, labels in the user's words. Agents read the full model and its report.
8. Use stable IDs for states and transitions. The board, the tests, and the evidence use the same IDs.

## Limits

A formal check shows only that the code matches the spec under certain assumptions. The spec comes from what people want. Only a person can judge if the spec is right. Pair each model with runs of the real code.
