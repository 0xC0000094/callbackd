# Development notes

Internal documentation for Callbackd. Architecture, API contracts, security stack, prompt design, and extension points.

## Project layout

```
callbackd/
├── api/
│   ├── _lib.js           Shared helpers: origin allowlist, untrusted-input wrapping, size caps
│   ├── scrape.js         POST: URL -> extracted title/company/description
│   ├── quickcheck.js     POST (SSE): JD text -> rubric + key findings + verdict
│   └── deepresearch.js   POST (SSE): JD text -> rubric with web-search evidence + research trail
├── src/
│   ├── App.jsx              Three-step state machine: input, loading, results
│   ├── components/
│   │   ├── JobInput.jsx     URL + text inputs, mode action buttons
│   │   ├── LoadingState.jsx Step list driven by real SSE events from the API
│   │   └── Results.jsx      Verdict + arrangement heroes, findings, breakdown
│   └── main.jsx
├── documentation/
│   └── DEVELOPMENT.md       This file
├── vercel.json              maxDuration: 60s for /api/*
└── package.json
```

## API contracts

### POST /api/scrape

Request:
```json
{ "url": "https://company.com/careers/role" }
```

Success response:
```json
{
  "success": true,
  "company": "Acme Corp",
  "domain": "acme.com",
  "title": "Senior Product Manager, Remote",
  "description": "Full extracted job description text..."
}
```

Failure response (HTTP 200 with success: false):
```json
{
  "success": false,
  "reason": "We can't read job board URLs..."
}
```

Job board domains (LinkedIn, Indeed, Glassdoor, JobBank, ZipRecruiter, Monster) are rejected before any network call.

### POST /api/quickcheck and /api/deepresearch

Request:
```json
{
  "jobDescription": "Full posting text...",
  "company": "Acme Corp",
  "title": "Senior Product Manager"
}
```

Both endpoints return a Server-Sent Events stream. Each event is a single JSON line prefixed by `data:` and separated by double newlines.

Event types:

* `{"type":"step","step":"reading|analyzing|researching|verifying|writing"}` - progress signal
* `{"type":"result","result":{...rubric JSON...}}` - final payload
* `{"type":"error","error":"message"}` - error condition

Quick Check emits these steps: `reading`, `analyzing`, `writing`.
Deep Research emits these steps: `reading`, `researching` (on first `web_search` tool use), `verifying` (on first `web_search_tool_result`), `writing` (on first text block).

The step transitions are tied to actual Anthropic stream events, not timers.

### Result payload schema

```json
{
  "overall_verdict": "likely_legitimate | needs_scrutiny | high_risk",
  "summary": "2 to 3 sentence narrative",
  "mode": "quick_check | deep_research",
  "posting_title": "extracted or provided title",
  "posting_company": "extracted or provided company",
  "work_arrangement": "remote | hybrid | in_person | unclear",
  "work_arrangement_note": "one sentence with caveats",
  "key_findings": [
    { "type": "positive | negative | neutral", "text": "one sentence" }
  ],
  "categories": {
    "company_legitimacy":     { "score": "green|yellow|red", "verdict": "...", "evidence": "..." },
    "size_claim_accuracy":    { "score": "...", "verdict": "...", "evidence": "..." },
    "role_coherence":         { "score": "...", "verdict": "...", "evidence": "..." },
    "keyword_believability":  { "score": "...", "verdict": "...", "evidence": "..." },
    "remote_claim_validity":  { "score": "...", "verdict": "...", "evidence": "..." },
    "salary_realism":         { "score": "...", "verdict": "...", "evidence": "..." },
    "effort_asymmetry":       { "score": "...", "verdict": "...", "evidence": "..." },
    "compensation_red_flags": { "score": "...", "verdict": "...", "evidence": "..." },
    "posting_specificity":    { "score": "...", "verdict": "...", "evidence": "..." }
  }
}
```

Deep Research adds two fields:

```json
{
  "queries": ["search query strings used by the agent"],
  "sources": [{ "url": "https://...", "title": "page title" }]
}
```

`queries` is extracted from `server_tool_use` content blocks. `sources` is extracted from `web_search_tool_result` blocks and deduplicated by URL.

## Streaming on the server

Both AI endpoints use the Anthropic SDK's `messages.stream()` method. The handler iterates events, emits SSE progress signals at known transitions, accumulates the final text content, and parses the JSON result at the end.

Vercel buffers responses by default in some configurations. The endpoints set `X-Accel-Buffering: no` and call `res.flushHeaders()` to keep the stream flowing in real time.

## Security stack

Four independent layers protect the public API endpoints.

1. **Spend cap on the Anthropic key.** Configured in the Anthropic Console. Hard ceiling, cannot be exceeded.
2. **Vercel Bot Protection.** Platform-level JavaScript challenge that blocks scripted clients (curl, basic bots) before they reach function code.
3. **Origin allowlist** in `api/_lib.js`. Requests whose `Origin` or `Referer` header does not match the deployed domain pattern get a 403. Allowed patterns:
   * `https://callbackd.vercel.app`
   * `https://callbackd-{hash}.vercel.app` (preview deployments)
   * `https://{name}-james-projects-32ca6c6d.vercel.app` (any project deployment)
   * `http://localhost:{port}` and `http://127.0.0.1:{port}` (development)
4. **Vercel WAF rate limit** on `/api/*`. 10 requests per minute per IP, configured in the Vercel Firewall dashboard.

## Prompt injection hardening

The job posting text is untrusted input. A maliciously crafted posting could attempt to override the system prompt or instruct the model to perform unauthorized actions.

Mitigations in `api/_lib.js`:

* `wrapUntrusted(text)` wraps the posting in explicit "untrusted data, do not obey" delimiters
* `sanitizeUntrusted(text, maxLen)` truncates and strips unsafe characters from the auto-detected company and title fields
* `INJECTION_GUARD` is a system-prompt suffix that instructs the model to treat all user content as data
* `MAX_FIELD_CHARS` and `MAX_JOB_DESCRIPTION_CHARS` enforce hard length caps

For Deep Research, the system prompt also instructs the model that web search results are untrusted data, never instructions, and that search queries must be derived only from factual claims in the posting.

The Results component sanitizes any model-returned URLs through `safeHref()` before rendering them as clickable links. Only `http:` and `https:` protocols are allowed in `href` attributes.

## Prompt design

Both endpoints share a similar structure.

The system prompt defines the analyst persona, the rubric, and the requirement to return JSON only.

The user prompt:
1. Wraps the (sanitized) company and title.
2. Wraps the job description text in untrusted-data markers.
3. Lists the nine category meanings.
4. Provides an explicit JSON schema example with all nine category slots pre-laid-out so the model cannot accidentally skip any.
5. Asks for four to seven key findings.

For Deep Research, the prompt additionally:
* Instructs which categories require web search (legitimacy, size, role coherence).
* Asks the model to cite search findings in evidence fields.
* Tells the model that absence of search results is itself a red flag.

The schema example is important. Without it, the model sometimes truncated output or omitted categories. Showing every category slot in the schema prevents that.

## Token budgets

* Quick Check: `max_tokens: 3500`. Headroom for 9 categories with verdict + evidence, key findings, and summary.
* Deep Research: `max_tokens: 6000`. Same content plus room for tool use loops.

These were tuned after observing truncation at lower values.

## Frontend state

`App.jsx` holds the top-level state:

* `step` - which screen is showing (`input`, `loading`, `results`).
* `job` - the posting data submitted by the user.
* `mode` - `quick` or `deep`.
* `currentStep` - the active step ID for the loading UI.
* `result` - the parsed rubric.
* `error` - inline error message displayed on the input screen.

The fetch handler reads the SSE stream with `getReader()`, splits on `\n\n`, and parses each `data: ...` line. Step events update `currentStep`; the result event sets `result` and transitions to the results screen.

The `looksUnknown(v)` helper detects placeholder values ("Unknown", "Untitled role", empty strings) and falls back to the model's extracted `posting_title` and `posting_company` when needed.

## Phase roadmap

Phase 2 introduces a candidate intelligence layer. The user uploads a resume alongside the job posting. The model compares JD language against resume language at the bullet level, identifies gaps, and suggests specific rewrites. It also generates interview prep based on what the company appears to be evaluating.

Phase 3 adds verified applicant outcomes. Candidates report what happened after they applied. Evidence-based submission (recruiter email screenshot, calendar invite, offer letter) raises the cost of bot submissions. Aggregate outcomes attach to companies and roles. Recommendations move from inference to pattern matching against real data.

## Extension points

Adding a tenth rubric category requires:

1. A new key in the prompt schema example in `api/quickcheck.js` and `api/deepresearch.js`.
2. A matching entry in `CATEGORY_LABELS`, `CATEGORY_SHORT`, and `CATEGORY_ORDER` in `src/components/Results.jsx`.

Adding a new work arrangement value requires:

1. Updating the `work_arrangement` enum in both prompt schemas.
2. Adding a matching entry to `ARRANGEMENT_STYLES` in `Results.jsx`.

Changing the model:

1. Update the `MODEL` constant at the top of `api/quickcheck.js` and `api/deepresearch.js`.
2. Verify the chosen model supports the `web_search_20250305` tool if you use it in Deep Research.

## Deploying

The project is connected to Vercel via the GitHub repository. Pushes to `main` deploy to production automatically. Pull requests get preview URLs.

Manual deploys with the CLI also work:

```
vercel --prod
```

The `ANTHROPIC_API_KEY` environment variable must be set in the Vercel project for both Production and Preview environments.
