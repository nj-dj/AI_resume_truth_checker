import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "resumeos-subscription-v1";
const FREE_MONTHLY_CREDITS = 30;

const initialState = {
  plan: "free",
  creditsUsed: 0,
  billingCycleStartedAt: new Date().toISOString(),
  usageEvents: [],
  settings: {
    emailUpdates: true,
    productTips: true,
    saveDrafts: true,
  },
  supportTickets: [],
};

const featureLabels = {
  truthChecker: "Resume Verification",
  atsScanner: "ATS Scanner",
  resumeEnhancer: "AI Resume Enhancer",
  coverLetter: "Cover Letter Generator",
  careerInsights: "Career Insights",
  jobSearch: "Job Recommendations",
  portfolio: "Portfolio Generator",
  interviewSession: "Interview Question Bank",
  interviewFeedback: "Interview Feedback",
};

const SubscriptionContext = createContext(null);

const readStoredState = () => {
  if (typeof window === "undefined") return initialState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;

    return {
      ...initialState,
      ...JSON.parse(raw),
      settings: {
        ...initialState.settings,
        ...JSON.parse(raw).settings,
      },
    };
  } catch {
    return initialState;
  }
};

export function SubscriptionProvider({ children }) {
  const [state, setState] = useState(readStoredState);
  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const remainingCredits = Math.max(FREE_MONTHLY_CREDITS - state.creditsUsed, 0);
  const isPro = state.plan === "pro";

  const openUpgrade = useCallback(() => setActivePanel("upgrade"), []);
  const openSettings = useCallback(() => setActivePanel("settings"), []);
  const openSupport = useCallback(() => setActivePanel("support"), []);
  const openActivity = useCallback(() => setActivePanel("activity"), []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  const upgradeToPro = useCallback(() => {
    setState((current) => ({
      ...current,
      plan: "pro",
      upgradedAt: new Date().toISOString(),
    }));
    setActivePanel(null);
  }, []);

  const downgradeToFree = useCallback(() => {
    setState((current) => ({
      ...current,
      plan: "free",
    }));
  }, []);

  const resetFreeCredits = useCallback(() => {
    setState((current) => ({
      ...current,
      creditsUsed: 0,
      billingCycleStartedAt: new Date().toISOString(),
      usageEvents: [],
    }));
  }, []);

  const consumeCredits = useCallback(
    ({ feature, cost }) => {
      const label = featureLabels[feature] ?? feature;

      if (state.plan === "free" && state.creditsUsed + cost > FREE_MONTHLY_CREDITS) {
        setActivePanel("upgrade");
        return {
          ok: false,
          message: `${label} needs ${cost} credits. Your free plan has ${remainingCredits} credits left. Upgrade to Pro or reset the demo allowance in Settings.`,
        };
      }

      setState((current) => ({
        ...current,
        creditsUsed: current.plan === "free" ? Math.min(current.creditsUsed + cost, FREE_MONTHLY_CREDITS) : current.creditsUsed,
        usageEvents: [
          {
            id: crypto.randomUUID(),
            feature,
            label,
            cost: current.plan === "free" ? cost : 0,
            plan: current.plan,
            createdAt: new Date().toISOString(),
          },
          ...current.usageEvents,
        ].slice(0, 20),
      }));

      return { ok: true };
    },
    [remainingCredits, state.creditsUsed, state.plan],
  );

  const updateSettings = useCallback((nextSettings) => {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...nextSettings,
      },
    }));
  }, []);

  const createSupportTicket = useCallback((ticket) => {
    setState((current) => ({
      ...current,
      supportTickets: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: "open",
          ...ticket,
        },
        ...current.supportTickets,
      ].slice(0, 10),
    }));
  }, []);

  const value = useMemo(
    () => ({
      activePanel,
      closePanel,
      consumeCredits,
      createSupportTicket,
      downgradeToFree,
      featureLabels,
      freeMonthlyCredits: FREE_MONTHLY_CREDITS,
      isPro,
      openActivity,
      openSettings,
      openSupport,
      openUpgrade,
      remainingCredits,
      resetFreeCredits,
      state,
      updateSettings,
      upgradeToPro,
    }),
    [
      activePanel,
      closePanel,
      consumeCredits,
      createSupportTicket,
      downgradeToFree,
      isPro,
      openActivity,
      openSettings,
      openSupport,
      openUpgrade,
      remainingCredits,
      resetFreeCredits,
      state,
      updateSettings,
      upgradeToPro,
    ],
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used inside SubscriptionProvider");
  }
  return context;
};
