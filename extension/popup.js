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
    '[class*="description" i]',
    "main",
    "article",
  ];

  function clone(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll(
      "script, style, nav, header, footer, noscript, svg, button, form",
    ).forEach((n) => n.remove());
    return c;
  }

  function textOf(el) {
    return clone(el).innerText.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }

  let best = "";
  for (const sel of SELECTORS) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const t = textOf(el);
    if (t.length > best.length) best = t;
    if (best.length > 1500) break;
  }
  if (best.length < 300) {
    best = textOf(document.body);
  }

  const titleMeta =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.querySelector("h1")?.innerText ||
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
  if (text.length < 200) {
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
  setStatus(`${text.length.toLocaleString()} characters captured. Ready.`);
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
