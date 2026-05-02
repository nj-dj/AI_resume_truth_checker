import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/mongodb.js";
import { logger } from "./utils/logger.js";

const startServer = async () => {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Backend server is running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
