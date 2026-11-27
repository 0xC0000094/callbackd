# Playbook: Bug fix

**You own correct behavior, from runtime evidence.**

## Steps

1. Reproduce the bug yourself, on the same surface as the user (UI, CLI, API). Use `project/verify/`. If it does not reproduce, make the trigger, narrow the conditions, or add instrumentation. Do not ask the user to reproduce it.
2. Make the reproduction a check:
   - If a cheap, clear test exists for this code, write the smallest test that fails for the intended reason.
   - If not, write a repro script or command. Do not force a test through brittle mocks.
3. Find the cause. Write two or more hypotheses. Test the one that removes the most possibilities first, with runtime evidence.
4. Confirm the mechanism before you change code.
5. Look for the same fault in other places.
6. Make the smallest change that removes the root cause. If the fix crosses a function boundary, sketch two shapes first.
7. Verify on the same surface as step 1.
8. Order the commits: the failing repro first, then the fix.
9. Continue with `agent/playbooks/open-pr.md`.

## Evidence

Paste the failing output and the passing output, word for word.

## Do not

- Do not ship a change that "might help". Every shipped line must trace to runtime evidence. Revert what a refuted hypothesis caused.
- Do not add a guard for a state that must never exist. Find what made the state.
- If two fixes that share one premise fail the same check, write the premise down and test it before a third fix.
