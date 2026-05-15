import { z } from "zod";

export const atsScanSchema = z.object({
  jobDescription: z.string().min(40, "jobDescription should be at least 40 characters"),
});

export const resumeEnhanceSchema = z.object({
  jobDescription: z.string().optional().default(""),
  focus: z.enum(["general", "ats", "leadership", "ic"]).optional().default("general"),
});

export const resumeEnhanceTextSchema = z.object({
  resumeText: z.string().min(80, "resumeText should be at least 80 characters"),
  jobDescription: z.string().optional().default(""),
  focus: z.enum(["general", "ats", "leadership", "ic"]).optional().default("general"),
});

export const atsScanTextSchema = z.object({
  resumeText: z.string().min(80, "resumeText should be at least 80 characters"),
  jobDescription: z.string().min(40, "jobDescription should be at least 40 characters"),
});

export const coverLetterSchema = z.object({
  candidateName: z.string().min(1),
  roleTitle: z.string().min(1),
  companyName: z.string().optional().default(""),
  highlights: z.array(z.string()).optional().default([]),
  tone: z.enum(["professional", "confident", "friendly", "executive"]).optional().default("professional"),
  jobDescriptionSnippet: z.string().optional().default(""),
});

export const careerInsightsSchema = z.object({
  currentSkills: z.array(z.string()).optional().default([]),
  targetRole: z.string().optional().default(""),
  experienceYears: z.coerce.number().min(0).max(60).optional().default(0),
  locationPreference: z.string().optional().default(""),
});

export const jobRecommendationsSchema = z.object({
  skills: z.array(z.string()).optional().default([]),
  experienceYears: z.coerce.number().min(0).max(60).optional().default(0),
  location: z.string().optional().default(""),
  workMode: z.enum(["remote", "hybrid", "onsite", "any"]).optional().default("any"),
});

export const portfolioProfileSchema = z.object({
  fullName: z.string().optional().default(""),
  headline: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  experience: z
    .array(
      z.object({
        role: z.string().optional().default(""),
        company: z.string().optional().default(""),
        duration: z.string().optional().default(""),
        description: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().optional().default(""),
        tech_stack: z.array(z.string()).optional().default([]),
        description: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
  socialLinks: z
    .array(
      z.object({
        label: z.string().optional().default(""),
        url: z.string().optional().default(""),
      }),
    )
    .optional()
    .default([]),
});

export const interviewSessionSchema = z.object({
  roleTitle: z.string().min(1),
  level: z.enum(["junior", "mid", "senior", "lead"]).optional().default("mid"),
  interviewType: z.enum(["technical", "hr", "mixed"]).optional().default("mixed"),
  focusAreas: z.array(z.string()).optional().default([]),
});

export const interviewFeedbackSchema = z.object({
  roleTitle: z.string().min(1),
  question: z.string().min(4),
  answer: z.string().min(10),
});
