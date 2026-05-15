import { useState } from "react";

import { formatApiError } from "../lib/formatApiError.js";
import { postResumeEnhance } from "../services/api.js";

export default function ResumeEnhancePage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [focus, setFocus] = useState("general");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Upload a resume to enhance.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await postResumeEnhance({ resumeFile: file, jobDescription, focus });
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
        <h1 className="text-3xl font-semibold tracking-tight">AI resume enhancer</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Strengthen bullets, tighten wording, add measurable framing, and align language with a target job description.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 shadow-sm backdrop-blur"
      >
        <label className="flex flex-col gap-2 text-sm font-medium">
          Resume (PDF or DOCX)
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Target job description (optional)
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Focus
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="general">General polish</option>
            <option value="ats">ATS keyword alignment</option>
            <option value="leadership">Leadership narrative</option>
            <option value="ic">Individual contributor depth</option>
          </select>
        </label>

        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Enhancing…" : "Generate enhancement pack"}
        </button>
      </form>

      {result ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <h2 className="text-lg font-semibold">Professional summary rewrite</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{result.rewrittenSummary}</p>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <h2 className="text-lg font-semibold">Bullet upgrades</h2>
            <div className="mt-4 space-y-4">
              {(result.bulletUpgrades ?? []).map((b, idx) => (
                <article key={`${b.original}-${idx}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
                  <p className="text-[var(--muted)]">Original</p>
                  <p className="mt-1 text-[var(--text)]">{b.original}</p>
                  <p className="mt-3 text-[var(--muted)]">Improved</p>
                  <p className="mt-1 font-medium text-[var(--accent)]">{b.improved}</p>
                  {b.rationale ? <p className="mt-2 text-xs text-[var(--muted)]">{b.rationale}</p> : null}
                </article>
              ))}
            </div>
          </section>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Grammar & wording</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text)]">
                {(result.grammarAndWordingNotes ?? []).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Measurable ideas</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text)]">
                {(result.measurableAchievementIdeas ?? []).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
