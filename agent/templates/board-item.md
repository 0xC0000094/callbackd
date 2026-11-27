# Task board item

```
Goal:          <one sentence>
Done checks:   <checks that can pass or fail>
Proof:         <video, output, or number to show>
Plan link:     <plans/<name>.md, for stories>
PR link(s):    <set when a pull request opens>
Verdict:       PASS | PASS+NOTES | FAIL  (from someone who did not write the change)
Decision log:  <logs/<task>.tsv, for long or unattended work>
Resume note:   <filled in when work pauses>
Owner:         <one agent or one person, as an actor name>
```

Actor names have four parts, joined by `/`:

```
<role>/<kind>/<model>/<run>
role:  builder | worker | verifier | judge | manager | human
kind:  agent | human
model: the model ID (for example from agent/MODELS.md), or "-" for a human
run:   a short name that the starter gives to this agent run, unique in the project
       (for example pr8-v3 for the third verifier run on pull request 8)

Examples:  builder/agent/claude-opus-5-5/v2-main
           verifier/agent/claude-sonnet-5-5/pr8-v3
           human/human/-/owner
```

Do not put a person's real name or email address in an actor name.

Status changes need evidence:

```
New → Investigating → Planned → In PR → Verified → Done
        findings      plan file   PR link   verdict   merged + check on main
```

Rules for an agent that uses the board:

1. Board status is a claim. The artifact is the truth. Set "Done" only with a merged pull request and a passed check.
2. Status and evidence: only the agent that owns or claims a task changes its status or adds its evidence. A verifier adds only its verdict.
3. Reports: a board can hold reports (activity, steps, decisions, waits, stops). Then every agent reports its own work there, and the steps live on the board. Otherwise, steps stay in the agent's own task list.
4. Updates must be safe to repeat.
5. If the board cannot be reached for a status or evidence change, stop. Do not guess the state. A failed report does not stop the work.
