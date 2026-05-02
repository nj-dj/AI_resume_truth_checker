export const logger = {
  info(message, meta = {}) {
    console.log(JSON.stringify({ level: "info", message, meta, timestamp: new Date().toISOString() }));
  },
  warn(message, meta = {}) {
    console.warn(JSON.stringify({ level: "warn", message, meta, timestamp: new Date().toISOString() }));
  },
  error(message, error = {}) {
    const payload =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    console.error(JSON.stringify({ level: "error", message, error: payload, timestamp: new Date().toISOString() }));
  },
};
