import { z } from "zod";

const jobPostingSchema = z.object({
  site: z.string().optional().default("unknown"),
  url: z.string().url().optional().default(""),
  title: z.string().trim().min(2, "Job title is required"),
  companyName: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  description: z.string().trim().min(40, "Job description should be at least 40 characters"),
  extractedAt: z.string().optional().default(""),
});

export const generateCoverLetterSchema = z.object({
  job: jobPostingSchema,
});

export const saveCoverLetterSchema = z.object({
  coverLetterId: z.string().optional(),
  job: jobPostingSchema,
  subjectLine: z.string().optional().default(""),
  content: z.string().trim().min(20, "Cover letter content is required"),
  callToAction: z.string().optional().default(""),
});

export const extensionEventSchema = z.object({
  event: z.string().trim().min(1),
  properties: z.record(z.unknown()).optional().default({}),
  occurredAt: z.string().optional().default(""),
});
