export const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const normalizeMessage = (error) => getErrorMessage(error).toLowerCase();

/**
 * Try the next Gemini model when the current model is unavailable or overloaded.
 */
export const isRetryableGeminiModelError = (error) => {
  const message = normalizeMessage(error);

  return (
    message.includes("503") ||
    message.includes("502") ||
    message.includes("500") ||
    message.includes("404") ||
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("service unavailable") ||
    message.includes("overloaded") ||
    message.includes("unavailable")
  );
};

/**
 * Switch to the alternate provider (e.g. OpenAI) after Gemini is exhausted.
 */
export const isProviderFallbackError = (error) => {
  const message = normalizeMessage(error);

  return (
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("503") ||
    message.includes("502") ||
    message.includes("500") ||
    message.includes("service unavailable") ||
    message.includes("overloaded") ||
    message.includes("unavailable")
  );
};
