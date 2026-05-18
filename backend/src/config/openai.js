import OpenAI from "openai";

import { env } from "./env.js";
import { logger } from "../utils/logger.js";
import { isProviderFallbackError } from "../utils/ai-errors.js";

let cachedClient = null;

export const isOpenAiConfigured = () => Boolean(env.openAiApiKey);

export const getOpenAiClient = () => {
  if (!env.openAiApiKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return cachedClient;
};

const getCandidateModels = () => {
  const configuredModels = [env.openAiModel, ...env.openAiFallbackModels];
  return [...new Set(configuredModels.filter(Boolean))];
};

export const generateOpenAiContent = async ({ contents, config = {}, purpose = "generation" }) => {
  const client = getOpenAiClient();

  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const wantsJson = config.responseMimeType === "application/json";
  const candidateModels = getCandidateModels();
  let lastError = null;

  for (const model of candidateModels) {
    try {
      logger.info("Attempting OpenAI request", { purpose, model, wantsJson });

      const response = await client.chat.completions.create({
        model,
        temperature: config.temperature ?? 0,
        messages: [
          {
            role: "user",
            content: typeof contents === "string" ? contents : String(contents),
          },
        ],
        ...(wantsJson ? { response_format: { type: "json_object" } } : {}),
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const text = typeof rawContent === "string" ? rawContent : rawContent ? JSON.stringify(rawContent) : "";

      if (!text) {
        throw new Error("OpenAI returned an empty response");
      }

      logger.info("OpenAI request succeeded", { purpose, model });
      return { text, model };
    } catch (error) {
      lastError = error;
      logger.warn("OpenAI request failed", {
        purpose,
        model,
        cause: error instanceof Error ? error.message : error,
      });

      const isLastModel = model === candidateModels[candidateModels.length - 1];
      if (!isProviderFallbackError(error) || isLastModel) {
        break;
      }
    }
  }

  throw lastError;
};
