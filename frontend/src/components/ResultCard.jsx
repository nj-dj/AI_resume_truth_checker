import SkillTag from "./SkillTag.jsx";

const decisionTone = {
  Hire: {
    icon: "check_circle",
    classes: "border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  Maybe: {
    icon: "warning",
    classes: "border-amber-600/30 bg-amber-50 text-amber-800 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100",
  },
  Reject: {
    icon: "cancel",
    classes: "border-rose-600/30 bg-rose-50 text-rose-800 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-100",
  },
};

const scoreTone = (score) => {
  if (score >= 70) return "from-emerald-400 to-secondary";
  if (score >= 40) return "from-amber-300 to-orange-300";
  return "from-rose-300 to-red-400";
};

const scoreBarTone = (score) => {
  if (score >= 70) return "bg-emerald-400";
  if (score >= 40) return "bg-amber-300";
  return "bg-rose-400";
};

export default function ResultCard({ result, githubInsight }) {
  const { score, decision, summary, verified_skills: verifiedSkills = [], suspicious_claims: suspiciousClaims = [] } =
    result;
  const decisionMeta = decisionTone[decision] ?? decisionTone.Maybe;

  return (
    <section className="animate-fade-up rounded-lg border border-outline-variant bg-surface p-6 shadow-glow sm:p-8">
      <div className="grid gap-6 min-[1500px]:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 sm:p-6">
          <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Analysis Result</p>
          <div className="mt-6">
            <div className={`inline-flex rounded-lg bg-gradient-to-r ${scoreTone(score)} p-[1px]`}>
              <div className="rounded-lg bg-surface-container-lowest px-7 py-6 text-center">
                <p className="text-sm text-on-surface-variant">Trust Score</p>
                <p className="mt-2 text-6xl font-semibold text-primary">{score}</p>
                <div className="mt-4 h-3 w-full max-w-56 overflow-hidden rounded bg-surface-container-highest">
                  <div
                    className={`h-full rounded ${scoreBarTone(score)} transition-all duration-700`}
                    style={{ width: `${Math.max(6, Math.min(score, 100))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-on-surface-variant">Confidence signal mapped across 100 points</p>
              </div>
            </div>

            <div className={`mt-5 inline-flex items-center gap-2 rounded border px-4 py-2 text-sm font-semibold ${decisionMeta.classes}`}>
              <span className="material-symbols-outlined text-[18px]">{decisionMeta.icon}</span>
              <span>{decision}</span>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-outline-variant bg-surface-container p-5">
            <p className="text-sm font-medium text-on-surface">AI Summary</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{summary}</p>
          </div>

          {Array.isArray(result.strengths) && result.strengths.length ? (
            <div className="mt-6 rounded-lg border border-emerald-600/20 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-500/[0.04]">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Strengths</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-950/80 dark:text-emerald-100/90">
                {result.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {Array.isArray(result.weaknesses) && result.weaknesses.length ? (
            <div className="mt-4 rounded-lg border border-amber-600/20 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-500/[0.04]">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-100">Watchouts</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-amber-950/80 dark:text-amber-50/90">
                {result.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 rounded-lg border border-secondary/20 bg-secondary/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-on-surface">GitHub Activity</p>
                <p className="mt-1 text-sm text-on-surface-variant">Context pulled from the current screening response.</p>
              </div>
              <div className="rounded bg-secondary/10 px-3 py-1 text-sm text-secondary">
                {githubInsight?.username || "Candidate"}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Repositories</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{githubInsight?.repositories ?? 0}</p>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Languages detected</p>
                <p className="mt-2 break-words text-sm font-medium leading-6 text-on-surface">{githubInsight?.languagesLabel ?? "None"}</p>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Last active</p>
                <p className="mt-2 break-words text-sm font-medium leading-6 text-on-surface">{githubInsight?.lastActive ?? "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="rounded-lg border border-emerald-600/20 bg-emerald-50 p-6 dark:border-emerald-400/20 dark:bg-emerald-500/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-primary">Verified Skills</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Claims supported by GitHub signals.</p>
              </div>
              <div className="rounded bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">{verifiedSkills.length}</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {verifiedSkills.length ? (
                verifiedSkills.map((item) => (
                  <div key={`${item.skill}-${item.evidence}`} className="min-w-0 rounded-lg border border-emerald-600/15 bg-surface-container-lowest p-4 dark:border-emerald-400/15">
                    <SkillTag>{item.skill}</SkillTag>
                    <p className="mt-3 max-w-md break-words text-sm leading-6 text-on-surface-variant">{item.evidence}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">No verified skills were returned.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-rose-600/20 bg-rose-50 p-6 dark:border-rose-400/20 dark:bg-rose-500/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-primary">Suspicious Claims</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Potential exaggerations or unsupported claims.</p>
              </div>
              <div className="rounded bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">{suspiciousClaims.length}</div>
            </div>

            <div className="mt-5 space-y-3">
              {suspiciousClaims.length ? (
                suspiciousClaims.map((item) => (
                  <div
                    key={`${item.skill}-${item.reason}`}
                    className="rounded-lg border border-rose-600/20 bg-surface-container-lowest p-4 transition duration-150 hover:border-rose-600/35 dark:border-rose-400/20 dark:hover:border-rose-400/35"
                  >
                    <SkillTag tone="danger">{item.skill}</SkillTag>
                    <p className="mt-3 text-sm leading-6 text-rose-950/80 dark:text-rose-100/80">{item.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">No suspicious claims were flagged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
