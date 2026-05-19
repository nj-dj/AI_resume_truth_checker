import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { AuthSession, CoverLetterResult, ExtensionMessage, JobPosting, UsageState } from "../shared/types";
import "./styles.css";

const sendMessage = <T,>(message: ExtensionMessage) =>
  chrome.runtime.sendMessage(message) as Promise<{ success: boolean; data?: T; message?: string }>;

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const usageText = useMemo(() => {
    if (!usage) return "Checking usage...";
    if (usage.canGenerate) return usage.plan === "free" ? `${usage.remainingTrial}/${usage.trialLimit} trial generations left` : "Subscription active";
    return "Trial limit reached";
  }, [usage]);

  const refreshJobAndUsage = async () => {
    const [jobResponse, usageResponse] = await Promise.all([
      sendMessage<JobPosting>({ type: "GET_ACTIVE_JOB" }),
      sendMessage<UsageState>({ type: "GET_USAGE" }),
    ]);
    setJob(jobResponse.data ?? null);
    setUsage(usageResponse.data ?? null);
  };

  useEffect(() => {
    void (async () => {
      const sessionResponse = await sendMessage<AuthSession>({ type: "GET_SESSION" });
      setSession(sessionResponse.data ?? null);
      await refreshJobAndUsage();
    })();
  }, []);

  const authenticate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const response =
      authMode === "signup"
        ? await sendMessage<AuthSession>({ type: "SIGNUP", payload: { name, email, password } })
        : await sendMessage<AuthSession>({ type: "LOGIN", payload: { email, password } });

    setLoading(false);

    if (!response.success || !response.data) {
      setError(response.message ?? "Authentication failed");
      return;
    }

    setSession(response.data);
    await refreshJobAndUsage();
  };

  const logout = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    await sendMessage({ type: "LOGOUT" });
    setSession(null);
    setResult(null);
    setLoading(false);
  };

  const generate = async () => {
    if (!job) return;
    setLoading(true);
    setError("");
    setNotice("");
    const response = await sendMessage<CoverLetterResult>({ type: "GENERATE_COVER_LETTER", payload: job });
    setLoading(false);

    if (!response.success || !response.data) {
      setError(response.message ?? "Generation failed");
      return;
    }

    setResult(response.data);
    setUsage(response.data.usage);
  };

  const copy = async () => {
    if (!result?.bodyMarkdown) return;
    await navigator.clipboard.writeText(result.bodyMarkdown);
    setNotice("Cover letter copied.");
  };

  const save = async () => {
    if (!job || !result?.bodyMarkdown) return;
    const response = await sendMessage({
      type: "SAVE_COVER_LETTER",
      payload: { coverLetterId: result.id, job, content: result.bodyMarkdown },
    });

    if (!response.success) {
      setError(response.message ?? "Save failed");
      return;
    }

    setNotice("Saved to your Resume.OS account.");
  };

  return (
    <main className="min-h-[520px] w-[390px] bg-zinc-950 p-4 text-zinc-50">
      <header className="mb-4 border-b border-zinc-800 pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Resume.OS</p>
        <h1 className="mt-1 text-xl font-bold">Cover Letter Assistant</h1>
        <p className="mt-1 text-sm text-zinc-400">{usageText}</p>
      </header>

      {!session ? (
        <form className="space-y-3" onSubmit={authenticate}>
          {authMode === "signup" ? (
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" required minLength={2} />
          ) : null}
          <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
          <input
            className="field"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={authMode === "signup" ? "Password (8+ characters)" : "Password"}
            type="password"
            required
            minLength={authMode === "signup" ? 8 : 1}
          />
          <button className="primary" disabled={loading}>
            {loading ? "Please wait..." : authMode === "signup" ? "Create account" : "Sign in"}
          </button>
          <button
            className="link-button"
            type="button"
            onClick={() => {
              setAuthMode(authMode === "signup" ? "login" : "signup");
              setError("");
              setNotice("");
            }}
          >
            {authMode === "signup" ? "Already have an account? Sign in" : "New here? Create account"}
          </button>
        </form>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-100">{session.user.name || session.user.email}</p>
              <p className="truncate text-xs text-zinc-500">{session.user.email}</p>
            </div>
            <button className="secondary compact" onClick={logout} disabled={loading}>
              Logout
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Detected job</p>
              <button className="mini" onClick={() => void refreshJobAndUsage()}>
                Refresh
              </button>
            </div>
            <h2 className="mt-2 font-semibold">{job?.title ?? "No supported job detected"}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {job ? `${job.companyName || "Unknown company"} - ${job.site}` : "Open a supported job post, then reopen or refresh this popup."}
            </p>
          </div>

          {usage && !usage.canGenerate ? (
            <a className="primary block text-center" href={usage.upgradeUrl ?? "https://ai-resume-truth-checker.vercel.app/pricing"} target="_blank" rel="noreferrer">
              Upgrade to continue
            </a>
          ) : (
            <button className="primary" disabled={!job || loading} onClick={generate}>
              {loading ? "Generating..." : "Generate Cover Letter"}
            </button>
          )}

          {result ? (
            <div className="space-y-3">
              <textarea className="min-h-[230px] w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm leading-6" readOnly value={result.bodyMarkdown} />
              <div className="grid grid-cols-2 gap-2">
                <button className="secondary" onClick={copy}>
                  Copy
                </button>
                <button className="secondary" onClick={save}>
                  Save
                </button>
              </div>
            </div>
          ) : null}
        </section>
      )}

      {error ? <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
      {notice ? <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{notice}</div> : null}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
