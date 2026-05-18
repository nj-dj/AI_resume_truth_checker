import { useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postCoverLetter } from "../services/api.js";

const atmosphereOptions = [
  { value: "professional", label: "Professional", icon: "business_center" },
  { value: "enthusiastic", label: "Enthusiastic", icon: "offline_bolt" },
  { value: "technical", label: "Technical", icon: "terminal" },
];

function FieldLabel({ children }) {
  return (
    <span className="block text-label-sm font-label-sm uppercase tracking-widest text-secondary">
      {children}
    </span>
  );
}

export default function CoverLetterPage() {
  const { consumeCredits } = useSubscription();
  const [candidateName, setCandidateName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [highlightsRaw, setHighlightsRaw] = useState(
    "Shipped a design system used by 6 squads\nCut p95 latency by 38%"
  );
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
      const usage = consumeCredits({ feature: "coverLetter", cost: 4 });
      if (!usage.ok) {
        setError(usage.message);
        return;
      }

      const highlights = highlightsRaw
        .split("\n")
        .map((line) => line.trim())
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
      [
        `# ${result.subjectLine}\n\n`,
        result.bodyMarkdown,
        `\n\n${result.callToAction}`,
      ],
      { type: "text/markdown" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1560px]">
      <section className="mb-6 border-b border-outline-variant pb-5">
        <p className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">
          Cover letter setup
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-headline-lg font-semibold uppercase text-primary">
              Cover letter generator
            </h1>
            <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
              Add your details, choose a tone, and generate a tailored cover letter.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 border border-outline-variant bg-surface-container-lowest px-4 py-3 font-code-md text-code-md text-on-surface-variant">
            <span className="status-dot" />
            Ready to write
          </div>
        </div>
      </section>

      <div className="grid overflow-hidden border border-outline-variant bg-surface lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
        <form
          onSubmit={handleSubmit}
          className="border-b border-outline-variant bg-surface-container-lowest lg:border-b-0 lg:border-r"
        >
          <div className="border-b border-outline-variant p-5 sm:p-6">
            <h2 className="text-headline-md font-semibold text-primary">Letter details</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Use concise details and one verified highlight per line.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
            <label className="space-y-2">
              <FieldLabel>Candidate name</FieldLabel>
              <input
                required
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                className="panel-input h-14 w-full px-4 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="e.g. Alex Rivera"
              />
            </label>

            <label className="space-y-2">
              <FieldLabel>Target role</FieldLabel>
              <input
                required
                value={roleTitle}
                onChange={(event) => setRoleTitle(event.target.value)}
                className="panel-input h-14 w-full px-4 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="e.g. Senior Security Analyst"
              />
            </label>

            <label className="space-y-2 xl:col-span-2">
              <FieldLabel>Company name</FieldLabel>
              <input
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                className="panel-input h-14 w-full px-4 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="e.g. Neuralink Systems"
              />
            </label>

            <label className="space-y-2 xl:col-span-2">
              <FieldLabel>Key value props and highlights</FieldLabel>
              <textarea
                value={highlightsRaw}
                onChange={(event) => setHighlightsRaw(event.target.value)}
                rows={7}
                className="panel-input min-h-[190px] w-full resize-y px-4 py-4 text-body-md leading-7 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="Paste one achievement per line..."
              />
              <p className="font-code-md text-code-md text-on-surface-variant">
                Add one highlight per line.
              </p>
            </label>

            <label className="space-y-2">
              <FieldLabel>Job context</FieldLabel>
              <textarea
                value={jdSnippet}
                onChange={(event) => setJdSnippet(event.target.value)}
                rows={7}
                className="panel-input min-h-[190px] w-full resize-y px-4 py-4 text-body-md leading-7 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                placeholder="Paste a short role summary..."
              />
            </label>

            <div className="space-y-2">
              <FieldLabel>Tone</FieldLabel>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] gap-2">
                {atmosphereOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTone(option.value)}
                    className={`flex min-h-14 items-center justify-start gap-2 rounded border px-3 py-3 text-sm font-semibold transition ${
                      tone === option.value
                        ? "border-secondary bg-secondary/10 text-primary"
                        : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-secondary/80 hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined shrink-0 text-[18px]">{option.icon}</span>
                    <span className="whitespace-nowrap">{option.label}</span>
                  </button>
                ))}
              </div>
              <div className="border border-outline-variant bg-surface p-4">
                <p className="font-code-md text-code-md uppercase text-on-surface-variant">
                  Selected tone
                </p>
                <p className="mt-2 text-title-md font-semibold capitalize text-primary">{tone}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant p-5 sm:p-6">
            {error ? (
              <div className="mb-4 border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded bg-secondary px-6 py-4 text-sm font-black uppercase tracking-widest text-on-secondary transition hover:brightness-110 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              {loading ? "Drafting..." : "Generate cover letter"}
            </button>
          </div>
        </form>

        <aside className="bg-surface">
          <div className="flex flex-col gap-4 border-b border-outline-variant p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div>
              <p className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">Draft</p>
              <h2 className="mt-2 text-headline-md font-semibold text-primary">Cover letter preview</h2>
            </div>
            <button
              type="button"
              onClick={downloadMd}
              disabled={!result}
              className="inline-flex items-center justify-center gap-2 rounded border border-outline-variant bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:border-secondary/60 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download Markdown
            </button>
          </div>

          {result ? (
            <div className="space-y-4 p-5 sm:p-6">
              <section className="border border-outline-variant bg-surface-container-low p-5">
                <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">
                  Subject
                </p>
                <p className="mt-3 text-title-md font-semibold text-primary">{result.subjectLine}</p>
              </section>

              <section className="border border-outline-variant bg-surface-container-low p-5">
                <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">
                  Body
                </p>
                <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap border border-outline-variant bg-surface-container-lowest p-4 font-mono text-sm leading-7 text-on-surface">
                  {result.bodyMarkdown}
                </pre>
              </section>

              <section className="border border-outline-variant bg-surface-container-low p-5">
                <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">
                  Call to action
                </p>
                <p className="mt-3 text-body-md text-on-surface">{result.callToAction}</p>
              </section>
            </div>
          ) : (
            <div className="grid min-h-[640px] place-items-center p-5 sm:p-6">
              <div className="w-full max-w-md border border-dashed border-outline-variant bg-surface-container-lowest p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary">description</span>
                <p className="mt-4 font-code-md text-code-md uppercase tracking-widest text-secondary">
                  Preview ready
                </p>
                <p className="mt-3 text-body-md text-on-surface-variant">
                  Generated subject, body, and closing line will render here.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
