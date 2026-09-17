module.exports = function maintenance(req, res, next) {
  if (String(process.env.MAINTENANCE_MODE).toLowerCase() !== "true") return next();

  const exempt = ["/health", "/api/admin"];
  if (exempt.some(prefix => req.path.startsWith(prefix))) return next();

  res.status(503).json({
    success: false,
    error: "ExpertHub is temporarily under maintenance."
  });
};
