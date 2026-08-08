/**
 * Centralized error handler middleware.
 * Formats error responses as { error: message } with appropriate HTTP status codes.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR HANDLER] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);

  const statusCode = err.statusCode || err.status || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
}

module.exports = errorHandler;
