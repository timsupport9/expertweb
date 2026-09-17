module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  const status = Number(err.status || err.statusCode || 500);
  res.status(status).json({
    success: false,
    error: status === 500 ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV !== "production" ? { details: err.stack } : {})
  });
};
