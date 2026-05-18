import { generateGeminiContent, isGeminiConfigured } from "../../config/gemini.js";
import { generateOpenAiContent, isOpenAiConfigured } from "../../config/openai.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { getErrorMessage, isProviderFallbackError } from "../../utils/ai-errors.js";

const buildProviderOrder = () => {
  const primary = env.aiPrimaryProvider === "openai" ? "openai" : "gemini";
  return primary === "openai" ? ["openai", "gemini"] : ["gemini", "openai"];
};

const isProviderAvailable = (provider) => {
  if (provider === "openai") {
    return isOpenAiConfigured();
  }

  return isGeminiConfigured();
};

/**
 * Generate text with one or more AI providers. Uses provider-level fallback when a provider is unavailable or rate-limited.
 * @returns {{ text: string, provider: 'gemini' | 'openai', model: string }}
 */
export const generateLlmText = async ({ contents, config = {}, purpose = "generation" }) => {
  const providerOrder = buildProviderOrder();
  let lastError = null;

  for (const provider of providerOrder) {
    if (!isProviderAvailable(provider)) {
      logger.info("Skipping unavailable provider", { provider, purpose });
      continue;
    }

    try {
      logger.info("Attempting AI provider", { provider, purpose });

      if (provider === "gemini") {
        const result = await generateGeminiContent({ contents, config, purpose });
        return {
          text: result.text ?? "",
          provider: "gemini",
          model: result.model ?? "unknown",
        };
      }

      const result = await generateOpenAiContent({ contents, config, purpose });
      return {
        text: result.text ?? "",
        provider: "openai",
        model: result.model ?? "unknown",
      };
    } catch (error) {
      lastError = error;
      logger.warn("AI provider request failed", {
        provider,
        purpose,
        cause: getErrorMessage(error),
      });

      const isLastProvider = provider === providerOrder[providerOrder.length - 1];
      if (!isProviderFallbackError(error) || isLastProvider) {
        break;
      }

      logger.info("Falling back to the next AI provider", { provider, purpose });
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("No AI provider is configured or available");
};
