# Playbook: Refactor

**You own the contract. The structure changes. The behavior does not.**

## Steps

1. Pin the behavior first: a characterization test, a snapshot, or an equivalence check. A type check and a lint pass are not a pin.
2. Name the missing structure. The new shape must delete branches or invalid states. It must not add layers.
3. Remove dead code and unused paths first.
4. Move in small steps. The pin must pass after each step.
5. Move every caller to the new API, and delete the old API in the same wave. Do not keep a shim.
6. Check renames in strings, documents, and configuration. Tools miss them.
7. Prove on the real artifact that the behavior is the same.
8. If the change does not make the code easier to read somewhere, revert it.
9. Order the commits: removal, then reshape, then cleanup.
10. Continue with `agent/playbooks/open-pr.md`.
