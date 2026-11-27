# Playbook: Open a pull request

**You own a pull request that a reviewer can understand in one minute.**

## Steps

1. Work in a worktree off the main branch. Keep unrelated changes out.
2. Rebase into small, ordered commits that can each land.
3. Clean the diff: no narrating comments, no unused guards, no dead paths.
4. Title: `type(scope): subject`. Name a real symbol if one carries the change.
5. Body: use `agent/templates/pr-body.md`. 40 lines maximum. Link logs and tables. Do not paste them.
6. Open it ready for review, not as a draft.
7. Link the pull request to its task on the board.
8. For a follow-up, open a stacked pull request. Do not grow this branch.

Opening a pull request does not start babysitting. Use `agent/playbooks/babysit.md` when the user asks.
