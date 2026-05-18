import { Link } from "react-router-dom";

const features = [
  {
    to: "/truth-checker",
    title: "Resume + GitHub Truth Checker",
    description: "Structured resume parsing, GitHub skill verification, and credibility scoring in one workflow.",
    tag: "Recruiting",
  },
  {
    to: "/ats",
    title: "ATS Scanner",
    description: "Compare your resume to job descriptions and identify gaps, keywords, and formatting signals.",
    tag: "ATS",
  },
  {
    to: "/enhance",
    title: "AI Resume Enhancer",
    description: "Improve bullets, action verbs, and clarity for standout resume impact.",
    tag: "Writing",
  },
  {
    to: "/builder",
    title: "Smart Resume Builder",
    description: "Create a polished resume with reliable layout patterns and saved drafts.",
    tag: "Editor",
  },
  {
    to: "/jobs",
    title: "Job recommendations",
    description: "Discover roles matched to your skills and preferences with curated suggestions.",
    tag: "Jobs",
  },
  {
    to: "/cover-letter",
    title: "Cover letter generator",
    description: "Generate a professional cover letter tailored to your target role.",
    tag: "Applications",
  },
  {
    to: "/career",
    title: "Career assistant",
    description: "Plan growth with learning paths, milestone guidance, and strategic next steps.",
    tag: "Strategy",
  },
  {
    to: "/portfolio",
    title: "Portfolio site generator",
    description: "Create a responsive portfolio page using your profile and achievements.",
    tag: "Presence",
  },
  {
    to: "/interview",
    title: "Interview preparation",
    description: "Get AI-crafted interview questions and structured answer feedback.",
    tag: "Interviews",
  },
];

export default function FeatureCards() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent-400">Explore the workspace</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">All tools for authentic resume performance</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          Navigate every step from credibility scoring to interview prep with clean, accessible workflows and modern dashboard cards.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.to}
            to={feature.to}
            className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface-950/90 p-6 shadow-xl shadow-black/10 transition duration-300 ease-out transform-gpu hover:-translate-y-1 hover:border-accent-400/20 hover:bg-surface-900/95 hover:shadow-2xl"
          >
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
              {feature.tag}
            </span>
            <h3 className="mt-5 text-xl font-semibold text-white transition group-hover:text-accent-400">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">{feature.description}</p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-accent-400">
              Open tool →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
