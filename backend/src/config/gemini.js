import { GoogleGenAI } from "@google/genai";

import { isRetryableGeminiModelError } from "../utils/ai-errors.js";
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

      return {
        text: result.text,
        model,
        raw: result,
      };
    } catch (error) {
      lastError = error;
      logger.warn("Gemini request failed", {
        purpose,
        model,
        cause: error instanceof Error ? error.message : error,
      });

      const isLastModel = model === candidateModels[candidateModels.length - 1];
      if (!isRetryableGeminiModelError(error) || isLastModel) {
        break;
      }
    }
  }

  throw lastError;
};
