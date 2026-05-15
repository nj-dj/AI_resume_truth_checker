import { useState } from "react";

import { formatApiError } from "../lib/formatApiError.js";
import { postCareerInsights } from "../services/api.js";

export default function CareerAssistantPage() {
  const [skillsRaw, setSkillsRaw] = useState("React, TypeScript, Node.js");
  const [targetRole, setTargetRole] = useState("Senior full-stack engineer");
  const [experienceYears, setExperienceYears] = useState(5);
  const [locationPreference, setLocationPreference] = useState("Hybrid in India");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const currentSkills = skillsRaw
        .split(/[,|\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const response = await postCareerInsights({
        currentSkills,
        targetRole,
        experienceYears: Number(experienceYears) || 0,
        locationPreference,
      });
      setResult(response.data);
    } catch (err) {
      setResult(null);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Career assistant</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Skill gap analysis, roadmap milestones, learning recommendations, and conservative salary framing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
          Current skills
          <textarea
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            rows={3}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Target role
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Years of experience
          <input
            type="number"
            min={0}
            max={40}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
          Location preference
          <input
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        {error ? (
          <p className="text-sm text-rose-600 dark:text-rose-300 md:col-span-2">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 md:col-span-2 disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Build career insights"}
        </button>
      </form>

      {result ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <h2 className="text-lg font-semibold">Trending skills to watch</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.trendingSkills?.map((s) => (
                <span key={s} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)]">
                  {s}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <h2 className="text-lg font-semibold">Skill gaps</h2>
            <ul className="mt-3 space-y-3 text-sm text-[var(--text)]">
              {(result.skillGaps ?? []).map((gap) => (
                <li key={gap.skill} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <p className="font-semibold text-[var(--accent)]">{gap.skill}</p>
                  <p className="mt-1 text-[var(--muted)]">{gap.why_it_matters}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Learning path</p>
                  <p className="mt-1">{gap.learning_path}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <h2 className="text-lg font-semibold">Roadmap</h2>
            <div className="mt-3 space-y-3">
              {(result.roadmapMilestones ?? []).map((m) => (
                <article key={m.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-xs text-[var(--muted)]">{m.timeframe}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text)]">
                    {(m.actions ?? []).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <h2 className="text-lg font-semibold">Salary insights</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text)]">{result.salaryInsights?.summary}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Confidence: {result.salaryInsights?.confidence}</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
