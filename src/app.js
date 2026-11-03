const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config");
const routes = require("./api/routes");
const { errorHandler, notFoundHandler } = require("./api/middlewares/errorHandling.middleware");
const { ensureUploadDir } = require("./services/upload.services");

/** Builds the Express application (without listening), so tests can use it. */
function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));

  ensureUploadDir();
  const media = express.static(config.upload.dir, { index: false, maxAge: "7d" });
  app.use("/media", media);
  // Old upload URLs pointed at the server root; keep them working.
  app.use(media);

  app.get("/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api", routes());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
