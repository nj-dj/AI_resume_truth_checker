import { useState } from "react";

import { formatApiError } from "../lib/formatApiError.js";
import { postCoverLetter } from "../services/api.js";

export default function CoverLetterPage() {
  const [candidateName, setCandidateName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [highlightsRaw, setHighlightsRaw] = useState("Shipped a design system used by 6 squads\nCut p95 latency by 38%");
  const [tone, setTone] = useState("professional");
  const [jdSnippet, setJdSnippet] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const highlights = highlightsRaw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const response = await postCoverLetter({
        candidateName,
        roleTitle,
        companyName,
        highlights,
        tone,
        jobDescriptionSnippet: jdSnippet,
      });
      setResult(response.data);
    } catch (err) {
      setResult(null);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const downloadMd = () => {
    if (!result) return;
    const blob = new Blob(
      [`# ${result.subjectLine}\n\n`, result.bodyMarkdown, `\n\n${result.callToAction}`],
      { type: "text/markdown" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI cover letter</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Generates Markdown you can edit, with tone control for different company cultures.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Your name
            <input
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Role title
            <input
              required
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Company (optional)
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Highlights (one per line)
          <textarea
            value={highlightsRaw}
            onChange={(e) => setHighlightsRaw(e.target.value)}
            rows={5}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Tone
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          >
            <option value="professional">Professional</option>
            <option value="confident">Confident</option>
            <option value="friendly">Friendly</option>
            <option value="executive">Executive</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Job snippet (optional)
          <textarea
            value={jdSnippet}
            onChange={(e) => setJdSnippet(e.target.value)}
            rows={4}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loading ? "Drafting…" : "Generate cover letter"}
        </button>
      </form>

      {result ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Draft</h2>
            <button type="button" onClick={downloadMd} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              Download Markdown
            </button>
          </div>
          <p className="text-sm text-[var(--muted)]">Subject: {result.subjectLine}</p>
          <div className="max-w-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm leading-7 text-[var(--text)]">
            <pre className="whitespace-pre-wrap font-sans">{result.bodyMarkdown}</pre>
          </div>
          <p className="text-sm text-[var(--text)]">{result.callToAction}</p>
        </div>
      ) : null}
    </div>
  );
}
