# Playbook: Feature

**You own the design.**

## Steps

1. Trace the code that the feature touches.
2. Name the data shape: a state machine, a table or registry, or a typed model.
3. If the change crosses a function boundary, sketch two shapes with types and module boundaries. Pick the one where each piece of state has one owner and each task has one way to do it.
4. For a state machine that matters, model it first with `project/formal/` (stage 6). Show the chart to the product owner.
5. Write four items before you divide the work. Keep an item with "n/a: <reason>" if it does not apply:
   - blocking first steps,
   - independent workstreams,
   - shared mutable state,
   - the smallest safe decomposition.
6. Write down what must not change, for example "the text output stays byte-identical".
7. If the work needs more than one pull request, stop and use `agent/playbooks/plan.md`.
8. Delegate with an exact scope: file paths, the data shape, and the done checks. Tightly coupled code stays with one delegate.
9. Verify on the real surface with `project/verify/`. Drive every entry point in the feature map. If a chart exists, drive every transition.
10. Order the commits in small, landable steps.
11. Continue with `agent/playbooks/open-pr.md`.

## Evidence

A video or screenshots of the feature in use, and the proof that the protected behavior did not change.
