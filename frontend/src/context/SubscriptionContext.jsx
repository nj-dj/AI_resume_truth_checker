import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "resumeos-subscription-v1";
const FREE_MONTHLY_CREDITS = 30;
const LOCAL_DRAFT_KEYS = ["enhancemyaicv-resume-builder-v1", "enhancemyaicv-saved-jobs"];

const initialState = {
  plan: "free",
  creditsUsed: 0,
  billingCycleStartedAt: new Date().toISOString(),
  usageEvents: [],
  notifications: [],
  unreadNotifications: 0,
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
    const persistentState = state.settings.saveDrafts
      ? state
      : {
          ...state,
          usageEvents: [],
        };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistentState));
  }, [state]);

  const remainingCredits = Math.max(FREE_MONTHLY_CREDITS - state.creditsUsed, 0);
  const isPro = state.plan === "pro";

  const openUpgrade = useCallback(() => setActivePanel("upgrade"), []);
  const openSettings = useCallback(() => setActivePanel("settings"), []);
  const openSupport = useCallback(() => setActivePanel("support"), []);
  const openActivity = useCallback(() => {
    setActivePanel("activity");
    setState((current) => ({
      ...current,
      unreadNotifications: 0,
    }));
  }, []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  const notificationPermission =
    typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "unsupported";

  const showBrowserNotification = useCallback(
    ({ title, message }) => {
      if (!state.settings.emailUpdates || notificationPermission !== "granted") {
        return;
      }

      new window.Notification(title, {
        body: message,
        tag: "resumeos-account-update",
      });
    },
    [notificationPermission, state.settings.emailUpdates],
  );

  const addAccountNotification = useCallback(
    ({ title, message, type = "account" }) => {
      setState((current) => {
        if (!current.settings.emailUpdates) {
          return current;
        }

        return {
          ...current,
          unreadNotifications: current.unreadNotifications + 1,
          notifications: [
            {
              id: crypto.randomUUID(),
              title,
              message,
              type,
              createdAt: new Date().toISOString(),
            },
            ...(current.notifications ?? []),
          ].slice(0, 20),
        };
      });
      showBrowserNotification({ title, message });
    },
    [showBrowserNotification],
  );

  const setAccountNotifications = useCallback(
    async (enabled) => {
      if (enabled && typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "default") {
        await window.Notification.requestPermission();
      }

      setState((current) => ({
        ...current,
        settings: {
          ...current.settings,
          emailUpdates: enabled,
        },
      }));

      if (enabled) {
        addAccountNotification({
          title: "Account notifications enabled",
          message: "Resume.OS will now keep product, support, and billing updates in your notification center.",
          type: "settings",
        });
      }
    },
    [addAccountNotification],
  );

  const upgradeToPro = useCallback(() => {
    setState((current) => ({
      ...current,
      plan: "pro",
      upgradedAt: new Date().toISOString(),
    }));
    addAccountNotification({
      title: "Pro workspace activated",
      message: "Credits are now unlimited for this local workspace.",
      type: "billing",
    });
    setActivePanel(null);
  }, [addAccountNotification]);

  const downgradeToFree = useCallback(() => {
    setState((current) => ({
      ...current,
      plan: "free",
    }));
    addAccountNotification({
      title: "Free plan restored",
      message: "The workspace is back on the free monthly credit allowance.",
      type: "billing",
    });
  }, [addAccountNotification]);

  const resetFreeCredits = useCallback(() => {
    setState((current) => ({
      ...current,
      creditsUsed: 0,
      billingCycleStartedAt: new Date().toISOString(),
      usageEvents: [],
    }));
    addAccountNotification({
      title: "Credits reset",
      message: "Free demo credits and usage history were reset for this workspace.",
      type: "billing",
    });
  }, [addAccountNotification]);

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
        usageEvents: current.settings.saveDrafts
          ? [
              {
                id: crypto.randomUUID(),
                feature,
                label,
                cost: current.plan === "free" ? cost : 0,
                plan: current.plan,
                createdAt: new Date().toISOString(),
              },
              ...current.usageEvents,
            ].slice(0, 20)
          : current.usageEvents,
      }));

      return { ok: true };
    },
    [remainingCredits, state.creditsUsed, state.plan],
  );

  const updateSettings = useCallback((nextSettings) => {
    if (nextSettings.saveDrafts === false && typeof window !== "undefined") {
      for (const key of LOCAL_DRAFT_KEYS) {
        window.localStorage.removeItem(key);
      }
    }

    setState((current) => ({
      ...current,
      usageEvents: nextSettings.saveDrafts === false ? [] : current.usageEvents,
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
    addAccountNotification({
      title: "Support ticket created",
      message: ticket.subject || "Your support request was saved in the workspace.",
      type: "support",
    });
  }, [addAccountNotification]);

  const clearUsageHistory = useCallback(() => {
    setState((current) => ({
      ...current,
      usageEvents: [],
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState((current) => ({
      ...current,
      notifications: [],
      unreadNotifications: 0,
    }));
  }, []);

  const value = useMemo(
    () => ({
      activePanel,
      closePanel,
      consumeCredits,
      createSupportTicket,
      clearNotifications,
      clearUsageHistory,
      downgradeToFree,
      featureLabels,
      freeMonthlyCredits: FREE_MONTHLY_CREDITS,
      isPro,
      notificationPermission,
      openActivity,
      openSettings,
      openSupport,
      openUpgrade,
      remainingCredits,
      resetFreeCredits,
      setAccountNotifications,
      state,
      updateSettings,
      upgradeToPro,
    }),
    [
      activePanel,
      closePanel,
      consumeCredits,
      createSupportTicket,
      clearNotifications,
      clearUsageHistory,
      downgradeToFree,
      isPro,
      notificationPermission,
      openActivity,
      openSettings,
      openSupport,
      openUpgrade,
      remainingCredits,
      resetFreeCredits,
      setAccountNotifications,
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
