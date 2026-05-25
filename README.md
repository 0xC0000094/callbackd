# Callbackd

Job posting legitimacy analyzer.

Live: https://callbackd.vercel.app

## What it does

Paste a job posting URL or the raw text. Pick a mode. Get a scored report.

## Modes

**Quick Check.** LLM inference over the posting text. Returns a verdict, a work arrangement classification, four to seven key findings, and at-a-glance category scores. A few seconds.

**Deep Research.** Same output as Quick Check plus an agentic tool-use loop. Alongside web search, the model calls real verification tools — domain registration records (RDAP/WHOIS), Internet Archive first-seen dates, and live HTTP headers — to check the posting's claims against ground truth. Adds per-category evidence, a research trail (the queries used and sources consulted), and a sixteen-point verification checklist grouped into identity, provenance, compensation, and viability, each marked clear, flag, or inconclusive. Around 100 seconds.

## Rubric

Nine categories, scored green, yellow, or red.

1. Company Legitimacy
2. Size Claim Accuracy
3. Role Coherence
4. Keyword Believability
5. Remote Claim Validity
6. Salary Realism
7. Effort Asymmetry
8. Compensation Red Flags
9. Posting Specificity

Each category includes a one sentence verdict and the specific evidence behind it. An overall verdict rolls up to Likely Legitimate, Needs Scrutiny, or High Risk.

## Work arrangement

The report classifies the role as Remote, Hybrid, In-person, or Unclear. A short note describes any caveats found in the posting, for example "Remote claimed but US timezones only, occasional travel required".

## Tech

* React, Vite, Tailwind CSS
* Vercel serverless functions (Node.js)
* Anthropic Claude Sonnet 4.6 via the official SDK
* Anthropic `web_search_20250305` plus custom tool use (RDAP/WHOIS, Internet Archive, HTTP headers) in an agentic loop for Deep Research
* Axios and Cheerio for URL scraping, behind an SSRF guard that blocks internal and cloud-metadata hosts
* Prompt-injection hardening: untrusted posting text is delimited and treated as data, and injection attempts are scored as a red flag
* Server-Sent Events for live progress updates

## Run locally

```
git clone https://github.com/0xC0000094/callbackd.git
cd callbackd
npm install
```

Create `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then:

```
npm install -g vercel
vercel link
vercel dev
```

`npm run dev` runs the Vite frontend only. The `/api/*` routes need `vercel dev`.

## Scope

This is Phase 1.

* Phase 1: legitimacy analyzer (this).
* Phase 2: resume comparison and interview prep.
* Phase 3: verified applicant outcomes and community data.

LinkedIn, Indeed, and Glassdoor URLs are not supported because those sites block scraping. Paste the posting text instead.

## Browser extension

A small Chrome / Edge / Brave / Firefox extension lives in [`extension/`](extension/). It reads the current tab's URL and visible job posting text, then opens callbackd.vercel.app with the data pre-filled. Useful for job board pages (LinkedIn, Indeed, Glassdoor) where direct scraping is blocked. Install instructions are in [`extension/README.md`](extension/README.md).

## Documentation

Architecture, API contracts, security, and prompt design notes are in [`documentation/DEVELOPMENT.md`](documentation/DEVELOPMENT.md).
