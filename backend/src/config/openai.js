import OpenAI from "openai";

import { env } from "./env.js";

export const openAiClient = new OpenAI({
  apiKey: env.openAiApiKey,
});
