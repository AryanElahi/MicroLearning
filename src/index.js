const config = require("./config");
const createApp = require("./app");
const prisma = require("./lib/prisma");
const logger = require("./utils/logger");

async function start() {
  await prisma.$connect();
  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port} (${config.env})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    // Force exit if connections don't close in time.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection:", reason);
});

start().catch(async (error) => {
  logger.error("Failed to start server:", error);
  await prisma.$disconnect();
  process.exit(1);
});
