# Rule table

Each rule here comes from a mistake that occurred two or more times. Mistakes seen one time go to `project/candidate-log.md`, not here.

| ID | Rule | Level | Enforcer | Proof | Status | Why not higher |
|---|---|---|---|---|---|---|
| <id> | <one command sentence> | <arch, type, lint, runtime, test, or doc> | <check name, path, or "none"> | <links to 2+ past mistakes> | <doc-only, ratchet N, or enforced> | <one sentence; required below type> |

Rules for this table:

1. A row starts at the second occurrence of a mistake. Fix it at the highest level that works, in the same change.
2. If the mistake of a `doc-only` row occurs again, move the rule to a stronger level in the same change.
3. For a common pattern, set `ratchet N` (N old cases remain). The check fails only when a change adds more. At zero, set `enforced`.
4. When the mistake can no longer be written (level `arch` or `type`), delete the row.
5. The ID is the same in the check, in its message, and in this table.
