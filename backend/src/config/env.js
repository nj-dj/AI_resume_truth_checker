import dotenv from "dotenv";
import { z } from "zod";
import { fileURLToPath } from "node:url";

dotenv.config();
dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  APP_ORIGIN: z.string().default("http://localhost:3000,http://localhost:5173"),
  MONGODB_URI: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  GEMINI_FALLBACK_MODELS: z.string().optional().default("gemini-2.0-flash,gemini-1.5-flash-001"),
  GITHUB_TOKEN: z.string().optional().default(""),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().default(5),
  VERCEL_URL: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini"),
  OPENAI_FALLBACK_MODELS: z.string().optional().default("gpt-4o-mini"),
  AI_PRIMARY_PROVIDER: z.enum(["gemini", "openai"]).optional().default("gemini"),
  AUTH_JWT_SECRET: z.string().optional().default("dev-auth-secret-change-me"),
  AUTH_ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  AUTH_REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  appOrigins: [
    ...parsed.data.APP_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
    parsed.data.VERCEL_URL ? `https://${parsed.data.VERCEL_URL}` : "",
  ].filter(Boolean),
  mongodbUri: parsed.data.MONGODB_URI?.trim() ?? "",
  geminiApiKey: parsed.data.GEMINI_API_KEY?.trim() ?? "",
  geminiModel: parsed.data.GEMINI_MODEL,
  geminiFallbackModels: parsed.data.GEMINI_FALLBACK_MODELS.split(",").map((model) => model.trim()).filter(Boolean),
  githubToken: parsed.data.GITHUB_TOKEN?.trim() ?? "",
  maxFileSizeBytes: parsed.data.MAX_FILE_SIZE_MB * 1024 * 1024,
  openAiApiKey: parsed.data.OPENAI_API_KEY?.trim() ?? "",
  openAiModel: parsed.data.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  openAiFallbackModels: parsed.data.OPENAI_FALLBACK_MODELS.split(",").map((model) => model.trim()).filter(Boolean),
  aiPrimaryProvider: parsed.data.AI_PRIMARY_PROVIDER,
  authJwtSecret: parsed.data.AUTH_JWT_SECRET?.trim() || "dev-auth-secret-change-me",
  authAccessTokenTtlMinutes: parsed.data.AUTH_ACCESS_TOKEN_TTL_MINUTES,
  authRefreshTokenTtlDays: parsed.data.AUTH_REFRESH_TOKEN_TTL_DAYS,
};
