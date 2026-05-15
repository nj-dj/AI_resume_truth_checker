import { useState } from "react";

import { formatApiError } from "../lib/formatApiError.js";
import { postInterviewFeedback, postInterviewSession } from "../services/api.js";

export default function InterviewPrepPage() {
  const [roleTitle, setRoleTitle] = useState("Senior Frontend Engineer");
  const [level, setLevel] = useState("senior");
  const [interviewType, setInterviewType] = useState("mixed");
  const [session, setSession] = useState(null);
  const [sessionError, setSessionError] = useState("");
  const [loadingSession, setLoadingSession] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [feedbackError, setFeedbackError] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const generateSession = async () => {
    setLoadingSession(true);
    setSessionError("");
    try {
      const response = await postInterviewSession({ roleTitle, level, interviewType, focusAreas: [] });
      setSession(response.data);
      const firstQ = response.data?.technicalQuestions?.[0]?.question ?? response.data?.hrQuestions?.[0]?.question ?? "";
      setQuestion(firstQ);
    } catch (err) {
      setSession(null);
      setSessionError(formatApiError(err));
    } finally {
      setLoadingSession(false);
    }
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    setLoadingFeedback(true);
    setFeedbackError("");
    try {
      const response = await postInterviewFeedback({ roleTitle, question, answer });
      setFeedback(response.data);
    } catch (err) {
      setFeedback(null);
      setFeedbackError(formatApiError(err));
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Interview preparation</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Generates calibrated question banks and structured feedback on your answers. Voice-enabled mock interviews can
          plug into the same API contracts later.
        </p>
      </div>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
        <h2 className="text-lg font-semibold">Mock interview session</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
            Role
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Level
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium md:col-span-3">
            Interview type
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            >
              <option value="mixed">Mixed</option>
              <option value="technical">Technical</option>
              <option value="hr">HR / behavioral</option>
            </select>
          </label>
        </div>
        {sessionError ? <p className="text-sm text-rose-600 dark:text-rose-300">{sessionError}</p> : null}
        <button
          type="button"
          onClick={() => void generateSession()}
          disabled={loadingSession}
          className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {loadingSession ? "Generating…" : "Generate question bank"}
        </button>

        {session ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Technical</h3>
              <ul className="mt-2 space-y-3 text-sm text-[var(--text)]">
                {session.technicalQuestions?.map((q) => (
                  <li key={q.question} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Follow-up: {q.follow_up}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">HR / behavioral</h3>
              <ul className="mt-2 space-y-3 text-sm text-[var(--text)]">
                {session.hrQuestions?.map((q) => (
                  <li key={q.question} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Follow-up: {q.follow_up}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Checklist</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--text)]">
                {session.preparationChecklist?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-6">
        <h2 className="text-lg font-semibold">Answer feedback</h2>
        <form className="space-y-4" onSubmit={submitFeedback}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Question
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Your answer
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>
          {feedbackError ? <p className="text-sm text-rose-600 dark:text-rose-300">{feedbackError}</p> : null}
          <button
            type="submit"
            disabled={loadingFeedback}
            className="rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {loadingFeedback ? "Scoring…" : "Get structured feedback"}
          </button>
        </form>

        {feedback ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">Strengths</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {feedback.strengths?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900 dark:text-amber-100">Improvements</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {feedback.improvements?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Confidence score</p>
              <p className="mt-2 text-4xl font-semibold text-[var(--accent)]">{feedback.confidenceScore}</p>
              <p className="mt-2 text-[var(--muted)]">{feedback.confidenceRationale}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Model outline</p>
              <ul className="mt-2 list-decimal space-y-1 pl-5">
                {feedback.modelAnswerOutline?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
