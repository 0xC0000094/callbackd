# Callbackd

Job posting legitimacy analyzer.

Live: https://callbackd.vercel.app

## What it does

Paste a job posting URL or the raw text. Pick a mode. Get a scored report.

## Modes

**Quick Check.** LLM inference over the posting text. Returns a verdict, a work arrangement classification, four to seven key findings, and at-a-glance category scores. A few seconds.

**Deep Research.** Same output as Quick Check plus agentic web search. The model looks up the company, checks size claims, and sanity-checks role coherence against comparable postings. Adds per-category evidence and a full research trail (the search queries used and the sources consulted). 30 to 60 seconds.

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
* Anthropic `web_search_20250305` tool for Deep Research
* Axios and Cheerio for URL scraping
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
