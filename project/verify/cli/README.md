# Verification CLI

Build one small CLI that agents use to drive the app. It must have:

1. Few commands that do real work and that combine well.
2. A dry-run option for each destructive command.
3. Subcommands that show the features step by step.
4. Error messages that say what to do instead.
5. Full help text.
6. Machine-readable output (JSON).
7. Its own tests.

Reason: a reusable, tested driver costs fewer tokens than new code in each task, and it gives the same result each time.
