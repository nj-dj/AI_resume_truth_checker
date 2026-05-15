import { Link } from "react-router-dom";

const cards = [
  {
    to: "/truth-checker",
    title: "Resume + GitHub Truth Checker",
    description: "Original screening flow: structured resume parsing, GitHub skill validation, and credibility scoring.",
    tag: "Recruiting",
  },
  {
    to: "/ats",
    title: "ATS Scanner",
    description: "Upload a resume with a job description for keyword coverage, formatting signals, and AI optimization tips.",
    tag: "ATS",
  },
  {
    to: "/enhance",
    title: "AI Resume Enhancer",
    description: "Stronger bullets, action verbs, measurable outcomes, and ATS-aware keyword alignment.",
    tag: "Writing",
  },
  {
    to: "/builder",
    title: "Smart Resume Builder",
    description: "Drag-and-drop sections, live preview, autosaved drafts, and export-ready layout.",
    tag: "Editor",
  },
  {
    to: "/jobs",
    title: "Job recommendations",
    description: "Skill-first matching with remote, hybrid, and location filters plus a lightweight saved-jobs tracker.",
    tag: "Jobs",
  },
  {
    to: "/cover-letter",
    title: "Cover letter generator",
    description: "Role-aware drafts with tone control and Markdown you can edit before export.",
    tag: "Applications",
  },
  {
    to: "/career",
    title: "Career assistant",
    description: "Skill gaps, learning paths, roadmap milestones, and cautious salary context.",
    tag: "Strategy",
  },
  {
    to: "/portfolio",
    title: "Portfolio site generator",
    description: "Turn structured profile data into a responsive single-page portfolio you can download as HTML.",
    tag: "Presence",
  },
  {
    to: "/interview",
    title: "Interview preparation",
    description: "AI-generated technical and HR questions plus structured feedback on your answers.",
    tag: "Interviews",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Command center</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          EnhanceMyAICV unifies resume intelligence, ATS alignment, applications, and interview prep in a single premium
          workspace inspired by leading job boards and AI resume products.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
          >
            <span className="inline-flex w-fit rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {card.tag}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">{card.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{card.description}</p>
            <span className="mt-4 text-sm font-semibold text-[var(--accent)]">Open workspace →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
