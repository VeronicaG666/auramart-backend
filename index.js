require("dotenv").config({ path: __dirname + "/../.env" }); 
const http = require("http");
const app = require("./app"); 
const { logger } = require("./utils/logger");

const PORT = process.env.PORT || 5000;

logger.info(`Database connected: ${process.env.DATABASE_URL ? "✅ Loaded" : "❌ Missing"}`);

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`🚀 Magic happening at http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

