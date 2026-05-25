import * as cheerio from "cheerio";
import { assertAllowedOrigin, assertLaunched, safeFetch } from "./_lib.js";

const BLOCKED_DOMAINS = [
  "linkedin.com",
  "indeed.com",
  "jobbank.gc.ca",
  "glassdoor.com",
  "glassdoor.ca",
  "ziprecruiter.com",
  "monster.com",
];

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function isBlocked(domain) {
  if (!domain) return false;
  return BLOCKED_DOMAINS.some((b) => domain === b || domain.endsWith(`.${b}`));
}

function extractCompanyName($, domain) {
  const og = $('meta[property="og:site_name"]').attr("content");
  if (og) return og.trim();

  const appName = $('meta[name="application-name"]').attr("content");
  if (appName) return appName.trim();

  if (domain) {
    const root = domain.split(".").slice(-2, -1)[0];
    if (root) return root.charAt(0).toUpperCase() + root.slice(1);
  }
  return "Unknown";
}

function extractTitle($) {
  const candidates = [
    $('meta[property="og:title"]').attr("content"),
    $("h1").first().text(),
    $("title").text(),
  ];
  for (const c of candidates) {
    if (c && c.trim().length > 0) return c.trim();
  }
  return "Untitled role";
}

function extractDescription($) {
  $("script, style, nav, header, footer, noscript").remove();

  const selectors = [
    '[class*="job-description" i]',
    '[class*="jobdescription" i]',
    '[class*="description" i]',
    '[id*="job-description" i]',
    '[id*="description" i]',
    "main",
    "article",
  ];

  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().replace(/\s+/g, " ").trim();
      if (text.length > 300) return text;
    }
  }

  const body = $("body").text().replace(/\s+/g, " ").trim();
  return body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, reason: "Method not allowed" });
  }

  if (!assertAllowedOrigin(req, res)) return;
  if (!assertLaunched(res)) return;

  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    return res.status(400).json({ success: false, reason: "Missing url" });
  }

  const domain = getDomain(url);
  if (!domain) {
    return res.status(200).json({
      success: false,
      reason: "That doesn't look like a valid URL. Try pasting the text instead.",
    });
  }

  if (isBlocked(domain)) {
    return res.status(200).json({
      success: false,
      reason:
        "We can't read job board URLs (LinkedIn, Indeed, Glassdoor, etc.). Paste the job posting text below instead.",
    });
  }

  try {
    const { data: html } = await safeFetch(url);

    const $ = cheerio.load(html);
    const title = extractTitle($);
    const company = extractCompanyName($, domain);
    const description = extractDescription($);

    if (!description || description.length < 200) {
      return res.status(200).json({
        success: false,
        reason:
          "We couldn't extract enough job content from that page. Paste the text directly below.",
      });
    }

    return res.status(200).json({
      success: true,
      company,
      domain,
      title,
      description: description.slice(0, 12000),
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      reason:
        "We couldn't read that URL — this usually happens with LinkedIn or Indeed. Paste the job text below instead.",
    });
  }
}
