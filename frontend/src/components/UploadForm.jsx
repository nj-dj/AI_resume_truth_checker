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
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-glow backdrop-blur-xl sm:p-8">
      <div className="absolute inset-0 bg-grid bg-[size:28px_28px] opacity-20" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/80">Candidate Screening</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Upload Resume for Verification</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {isDemoMode ? (
              <div className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
                Demo mode active
              </div>
            ) : null}
            <div className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 md:block">
              AI + GitHub Cross-Check
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <label
              htmlFor={fileId}
              className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-dashed border-slate-600 bg-slate-900/60 p-5 transition duration-300 hover:border-cyan-400/40 hover:bg-slate-900/80"
            >
              <div>
                <span className="text-sm font-medium text-slate-300">Resume Upload</span>
                <p className="mt-3 text-2xl font-semibold text-white">Drop a PDF resume here</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Upload the candidate's resume in PDF format. We will extract the content and validate it against
                  GitHub activity.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <span className="truncate text-sm text-slate-200">{selectedFileName || "No file selected yet"}</span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200 transition group-hover:bg-cyan-400/25">
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

            <div className="rounded-3xl border border-white/8 bg-slate-900/60 p-5">
              <label htmlFor={usernameId} className="text-sm font-medium text-slate-300">
                GitHub Username
              </label>
              <input
                id={usernameId}
                name="githubUsername"
                type="text"
                placeholder="e.g. torvalds"
                value={githubUsername}
                onChange={(event) => onGithubUsernameChange(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              />

              <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm text-slate-300">What happens next?</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li>Resume text is extracted and structured with AI.</li>
                  <li>GitHub repositories and languages are analyzed.</li>
                  <li>Claims are scored for credibility and consistency.</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-5 py-3.5 text-base font-semibold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/20 border-t-slate-950" />
                      {loadingStep}
                    </>
                  ) : (
                    "Analyze Candidate"
                  )}
                </button>

                <button
                  type="button"
                  onClick={onTryDemoCandidate}
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Try Demo Candidate
                </button>
              </div>

              {isLoading ? (
                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                  <p className="text-sm font-medium text-cyan-100">Live Analysis Flow</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {[
                      "Analyzing resume...",
                      "Checking GitHub activity...",
                      "Validating skills...",
                      "Generating report...",
                    ].map((step, index) => (
                      <li key={step} className={`flex items-center gap-3 ${step === loadingStep ? "text-cyan-200" : "text-slate-500"}`}>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            step === loadingStep ? "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" : "bg-slate-700"
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
