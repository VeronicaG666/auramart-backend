const { logger } = require("../utils/logger");

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = "error";
  }
}

const handleError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }
  logger.error(`[${statusCode}] ${message}`);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: statusCode === 500 ? "An unexpected error occurred" : message,
  });
};

module.exports = {
  ErrorHandler,
  handleError,
};
