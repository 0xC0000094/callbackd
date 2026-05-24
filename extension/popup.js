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
  //
  // LinkedIn-specific fast path: LinkedIn embeds the active JobPosting as
  // structured JSON in <code id="bpr-guid-*"> elements (their Voyager BPR
  // payload). When we can find that, it's far cleaner than scraping the
  // DOM, where the job-view page mixes the selected job with a "More jobs"
  // recommendation feed in the same scaffold container.
  function extractLinkedInJob() {
    if (!/(^|\.)linkedin\.com$/i.test(location.hostname)) return null;

    function getActiveJobId() {
      const m = location.pathname.match(/\/jobs\/view\/(\d+)/);
      if (m) return m[1];
      const cur = new URLSearchParams(location.search).get("currentJobId");
      return cur || null;
    }

    const activeJobId = getActiveJobId();
    const codeBlocks = document.querySelectorAll('code[id^="bpr-guid-"]');

    let bestPosting = null;
    let bestPostingMatchesActive = false;
    const companyByUrn = new Map();
    const geoByUrn = new Map();
    const employmentByUrn = new Map();

    for (const code of codeBlocks) {
      let parsed;
      try {
        parsed = JSON.parse(code.textContent || "");
      } catch (e) {
        continue;
      }
      const included = Array.isArray(parsed.included) ? parsed.included : [];
      const candidates = [parsed.data, ...included].filter(Boolean);

      for (const item of candidates) {
        const t = item.$type || item["$type"];
        if (!t) continue;
        if (t === "com.linkedin.voyager.dash.jobs.JobPosting" && item.title && item.description) {
          const urn = item.entityUrn || item.trackingUrn || "";
          const matchesActive = !!activeJobId && urn.includes(activeJobId);
          if (matchesActive) {
            bestPosting = item;
            bestPostingMatchesActive = true;
          } else if (!bestPostingMatchesActive && !bestPosting) {
            bestPosting = item;
          }
        } else if (t === "com.linkedin.voyager.dash.organization.Company" && item.entityUrn) {
          companyByUrn.set(item.entityUrn, item);
        } else if (t === "com.linkedin.voyager.dash.common.Geo" && item.entityUrn) {
          geoByUrn.set(item.entityUrn, item);
        } else if (t === "com.linkedin.voyager.dash.hiring.EmploymentStatus" && item.entityUrn) {
          employmentByUrn.set(item.entityUrn, item);
        }
      }
    }

    if (!bestPosting) return null;

    const title = bestPosting.title || "";
    const description = (bestPosting.description && bestPosting.description.text) || "";
    if (description.length < 200) return null;

    const companyName =
      (bestPosting.companyDetails && bestPosting.companyDetails.name) ||
      (bestPosting.companyDetails &&
        bestPosting.companyDetails.jobCompany &&
        bestPosting.companyDetails.jobCompany.rawCompanyName) ||
      "";
    let locationName = "";
    if (bestPosting.location && typeof bestPosting.location === "object") {
      locationName =
        bestPosting.location.defaultLocalizedName ||
        bestPosting.location.abbreviatedLocalizedName ||
        "";
    } else if (typeof bestPosting.location === "string") {
      const geo = geoByUrn.get(bestPosting.location);
      locationName = (geo && (geo.defaultLocalizedName || geo.abbreviatedLocalizedName)) || "";
    } else if (bestPosting["*location"]) {
      const geo = geoByUrn.get(bestPosting["*location"]);
      locationName = (geo && (geo.defaultLocalizedName || geo.abbreviatedLocalizedName)) || "";
    }
    let employmentType = "";
    if (bestPosting.employmentStatus && typeof bestPosting.employmentStatus === "object") {
      employmentType = bestPosting.employmentStatus.localizedName || "";
    } else if (bestPosting["*employmentStatus"]) {
      const e = employmentByUrn.get(bestPosting["*employmentStatus"]);
      employmentType = (e && e.localizedName) || "";
    }

    const lines = [];
    if (title) lines.push(`Job Title: ${title}`);
    if (companyName) lines.push(`Company: ${companyName}`);
    if (locationName) lines.push(`Location: ${locationName}`);
    if (employmentType) lines.push(`Employment Type: ${employmentType}`);
    lines.push("");
    lines.push("Description:");
    lines.push(description);

    return {
      text: lines.join("\n").trim(),
      title,
      company: companyName,
      selector: "linkedin:bpr-json",
    };
  }

  // Strategy: try site-specific selectors first, ordered most-specific to
  // most-general. The first match that yields enough text wins — we do NOT
  // pick the longest match across all selectors, because pages like
  // Indeed search results have a giant body (all results) AND a right
  // pane with one job in it, and we want the right pane.
  const PRIORITY_SELECTORS = [
    // Indeed
    ".jobsearch-RightPane",
    "#jobsearch-ViewjobPaneWrapper",
    "#viewJobSSRRoot",
    "#jobDescriptionText",
    // LinkedIn (current jobs UI, 2025+)
    ".jobs-search__job-details--container",
    ".jobs-semantic-search-job-details-wrapper",
    ".job-view-layout.jobs-details",
    ".job-details-about-the-job-module__description",
    ".scaffold-layout__detail",
    // LinkedIn (older jobs UI — kept for backward compat)
    ".jobs-description-content__text",
    ".jobs-description__content",
    ".jobs-details__main-content",
    ".show-more-less-html__markup",
    '[class*="jobs-description" i]',
    // Generic site conventions
    '[class*="job-description" i]',
    '[class*="jobdescription" i]',
    '[id*="job-description" i]',
    '[id*="jobDescription" i]',
    '[class*="job-posting" i]',
    '[class*="jobPosting" i]',
    '[class*="JobDetails" i]',
    '[class*="job-details" i]',
  ];

  // Used only if no priority selector returns enough text.
  const FALLBACK_SELECTORS = [
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

  // LinkedIn fast path — try the structured JSON before any DOM scraping.
  const linkedInResult = extractLinkedInJob();
  if (linkedInResult && linkedInResult.text.length >= 400) {
    return {
      url: location.href,
      pageTitle: linkedInResult.title || document.title || "",
      pageCompany: linkedInResult.company || "",
      text: linkedInResult.text,
      selector: linkedInResult.selector,
    };
  }

  let best = "";
  let bestSelector = "";

  // Priority pass: first selector that returns enough text wins.
  for (const sel of PRIORITY_SELECTORS) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const t = extractText(el);
    if (t.length >= 400) {
      best = t;
      bestSelector = sel;
      break;
    }
    if (t.length > best.length) {
      best = t;
      bestSelector = sel;
    }
  }

  // Fallback pass: only if we still have nothing substantial.
  if (best.length < 400) {
    for (const sel of FALLBACK_SELECTORS) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const t = extractText(el);
      if (t.length > best.length) {
        best = t;
        bestSelector = sel;
      }
    }
  }

  // Body fallback: only if nothing else worked.
  if (best.length < 400) {
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
