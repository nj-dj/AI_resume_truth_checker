import { useId } from "react";

export default function UploadForm({
  githubUsername,
  onGithubUsernameChange,
  onFileChange,
  onSubmit,
  onTryDemoCandidate,
  isLoading,
  isDemoMode,
  loadingStep,
  selectedFileName,
}) {
  const usernameId = useId();
  const fileId = useId();

  return (
    <section className="panel-card p-5 sm:p-6">
      <div>
        <div className="mb-6 flex flex-col gap-4 border-b border-outline-variant pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-label-sm font-label-sm panel-label">Resume verification</p>
            <h2 className="mt-2 text-headline-md font-semibold text-primary">Upload Resume for Verification</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {isDemoMode ? (
              <div className="rounded border border-amber-600/30 bg-amber-50 px-4 py-2 text-code-md font-code-md text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                Sample resume loaded
              </div>
            ) : null}
            <div className="hidden rounded border border-secondary/30 bg-secondary/10 px-4 py-2 text-code-md font-code-md text-secondary md:block">
              AI and GitHub check
            </div>
          </div>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <label
              htmlFor={fileId}
              className="group flex cursor-pointer flex-col justify-between rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-4 transition duration-150 hover:border-secondary/60 hover:bg-surface-container sm:p-5"
            >
              <div>
                <span className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Resume file</span>
                <p className="mt-3 text-title-md font-semibold text-primary">Drop a PDF resume here</p>
                <p className="mt-2 text-body-md text-on-surface-variant">
                  Upload the candidate's resume in PDF format. We will extract the content and validate it against
                  GitHub activity.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container px-4 py-3">
                <span className="truncate text-sm text-on-surface">{selectedFileName || "No file selected yet"}</span>
                <span className="rounded bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary transition group-hover:bg-secondary/25">
                  Choose PDF
                </span>
              </div>
              <input
                id={fileId}
                name="resume"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onFileChange}
              />
            </label>

            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <label htmlFor={usernameId} className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">
                GitHub Username
              </label>
              <input
                id={usernameId}
                name="githubUsername"
                type="text"
                placeholder="e.g. torvalds"
                value={githubUsername}
                onChange={(event) => onGithubUsernameChange(event.target.value)}
                className="mt-3 w-full panel-input px-4 py-3 text-base outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />

              <div className="mt-6 rounded-lg border border-outline-variant bg-surface-container p-4">
                <p className="text-sm font-medium text-on-surface">What we check</p>
                <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  <li>Resume text is extracted and structured with AI.</li>
                  <li>GitHub repositories and languages are analyzed.</li>
                  <li>Claims are scored for credibility and consistency.</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-3 panel-button-primary px-5 py-3.5 text-sm font-semibold transition duration-150 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-secondary/20 border-t-on-secondary" />
                      {loadingStep}
                    </>
                  ) : (
                    "Analyze resume"
                  )}
                </button>

                <button
                  type="button"
                  onClick={onTryDemoCandidate}
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 panel-button-secondary px-5 py-3 text-sm font-semibold transition duration-150 hover:border-secondary/60 hover:bg-secondary/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Try sample resume
                </button>
              </div>

              {isLoading ? (
                <div className="mt-5 rounded-lg border border-secondary/25 bg-secondary/5 p-4">
                  <p className="text-sm font-medium text-secondary">Analysis progress</p>
                  <ul className="mt-3 space-y-2 text-sm text-on-surface">
                    {[
                      "Analyzing resume...",
                      "Checking GitHub activity...",
                      "Validating skills...",
                      "Generating report...",
                    ].map((step, index) => (
                      <li key={step} className={`flex items-center gap-3 ${step === loadingStep ? "text-secondary" : "text-on-surface-variant"}`}>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            step === loadingStep ? "bg-secondary shadow-[0_0_16px_rgba(78,222,163,0.7)]" : "bg-surface-container-highest"
                          }`}
                        />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
