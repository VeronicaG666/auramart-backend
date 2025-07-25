const { ErrorHandler } = require("../helpers/error");

const unknownEndpoint = (req, res) => {
  throw new ErrorHandler(404, "Unknown endpoint");
};

module.exports = unknownEndpoint;
