import axios from "axios";
import * as cheerio from "cheerio";
import dns from "node:dns/promises";
import net from "node:net";
import { assertAllowedOrigin } from "./_lib.js";

// Reject IPs that point at the host itself or the private network. This is the
// core SSRF defense: a user-supplied URL must resolve to a public address.
function isPrivateIp(ip) {
  if (ip.startsWith("::ffff:")) ip = ip.slice(7); // IPv4-mapped IPv6
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA
    if (lower.startsWith("fe80")) return true; // link-local
    return false;
  }
  return true; // unparseable -> block
}

// Returns a validated URL object, or null if it must not be fetched.
async function assertSafeUrl(rawUrl) {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  if (host === "localhost") return null;

  let addresses;
  if (net.isIP(host)) {
    addresses = [host];
  } else {
    try {
      addresses = (await dns.lookup(host, { all: true })).map((r) => r.address);
    } catch {
      return null;
    }
  }
  if (addresses.length === 0 || addresses.some(isPrivateIp)) return null;
  return u;
}

// Fetch while validating the initial URL AND every redirect target, so an
// attacker can't bypass the check with a public URL that 30x-redirects inward.
async function safeFetch(startUrl) {
  let current = startUrl;
  for (let hop = 0; hop < 5; hop++) {
    const safe = await assertSafeUrl(current);
    if (!safe) throw new Error("blocked-url");
    const resp = await axios.get(safe.toString(), {
      timeout: 15000,
      maxRedirects: 0,
      maxContentLength: 5 * 1024 * 1024,
      validateStatus: (s) => s >= 200 && s < 400,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CallbackdBot/0.1; +https://callbackd.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (resp.status >= 300 && resp.status < 400 && resp.headers.location) {
      current = new URL(resp.headers.location, safe).toString();
      continue;
    }
    return resp;
  }
  throw new Error("too-many-redirects");
}

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
