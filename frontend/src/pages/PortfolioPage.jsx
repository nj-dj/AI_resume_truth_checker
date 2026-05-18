import { useMemo, useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postPortfolioHtml } from "../services/api.js";

const initialProfile = {
  fullName: "Alex Rivera",
  headline: "Product-minded full-stack engineer",
  bio: "I build reliable customer experiences with TypeScript, React, and Node.",
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  experience: [
    {
      role: "Senior Engineer",
      company: "Northwind Labs",
      duration: "2022 — Present",
      description: "Led migration to modular React architecture and improved release cadence.",
    },
  ],
  projects: [
    {
      name: "Realtime ops console",
      tech_stack: ["React", "WebSockets", "Node.js"],
      description: "Operational dashboard used by support and SRE teams.",
    },
  ],
  socialLinks: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
  ],
};

export default function PortfolioPage() {
  const { consumeCredits } = useSubscription();
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [headline, setHeadline] = useState(initialProfile.headline);
  const [bio, setBio] = useState(initialProfile.bio);
  const [skillsRaw, setSkillsRaw] = useState(initialProfile.skills.join(", "));
  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/in/example");
  const [github, setGithub] = useState("https://github.com/example");
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const payload = useMemo(() => {
    const skills = skillsRaw
      .split(/[,|\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const socialLinks = [
      { label: "LinkedIn", url: linkedin },
      { label: "GitHub", url: github },
    ].filter((l) => l.url);
    return {
      fullName,
      headline,
      bio,
      skills,
      experience: initialProfile.experience,
      projects: initialProfile.projects,
      socialLinks,
    };
  }, [fullName, headline, bio, skillsRaw, linkedin, github]);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const usage = consumeCredits({ feature: "portfolio", cost: 6 });
      if (!usage.ok) {
        setError(usage.message);
        return;
      }

      const response = await postPortfolioHtml(payload);
      setHtml(response.data?.html ?? "");
    } catch (err) {
      setHtml("");
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-container-max mx-auto space-y-10">
      <section className="rounded-[1.5rem] panel-card-soft p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary">Portfolio</p>
        <h1 className="text-headline-lg font-semibold text-primary">Portfolio generator</h1>
        <p className="mt-4 max-w-3xl text-body-lg text-on-surface-variant">
          Create a responsive portfolio page from structured fields and export it as static HTML.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-6 panel-card p-8"
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <label className="space-y-3 text-sm font-medium">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          <label className="space-y-3 text-sm font-medium">
            Headline
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          <label className="space-y-3 text-sm font-medium">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full panel-input px-4 py-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          <label className="space-y-3 text-sm font-medium">
            Skills (comma-separated)
            <textarea
              value={skillsRaw}
              onChange={(e) => setSkillsRaw(e.target.value)}
              rows={3}
              className="w-full panel-input px-4 py-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          <label className="space-y-3 text-sm font-medium">
            LinkedIn URL
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          <label className="space-y-3 text-sm font-medium">
            GitHub URL
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full panel-input px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition hover:bg-accent-400 disabled:opacity-60"
            >
              {loading ? "Generating..." : "Preview portfolio"}
            </button>
            <button
              type="button"
              onClick={downloadHtml}
              disabled={!html}
              className="inline-flex items-center justify-center panel-button-secondary px-6 py-3 text-sm font-semibold disabled:opacity-40"
            >
              Download website file
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] panel-card-soft p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Live preview</p>
            <div className="mt-4 h-[640px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-surface p-4">
              {html ? <iframe title="Portfolio preview" className="h-full w-full border-0" srcDoc={html} /> : <div className="flex h-full items-center justify-center text-sm text-on-surface-variant">Generate a preview to inspect the HTML.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
