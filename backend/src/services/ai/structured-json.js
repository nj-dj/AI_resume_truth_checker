import { StatusCodes } from "http-status-codes";

import { ApiError } from "../../utils/api-error.js";
import { extractJsonStringFromLlm } from "../../utils/extract-json-from-llm.js";
import { getErrorMessage } from "../../utils/ai-errors.js";
import { logger } from "../../utils/logger.js";
import { generateLlmText } from "./llm-provider.js";

export const generateStructuredJson = async ({ prompt, purpose, temperature = 0, fallbackData = null }) => {
  try {
    const result = await generateLlmText({
      contents: prompt,
      config: {
        temperature,
        responseMimeType: "application/json",
      },
      purpose,
    });

    if (!result.text) {
      throw new ApiError(StatusCodes.BAD_GATEWAY, "The AI model returned an empty response");
    }

    const parsed = JSON.parse(extractJsonStringFromLlm(result.text));

    return {
      ...parsed,
      _meta: {
        provider: result.provider,
        model: result.model,
      },
    };
  } catch (error) {
    if (fallbackData) {
      logger.warn("Using local structured AI fallback", {
        purpose,
        cause: getErrorMessage(error),
      });

      const data = typeof fallbackData === "function" ? fallbackData(error) : fallbackData;

      return {
        ...data,
        _meta: {
          provider: "local",
          model: "deterministic-fallback",
          fallback: true,
          cause: getErrorMessage(error),
        },
      };
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(StatusCodes.BAD_GATEWAY, "Failed to parse structured AI response", {
      cause: getErrorMessage(error),
    });
  }
};
