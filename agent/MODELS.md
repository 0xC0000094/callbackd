# Models for each role: Claude Code

Playbooks name roles, not models. Change a model only here.

| Role | Used for | Model | Effort |
|---|---|---|---|
| code | feature, bug-fix, refactor, perf | claude-opus-5-5 | high |
| judgment and prose | plans, replies, documentation | claude-opus-5-5 | high |
| verification | verifier agents, verification runs | claude-sonnet-5-5 | medium |
| trivial edits | renames, version bumps | claude-haiku-5-5 | low |
| judge | decision-log review, comparisons | a fresh claude-opus-5-5 session with no shared context | high |

Rules:

1. A judge should come from a different vendor than the writer. This setup has only one vendor. So a judge is a fresh session with no shared context. This check is weaker. Say so in the review.
2. Use claude-fable-5-2 only when the user names it, or after two runs of the same brief fail their check. Difficulty alone does not qualify.
