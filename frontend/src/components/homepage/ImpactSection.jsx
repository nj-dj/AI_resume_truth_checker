const impactItems = [
  {
    title: "Verified confidence",
    description: "See which resume claims are backed by skills, project evidence, and GitHub validation before you apply.",
  },
  {
    title: "ATS-ready accuracy",
    description: "Highlight role-specific keywords and formatting signals so your resume performs better in automated screenings.",
  },
  {
    title: "Faster hiring prep",
    description: "Build interview-ready stories and career materials from the same trusted workspace.",
  },
];

export default function ImpactSection() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-surface-950/90 p-6 shadow-xl shadow-black/10 ring-1 ring-white/5 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-400">Why it matters</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trusted resume decisions, faster than ever.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Bring structure, evidence, and AI-driven clarity to your job search with a polished experience that feels modern and dependable.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {impactItems.map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300 shadow-sm backdrop-blur-sm">
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
