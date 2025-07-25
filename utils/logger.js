const pino = require("pino");

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  prettyPrint: process.env.NODE_ENV !== "production",
});

module.exports.logger = logger;
