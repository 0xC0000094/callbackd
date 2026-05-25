import { useEffect, useState } from "react";
import { LAUNCH_AT_MS } from "../launchGate.js";

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatRemaining(ms) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

export default function ComingSoon() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= LAUNCH_AT_MS) {
        clearInterval(id);
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = LAUNCH_AT_MS - now;
  const { d, h, m, s } = formatRemaining(remaining);
  const launchDate = new Date(LAUNCH_AT_MS);
  const launchStr = launchDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-8 rounded-2xl bg-zinc-900 text-white text-3xl font-semibold">
          C
        </div>

        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-zinc-900 mb-3">
          Callbackd
        </h1>
        <div className="text-base sm:text-lg text-zinc-600 mb-2">
          Job posting legitimacy analyzer
        </div>
        <div className="text-sm text-zinc-500 italic mb-12 max-w-md mx-auto">
          How do we identify high-quality, legitimate remote job opportunities
          using AI?
        </div>

        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500 mb-4">
          Live in
        </div>
        <div className="flex justify-center gap-4 sm:gap-6 mb-10 font-mono">
          {d > 0 && (
            <TimeBlock value={d} label={d === 1 ? "day" : "days"} />
          )}
          <TimeBlock value={pad(h)} label="hr" />
          <TimeBlock value={pad(m)} label="min" />
          <TimeBlock value={pad(s)} label="sec" />
        </div>

        <div className="text-xs text-zinc-500">{launchStr}</div>
      </div>
    </div>
  );
}

function TimeBlock({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-medium text-zinc-900 leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-2">
        {label}
      </div>
    </div>
  );
}
