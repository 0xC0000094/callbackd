import { useState } from "react";
import JobInput from "./components/JobInput.jsx";
import LoadingState from "./components/LoadingState.jsx";
import Results from "./components/Results.jsx";

export default function App() {
  const [step, setStep] = useState("input");
  const [job, setJob] = useState(null);
  const [mode, setMode] = useState(null);
  const [currentStep, setCurrentStep] = useState("reading");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleRun(j, m) {
    setJob(j);
    setMode(m);
    setCurrentStep("reading");
    setStep("loading");
    setError("");

    const endpoint = m === "deep" ? "/api/deepresearch" : "/api/quickcheck";

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: j.jobDescription,
          company: j.company,
          title: j.title,
        }),
      });

      if (!r.ok || !r.body) {
        let msg = "Analysis failed. Try again.";
        try {
          const data = await r.json();
          msg = data.error || msg;
        } catch {
          // ignore
        }
        setError(msg);
        setStep("input");
        return;
      }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult = null;
      let streamError = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const evt of events) {
          const dataLines = evt
            .split("\n")
            .filter((l) => l.startsWith("data: "));
          for (const line of dataLines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "step") {
                setCurrentStep(data.step);
              } else if (data.type === "result") {
                finalResult = data.result;
              } else if (data.type === "error") {
                streamError = data.error || "Analysis failed.";
              }
            } catch {
              // ignore malformed event
            }
          }
        }
      }

      if (streamError) {
        setError(streamError);
        setStep("input");
        return;
      }

      if (!finalResult) {
        setError("No result received from server.");
        setStep("input");
        return;
      }

      const looksUnknown = (v) =>
        !v || /^(unknown|untitled.*)$/i.test(String(v).trim());
      setJob({
        ...j,
        title:
          looksUnknown(j.title) && finalResult.posting_title
            ? finalResult.posting_title
            : j.title,
        company:
          looksUnknown(j.company) && finalResult.posting_company
            ? finalResult.posting_company
            : j.company,
      });
      setResult(finalResult);
      setStep("results");
    } catch {
      setError("Network error. Try again.");
      setStep("input");
    }
  }

  function reset() {
    setStep("input");
    setJob(null);
    setMode(null);
    setResult(null);
    setError("");
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={reset}
            className="text-xl font-bold text-zinc-900 tracking-tight"
          >
            Callbackd
          </button>
          <div className="text-xs text-zinc-500">
            Job posting legitimacy analyzer
          </div>
        </div>
      </header>

      <main className="px-6 py-10">
        {step === "input" && (
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Is this job posting real?
            </h1>
            <p className="text-zinc-600">
              Paste a URL or the job text, then pick how thorough you want the
              analysis. Nine legitimacy categories, traffic-light scored.
            </p>
          </div>
        )}

        {error && step === "input" && (
          <div className="max-w-2xl mx-auto mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
            {error}
          </div>
        )}

        {step === "input" && <JobInput onSubmit={handleRun} />}
        {step === "loading" && (
          <LoadingState mode={mode} currentStep={currentStep} />
        )}
        {step === "results" && (
          <Results result={result} job={job} onReset={reset} />
        )}
      </main>

      <footer className="text-center text-xs text-zinc-400 py-8">
        Phase 1 · Legitimacy Analyzer
      </footer>
    </div>
  );
}
