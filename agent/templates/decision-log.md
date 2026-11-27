# Decision log

Use `agent/templates/decision-log.tsv` for long or unattended work. Copy it to `logs/<task>.tsv`. Write one row for each decision.

| Column | Content |
|---|---|
| ts | The time |
| phase | The playbook step or the phase |
| decision | What you decided |
| why | The reason, in one sentence |
| evidence | A link or path to the evidence |
| result | kept, reverted, or open |

At the end, a reviewer from a different model vendor reads the log and the transcript. The reply ends with an "Attention" section. The human reads that section first.
