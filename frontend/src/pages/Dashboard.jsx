import { Link } from "react-router-dom";

const modules = [
  {
    label: "Improve",
    status: "Ready",
    icon: "qr_code_scanner",
    title: "ATS Scanner",
    description: "Parse resumes against target roles for keyword coverage, format issues, and rejection risk.",
    to: "/ats",
  },
  {
    label: "Improve",
    status: "Popular",
    icon: "auto_awesome",
    title: "Resume Enhancer",
    description: "Rewrite bullets for stronger impact, clearer metrics, and semantic keyword alignment.",
    to: "/enhance",
  },
  {
    label: "Create",
    status: "Saved locally",
    icon: "edit_note",
    title: "Resume Builder",
    description: "Construct, reorder, autosave, and export resume sections from one focused workspace.",
    to: "/builder",
  },
  {
    label: "Create",
    icon: "description",
    title: "Cover Letter",
    description: "Generate role-specific letters from verified highlights, tone, and company context.",
    to: "/cover-letter",
  },
  {
    label: "Create",
    icon: "language",
    title: "Portfolio",
    description: "Render a responsive static portfolio from structured profile data and links.",
    to: "/portfolio",
  },
  {
    label: "Plan",
    icon: "search",
    title: "Job Search",
    description: "Load skill-weighted matches with work mode, location, and saved-role tracking.",
    to: "/jobs",
  },
  {
    label: "Plan",
    icon: "psychology",
    title: "Career Advice",
    description: "Map skill gaps, milestones, learning paths, and conservative salary framing.",
    to: "/career",
  },
  {
    label: "Plan",
    icon: "interpreter_mode",
    title: "Interview Prep",
    description: "Create practice interview questions and get feedback on your answers.",
    to: "/interview",
  },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1560px] space-y-10">
      <section>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg tracking-tight text-primary">Dashboard</h1>
            <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">
              Choose a resume, job search, writing, or interview tool to continue.
            </p>
          </div>
          <button className="inline-flex w-fit items-center gap-2 rounded border border-outline-variant bg-surface px-4 py-3 text-label-sm font-label-sm uppercase tracking-widest text-on-surface transition hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[18px]">history</span>
            Recent activity
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <article className="module-card group relative col-span-12 overflow-hidden bg-surface-container-low p-6 lg:col-span-8">
            <span className="material-symbols-outlined absolute right-5 top-5 text-[112px] text-primary opacity-10 transition group-hover:opacity-20">
              verified
            </span>
            <div className="relative z-10 max-w-3xl">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">security</span>
                <span className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">Verification</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-primary">Resume Verification</h2>
              <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">
                Forensic verification of skill claims and experience records. Compare technical stack proficiency against GitHub evidence to protect credential accuracy.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/truth-checker"
                  className="inline-flex items-center justify-center gap-2 rounded bg-secondary px-6 py-3 text-label-sm font-label-sm uppercase tracking-widest text-on-secondary transition hover:brightness-110"
                >
                  Open tool
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  to="/truth-checker"
                  className="inline-flex items-center justify-center rounded border border-outline-variant px-6 py-3 text-label-sm font-label-sm uppercase tracking-widest text-on-surface transition hover:border-primary"
                >
                  Start check
                </Link>
              </div>
            </div>
          </article>

          <aside className="module-card col-span-12 bg-surface-container-lowest p-6 lg:col-span-4">
            <h3 className="mb-4 text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Progress snapshot</h3>
            <div className="space-y-2 font-code-md text-code-md">
              <div className="flex justify-between border-b border-outline-variant/40 py-2">
                <span className="text-on-surface-variant">Active Search</span>
                <span className="text-primary">12 Active</span>
              </div>
              <div className="flex justify-between border-b border-outline-variant/40 py-2">
                <span className="text-on-surface-variant">Average ATS score</span>
                <span className="text-secondary">94%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-on-surface-variant">Prep Readiness</span>
                <span className="text-primary">B+ High</span>
              </div>
            </div>
            <div className="mt-10 h-24 overflow-hidden border border-outline-variant/60 bg-surface-container">
              <div className="flex h-full items-end gap-1 px-2">
                {[40, 60, 45, 75, 90, 85].map((height, index) => (
                  <span
                    key={height + index}
                    className="w-full bg-secondary"
                    style={{ height: `${height}%`, opacity: 0.35 + index * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </aside>

          {modules.map((item, index) => (
            <article
              key={item.title}
              className={`module-card col-span-12 flex flex-col p-5 md:col-span-6 lg:col-span-4 ${
                index > 4 ? "bg-surface-container-low" : "bg-surface"
              }`}
            >
              <div className="mb-6 flex items-start justify-between">
                <span className={`material-symbols-outlined ${index > 4 ? "text-secondary" : "text-primary"}`}>{item.icon}</span>
                {item.status ? <span className="font-code-md text-code-md text-secondary">{item.status}</span> : null}
              </div>
              <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">{item.label}</p>
              <h3 className="mt-1 text-[18px] font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 flex-1 text-body-md text-on-surface-variant">{item.description}</p>
              <Link
                to={item.to}
                className="mt-6 inline-flex w-full items-center justify-center border border-outline-variant py-2 text-label-sm font-label-sm uppercase tracking-widest text-on-surface transition hover:border-primary"
              >
                Open tool
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
