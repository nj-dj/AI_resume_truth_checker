import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

if (!env.geminiApiKey) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

export const geminiClient = new GoogleGenAI({
  apiKey: env.geminiApiKey,
});

const getCandidateModels = () => {
  const configuredModels = [env.geminiModel, ...env.geminiFallbackModels];
  return [...new Set(configuredModels.filter(Boolean))];
};

const shouldTryNextModel = (error) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("503") || message.includes("Service Unavailable") || message.includes("404");
};

export const generateGeminiContent = async ({ contents, config = {}, purpose = "generation" }) => {
  const candidateModels = getCandidateModels();
  let lastError = null;

  for (const model of candidateModels) {
    try {
      logger.info("Attempting Gemini request", {
        purpose,
        model,
      });

      const result = await geminiClient.models.generateContent({
        model,
        contents,
        config,
      });

      logger.info("Gemini request succeeded", {
        purpose,
        model,
      });

      return result;
    } catch (error) {
      lastError = error;
      logger.warn("Gemini request failed", {
        purpose,
        model,
        cause: error instanceof Error ? error.message : error,
      });

      if (!shouldTryNextModel(error) || model === candidateModels[candidateModels.length - 1]) {
        break;
      }
    }
  }

  throw lastError;
};
