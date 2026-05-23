const CATEGORY_LABELS = {
  company_legitimacy: "Company Legitimacy",
  size_claim_accuracy: "Size Claim Accuracy",
  role_coherence: "Role Coherence",
  keyword_believability: "Keyword Believability",
  remote_claim_validity: "Remote Claim Validity",
  salary_realism: "Salary Realism",
  effort_asymmetry: "Effort Asymmetry",
  compensation_red_flags: "Compensation Red Flags",
  posting_specificity: "Posting Specificity",
};

const CATEGORY_SHORT = {
  company_legitimacy: "Company",
  size_claim_accuracy: "Size",
  role_coherence: "Role",
  keyword_believability: "Skills",
  remote_claim_validity: "Remote",
  salary_realism: "Salary",
  effort_asymmetry: "Effort",
  compensation_red_flags: "Comp flags",
  posting_specificity: "Detail",
};

const CATEGORY_ORDER = [
  "company_legitimacy",
  "size_claim_accuracy",
  "role_coherence",
  "keyword_believability",
  "remote_claim_validity",
  "salary_realism",
  "effort_asymmetry",
  "compensation_red_flags",
  "posting_specificity",
];

const VERDICT_STYLES = {
  likely_legitimate: {
    label: "Likely Legitimate",
    icon: "✓",
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    border: "border-emerald-300",
    text: "text-emerald-900",
    accent: "text-emerald-700",
    iconBg: "bg-emerald-500",
  },
  needs_scrutiny: {
    label: "Needs Scrutiny",
    icon: "!",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    border: "border-amber-300",
    text: "text-amber-900",
    accent: "text-amber-700",
    iconBg: "bg-amber-500",
  },
  high_risk: {
    label: "High Risk",
    icon: "✕",
    bg: "bg-gradient-to-br from-rose-50 to-rose-100",
    border: "border-rose-300",
    text: "text-rose-900",
    accent: "text-rose-700",
    iconBg: "bg-rose-500",
  },
};

const SCORE_STYLES = {
  green: {
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Green",
    cardAccent: "border-l-emerald-400",
  },
  yellow: {
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Yellow",
    cardAccent: "border-l-amber-400",
  },
  red: {
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Red",
    cardAccent: "border-l-rose-400",
  },
};

const FINDING_STYLES = {
  positive: {
    icon: "+",
    iconBg: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
  },
  negative: {
    icon: "−",
    iconBg: "bg-rose-100 text-rose-700",
    border: "border-rose-200",
  },
  neutral: {
    icon: "•",
    iconBg: "bg-zinc-100 text-zinc-600",
    border: "border-zinc-200",
  },
};

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Only allow http(s) links to reach an href, so a malicious "javascript:" or
// "data:" URL in model output can't execute when clicked.
function safeHref(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const ARRANGEMENT_STYLES = {
  remote: {
    label: "Remote",
    icon: "🌐",
    bg: "bg-gradient-to-br from-sky-50 to-sky-100",
    border: "border-sky-300",
    text: "text-sky-900",
    accent: "text-sky-700",
    iconBg: "bg-sky-500",
  },
  hybrid: {
    label: "Hybrid",
    icon: "⇆",
    bg: "bg-gradient-to-br from-violet-50 to-violet-100",
    border: "border-violet-300",
    text: "text-violet-900",
    accent: "text-violet-700",
    iconBg: "bg-violet-500",
  },
  in_person: {
    label: "In-person",
    icon: "🏢",
    bg: "bg-gradient-to-br from-zinc-50 to-zinc-100",
    border: "border-zinc-300",
    text: "text-zinc-900",
    accent: "text-zinc-600",
    iconBg: "bg-zinc-700",
  },
  unclear: {
    label: "Unclear",
    icon: "?",
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    border: "border-amber-300",
    text: "text-amber-900",
    accent: "text-amber-700",
    iconBg: "bg-amber-500",
  },
};

function countScores(categories) {
  const counts = { green: 0, yellow: 0, red: 0 };
  CATEGORY_ORDER.forEach((k) => {
    const s = categories?.[k]?.score;
    if (s && counts[s] !== undefined) counts[s] += 1;
  });
  return counts;
}

export default function Results({ result, job, onReset }) {
  const verdictKey = result.overall_verdict || "needs_scrutiny";
  const verdict = VERDICT_STYLES[verdictKey] || VERDICT_STYLES.needs_scrutiny;
  const modeLabel =
    result.mode === "deep_research" ? "Deep Research — Verified" : "Quick Check";
  const counts = countScores(result.categories);
  const findings = Array.isArray(result.key_findings) ? result.key_findings : [];
  const sources = Array.isArray(result.sources) ? result.sources : [];
  const queries = Array.isArray(result.queries) ? result.queries : [];
  const isDeep = result.mode === "deep_research";

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Analyze another posting
        </button>
        <span className="text-xs uppercase tracking-wide text-zinc-500 px-2 py-1 bg-zinc-100 rounded">
          {modeLabel}
        </span>
      </div>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
          Analyzed posting
        </div>
        <div className="text-lg font-semibold text-zinc-900">{job.title}</div>
        <div className="text-sm text-zinc-600">{job.company}</div>
      </div>

      <div className="grid md:grid-cols-5 gap-4 mb-6">
        <div
          className={`md:col-span-3 relative overflow-hidden p-6 rounded-2xl border-2 ${verdict.bg} ${verdict.border}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-full ${verdict.iconBg} text-white text-3xl font-bold flex items-center justify-center shadow-md`}
            >
              {verdict.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`text-xs uppercase tracking-wider ${verdict.accent} mb-1`}
              >
                Legitimacy verdict
              </div>
              <div className={`text-3xl font-bold ${verdict.text} mb-3`}>
                {verdict.label}
              </div>
              <p className={`text-sm leading-relaxed ${verdict.text}`}>
                {result.summary}
              </p>
            </div>
          </div>
        </div>

        {result.work_arrangement && (() => {
          const a =
            ARRANGEMENT_STYLES[result.work_arrangement] ||
            ARRANGEMENT_STYLES.unclear;
          return (
            <div
              className={`md:col-span-2 relative overflow-hidden p-6 rounded-2xl border-2 ${a.bg} ${a.border}`}
            >
              <div className="flex flex-col h-full">
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-full ${a.iconBg} text-white text-2xl flex items-center justify-center shadow-md mb-3`}
                >
                  {a.icon}
                </div>
                <div
                  className={`text-xs uppercase tracking-wider ${a.accent} mb-1`}
                >
                  Work arrangement
                </div>
                <div className={`text-3xl font-bold ${a.text} mb-2`}>
                  {a.label}
                </div>
                {result.work_arrangement_note && (
                  <p className={`text-sm leading-relaxed ${a.text} mt-auto`}>
                    {result.work_arrangement_note}
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {counts.green}
          </div>
          <div className="text-xs text-emerald-700 uppercase tracking-wide">
            Green
          </div>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
          <div className="text-2xl font-bold text-amber-700">
            {counts.yellow}
          </div>
          <div className="text-xs text-amber-700 uppercase tracking-wide">
            Yellow
          </div>
        </div>
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-center">
          <div className="text-2xl font-bold text-rose-700">{counts.red}</div>
          <div className="text-xs text-rose-700 uppercase tracking-wide">
            Red
          </div>
        </div>
      </div>

      {findings.length > 0 && (
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Key findings
            <span className="text-zinc-400 normal-case font-normal ml-2">
              {isDeep
                ? "from the posting and our web research"
                : "from the posting text"}
            </span>
          </div>
          <ul className="space-y-2">
            {findings.map((f, i) => {
              const style =
                FINDING_STYLES[f?.type] || FINDING_STYLES.neutral;
              return (
                <li
                  key={i}
                  className={`flex items-start gap-3 p-3 bg-white border ${style.border} rounded-lg`}
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full ${style.iconBg} flex items-center justify-center text-sm font-bold`}
                  >
                    {style.icon}
                  </span>
                  <span className="text-sm text-zinc-800 leading-relaxed">
                    {f?.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {isDeep && (queries.length > 0 || sources.length > 0) && (
        <div className="mb-8 p-5 bg-zinc-50 border border-zinc-200 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Research trail
          </div>

          {queries.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-zinc-700 mb-2">
                Searches performed
              </div>
              <div className="flex flex-wrap gap-2">
                {queries.map((q, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 bg-white border border-zinc-200 rounded-full text-zinc-700 font-mono"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-2">
                Sources consulted ({sources.length})
              </div>
              <ul className="space-y-1">
                {sources.map((s, i) => {
                  const href = safeHref(s.url);
                  return (
                    <li key={i} className="text-sm">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-900 hover:underline"
                        >
                          {s.title}
                        </a>
                      ) : (
                        <span className="text-zinc-900">{s.title}</span>
                      )}
                      <span className="text-xs text-zinc-500 ml-2">
                        {hostFromUrl(s.url)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
          Category scores at a glance
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((key) => {
            const cat = result.categories?.[key];
            if (!cat) return null;
            const style = SCORE_STYLES[cat.score] || SCORE_STYLES.yellow;
            const ChipTag = isDeep ? "a" : "span";
            const chipProps = isDeep ? { href: `#cat-${key}` } : {};
            return (
              <ChipTag
                key={key}
                {...chipProps}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${style.chip} ${
                  isDeep ? "hover:opacity-80 transition cursor-pointer" : ""
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                {CATEGORY_SHORT[key]}
              </ChipTag>
            );
          })}
        </div>
      </div>

      {isDeep ? (
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Detailed breakdown
          </div>
          <div className="space-y-3">
            {CATEGORY_ORDER.map((key, i) => {
              const cat = result.categories?.[key];
              if (!cat) return null;
              const style = SCORE_STYLES[cat.score] || SCORE_STYLES.yellow;
              return (
                <div
                  key={key}
                  id={`cat-${key}`}
                  className={`scroll-mt-4 bg-white border border-zinc-200 border-l-4 ${style.cardAccent} rounded-lg p-5`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-semibold text-zinc-900">
                        {CATEGORY_LABELS[key]}
                      </h3>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${style.chip}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                      ></span>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-800 leading-relaxed mb-3">
                    {cat.verdict}
                  </p>
                  <div className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 border border-zinc-100 rounded-md p-3">
                    <span className="font-semibold text-zinc-700">
                      Evidence:{" "}
                    </span>
                    {cat.evidence}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-8 p-5 bg-zinc-50 border border-zinc-200 border-dashed rounded-xl text-center">
          <div className="text-sm font-medium text-zinc-900 mb-1">
            Want the per-category evidence and a verified research trail?
          </div>
          <div className="text-xs text-zinc-600 mb-3">
            Deep Research looks up the company, checks their claims against
            public sources, and gives you a full breakdown for every category.
          </div>
          <button
            onClick={onReset}
            className="text-xs font-medium px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition"
          >
            Run Deep Research on a posting →
          </button>
        </div>
      )}

      <div className="p-6 bg-zinc-900 text-white rounded-xl">
        <div className="font-semibold mb-1">
          Did you apply to this role? Come back and tell us what happened.
        </div>
        <div className="text-sm text-zinc-400">
          Callbackd gets smarter when candidates share their outcomes.
        </div>
      </div>
    </div>
  );
}
