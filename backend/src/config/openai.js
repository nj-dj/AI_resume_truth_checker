import OpenAI from "openai";

import { env } from "./env.js";
import { logger } from "../utils/logger.js";

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

export const generateOpenAiContent = async ({ contents, config = {}, purpose = "generation" }) => {
  const client = getOpenAiClient();

  if (!client) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const wantsJson = config.responseMimeType === "application/json";
  const model = env.openAiModel;

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

  const text = response.choices?.[0]?.message?.content ?? "";

  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }

  return { text, model };
};
