import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";

import { useSubscription } from "../../context/SubscriptionContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

const navLinkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 px-4 py-3 text-body-md transition duration-150",
    isActive
      ? "border-l-2 border-primary bg-surface-variant text-primary"
      : "border-l-2 border-transparent text-on-surface-variant hover:bg-surface-container-highest hover:text-primary",
  ].join(" ");

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/truth-checker", label: "Resume Verification", icon: "verified" },
  { to: "/ats", label: "ATS Scanner", icon: "qr_code_scanner" },
  { to: "/enhance", label: "Resume Enhancer", icon: "auto_awesome" },
  { to: "/builder", label: "Resume Builder", icon: "edit_note" },
  { to: "/jobs", label: "Job Search", icon: "search" },
  { to: "/cover-letter", label: "Cover Letter", icon: "description" },
  { to: "/career", label: "Advice", icon: "psychology" },
  { to: "/portfolio", label: "Portfolio", icon: "language" },
  { to: "/interview", label: "Interview Prep", icon: "interpreter_mode" },
];

export default function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const {
    activePanel,
    closePanel,
    createSupportTicket,
    downgradeToFree,
    freeMonthlyCredits,
    isPro,
    openSettings,
    openSupport,
    openUpgrade,
    remainingCredits,
    resetFreeCredits,
    state: subscription,
    updateSettings,
    upgradeToPro,
  } = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportSent, setSupportSent] = useState(false);

  const handleSupportSubmit = (event) => {
    event.preventDefault();
    createSupportTicket({
      subject: supportSubject.trim() || "General support request",
      message: supportMessage.trim(),
    });
    setSupportSubject("");
    setSupportMessage("");
    setSupportSent(true);
  };

  const closeMobileAnd = (action) => {
    setMobileOpen(false);
    action();
  };

  const nav = (
    <>
      <div className="p-6">
        <h1 className="font-headline-md text-headline-md font-bold uppercase tracking-tighter text-primary">RESUME.OS</h1>
        <p className="text-body-md text-on-surface-variant opacity-70">Career tools</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="mt-auto border-t border-outline-variant bg-surface-container-lowest/50 p-4">
        <button
          type="button"
          onClick={() => closeMobileAnd(openUpgrade)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-3 text-label-sm font-semibold uppercase tracking-widest text-on-secondary transition hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">upgrade</span>
          {isPro ? "Pro plan active" : "Upgrade to Pro"}
        </button>
        <div className="mt-3 border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface-variant">
          {isPro ? "Unlimited usage" : `Free credits: ${remainingCredits}/${freeMonthlyCredits}`}
        </div>
        <div className="mt-4 space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 px-2 py-2 text-left text-label-sm font-label-sm text-on-surface-variant transition hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">contrast</span>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={() => closeMobileAnd(openSettings)}
            className="flex w-full items-center gap-3 px-2 py-2 text-left text-label-sm font-label-sm text-on-surface-variant transition hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Settings
          </button>
          <button
            type="button"
            onClick={() => closeMobileAnd(openSupport)}
            className="flex w-full items-center gap-3 px-2 py-2 text-left text-label-sm font-label-sm text-on-surface-variant transition hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            Support
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-on-surface lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low lg:flex">
        {nav}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="flex h-full w-[min(20rem,86vw)] flex-col border-r border-outline-variant bg-surface-container-low" onClick={(event) => event.stopPropagation()}>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-xl lg:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-primary lg:hidden"
              aria-label="Open navigation"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <span className="font-code-md text-code-md text-on-surface-variant flex items-center gap-2">
              <span className="status-dot animate-pulse" />
              <span className="hidden sm:inline">Status:</span> Stable
            </span>
            <span className="hidden h-4 w-px bg-outline-variant sm:block" />
            <button
              type="button"
              onClick={openUpgrade}
              className="hidden font-code-md text-code-md text-primary transition hover:text-secondary sm:block"
            >
              {isPro ? "Plan: Pro" : `Credits: ${remainingCredits}`}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={openSupport}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded border border-transparent text-on-surface-variant transition hover:border-outline-variant hover:text-primary"
              aria-label="Open support"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-error" />
            </button>
            <button
              type="button"
              onClick={openSettings}
              className="flex items-center gap-2 rounded border border-transparent px-2 py-1 text-left transition hover:border-outline-variant hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-secondary/20"
              aria-label="Open profile settings"
            >
              <div className="hidden text-right sm:block">
                <p className="font-label-sm text-label-sm uppercase text-primary">User profile</p>
                <p className="text-[10px] text-on-surface-variant">Career workspace</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant bg-surface-container-highest text-label-sm font-semibold text-primary">
                A1
              </div>
            </button>
          </div>
        </header>

        <motion.main
          className="min-h-[calc(100vh-4rem)] bg-background px-4 pb-10 pt-8 sm:px-6 lg:px-8"
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.main>

        <footer className="hidden border-t border-outline-variant bg-surface-container-lowest px-6 py-4 text-code-md font-code-md text-on-surface-variant lg:flex lg:items-center lg:justify-between">
          <span className="text-primary">Resume.OS v2.4.0 | Ready</span>
          <span>Local date: 2026.05.18</span>
        </footer>
      </div>

      {activePanel ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4" onMouseDown={closePanel}>
          <div
            className="w-full max-w-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-outline-variant p-5">
              <div>
                <p className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">
                  {activePanel === "upgrade" ? "Subscription" : activePanel === "settings" ? "Control Panel" : "Support Desk"}
                </p>
                <h2 className="mt-2 text-headline-md font-semibold text-primary">
                  {activePanel === "upgrade" ? "Upgrade Resume.OS" : activePanel === "settings" ? "Settings" : "Contact Support"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant bg-surface text-on-surface-variant transition hover:text-primary"
                aria-label="Close dialog"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {activePanel === "upgrade" ? (
              <div className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border border-outline-variant bg-surface p-5">
                    <p className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Free</p>
                    <p className="mt-3 text-3xl font-semibold text-primary">{freeMonthlyCredits}</p>
                    <p className="mt-1 text-body-md text-on-surface-variant">monthly AI credits for evaluation.</p>
                    <div className="mt-5 h-2 bg-surface-container-highest">
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${Math.min((subscription.creditsUsed / freeMonthlyCredits) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="mt-3 font-code-md text-code-md text-on-surface-variant">
                      Used: {subscription.creditsUsed}/{freeMonthlyCredits}
                    </p>
                  </div>
                  <div className="border border-secondary bg-secondary/10 p-5">
                    <p className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">Pro</p>
                    <p className="mt-3 text-3xl font-semibold text-primary">$9/mo</p>
                    <p className="mt-1 text-body-md text-on-surface-variant">unlimited local credits, priority workflows, and export-focused tools.</p>
                    <button
                      type="button"
                      onClick={upgradeToPro}
                      disabled={isPro}
                      className="mt-5 w-full rounded bg-secondary px-5 py-3 text-sm font-black uppercase tracking-widest text-on-secondary transition hover:brightness-110 disabled:opacity-60"
                    >
                      {isPro ? "Pro already active" : "Activate Pro demo"}
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-6 text-on-surface-variant">
                  This implementation is ready to swap the demo activation for Stripe, Razorpay, or your backend billing endpoint later.
                </p>
              </div>
            ) : null}

            {activePanel === "settings" ? (
              <div className="space-y-5 p-5">
                <div className="grid gap-3">
                  {[
                    ["emailUpdates", "Email product and account updates"],
                    ["productTips", "Show product tips in the app"],
                    ["saveDrafts", "Save local drafts and usage history"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between gap-4 border border-outline-variant bg-surface p-4">
                      <span className="text-body-md text-on-surface">{label}</span>
                      <input
                        type="checkbox"
                        checked={subscription.settings[key]}
                        onChange={(event) => updateSettings({ [key]: event.target.checked })}
                        className="h-5 w-5 accent-secondary"
                      />
                    </label>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={resetFreeCredits}
                    className="rounded border border-outline-variant bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:border-secondary"
                  >
                    Reset demo credits
                  </button>
                  <button
                    type="button"
                    onClick={downgradeToFree}
                    className="rounded border border-outline-variant bg-surface-container px-4 py-3 text-sm font-semibold text-on-surface transition hover:border-secondary"
                  >
                    Switch to free plan
                  </button>
                </div>
              </div>
            ) : null}

            {activePanel === "support" ? (
              <div className="p-5">
                {supportSent ? (
                  <div className="mb-4 border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
                    Support ticket saved locally. Latest ticket ID: {subscription.supportTickets[0]?.id}
                  </div>
                ) : null}
                <form className="space-y-4" onSubmit={handleSupportSubmit}>
                  <label className="block space-y-2">
                    <span className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">Subject</span>
                    <input
                      value={supportSubject}
                      onChange={(event) => setSupportSubject(event.target.value)}
                      className="panel-input h-12 w-full px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="e.g. Billing question, API issue, feature request"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">Message</span>
                    <textarea
                      required
                      value={supportMessage}
                      onChange={(event) => setSupportMessage(event.target.value)}
                      rows={5}
                      className="panel-input w-full px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="Tell us what happened and which module you were using."
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded bg-secondary px-5 py-3 text-sm font-black uppercase tracking-widest text-on-secondary transition hover:brightness-110"
                  >
                    Submit support ticket
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
