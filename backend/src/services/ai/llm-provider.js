import { generateGeminiContent } from "../../config/gemini.js";
import { generateOpenAiContent, isOpenAiConfigured } from "../../config/openai.js";
import { logger } from "../../utils/logger.js";
import { getErrorMessage, isProviderFallbackError } from "../../utils/ai-errors.js";

/**
 * Generate text with Gemini (model fallbacks) and optional OpenAI provider fallback.
 * @returns {{ text: string, provider: 'gemini' | 'openai', model: string }}
 */
export const generateLlmText = async ({ contents, config = {}, purpose = "generation" }) => {
  let geminiError = null;

  try {
    const result = await generateGeminiContent({ contents, config, purpose });
    return {
      text: result.text ?? "",
      provider: "gemini",
      model: result.model ?? "unknown",
    };
  } catch (error) {
    geminiError = error;
    logger.warn("Gemini provider failed for all configured models", {
      purpose,
      cause: getErrorMessage(error),
    });
  }

  if (!isProviderFallbackError(geminiError)) {
    throw geminiError;
  }

  if (!isOpenAiConfigured()) {
    throw new Error(
      `${getErrorMessage(geminiError)}. Configure OPENAI_API_KEY in backend/.env to enable automatic fallback when Gemini quota is exceeded.`,
    );
  }

  logger.info("Falling back to OpenAI provider", { purpose });

  try {
    const result = await generateOpenAiContent({ contents, config, purpose });
    logger.info("OpenAI fallback succeeded", { purpose, model: result.model });
    return {
      text: result.text ?? "",
      provider: "openai",
      model: result.model ?? "unknown",
    };
  } catch (openAiError) {
    logger.error("OpenAI fallback failed", {
      purpose,
      geminiCause: getErrorMessage(geminiError),
      openAiCause: getErrorMessage(openAiError),
    });

    throw new Error(
      `All AI providers failed. Gemini: ${getErrorMessage(geminiError)}. OpenAI: ${getErrorMessage(openAiError)}`,
    );
  }
};
