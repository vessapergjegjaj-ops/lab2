const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found: " + req.method + " " + req.originalUrl,
  });
};

const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || (error.type === "entity.parse.failed" ? 400 : 500);
  const message = error.type === "entity.parse.failed" ? "Invalid JSON request body" : error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = { notFound, errorHandler };
