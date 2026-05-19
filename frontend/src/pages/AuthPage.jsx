import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";

export default function AuthPage({ mode = "login" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, signIn, signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname || "/";

  const title = isSignup ? "Create your workspace" : "Welcome back";
  const subtitle = isSignup
    ? "Start a secure Resume.OS account for saved career workflows."
    : "Sign in to continue using your resume verification tools.";

  const helperLink = useMemo(
    () =>
      isSignup ? (
        <span>
          Already have an account?{" "}
          <Link className="font-semibold text-secondary transition hover:brightness-125" to="/login">
            Sign in
          </Link>
        </span>
      ) : (
        <span>
          New to Resume.OS?{" "}
          <Link className="font-semibold text-secondary transition hover:brightness-125" to="/signup">
            Create an account
          </Link>
        </span>
      ),
    [isSignup],
  );

  useEffect(() => {
    setError("");
    setForm((current) => ({ ...current, password: "" }));
  }, [mode]);

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isSignup) {
        await signUp(form);
      } else {
        await signIn({ email: form.email, password: form.password });
      }

      navigate(redirectTo, { replace: true });
    } catch (caughtError) {
      setError(formatApiError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background text-on-surface lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
      <section className="flex min-h-[34rem] flex-col justify-between border-b border-outline-variant bg-surface-container-low px-5 py-6 sm:px-8 lg:border-b-0 lg:border-r lg:px-10">
        <div>
          <p className="font-code-md text-code-md uppercase text-secondary">Resume.OS</p>
          <h1 className="mt-5 max-w-2xl text-display-xl font-bold text-primary sm:text-[56px] sm:leading-[1.05]">
            AI resume truth checking, behind a real account.
          </h1>
          <p className="mt-5 max-w-xl text-body-lg leading-7 text-on-surface-variant">
            Keep verification, ATS analysis, cover letters, and interview prep inside one signed-in career workspace.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-on-surface-variant sm:grid-cols-3">
          {[
            ["secure", "Signed sessions"],
            ["person_add", "Simple signup"],
            ["logout", "Clean logout"],
          ].map(([icon, label]) => (
            <div key={label} className="border border-outline-variant bg-surface px-4 py-3">
              <span className="material-symbols-outlined text-[20px] text-secondary">{icon}</span>
              <p className="mt-2 font-semibold text-on-surface">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md border border-outline-variant bg-surface-container-lowest p-5 shadow-glow sm:p-6">
          <p className="text-label-sm font-label-sm uppercase tracking-widest text-secondary">{isSignup ? "Sign up" : "Sign in"}</p>
          <h2 className="mt-3 text-headline-md font-semibold text-primary">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">{subtitle}</p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {isSignup ? (
              <label className="block space-y-2">
                <span className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Name</span>
                <input
                  className="panel-input h-12 w-full px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  value={form.name}
                  onChange={updateField("name")}
                  autoComplete="name"
                  required
                  minLength={2}
                  placeholder="Your name"
                />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Email</span>
              <input
                className="panel-input h-12 w-full px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                value={form.email}
                onChange={updateField("email")}
                autoComplete="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-label-sm font-label-sm uppercase tracking-widest text-on-surface-variant">Password</span>
              <input
                className="panel-input h-12 w-full px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                value={form.password}
                onChange={updateField("password")}
                autoComplete={isSignup ? "new-password" : "current-password"}
                type="password"
                required
                minLength={isSignup ? 8 : 1}
                placeholder={isSignup ? "At least 8 characters" : "Your password"}
              />
            </label>

            {error ? <div className="border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{error}</div> : null}

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded bg-secondary px-5 text-sm font-black uppercase tracking-widest text-on-secondary transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={submitting || loading}
            >
              <span className="material-symbols-outlined text-[18px]">{isSignup ? "person_add" : "login"}</span>
              {submitting ? "Please wait" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-on-surface-variant">{helperLink}</p>
        </div>
      </section>
    </main>
  );
}
