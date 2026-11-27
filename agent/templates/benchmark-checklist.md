# Benchmark checklist

Before you report or act on a measured number, answer each question with evidence from a run, not a guess.

1. What limits the number, and why is it not double?
2. Did every side run tuned, the way production runs?
3. Does the result break a physical limit (disk, network, cores)?
4. Did anything fail, or return wrong output?
5. Does it repeat over alternating runs (five or more for each side)? Give the median and the range.
6. Does it matter on the end-to-end path that a user waits on?
7. Did the work actually happen inside the timed part?

Verdict: faster, slower, no measurable difference, or inconclusive. Give the number of runs, the range, and the limiter.
