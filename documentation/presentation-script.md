# Callbackd — Presentation deck content

Plain-text mirror of the slides in `public/presentation/index.html`. Useful as a script during the demo, for sharing with non-presenting reviewers, or as a backup if the deck ever fails to load.

---

## Slide 1 — Title

# Callbackd

Job posting legitimacy analyzer

> How do we identify high-quality, legitimate remote job opportunities using AI?

**Speaker notes:** Open with the prompt itself. Pause. Then say: this is one answer.

---

## Slide 2 — The problem

- Job seekers waste hours on postings that were never going to call back.
- Fake postings, ghost jobs, MLMs disguised as roles, and copy paste filler all look reasonable at first glance.
- The remote work boom multiplied this. More postings, more countries, harder to verify.

**Speaker notes:** Replace these with specific examples or a personal story. The stronger the human angle, the better the open.

---

## Slide 3 — The answer

Two modes. Same rubric. Different depth of evidence.

**⚡ Quick Check**
LLM inference over the posting text. Pattern recognition, language signals, red flags. A few seconds.

**🔍 Deep Research**
LLM plus agentic web search. Verifies the company exists, checks size claims, sanity checks the role. 30 to 60 seconds.

**Speaker notes:** The trick is the same rubric in both modes. Deep Research is not a different product, it is the same product with receipts.

---

## Slide 4 — Nine signals, traffic light scored

- Company Legitimacy
- Size Claim Accuracy
- Role Coherence
- Keyword Believability
- Remote Claim Validity
- Salary Realism
- Effort Asymmetry
- Compensation Red Flags
- Posting Specificity

Each one gets green, yellow, or red, with a one sentence verdict and the evidence behind it. An overall verdict rolls up.

---

## Slide 5 — Three outcomes

**Likely Legitimate (green)**
Findable company, coherent role, specific responsibilities, realistic comp.

**Needs Scrutiny (yellow)**
Mixed signals. Could be a real role with sloppy framing, or a ghost posting in a good suit.

**High Risk (red)**
Scam patterns, unpaid trials, commission only, unverifiable company, generic filler.

---

## Slide 6 — Remote, hybrid, or in person

Every report classifies the work arrangement as a peer signal to the legitimacy verdict.

- Remote, Hybrid, In-person, or Unclear, surfaced at the top of the report.
- A one sentence note describes any caveats found in the posting, for example "Remote claimed but US timezones only, occasional travel required".
- Distinct from the rubric category that asks whether the remote claim itself is trustworthy.

---

## Slide 7 — Live demo

[QR code → https://callbackd.vercel.app/]

callbackd.vercel.app →

Three postings to show: a real careers page, a subtle ghost job, and an obvious scam.

**Speaker notes:** Have all three postings already in clipboard or in browser tabs. Run Quick Check first for speed, then Deep Research to show the research trail.

---

## Slide 8 — How it is built

- React, Vite, Tailwind CSS on the frontend.
- Vercel serverless functions for the API.
- Claude Sonnet 4.6 via the Anthropic SDK, with the hosted `web_search` tool for Deep Research.
- Server-Sent Events stream real progress from the model to the loading UI. No fake timers.
- Origin allowlist, Vercel bot protection, WAF rate limit, and a hard spend cap on the key.

---

## Slide 9 — Roadmap

Phase 1 is what you saw in the demo. Phases 2 and 3 are how the product compounds.

**① Phase 1 · Live — Legitimacy Analyzer**
Two modes, nine signals, traffic light scored.

**② Phase 2 · Next — Candidate Intelligence**
Resume comparison at the bullet level. Gap analysis. Targeted interview prep.

**③ Phase 3 · Later — Community Outcomes**
Verified applicant submissions. Recommendations move from inference to pattern matching against real data.

---

## Slide 10 — Flywheel

# More candidates → better outcome data → better recommendations → more candidates.

Every outcome submitted makes the next recommendation smarter.

---

## Slide 11 — Thank you

# Thank you

Questions?

- **Live demo** — callbackd.vercel.app
- **Source** — github.com/0xC0000094/callbackd
- **James Ventura** — linkedin.com/in/james--ventura

[QR code → https://www.linkedin.com/in/james--ventura/]
Scan to connect on LinkedIn
