// Runs in the extension popup. Talks to the current tab via chrome.scripting,
// then opens callbackd.vercel.app with the scraped data as a hash payload.

const WEB_APP_URL = "https://callbackd.vercel.app";
const MAX_TEXT_CHARS = 20000;

const $pageUrl = document.getElementById("page-url");
const $preview = document.getElementById("preview");
const $status = document.getElementById("status");
const $analyze = document.getElementById("analyze");
const $recheck = document.getElementById("recheck");

let cached = null;

function setStatus(msg, isError) {
  $status.textContent = msg || "";
  $status.classList.toggle("error", !!isError);
}

function pageScrape() {
  // This function runs INSIDE the inspected page.
  const SELECTORS = [
    '[class*="job-description" i]',
    '[class*="jobdescription" i]',
    '[id*="job-description" i]',
    '[id*="jobDescription" i]',
    '[class*="JobDetails" i]',
    '[class*="job-details" i]',
    '[class*="jobPosting" i]',
    '[class*="posting" i]',
    '[class*="description" i]',
    '[role="main"]',
    "main",
    "article",
  ];

  function extractText(el) {
    if (!el) return "";
    const c = el.cloneNode(true);
    // Note: we deliberately do NOT strip <form>. ASP.NET-based job sites
    // (e.g. Ontario Public Service Careers) wrap the entire page body in
    // one form, so removing it would erase all content.
    c.querySelectorAll(
      'script, style, nav, header, footer, noscript, svg, iframe, button, input[type="button"], input[type="submit"], [aria-hidden="true"]',
    ).forEach((n) => n.remove());
    // textContent is reliable on detached nodes; innerText is browser-dependent
    return (c.textContent || "")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  let best = "";
  let bestSelector = "";
  for (const sel of SELECTORS) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const t = extractText(el);
    if (t.length > best.length) {
      best = t;
      bestSelector = sel;
    }
    if (best.length > 2000) break;
  }
  if (best.length < 500) {
    const bodyText = extractText(document.body);
    if (bodyText.length > best.length) {
      best = bodyText;
      bestSelector = "body";
    }
  }

  const h1 = document.querySelector("h1");
  const titleMeta =
    document.querySelector('meta[property="og:title"]')?.content ||
    (h1 && h1.textContent) ||
    document.title ||
    "";
  const companyMeta =
    document.querySelector('meta[property="og:site_name"]')?.content ||
    document.querySelector('meta[name="application-name"]')?.content ||
    "";

  return {
    url: location.href,
    pageTitle: titleMeta.trim(),
    pageCompany: companyMeta.trim(),
    text: best,
    selector: bestSelector,
  };
}

async function readActiveTab() {
  setStatus("");
  $analyze.disabled = true;
  $preview.textContent = "Reading the page…";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) {
    setStatus("No active tab found.", true);
    return;
  }
  $pageUrl.textContent = tab.url;

  if (!/^https?:\/\//.test(tab.url)) {
    setStatus("This page can't be read (non-web URL).", true);
    return;
  }

  let results;
  try {
    results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: pageScrape,
    });
  } catch (err) {
    setStatus("Couldn't read this page. " + (err?.message || ""), true);
    return;
  }

  const data = results?.[0]?.result;
  if (!data) {
    setStatus("Nothing extracted from this page.", true);
    return;
  }

  const text = (data.text || "").slice(0, MAX_TEXT_CHARS);
  if (text.length < 120) {
    setStatus(
      "Too little text on this page to analyze. Try a job posting page.",
      true,
    );
    $preview.textContent = text || "(empty)";
    return;
  }

  cached = {
    url: data.url,
    title: data.pageTitle || "",
    company: data.pageCompany || "",
    text,
  };
  $preview.textContent = text.slice(0, 400) + (text.length > 400 ? "…" : "");
  const where = data.selector ? ` from ${data.selector}` : "";
  setStatus(`${text.length.toLocaleString()} characters captured${where}.`);
  $analyze.disabled = false;
}

function encodePayload(obj) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)));
}

function handoff() {
  if (!cached) return;
  const payload = encodePayload(cached);
  const url = `${WEB_APP_URL}/#cbd=${payload}`;
  chrome.tabs.create({ url });
  window.close();
}

$analyze.addEventListener("click", handoff);
$recheck.addEventListener("click", readActiveTab);

readActiveTab();
