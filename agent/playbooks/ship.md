# Playbook: Ship

**You own the verdicts. Only verified changes land.**

## Steps

1. For each pull request, start a fresh verifier that did not write the code.
2. The verifier runs the change as a user would, with `project/verify/`. It changes no files on the branch.
3. The verifier posts one verdict as a comment on the pull request: PASS, PASS+NOTES, or FAIL. The comment gives the evidence for each done check: the commands and their output. A forge can block an approval of your own pull request, so use a comment, not an approval.
   - The first line is `<VERDICT> at <full commit SHA>`. The second line is the signature: `Signed: <actor name>`.
   - The pull request body ends with `Signed: <actor name>` for the builder.
   - In a project, all agents can use one forge account. So the signature, not the account, shows who acted. A verifier's name must differ from the builder's name.
4. The verifier keeps its full evidence log in `logs/`, which is not committed.
5. Green CI and an approving bot review are not verdicts.
6. After a rebase, compare the patch ID with the verified one before you trust an old verdict.
7. Land only the verified pull requests, from the bottom of the stack, one at a time. Stop at the first pull request that is not verified.
8. After each merge, read the result back. A merge command can report success when it only queued the merge.
