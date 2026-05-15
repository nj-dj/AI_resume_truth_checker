import SkillTag from "./SkillTag.jsx";

const decisionTone = {
  Hire: {
    icon: "✅",
    classes: "text-emerald-200 border-emerald-400/25 bg-emerald-500/10",
  },
  Maybe: {
    icon: "⚠️",
    classes: "text-amber-100 border-amber-400/25 bg-amber-500/10",
  },
  Reject: {
    icon: "❌",
    classes: "text-rose-100 border-rose-400/25 bg-rose-500/10",
  },
};

const scoreTone = (score) => {
  if (score >= 70) return "from-emerald-400 to-cyan-300";
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
    <section className="animate-fade-up rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-glow backdrop-blur-xl sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/8 bg-slate-950/70 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Analysis Result</p>
          <div className="mt-6">
            <div
              className={`inline-flex rounded-3xl bg-gradient-to-r ${scoreTone(
                score,
              )} p-[1px] shadow-[0_18px_48px_rgba(8,145,178,0.18)]`}
            >
              <div className="rounded-[22px] bg-slate-950/95 px-7 py-6 text-center">
                <p className="text-sm text-slate-400">Trust Score</p>
                <p className="mt-2 text-6xl font-semibold text-white">{score}</p>
                <div className="mt-4 h-3 w-56 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full ${scoreBarTone(score)} transition-all duration-700`}
                    style={{ width: `${Math.max(6, Math.min(score, 100))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">Confidence signal mapped across 100 points</p>
              </div>
            </div>

            <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${decisionMeta.classes}`}>
              <span>{decisionMeta.icon}</span>
              <span>{decision}</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-slate-300">AI Summary</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{summary}</p>
          </div>

          {Array.isArray(result.strengths) && result.strengths.length ? (
            <div className="mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.04] p-5">
              <p className="text-sm font-medium text-emerald-200">Strengths</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-100/90">
                {result.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {Array.isArray(result.weaknesses) && result.weaknesses.length ? (
            <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-500/[0.04] p-5">
              <p className="text-sm font-medium text-amber-100">Watchouts</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-amber-50/90">
                {result.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-200">GitHub Activity</p>
                <p className="mt-1 text-sm text-slate-400">Context pulled from the current screening response.</p>
              </div>
              <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
                {githubInsight?.username || "Candidate"}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Repositories</p>
                <p className="mt-2 text-2xl font-semibold text-white">{githubInsight?.repositories ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Languages detected</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-200">{githubInsight?.languagesLabel ?? "None"}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last active</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-200">{githubInsight?.lastActive ?? "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-emerald-400/10 bg-emerald-500/[0.04] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Verified Skills</h3>
                <p className="mt-1 text-sm text-slate-400">Claims supported by GitHub signals.</p>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                {verifiedSkills.length}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {verifiedSkills.length ? (
                verifiedSkills.map((item) => (
                  <div key={`${item.skill}-${item.evidence}`} className="rounded-2xl border border-emerald-400/15 bg-slate-950/60 p-4">
                    <SkillTag>{item.skill}</SkillTag>
                    <p className="mt-3 max-w-md text-sm leading-6 text-emerald-100/85">{item.evidence}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No verified skills were returned.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-rose-400/10 bg-rose-500/[0.04] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Suspicious Claims</h3>
                <p className="mt-1 text-sm text-slate-400">Potential exaggerations or unsupported claims.</p>
              </div>
              <div className="rounded-full bg-rose-400/10 px-3 py-1 text-sm text-rose-200">
                {suspiciousClaims.length}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {suspiciousClaims.length ? (
                suspiciousClaims.map((item) => (
                  <div
                    key={`${item.skill}-${item.reason}`}
                    className="rounded-2xl border border-rose-400/12 bg-slate-950/60 p-4 transition duration-300 hover:border-rose-400/25"
                  >
                    <div className="flex items-start gap-3">
                      <SkillTag tone="danger">{item.skill}</SkillTag>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-rose-100/80">{item.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No suspicious claims were flagged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
