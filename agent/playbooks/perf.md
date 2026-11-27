# Playbook: Performance

**You own a measured improvement.**

## Steps

1. Measure the baseline on the real path. Check the number with `agent/templates/benchmark-checklist.md`.
2. Profile. Find the code that limits the number. Do not guess from reading the source.
3. Try fixes in this order. Stop at the first one that meets the target:
   1. Do not do the work.
   2. Do not do it again.
   3. Do less of it.
   4. Do it later.
   5. Do it when the user is not waiting.
   6. Do it at the same time as other work.
   7. Do it cheaper.
4. Measure again, with the same method.
5. Report: baseline, after, change, number of runs, range, and the limiter. Attach the profiles.
6. Continue with `agent/playbooks/open-pr.md`.
