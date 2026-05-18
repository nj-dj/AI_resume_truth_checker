import { useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postCareerInsights } from "../services/api.js";

export default function CareerAssistantPage() {
  const { consumeCredits } = useSubscription();
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
      const usage = consumeCredits({ feature: "careerInsights", cost: 4 });
      if (!usage.ok) {
        setError(usage.message);
        return;
      }

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
    <div className="max-w-container-max mx-auto space-y-10">
      <section className="rounded-[1.5rem] panel-card-soft p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary">Career Assistant</p>
        <h1 className="text-headline-lg font-semibold text-primary">Career assistant</h1>
        <p className="mt-4 max-w-3xl text-body-lg text-on-surface-variant">
          Skill gap analysis, roadmap milestones, learning recommendations, and conservative salary framing.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 rounded-[1.5rem] panel-card p-8 md:grid-cols-2">
        <label className="md:col-span-2 space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Current skills</span>
          <textarea
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            rows={3}
            className="w-full panel-input px-4 py-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        <label className="space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Target role</span>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="panel-input w-full rounded-[1.5rem] px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        <label className="space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Years of experience</span>
          <input
            type="number"
            min={0}
            max={40}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="panel-input w-full rounded-[1.5rem] px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        <label className="md:col-span-2 space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Location preference</span>
          <input
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
            className="panel-input w-full rounded-[1.5rem] px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        {error ? <p className="text-sm text-rose-400 md:col-span-2">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 inline-flex items-center justify-center panel-button-primary px-6 py-3 text-sm font-semibold transition hover:bg-accent-400 disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Get career advice"}
        </button>
      </form>

      {result ? (
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
            <h2 className="text-lg font-semibold text-primary">Trending skills to watch</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.trendingSkills?.map((s) => (
                <span key={s} className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                  {s}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
            <h2 className="text-lg font-semibold text-primary">Skill gaps</h2>
            <div className="mt-4 space-y-4">
              {(result.skillGaps ?? []).map((gap) => (
                <div key={gap.skill} className="rounded-[1.5rem] border border-white/10 bg-surface-950 p-5">
                  <p className="text-sm font-semibold text-secondary">{gap.skill}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">{gap.why_it_matters}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-on-surface-variant">Learning path</p>
                  <p className="mt-1 text-sm text-on-surface">{gap.learning_path}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
            <h2 className="text-lg font-semibold text-primary">Roadmap</h2>
            <div className="mt-4 space-y-4">
              {(result.roadmapMilestones ?? []).map((m) => (
                <div key={m.title} className="rounded-[1.5rem] border border-white/10 bg-surface-950 p-5 text-sm">
                  <p className="font-semibold text-on-surface">{m.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{m.timeframe}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
                    {(m.actions ?? []).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
            <h2 className="text-lg font-semibold text-primary">Salary insights</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">{result.salaryInsights?.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-on-surface-variant">Confidence: {result.salaryInsights?.confidence}</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
