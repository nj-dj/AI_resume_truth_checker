import mongoose from "mongoose";

import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!env.mongodbUri) {
    logger.warn("MongoDB connection skipped because MONGODB_URI is not configured");
    return false;
  }

  try {
    await mongoose.connect(env.mongodbUri);
    logger.info("MongoDB connected");
    return true;
  } catch (error) {
    logger.warn("MongoDB connection failed; continuing without database persistence", {
      cause: error instanceof Error ? error.message : error,
    });
    return false;
  }
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
