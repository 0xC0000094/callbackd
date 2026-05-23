# Callbackd

**Job posting legitimacy analyzer for the remote-work era.**

Live: [callbackd.vercel.app](https://callbackd.vercel.app)

---

## The hackathon prompt

> _How do we identify high-quality, legitimate remote job opportunities using AI?_

Most ghost-job tooling stops at flag-the-scam. Callbackd answers the question one layer up: not just _is this fake?_ but _what kind of work is this, and does it survive scrutiny?_ Every analysis returns two top-line signals — a legitimacy verdict and a work-arrangement classification — so candidates know in one screen whether to keep reading.

---

## What it does (Phase 1)

Paste a job posting URL or the raw text. Pick one of two modes. Get a scored report.

### Two modes, same rubric

| | Quick Check ⚡ | Deep Research 🔍 |
|---|---|---|
| **What it does** | LLM inference over the posting text — pattern recognition, language signals, red flags | LLM **plus** agentic web search to verify the company exists, check size claims, and sanity-check role coherence |
| **Time** | A few seconds | 30–60 seconds |
| **Output** | Verdict, work arrangement, 4–7 key findings, at-a-glance category scores | Everything in Quick Check **plus** a per-category evidence breakdown and a research trail (actual search queries + sources consulted) |
| **What you get** | Pattern recognition in seconds | Pattern recognition with receipts |

### The rubric — nine categories, traffic-light scored

| # | Category | Asks |
|---|---|---|
| 1 | Company Legitimacy | Does the company verifiably exist? |
| 2 | Size Claim Accuracy | Does the implied headcount match what's findable? |
| 3 | Role Coherence | Do the responsibilities match the title? |
| 4 | Keyword Believability | Do the required skills cohere for this level? |
| 5 | Remote Claim Validity | Is "remote" genuine or hiding restrictions? |
| 6 | Salary Realism | Is comp present, specific, and market-realistic? |
| 7 | Effort Asymmetry | Is the application process reasonable? |
| 8 | Compensation Red Flags | Commission-only, unpaid trial, equity-only, vague "competitive"? |
| 9 | Posting Specificity | Specific responsibilities, or copy-paste filler? |

Each category gets `green` / `yellow` / `red` with a one-sentence verdict and the specific evidence behind it. Overall verdict rolls up to **Likely Legitimate** / **Needs Scrutiny** / **High Risk**.

### Work arrangement, surfaced as a peer signal

Alongside the legitimacy verdict, every report classifies the role as **Remote** / **Hybrid** / **In-person** / **Unclear**, with a one-sentence caveat noting any hidden restrictions (e.g. "Remote claimed but PST/EST timezones only, occasional travel to HQ required").

This is what makes the answer to the hackathon question specifically about _remote_ work — not just _is this real_ but _is the remote claim itself trustworthy_.

---

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Vercel serverless functions (Node.js)
- **AI:** Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) via the official SDK
- **Tools:** Anthropic's hosted `web_search_20250305` for the Deep Research agent
- **Scraping:** Axios + Cheerio for URL ingestion (job board domains rejected gracefully)
- **Streaming:** Server-Sent Events for real-time progress signals tied to actual model events (no fake timers)

---

## Architecture

```
callbackd/
├── api/
│   ├── _lib.js           Shared helpers: origin allowlist, untrusted-input wrapping
│   ├── scrape.js         POST: URL → extracted title/company/description
│   ├── quickcheck.js     POST (SSE): JD text → rubric, key findings, verdict
│   └── deepresearch.js   POST (SSE): JD text → rubric with web-search evidence + research trail
├── src/
│   ├── App.jsx              Three-step state machine: input → loading → results
│   ├── components/
│   │   ├── JobInput.jsx     URL + text inputs, mode buttons
│   │   ├── LoadingState.jsx Step list driven by real SSE events from the API
│   │   └── Results.jsx      Verdict + arrangement heroes, findings, breakdown
│   └── main.jsx
├── vercel.json              maxDuration: 60s (gives Deep Research room)
└── package.json
```

Both API endpoints return Server-Sent Events. As the model hits real milestones — text block starting, web search firing, search result returning — the server emits progress events that the client uses to drive the loading UI. The final event carries the parsed rubric JSON.

---

## Run locally

```bash
git clone https://github.com/0xC0000094/callbackd.git
cd callbackd
npm install
```

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm i -g vercel    # if you don't already have it
vercel link        # links to the existing Vercel project
vercel dev         # runs the frontend + /api/* on localhost:3000
```

`npm run dev` alone runs only the Vite frontend; the `/api/*` routes need the Vercel CLI.

---

## Security posture

A demo that costs money per request to a public endpoint deserves more than zero defense. The deployed stack:

1. **Hard spend cap** on the Anthropic key (Console-side, can't overspend)
2. **Vercel Bot Protection** at the platform edge — JS challenge blocks scripted/curl clients before they reach function code
3. **Origin allowlist** (`api/_lib.js`) — rejects requests whose `Origin` / `Referer` don't match the deployed domain
4. **Vercel WAF rate limit** on `/api/*` — 10 req/min/IP
5. **Prompt-injection guards** — job posting text is sanitized and wrapped as untrusted data; the system prompt instructs the model never to treat scraped text or search results as instructions

---

## What's _not_ in Phase 1

By design — these are roadmap items, not gaps:

- No user accounts, login, or database
- No resume upload or candidate-side analysis
- No community submissions or outcome tracking
- No support for LinkedIn / Indeed / Glassdoor URLs (paste the text instead — they actively block scraping)

If a feature isn't above, it's not built.

---

## The longer answer to the hackathon prompt

Phase 1 ships a working answer to the literal question. Phases 2 and 3 answer the question underneath it.

### Phase 2 — Candidate intelligence layer
User submits their resume alongside the job posting. The model compares JD language against resume language, identifies specific gaps, and suggests exact rewrites at the bullet level. Generates targeted interview prep based on what _this specific company_ is actually testing for.

### Phase 3 — Community and outcome data
Verified applicant submissions. Candidates report what happened after they applied; evidence-based submission (recruiter email, calendar invite, offer letter) raises the cost of bot submissions. Aggregate outcomes attach to companies and roles. The AI stops guessing and starts pattern-matching against real wins and losses.

**The compounding effect:** more candidates → better outcome data → better recommendations → more candidates. The product gets harder to copy the longer it runs.

---

## License

Built for hackathon submission. No license declared yet.
