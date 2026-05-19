export type SupportedSite =
  | "linkedin"
  | "indeed"
  | "shine"
  | "monster"
  | "apna"
  | "foundit"
  | "glassdoor"
  | "wellfound"
  | "naukri"
  | "internshala"
  | "unknown";

export type JobPosting = {
  site: SupportedSite;
  url: string;
  title: string;
  companyName: string;
  location?: string;
  description: string;
  extractedAt: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
    name?: string;
  };
};

export type UsageState = {
  plan: "free" | "monthly" | "yearly";
  trialLimit: number;
  trialUsed: number;
  remainingTrial: number;
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled" | "none";
  canGenerate: boolean;
  upgradeUrl?: string;
};

export type CoverLetterResult = {
  id?: string;
  subjectLine: string;
  bodyMarkdown: string;
  callToAction: string;
  matchScore?: number;
  usage: UsageState;
};

export type ExtensionMessage =
  | { type: "JOB_DETECTED"; payload: JobPosting }
  | { type: "GET_ACTIVE_JOB" }
  | { type: "GENERATE_COVER_LETTER"; payload: JobPosting }
  | { type: "SAVE_COVER_LETTER"; payload: { coverLetterId?: string; job: JobPosting; content: string } }
  | { type: "SIGNUP"; payload: { name: string; email: string; password: string } }
  | { type: "LOGIN"; payload: { email: string; password: string } }
  | { type: "LOGOUT" }
  | { type: "GET_SESSION" }
  | { type: "GET_USAGE" };
