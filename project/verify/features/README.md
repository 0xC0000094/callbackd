# Feature map: <app name>

This folder is the maintained list of the app's features, from the user's point of view. Read this index, then use one feature file as the recipe.

## Baseline preconditions

- <launch URL>
- <a disposable data directory for each run>
- <seed records>
- Never drive an instance that this verification run did not start.

## Driving conventions

- Start from the baseline.
- Use roles and accessible names.
- Restore the seed data after a change.
- Do not delete evidence.

## Proof and skip reporting

- Proof = the action and the state that results.
- If you cannot reach an entry point, report the command that you tried and the precondition that is missing.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file has a title, one paragraph, and exactly four sections. The sections are, in this order: Sub-features, How to get to it (user POV), Driving it with <cli>, Gotchas. Use `project/verify/features/_template.md`.

## Features

- [<feature>](<feature>.md): <one line about what it covers>
