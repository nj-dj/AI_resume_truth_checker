import { useMemo, useState } from "react";

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
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Portfolio generator</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Creates a responsive single-page portfolio from structured fields. Download the HTML and host on any static
          provider.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void generate();
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Headline
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Skills (comma-separated)
            <textarea
              value={skillsRaw}
              onChange={(e) => setSkillsRaw(e.target.value)}
              rows={3}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            LinkedIn URL
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            GitHub URL
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {loading ? "Rendering…" : "Generate preview"}
            </button>
            <button
              type="button"
              onClick={downloadHtml}
              disabled={!html}
              className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold disabled:opacity-40"
            >
              Download HTML
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--muted)]">Live preview</p>
          <div className="h-[640px] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-inner">
            {html ? <iframe title="Portfolio preview" className="h-full w-full border-0" srcDoc={html} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
