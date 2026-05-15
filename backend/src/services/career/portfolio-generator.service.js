const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const listItems = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

const experienceBlocks = (experience) =>
  (Array.isArray(experience) ? experience : [])
    .map(
      (exp) => `
      <article class="timeline-item">
        <h3>${escapeHtml(exp?.role)} <span>${escapeHtml(exp?.company)}</span></h3>
        <p class="muted">${escapeHtml(exp?.duration)}</p>
        <p>${escapeHtml(exp?.description)}</p>
      </article>`,
    )
    .join("");

const projectBlocks = (projects) =>
  (Array.isArray(projects) ? projects : [])
    .map(
      (project) => `
      <article class="card">
        <h3>${escapeHtml(project?.name)}</h3>
        <p class="tags">${(Array.isArray(project?.tech_stack) ? project.tech_stack : []).map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</p>
        <p>${escapeHtml(project?.description)}</p>
      </article>`,
    )
    .join("");

class PortfolioGeneratorService {
  buildHtml(profile) {
    const name = escapeHtml(profile?.fullName || "Portfolio");
    const title = escapeHtml(profile?.headline || "Software professional");
    const bio = escapeHtml(profile?.bio || "");
    const skills = listItems(profile?.skills || []);
    const links = (Array.isArray(profile?.socialLinks) ? profile.socialLinks : [])
      .filter((l) => l?.url)
      .map((l) => `<a href="${escapeHtml(l.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(l.label || l.url)}</a>`)
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name}</title>
  <style>
    :root { color-scheme: light dark; --bg: #0b1220; --fg: #e8eefc; --muted: #9fb0d8; --accent: #38bdf8; }
    @media (prefers-color-scheme: light) {
      :root { --bg: #f8fafc; --fg: #0f172a; --muted: #475569; --accent: #0284c7; }
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background: var(--bg); color: var(--fg); }
    header { padding: 4rem 1.5rem 3rem; text-align: center; background: radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 55%); }
    h1 { margin: 0; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -0.03em; }
    .headline { margin-top: 0.75rem; color: var(--muted); font-size: 1.1rem; }
    main { max-width: 960px; margin: 0 auto; padding: 0 1.5rem 4rem; display: grid; gap: 2.5rem; }
    section h2 { font-size: 1.25rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; }
    ul { padding-left: 1.2rem; line-height: 1.7; }
    .links { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-top: 1.5rem; }
    .links a { color: var(--accent); text-decoration: none; border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent); padding: 0.4rem 0.9rem; border-radius: 999px; font-size: 0.9rem; }
    .card, .timeline-item { border: 1px solid color-mix(in srgb, var(--fg) 12%, transparent); border-radius: 16px; padding: 1.25rem 1.5rem; background: color-mix(in srgb, var(--fg) 4%, transparent); }
    .timeline-item h3 span { color: var(--muted); font-weight: 500; font-size: 0.95rem; margin-left: 0.35rem; }
    .muted { color: var(--muted); font-size: 0.9rem; }
    .tags span { display: inline-block; margin: 0.2rem 0.35rem 0 0; padding: 0.15rem 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--accent) 18%, transparent); font-size: 0.75rem; }
  </style>
</head>
<body>
  <header>
    <h1>${name}</h1>
    <p class="headline">${title}</p>
    ${bio ? `<p style="max-width:640px;margin:1.5rem auto 0;line-height:1.7;color:var(--muted)">${bio}</p>` : ""}
    <div class="links">${links}</div>
  </header>
  <main>
    <section><h2>Skills</h2><ul>${skills || "<li>—</li>"}</ul></section>
    <section><h2>Experience</h2>${experienceBlocks(profile?.experience) || "<p class='muted'>Add roles to your resume data.</p>"}</section>
    <section><h2>Projects</h2><div style="display:grid;gap:1rem">${projectBlocks(profile?.projects) || "<p class='muted'>Add projects to your resume data.</p>"}</div></section>
  </main>
</body>
</html>`;
  }
}

export const portfolioGeneratorService = new PortfolioGeneratorService();
