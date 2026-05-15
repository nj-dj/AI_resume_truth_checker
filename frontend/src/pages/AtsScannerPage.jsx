import { useState } from "react";

import { formatApiError } from "../lib/formatApiError.js";
import { postAtsScan } from "../services/api.js";

export default function AtsScannerPage() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Upload a PDF or DOCX resume.");
      return;
    }
    if (jobDescription.trim().length < 40) {
      setError("Paste a fuller job description (at least a few sentences) for meaningful keyword coverage.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await postAtsScan({ resumeFile: file, jobDescription: jobDescription.trim() });
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
        <h1 className="text-3xl font-semibold tracking-tight">ATS resume scanner</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Combines deterministic keyword coverage with Gemini-powered coaching for missing keywords, formatting risks, and
          ATS-friendly phrasing.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 shadow-sm backdrop-blur"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
            Resume file (PDF or DOCX)
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent-muted)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--accent)]"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <div />
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text)]">
          Job description
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste the full job description including responsibilities and requirements."
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>

        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Scanning…" : "Run ATS scan"}
        </button>
      </form>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Composite ATS score</p>
            <p className="mt-3 text-5xl font-semibold text-[var(--accent)]">{result.atsScore}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Keyword match component: {result.keywordMatchScore}</p>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Formatting signals</p>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text)]">
              {(result.formattingIssues ?? []).map((issue) => (
                <li key={issue.id}>
                  <span className="font-semibold capitalize">{issue.severity}</span>: {issue.message}
                </li>
              ))}
              {!result.formattingIssues?.length ? <li className="text-[var(--muted)]">No major structural issues detected.</li> : null}
            </ul>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Missing keywords</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(result.missingKeywords ?? []).map((kw) => (
                <span key={kw} className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-200">
                  {kw}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">AI optimization suggestions</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--text)]">
              {(result.optimizationSuggestions ?? []).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
