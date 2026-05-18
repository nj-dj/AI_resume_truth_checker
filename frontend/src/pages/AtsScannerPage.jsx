import { useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postAtsScan } from "../services/api.js";

export default function AtsScannerPage() {
  const { consumeCredits } = useSubscription();
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
      setError("Paste a fuller job description for meaningful keyword coverage.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const usage = consumeCredits({ feature: "atsScanner", cost: 5 });
      if (!usage.ok) {
        setError(usage.message);
        return;
      }

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
    <div className="mx-auto max-w-[1560px]">
      <section className="mb-6 border-b border-outline-variant pb-5">
        <p className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">ATS Scanner</p>
        <h1 className="mt-2 text-headline-lg font-semibold uppercase text-primary">ATS resume scanner</h1>
        <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
          Combine deterministic keyword coverage with AI coaching for better formatting, resume structure, and ATS success.
        </p>
      </section>

      <div className="grid overflow-hidden border border-outline-variant lg:grid-cols-[0.42fr_0.58fr]">
        <form onSubmit={handleSubmit} className="space-y-6 border-b border-outline-variant bg-surface-container-lowest p-6 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="text-headline-md font-semibold text-primary">Upload resume</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">Add your resume and the job description to compare them.</p>
          </div>

          <label className="block space-y-3">
            <span className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Resume file (PDF/DOCX)</span>
            <div className="rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center transition hover:border-secondary/60 hover:bg-surface-container">
              <span className="material-symbols-outlined text-4xl text-primary">upload_file</span>
              <p className="mt-3 text-body-md font-bold text-primary">Drop resume here or click to browse</p>
              <p className="mt-2 text-sm text-on-surface-variant">PDF, DOC, or DOCX files are supported.</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="mt-4 panel-input w-full px-4 py-3 text-sm file:mr-3 file:rounded file:border-0 file:bg-secondary/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-secondary"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </label>

          <label className="block space-y-3">
            <span className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Job description</span>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={14}
              placeholder="Paste the job description here so we can compare your resume against it..."
              className="min-h-[340px] w-full panel-input px-4 py-4 text-sm leading-6 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded bg-secondary px-6 py-4 text-headline-md font-black uppercase text-on-secondary transition hover:opacity-90 disabled:opacity-60"
          >
            <span className="material-symbols-outlined">bolt</span>
            {loading ? "Scanning..." : "Scan resume"}
          </button>
        </form>

        <div className="bg-surface">
          <div className="flex flex-col gap-4 border-b border-outline-variant p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-headline-md font-semibold text-primary">Scan results</h2>
              <p className="mt-1 text-sm text-secondary">Keyword and formatting review</p>
            </div>
            <div className="sm:text-right">
              <div className="text-headline-lg font-black text-secondary">{result ? `${result.atsScore}/100` : "--/100"}</div>
              <p className="text-label-sm font-label-sm uppercase text-on-surface-variant">Composite Match Score</p>
            </div>
          </div>

          {result ? (
            <div className="grid gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <section className="border border-outline-variant bg-surface-container-low p-5 md:col-span-2">
                  <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Missing keywords</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(result.missingKeywords ?? []).map((kw) => (
                      <span key={kw} className="border border-secondary bg-secondary/10 px-3 py-1 font-code-md text-code-md text-secondary">
                        {kw}
                      </span>
                    ))}
                    {!result.missingKeywords?.length ? <span className="text-sm text-on-surface-variant">No missing keywords returned.</span> : null}
                  </div>
                </section>
                <section className="flex flex-col justify-center border border-outline-variant bg-surface-container-low p-5">
                  <p className="text-headline-lg font-semibold text-primary">{result.keywordMatchScore}</p>
                  <p className="mt-1 text-label-sm font-label-sm uppercase text-on-surface-variant">Keyword Match</p>
                  <div className="mt-5 h-1 w-full bg-outline-variant">
                    <div className="h-full bg-secondary" style={{ width: `${Math.min(Number(result.keywordMatchScore) || 0, 100)}%` }} />
                  </div>
                </section>
              </div>

              <section className="border border-outline-variant">
                <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-high px-5 py-3">
                  <span className="material-symbols-outlined text-secondary">psychology</span>
                  <span className="text-label-sm font-label-sm uppercase tracking-widest text-primary">Improvement suggestions</span>
                </div>
                <div className="divide-y divide-outline-variant">
                  {(result.optimizationSuggestions ?? []).map((s) => (
                    <div key={s} className="p-5 transition hover:bg-surface-container-low">
                      <p className="text-body-md text-on-surface-variant">{s}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-outline-variant bg-surface-container-low p-5">
                <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Formatting signals</p>
                <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                  {(result.formattingIssues ?? []).map((issue) => (
                    <li key={issue.id} className="border border-outline-variant bg-surface p-4">
                      <span className="font-semibold capitalize text-primary">{issue.severity}</span>: {issue.message}
                    </li>
                  ))}
                  {!result.formattingIssues?.length ? <li>No major structural issues detected.</li> : null}
                </ul>
              </section>
            </div>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center p-6 text-center text-sm text-on-surface-variant">
              Run a scan to see your match score and improvement tips.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
