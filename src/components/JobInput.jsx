import { useState } from "react";

export default function JobInput({ onSubmit }) {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  const hasUrl = url.trim().length > 0;
  const hasText = text.trim().length >= 100;
  const canSubmit = hasUrl || hasText;

  async function handleRun(mode) {
    setScrapeError("");
    if (!canSubmit || busy) return;

    if (hasText) {
      onSubmit(
        {
          jobDescription: text.trim(),
          company: "",
          title: "",
          source: "text",
        },
        mode,
      );
      return;
    }

    setBusy(true);
    try {
      const r = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await r.json();
      if (data.success) {
        onSubmit(
          {
            jobDescription: data.description,
            company: data.company || "",
            title: data.title || "",
            source: "url",
          },
          mode,
        );
      } else {
        setScrapeError(
          data.reason ||
            "We couldn't read that URL. Paste the posting text below instead.",
        );
      }
    } catch {
      setScrapeError(
        "Network error while reading the URL. Paste the posting text below instead.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Job posting URL
          <span className="text-zinc-400 font-normal ml-1">— optional</span>
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://company.com/careers/role"
          className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
        />
        <p className="text-xs text-zinc-500 mt-1">
          Direct company careers pages only. LinkedIn / Indeed / Glassdoor URLs
          won't work — paste the text instead.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Job posting text
          <span className="text-zinc-400 font-normal ml-1">
            — paste it here, or leave blank if you provided a URL
          </span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={10}
          className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none font-mono text-sm"
        />
        <p className="text-xs text-zinc-500 mt-1">
          {text.trim().length === 0 ? (
            <span>
              If you don't have a URL, paste at least 100 characters. We'll
              detect the company and title automatically.
            </span>
          ) : (
            <>
              {text.trim().length} characters
              {text.trim().length < 100 && (
                <span className="text-amber-600"> — minimum 100</span>
              )}
            </>
          )}
        </p>
      </div>

      {scrapeError && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
          {scrapeError}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleRun("quick")}
          disabled={!canSubmit || busy}
          className="group flex flex-col items-start text-left p-4 rounded-lg border border-zinc-200 bg-white hover:border-zinc-900 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚡</span>
            <span className="font-semibold text-zinc-900">Quick Check</span>
          </div>
          <span className="text-xs text-zinc-500">
            Pattern analysis, results in seconds
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleRun("deep")}
          disabled={!canSubmit || busy}
          className="group flex flex-col items-start text-left p-4 rounded-lg border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition relative"
        >
          <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wide bg-white/15 px-2 py-0.5 rounded-full">
            30–60s
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔍</span>
            <span className="font-semibold">Deep Research</span>
          </div>
          <span className="text-xs text-zinc-300">
            Verified — we look up the company and check their claims
          </span>
        </button>
      </div>

      {busy && (
        <p className="text-center text-sm text-zinc-500">Reading the URL…</p>
      )}

      <p className="text-xs text-center text-zinc-400">
        Paste a URL, the posting text, or both. We'll auto-detect the company
        and title.
      </p>
    </div>
  );
}
