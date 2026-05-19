import { extensionApi } from "../shared/api";
import { storage } from "../shared/storage";
import type { AuthSession, ExtensionMessage, JobPosting } from "../shared/types";

const isExpired = (session?: AuthSession) => !session || Date.now() > session.expiresAt - 60_000;

const getFreshSession = async () => {
  const session = await storage.get("session");
  if (!session) return null;

  if (!isExpired(session)) {
    return session;
  }

  const refreshed = await extensionApi.refresh(session.refreshToken);
  await storage.set({ session: refreshed.data });
  return refreshed.data;
};

const retry = async <T>(operation: () => Promise<T>, attempts = 2): Promise<T> => {
  let lastError: unknown;

  for (let index = 0; index <= attempts; index += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (index + 1)));
    }
  }

  throw lastError;
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    usage: {
      plan: "free",
      trialLimit: 5,
      trialUsed: 0,
      remainingTrial: 5,
      subscriptionStatus: "none",
      canGenerate: true,
    },
  });
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  void (async () => {
    try {
      if (message.type === "JOB_DETECTED") {
        await storage.set({ activeJob: message.payload });
        const session = await storage.get("session");
        await extensionApi.track(session?.accessToken, "job_detected", {
          site: message.payload.site,
          url: message.payload.url,
          hasCompany: Boolean(message.payload.companyName),
          descriptionLength: message.payload.description.length,
        });
        sendResponse({ success: true });
        return;
      }

      if (message.type === "GET_ACTIVE_JOB") {
        sendResponse({ success: true, data: await storage.get("activeJob") });
        return;
      }

      if (message.type === "GET_SESSION") {
        sendResponse({ success: true, data: await getFreshSession() });
        return;
      }

      if (message.type === "GET_USAGE") {
        const session = await getFreshSession();
        if (!session) {
          sendResponse({ success: true, data: await storage.get("usage") });
          return;
        }

        const usage = await extensionApi.usage(session.accessToken);
        await storage.set({ usage: usage.data });
        sendResponse({ success: true, data: usage.data });
        return;
      }

      if (message.type === "LOGIN") {
        const session = await extensionApi.login(message.payload.email, message.payload.password);
        await storage.set({ session: session.data });
        const usage = await extensionApi.usage(session.data.accessToken);
        await storage.set({ usage: usage.data });
        sendResponse({ success: true, data: session.data });
        return;
      }

      if (message.type === "SIGNUP") {
        const session = await extensionApi.signup(message.payload.name, message.payload.email, message.payload.password);
        await storage.set({ session: session.data });
        const usage = await extensionApi.usage(session.data.accessToken);
        await storage.set({ usage: usage.data });
        sendResponse({ success: true, data: session.data });
        return;
      }

      if (message.type === "LOGOUT") {
        await storage.remove(["session", "activeJob", "lastCoverLetter"]);
        sendResponse({ success: true });
        return;
      }

      if (message.type === "GENERATE_COVER_LETTER") {
        const session = await getFreshSession();
        if (!session) {
          sendResponse({ success: false, message: "Please sign in to generate a cover letter." });
          return;
        }

        const result = await retry(() => extensionApi.generateCoverLetter(session.accessToken, message.payload as JobPosting));
        await storage.set({
          usage: result.data.usage,
          lastCoverLetter: result.data.bodyMarkdown,
        });
        sendResponse({ success: true, data: result.data });
        return;
      }

      if (message.type === "SAVE_COVER_LETTER") {
        const session = await getFreshSession();
        if (!session) {
          sendResponse({ success: false, message: "Please sign in before saving." });
          return;
        }

        const result = await extensionApi.saveCoverLetter(session.accessToken, message.payload);
        sendResponse({ success: true, data: result.data });
      }
    } catch (error) {
      sendResponse({
        success: false,
        message: error instanceof Error ? error.message : "Unexpected extension error",
      });
    }
  })();

  return true;
});
