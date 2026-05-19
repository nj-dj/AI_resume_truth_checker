import crypto from "node:crypto";
import { StatusCodes } from "http-status-codes";

import { isDatabaseConnected } from "../database/mongodb.js";
import { ExtensionUsage } from "../models/extension-usage.model.js";
import { SavedCoverLetter } from "../models/saved-cover-letter.model.js";
import { coverLetterService } from "./career/cover-letter.service.js";
import { ApiError } from "../utils/api-error.js";

const memoryUsage = new Map();
const memoryCoverLetters = new Map();
const FREE_TRIAL_LIMIT = 5;

const buildUsageState = (usage) => {
  const plan = usage?.plan ?? "free";
  const trialLimit = usage?.trialLimit ?? FREE_TRIAL_LIMIT;
  const trialUsed = usage?.trialUsed ?? 0;
  const remainingTrial = Math.max(trialLimit - trialUsed, 0);
  const subscriptionStatus = usage?.subscriptionStatus ?? "none";
  const isPaid = plan === "monthly" || plan === "yearly" || subscriptionStatus === "active";

  return {
    plan,
    trialLimit,
    trialUsed,
    remainingTrial,
    subscriptionStatus,
    canGenerate: isPaid || remainingTrial > 0,
    upgradeUrl: "https://ai-resume-truth-checker.vercel.app/pricing",
  };
};

const getUsageRecord = async (userId) => {
  if (isDatabaseConnected()) {
    return ExtensionUsage.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, trialLimit: FREE_TRIAL_LIMIT, trialUsed: 0 } },
      { new: true, upsert: true },
    );
  }

  if (!memoryUsage.has(userId)) {
    memoryUsage.set(userId, {
      userId,
      plan: "free",
      trialLimit: FREE_TRIAL_LIMIT,
      trialUsed: 0,
      subscriptionStatus: "none",
    });
  }

  return memoryUsage.get(userId);
};

const incrementUsage = async (usage) => {
  if (usage.plan === "monthly" || usage.plan === "yearly" || usage.subscriptionStatus === "active") {
    return usage;
  }

  if (usage.trialUsed >= usage.trialLimit) {
    throw new ApiError(StatusCodes.PAYMENT_REQUIRED, "Trial limit reached. Upgrade to continue generating cover letters.");
  }

  if (isDatabaseConnected()) {
    usage.trialUsed += 1;
    await usage.save();
    return usage;
  }

  usage.trialUsed += 1;
  memoryUsage.set(usage.userId, usage);
  return usage;
};

const saveLetter = async ({ userId, job, subjectLine, bodyMarkdown, callToAction }) => {
  if (isDatabaseConnected()) {
    const saved = await SavedCoverLetter.create({
      userId,
      job,
      subjectLine,
      bodyMarkdown,
      callToAction,
    });

    return saved._id.toString();
  }

  const id = crypto.randomUUID();
  memoryCoverLetters.set(id, {
    id,
    userId,
    job,
    subjectLine,
    bodyMarkdown,
    callToAction,
    createdAt: new Date(),
  });

  return id;
};

export const extensionService = {
  async getUsage(user) {
    const usage = await getUsageRecord(user.id);
    return buildUsageState(usage);
  },

  async generateCoverLetter({ user, job }) {
    const usage = await getUsageRecord(user.id);
    const usageState = buildUsageState(usage);

    if (!usageState.canGenerate) {
      throw new ApiError(StatusCodes.PAYMENT_REQUIRED, "Trial limit reached. Upgrade to continue generating cover letters.");
    }

    const highlights = [
      job.location ? `Interested in ${job.location} roles` : "",
      job.description.slice(0, 220),
    ].filter(Boolean);

    const generated = await coverLetterService.generate({
      candidateName: user.name || user.email.split("@")[0],
      roleTitle: job.title,
      companyName: job.companyName,
      highlights,
      tone: "professional",
      jobDescriptionSnippet: job.description.slice(0, 4000),
    });

    const nextUsage = await incrementUsage(usage);
    const data = generated.data;
    const id = await saveLetter({
      userId: user.id,
      job,
      subjectLine: data.subjectLine,
      bodyMarkdown: data.bodyMarkdown,
      callToAction: data.callToAction,
    });

    return {
      id,
      subjectLine: data.subjectLine,
      bodyMarkdown: data.bodyMarkdown,
      callToAction: data.callToAction,
      usage: buildUsageState(nextUsage),
    };
  },

  async saveCoverLetter({ user, job, subjectLine, content, callToAction }) {
    const id = await saveLetter({
      userId: user.id,
      job,
      subjectLine,
      bodyMarkdown: content,
      callToAction,
    });

    return { id };
  },

  trackEvent({ user, event, properties, occurredAt }) {
    return {
      userId: user?.id ?? null,
      event,
      properties,
      occurredAt: occurredAt || new Date().toISOString(),
    };
  },
};
