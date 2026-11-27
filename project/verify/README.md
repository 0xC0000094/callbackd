# Verification skill: <app name>

Any agent uses this skill to launch the app, drive it as a user, and capture evidence. Read `project/verify/features/README.md` first, then the file of the feature that you need.

## Launch

<the one command that starts a fresh instance with a disposable data directory, for example: `<command> --data /tmp/<app>-$RUN_ID`>

## Doctor

<the command that checks the instance. It must report the URL, the data directory, and the build revision.>

Run the doctor before the first drive, after each failed drive, and on each new session. If the doctor cannot see a problem (for example, a stuck UI), restart the instance.

## Drive

- Browser: `<cli> browser click|fill|press|snapshot --aria|screenshot`
- Terminal: `<cli> cli -- <command>`
- Use roles and accessible names, not CSS classes or element positions.

## Evidence

- UI: an accessibility snapshot and a screenshot that shows the app name.
- CLI: the command, stdout, stderr, and the exit code.
- A change to stored data: read the value back through a second, read-only view.
- Tag each artifact with the feature ID and the entry point. Store it in `<artifact dir>`.

## Cleanup

<the command that stops the instance and removes the data directory. Evidence must survive cleanup.>

## Helpers

<seed data, test users, and the one command that starts the whole environment>

## Self-proof (do this before you use the skill)

1. Launch.
2. Run the doctor.
3. Drive one feature from the feature map.
4. Capture its evidence.
5. Clean up.
6. Confirm that the evidence still exists.

If the proof fails, do not use the skill. Fix it first.

## Maintenance (stage 7: daily)

1. Start one read-only agent for each feature file. Each one reads the source, finds likely drift, and returns one live recipe.
2. Drive every feature at least one time, also when the source looks clean.
3. Classify each failure: doc drift (fix the map), harness gap (fix the harness), or product gap (report it; do not fix it in the documentation).
4. Change only files in `project/verify/`. Never edit product code here.
5. Report one outcome: clean, changed, or blocked.
