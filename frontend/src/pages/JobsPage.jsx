import { useEffect, useMemo, useState } from "react";

import { formatApiError } from "../lib/formatApiError.js";
import { postJobRecommendations } from "../services/api.js";

const STORAGE_SAVED = "enhancemyaicv-saved-jobs";

const parseSkills = (raw) =>
  raw
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function JobsPage() {
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

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
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
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSaved = (id) => {
    setSavedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Job recommendations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Skill-weighted ranking over curated roles with remote, hybrid, and location-aware scoring. Saved jobs stay in
          your browser for quick tracking.
        </p>
      </div>

      <div className="grid gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 lg:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
          Skills (comma-separated)
          <textarea
            value={skillsRaw}
            onChange={(e) => setSkillsRaw(e.target.value)}
            rows={3}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Experience years
          <input
            type="number"
            min={0}
            max={40}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Work mode
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="any">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium lg:col-span-2">
          Location keyword
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Bengaluru, Remote, London"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <div className="flex items-end lg:col-span-2">
          <button
            type="button"
            onClick={() => void loadJobs()}
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh matches"}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

      <div className="space-y-4">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-[var(--text)]">{job.title}</h2>
                <span className="rounded-full bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                  Match {job.matchScore}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {job.company} · {job.location} · {job.workMode}
              </p>
              <p className="mt-2 text-sm text-[var(--text)]">{job.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{job.salaryBand}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleSaved(job.id)}
              className={`h-fit rounded-xl border px-4 py-2 text-sm font-semibold ${
                savedIds.includes(job.id)
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)]"
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
