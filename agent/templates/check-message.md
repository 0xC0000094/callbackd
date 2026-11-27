# Check message standard

Each lint rule or CI check that comes from a repeated mistake uses this message format.

```
<id>: <the problem, in this code, with the real symbol>.
Use <the exact replacement: file, type, function, or command> instead.
[<the reason, one clause, only if an agent could otherwise patch around the error>.]
Do not disable this check. Exceptions need a reason, an expiry date, and human approval.
```

## Rules

1. Start with the stable ID. The rule table uses the same ID.
2. State the problem in the words of this code, with the real symbol.
3. Name the exact fix: the file, type, function, or command to use.
4. If the fix is a command, give the full command.
5. Give a reason only when an agent could otherwise work around the error.
6. Never suggest a workaround or a suppression.
7. Three sentences maximum before the exception line.

## Example

```
no-main-in-renderer: electron-renderer/ cannot import electron-main/, not even types. Move the shared type to shared/types.ts and import it from there. Do not disable this check. Exceptions need a reason, an expiry date, and human approval.
```

## Tests for a new message

1. The check fails on each past mistake in the Proof column of the rule table.
2. Give a fresh agent only the failing code and the message. Do not say that it is a test. It must apply the named fix, not a workaround. Run it two times.
3. A script confirms that the replacement in the message exists.
4. Remove the reason clause and run step 2 again. If the agent still fixes it correctly, keep the clause removed.
