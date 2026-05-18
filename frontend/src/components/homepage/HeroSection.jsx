import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface-950/95 px-6 py-10 shadow-xl shadow-black/20 sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-accent-400/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid gap-10 lg:grid-cols-[1.3fr_0.9fr] xl:max-w-[1180px]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-accent-400">Resume tools ready</p>

          <h1 className="text-5xl font-serif font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Precision-engineered resumes.
          </h1>

          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Improve your resume, check ATS fit, create cover letters, and prepare for interviews in one focused workspace.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/truth-checker"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-accent-400/20 transition hover:bg-slate-100"
            >
              Check my resume
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link
              to="/ats"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/5"
            >
              Scan for ATS
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-surface-900/95 p-5 shadow-xl ring-1 ring-white/5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white/5 px-4 py-4 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-accent-400">Dashboard</p>
              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Choose a tool to start</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-200">grid_view</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-slate-200">list</span>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-surface-950/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                <span className="uppercase tracking-[0.24em] text-accent-400">Verification</span>
                <span className="text-slate-500">verified</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Resume Verification</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Compare resume claims with GitHub activity and get a clear credibility report.
              </p>
              <Link to="/truth-checker" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-400">
                Open tool
              </Link>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-surface-950/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                <span className="uppercase tracking-[0.24em] text-accent-400">ATS</span>
                <span className="text-slate-500">monitoring</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">ATS Scanner</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Upload a resume with a job description for keyword coverage, formatting signals, and improvement tips.
              </p>
              <Link to="/ats" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-400">
                Open tool
              </Link>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-surface-950/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                <span className="uppercase tracking-[0.24em] text-accent-400">Writing</span>
                <span className="text-slate-500">enhance</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Resume Enhancer</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Rewrite bullets with stronger wording, measurable outcomes, and better keyword fit.
              </p>
              <Link to="/enhance" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-400">
                Open tool
              </Link>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-surface-950/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                <span className="uppercase tracking-[0.24em] text-accent-400">Editor</span>
                <span className="text-slate-500">layers</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Smart Resume Builder</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Reorder sections, preview edits, autosave drafts, and export a clean resume page.
              </p>
              <Link to="/builder" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-400">
                Open tool
              </Link>
            </article>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-2xl bg-surface-950/90 px-3 py-2">Tools ready</span>
              <span className="rounded-2xl bg-surface-950/90 px-3 py-2">Fast preview</span>
              <span className="rounded-2xl bg-surface-950/90 px-3 py-2">Drafts saved in browser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
