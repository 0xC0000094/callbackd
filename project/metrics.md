# Metrics

Record these numbers at stage 1, then each week. Quality must stay stable or improve while volume increases.

| Date | Pull requests merged | Revert rate | Number of checks | Number of code comments |
|---|---|---|---|---|
| <YYYY-MM-DD> | <n> | <%> | <n> | <n> |

## Review time

One row for each pull request. The human gives the minutes that they spent reviewing. The time between the request and the reply is only an upper limit.

| Pull request | Asked at | Human minutes | Notes |
|---|---|---|---|
| <#n> | <YYYY-MM-DD HH:MM> | <n> | <what took the time> |

Notes:

1. The revert rate does not count a bug that a later pull request fixes. Track those bugs too, if you can.
2. A pull request count measures how finely work is cut. It does not measure features.
3. Add a budget as a check when you can, for example a download-size limit or a frame-rate target. A budget that fails the build is better than a number in this file.
