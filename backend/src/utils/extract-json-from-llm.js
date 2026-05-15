export const extractJsonStringFromLlm = (content) => {
  const trimmed = String(content ?? "").trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
};
