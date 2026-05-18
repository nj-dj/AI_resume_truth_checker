import { useState } from "react";

import { useSubscription } from "../context/SubscriptionContext.jsx";
import { formatApiError } from "../lib/formatApiError.js";
import { postInterviewFeedback, postInterviewSession } from "../services/api.js";

export default function InterviewPrepPage() {
  const { consumeCredits } = useSubscription();
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
      const usage = consumeCredits({ feature: "interviewSession", cost: 3 });
      if (!usage.ok) {
        setSessionError(usage.message);
        return;
      }

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
      const usage = consumeCredits({ feature: "interviewFeedback", cost: 2 });
      if (!usage.ok) {
        setFeedbackError(usage.message);
        return;
      }

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
    <div className="max-w-container-max mx-auto space-y-10">
      <section className="rounded-[1.5rem] panel-card-soft p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary">Interview Prep</p>
        <h1 className="text-headline-lg font-semibold text-primary">Interview preparation</h1>
        <p className="mt-4 max-w-3xl text-body-lg text-on-surface-variant">
          Generate practice interview questions and get feedback to sharpen your answers.
        </p>
      </section>

      <section className="space-y-6 panel-card p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Mock interview session</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Create a targeted set of questions for your role and experience level.</p>
          </div>
          <button
            type="button"
            onClick={() => void generateSession()}
            disabled={loadingSession}
            className="inline-flex items-center justify-center panel-button-primary px-6 py-3 text-sm font-semibold transition hover:bg-accent-400 disabled:opacity-60"
          >
            {loadingSession ? "Generating..." : "Generate interview questions"}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <label className="space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-5">
            <span className="text-xs uppercase tracking-[0.18em] text-secondary">Role</span>
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="panel-input w-full px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </label>
          <label className="space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-5">
            <span className="text-xs uppercase tracking-[0.18em] text-secondary">Level</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="panel-input w-full px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </label>
          <label className="md:col-span-3 space-y-3 rounded-[1.5rem] border border-white/10 bg-surface-950/80 p-5">
            <span className="text-xs uppercase tracking-[0.18em] text-secondary">Interview type</span>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="panel-input w-full px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            >
              <option value="mixed">Mixed</option>
              <option value="technical">Technical</option>
              <option value="hr">HR / behavioral</option>
            </select>
          </label>
        </div>

        {sessionError ? <p className="text-sm text-rose-400">{sessionError}</p> : null}

        {session ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Technical</h3>
              <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                {session.technicalQuestions?.map((q) => (
                  <li key={q.question} className="rounded-[1.5rem] border border-white/10 bg-surface-900 p-4">
                    <p className="font-semibold text-on-surface">{q.question}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Follow-up: {q.follow_up}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] panel-card-soft p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">HR / behavioral</h3>
              <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
                {session.hrQuestions?.map((q) => (
                  <li key={q.question} className="rounded-[1.5rem] border border-white/10 bg-surface-900 p-4">
                    <p className="font-semibold text-on-surface">{q.question}</p>
                    <p className="mt-2 text-xs text-on-surface-variant">Follow-up: {q.follow_up}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 rounded-[1.5rem] border border-white/10 bg-surface-950/85 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Checklist</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-on-surface-variant">
                {session.preparationChecklist?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-6 panel-card p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-primary">Answer feedback</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Submit your response to receive structured improvement guidance.</p>
          </div>
          <div className="text-sm text-on-surface-variant">Short, concise answers work best.</div>
        </div>
        <form className="space-y-5" onSubmit={submitFeedback}>
          <label className="block space-y-2">
            <span className="block text-xs uppercase tracking-[0.18em] text-secondary">Question</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full panel-input resize-y px-4 py-4 text-sm leading-6 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              placeholder="Paste the interview question you want to practice..."
            />
          </label>
          <label className="block space-y-2">
            <span className="block text-xs uppercase tracking-[0.18em] text-secondary">Your answer</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="w-full panel-input resize-y px-4 py-4 text-sm leading-6 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              placeholder="Write your spoken answer here. Aim for a concise, specific response."
            />
          </label>
          {feedbackError ? <p className="text-sm text-rose-400">{feedbackError}</p> : null}
          <button
            type="submit"
            disabled={loadingFeedback}
            className="inline-flex items-center justify-center panel-button-primary px-6 py-3 text-sm font-semibold transition hover:bg-accent-400 disabled:opacity-60"
          >
            {loadingFeedback ? "Reviewing..." : "Review my answer"}
          </button>
        </form>

        {feedback ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-emerald-500/10 p-5 text-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Strengths</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-on-surface-variant">
                {feedback.strengths?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-amber-500/10 p-5 text-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-amber-100">Improvements</p>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-on-surface-variant">
                {feedback.improvements?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2 rounded-[1.5rem] border border-white/10 bg-surface-900 p-5 text-sm">
              <p className="text-xs uppercase tracking-[0.16em] text-secondary">Confidence score</p>
              <p className="mt-3 text-4xl font-semibold text-secondary">{feedback.confidenceScore}</p>
              <p className="mt-3 text-on-surface-variant">{feedback.confidenceRationale}</p>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.16em] text-secondary">Model outline</p>
                <ul className="mt-3 list-decimal space-y-2 pl-5 text-on-surface-variant">
                  {feedback.modelAnswerOutline?.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
