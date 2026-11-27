# Brief: callbackd release 2, the callbackd skill

**Problem:** callbackd checks whether a job posting is legitimate. Today it runs only on the owner's website, with the owner's API key, and the site is paused. Users cannot run the check in their own Claude.

**Users:** job seekers who use Claude (claude.ai, Claude Code, or Cowork). The owner, who wants traffic to the website and to GitHub.

**Goal:** a user finds the callbackd skill through a link on the callbackd website, and downloads it from GitHub. The user adds it to their own Claude, and gets the same report as on the website. Their own Claude plan pays for it, so they need no API key.

## Starting point

- The callbackd repository (public, the owner's own hackathon entry): a Vite and React website, Vercel serverless functions in api/, and a browser extension. The rubric, the report, and the verdict rules are in the code and in the README.
- The website and the extension stay. The skill is a supplement (the owner, build thread #60).
- The skill differences between claude.ai, Claude Code, and Cowork are not known well enough yet. The first step finds them in the official documentation.

## What it adds

| # | Part | What it does |
|---|---|---|
| 1 | Platform facts | A short document, with links to the official documentation, says how a skill is packaged, installed, and run in claude.ai, Claude Code, and Cowork, and what each one allows (scripts, network, files, size). The other parts follow it. |
| 2 | The skill | One skill folder with SKILL.md and reference files: the nine-category rubric, the colors, the verdict rules, the work-arrangement rules, Quick Check and Deep Research, the report template, and the callbackd style. Its rules come from the current code, so the skill and the website give the same verdicts. |
| 3 | Deep Research on each platform | Deep Research needs internet tools (the owner). Where the skill's scripts may reach the internet, it uses the same checks as the website. Where they may not, it uses Claude's own web tools, and the report says which checks ran. Where no internet tool exists, the skill says that Deep Research is not available there, and does not give a weaker report. |
| 4 | Report format | The report is an HTML artifact (the owner) with the nine categories, their colors, the evidence, and the overall verdict, in the callbackd style. Its name is "<date> - <job title> - <company>", with the date as YYYY-MM-DD. |
| 5 | Packages | A build step makes the package for each platform from the one skill folder. A GitHub release holds the packages. |
| 6 | Download page | An HTML page on the callbackd website, in its style, with the download links (to the GitHub release) and step-by-step install instructions for each platform. Links between the website and GitHub go both ways. |

## Rules that must always hold

1. The skill holds no API key and asks for none.
2. The skill and the website use one rubric. A test fails if they differ in a category, a color rule, or a verdict rule.
3. Nothing is deployed to Vercel, and no release is published, without the owner's approval on the board.
4. No secret goes into the repository, the release, or the board.

## Done when

1. **Platform facts:** the document exists, each fact links to official documentation, and the owner reads it on the board.
2. **Same verdicts:** for the demo postings in documentation/demo-test-postings.md, the skill's verdict and category colors equal the website's rules.
3. **Each platform:** the skill installs and runs in Claude Code, from the package, in a fresh project. For claude.ai and Cowork, the owner runs it once from the release and confirms on the board.
4. **Download page:** it builds with the website, it matches the site's style, and its links work, at 1280 and 360 pixels.
5. **Release:** a draft GitHub release holds the packages. The owner approves publishing it.
6. **Checks and verdicts:** a verifier that did not write the code posts a signed verdict on each pull request. A fresh session that the builder did not start verifies the last pull request.

## Out of scope

Unpausing the website's API features, a new API, payments, and changes to the extension.
