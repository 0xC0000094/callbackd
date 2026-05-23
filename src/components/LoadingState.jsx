const QUICK_STEPS = [
  { id: "reading", label: "Reading the posting…" },
  { id: "analyzing", label: "Analyzing patterns…" },
  { id: "writing", label: "Building your report…" },
];

const DEEP_STEPS = [
  { id: "reading", label: "Reading the posting…" },
  { id: "researching", label: "Researching the company…" },
  { id: "verifying", label: "Verifying claims…" },
  { id: "writing", label: "Building your report…" },
];

export default function LoadingState({ mode, currentStep }) {
  const steps = mode === "deep" ? DEEP_STEPS : QUICK_STEPS;
  const foundIdx = steps.findIndex((s) => s.id === currentStep);
  const currentIdx = foundIdx === -1 ? 0 : foundIdx;

  return (
    <div className="w-full max-w-md mx-auto text-center py-16">
      <div className="inline-block w-10 h-10 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-6"></div>
      <div className="space-y-2 inline-block text-left">
        {steps.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-sm transition-all ${
                active
                  ? "text-zinc-900 font-medium"
                  : done
                  ? "text-zinc-500"
                  : "text-zinc-300"
              }`}
            >
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "border-2 border-zinc-900"
                    : "border border-zinc-300"
                }`}
              >
                {done ? "✓" : ""}
              </span>
              {step.label}
            </div>
          );
        })}
      </div>
      <div className="mt-6 text-xs text-zinc-400">
        {mode === "deep"
          ? "Agentic research can take 30–60 seconds"
          : "Pattern analysis takes a few seconds"}
      </div>
    </div>
  );
}
