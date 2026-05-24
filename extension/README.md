# Callbackd browser extension

One-click handoff from any job page to [callbackd.vercel.app](https://callbackd.vercel.app).

The extension reads the current tab's URL and visible job posting text, then opens the analyzer in a new tab with the data pre-filled. The analysis itself happens on callbackd.vercel.app — the extension does not call the API directly, so the deployed app's security stack still applies.

## Install (Chrome / Edge / Brave)

1. Open `chrome://extensions/`
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder in this repo
5. Pin the Callbackd icon to the toolbar for one-click access

## Install (Firefox)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file inside the `extension/` folder

Firefox loads the extension only for the current session. For permanent installation, package and submit to AMO.

## How it works

1. You're on any job posting page (LinkedIn, Indeed, a company careers page, anywhere).
2. Click the Callbackd icon in your toolbar.
3. The popup shows the page URL and a preview of the captured text.
4. Click **Open in Callbackd**.
5. A new tab opens at callbackd.vercel.app with the URL and posting text already filled in.
6. Pick Quick Check or Deep Research and run the analysis as normal.

## Data flow

The extension uses Chrome's `chrome.scripting.executeScript` to run a small extraction function inside the page you're viewing. It looks for job-description-shaped DOM elements first, then falls back to the main content area, then to the body text. It captures up to 20,000 characters.

The captured payload (URL, page title, company hint, extracted text) is base64-encoded and passed to the web app via a URL hash fragment (`#cbd=...`). The hash never leaves the browser. The web app reads it, populates the form, and clears the hash from history.

## Regenerating icons

```
node extension/scripts/gen-icons.mjs
```

Writes solid-color placeholder PNGs to `extension/icons/`. Replace with a real logo when you have one.

## Permissions used

* `activeTab` — read the currently focused tab when you click the icon.
* `scripting` — run the extraction function in the page.
* `host_permissions: <all_urls>` — required so the extraction can run on any job site, not just a hardcoded list.

The extension does not background-poll, track browsing, or send anything to a server other than opening a new tab to callbackd.vercel.app.
