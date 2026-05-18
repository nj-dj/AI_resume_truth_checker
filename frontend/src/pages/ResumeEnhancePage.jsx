import { useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postResumeEnhance } from "../services/api.js";

export default function ResumeEnhancePage() {
  const { consumeCredits } = useSubscription();
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
      const usage = consumeCredits({ feature: "resumeEnhancer", cost: 6 });
      if (!usage.ok) {
        setError(usage.message);
        return;
      }

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
    <div className="max-w-container-max mx-auto space-y-10">
      <section className="rounded-[1.5rem] panel-card-soft p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary">Resume enhancer</p>
        <h1 className="text-headline-lg font-semibold text-primary">AI resume enhancer</h1>
        <p className="max-w-3xl text-body-lg text-on-surface-variant">
          Strengthen bullets, tighten wording, add measurable framing, and align language with your target opportunity.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[1.5rem] panel-card p-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Resume</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="panel-input w-full px-4 py-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-secondary"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Target job description</span>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              placeholder="Optional role details for more relevant polish."
              className="panel-input w-full px-4 py-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
        </div>

        <label className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-6 text-sm font-semibold">
          <span className="uppercase tracking-[0.18em] text-on-surface-variant">Focus</span>
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="panel-input rounded-2xl px-4 py-3 text-sm text-on-surface outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          >
            <option value="general">General polish</option>
            <option value="ats">ATS keyword match</option>
            <option value="leadership">Leadership narrative</option>
            <option value="ic">Technical contributor detail</option>
          </select>
        </label>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center panel-button-primary px-6 py-3 text-sm font-semibold transition hover:bg-accent-400 disabled:opacity-60"
        >
          {loading ? "Improving..." : "Improve resume"}
        </button>
      </form>

      {result ? (
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
            <h2 className="text-lg font-semibold text-primary">Professional summary rewrite</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{result.rewrittenSummary}</p>
          </section>
          <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
            <h2 className="text-lg font-semibold text-primary">Bullet upgrades</h2>
            <div className="mt-4 space-y-4">
              {(result.bulletUpgrades ?? []).map((b, idx) => (
                <article key={`${b.original}-${idx}`} className="rounded-[1.5rem] border border-white/10 bg-surface-900 p-5 text-sm shadow-[0_8px_24px_-18px_rgba(15,23,42,0.8)]">
                  <p className="text-on-surface-variant">Original</p>
                  <p className="mt-2 text-on-surface">{b.original}</p>
                  <p className="mt-4 text-on-surface-variant">Improved</p>
                  <p className="mt-2 font-semibold text-secondary">{b.improved}</p>
                  {b.rationale ? <p className="mt-3 text-xs text-on-surface-variant">{b.rationale}</p> : null}
                </article>
              ))}
            </div>
          </section>
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Grammar & wording</h3>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-on-surface-variant">
                {(result.grammarAndWordingNotes ?? []).map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Measurable ideas</h3>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-on-surface-variant">
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
