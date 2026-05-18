import { useEffect, useMemo, useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postJobRecommendations } from "../services/api.js";

const STORAGE_SAVED = "enhancemyaicv-saved-jobs";

const parseSkills = (raw) =>
  raw
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function JobsPage() {
  const { consumeCredits } = useSubscription();
  const [skillsRaw, setSkillsRaw] = useState("TypeScript, React, Node.js");
  const [experienceYears, setExperienceYears] = useState(4);
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("any");
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_SAVED);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_SAVED, JSON.stringify(savedIds));
  }, [savedIds]);

  const skills = useMemo(() => parseSkills(skillsRaw), [skillsRaw]);

  const loadJobs = async ({ chargeCredits = true } = {}) => {
    setLoading(true);
    setError("");
    try {
      if (chargeCredits) {
        const usage = consumeCredits({ feature: "jobSearch", cost: 2 });
        if (!usage.ok) {
          setError(usage.message);
          return;
        }
      }

      const response = await postJobRecommendations({
        skills,
        experienceYears: Number(experienceYears) || 0,
        location,
        workMode,
      });
      setJobs(response.data?.jobs ?? []);
    } catch (err) {
      setJobs([]);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs({ chargeCredits: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSaved = (id) => {
    setSavedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  return (
    <div className="max-w-container-max mx-auto space-y-10">
      <section className="rounded-[1.5rem] panel-card-soft p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary">Job recommendations</p>
        <h1 className="text-headline-lg font-semibold text-primary">Job recommendations</h1>
        <p className="mt-4 max-w-3xl text-body-lg text-on-surface-variant">
          Skill-weighted role matching with location-aware scoring and saved job tracking in your command center.
        </p>
      </section>

      <div className="grid gap-6 panel-card p-6 lg:grid-cols-4">
        <label className="md:col-span-2 space-y-3 text-sm font-medium">
          <span className="text-xs uppercase tracking-[0.18em] text-secondary">Skills</span>
          <textarea
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            rows={3}
            className="w-full panel-input px-4 py-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        <label className="space-y-3 text-sm font-medium">
          <span className="text-xs uppercase tracking-[0.18em] text-secondary">Experience years</span>
          <input
            type="number"
            min={0}
            max={40}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        <label className="space-y-3 text-sm font-medium">
          <span className="text-xs uppercase tracking-[0.18em] text-secondary">Work mode</span>
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          >
            <option value="any">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </label>
        <label className="md:col-span-2 space-y-3 text-sm font-medium">
          <span className="text-xs uppercase tracking-[0.18em] text-secondary">Location keyword</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bengaluru, Remote, London"
            className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </label>
        <div className="flex items-end md:col-span-2">
          <button
            type="button"
            onClick={() => void loadJobs()}
            disabled={loading}
            className="w-full panel-button-primary px-5 py-3 text-sm font-semibold transition hover:bg-accent-400 disabled:opacity-60"
          >
            {loading ? "Searching..." : "Find matching jobs"}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="space-y-4">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="flex flex-col gap-5 rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.5)] md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-primary">{job.title}</h2>
                <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Match {job.matchScore}
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                {job.company} · {job.location} · {job.workMode}
              </p>
              <p className="text-sm text-on-surface">{job.summary}</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-xs text-on-surface-variant">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">{job.salaryBand}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSaved(job.id)}
              className={`h-fit rounded-[1.5rem] border px-4 py-2 text-sm font-semibold transition ${
                savedIds.includes(job.id)
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 bg-surface-900 text-on-surface"
              }`}
            >
              {savedIds.includes(job.id) ? "Saved" : "Save job"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
