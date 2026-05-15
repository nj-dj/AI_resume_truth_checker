import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";

import { useTheme } from "../../context/ThemeContext.jsx";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-[var(--accent-muted)] text-[var(--accent)]"
      : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
  ].join(" ");

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/truth-checker", label: "Truth Checker" },
  { to: "/ats", label: "ATS Scanner" },
  { to: "/enhance", label: "AI Enhancer" },
  { to: "/builder", label: "Resume Builder" },
  { to: "/jobs", label: "Jobs" },
  { to: "/cover-letter", label: "Cover Letter" },
  { to: "/career", label: "Career AI" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/interview", label: "Interview Prep" },
];

export default function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 bg-grid bg-[size:40px_40px] opacity-[0.06]" aria-hidden />
      <div className="pointer-events-none fixed -left-24 top-0 h-80 w-80 rounded-full bg-[var(--glow-1)] blur-3xl opacity-70" aria-hidden />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-[var(--glow-2)] blur-3xl opacity-60" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        <aside className="border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-4 backdrop-blur-xl lg:w-64 lg:border-b-0 lg:border-r lg:px-4 lg:py-8">
          <div className="flex items-center justify-between gap-3">
            <NavLink to="/" className="block" onClick={() => setMobileOpen(false)}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">EnhanceMyAICV</p>
              <p className="mt-1 text-lg font-semibold tracking-tight">Career Studio</p>
            </NavLink>
            <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text)]"
              >
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text)] lg:hidden"
                onClick={() => setMobileOpen((open) => !open)}
              >
                Menu
              </button>
            </div>
          </div>

          <nav
            className={`mt-6 flex flex-col gap-1 ${mobileOpen ? "flex" : "hidden"} lg:flex`}
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setMobileOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-[var(--border)] bg-[var(--surface)]/60 px-4 py-4 backdrop-blur-md sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">MakeMyCV platform</p>
                <p className="text-sm text-[var(--muted)]">AI resume, ATS, jobs, and interview workflows in one workspace.</p>
              </div>
            </div>
          </header>

          <motion.main
            className="flex-1 px-4 py-8 sm:px-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </div>
  );
}
