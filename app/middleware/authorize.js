module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });

  const roles = Array.isArray(req.user.roles)
    ? req.user.roles
    : (req.user.role ? [req.user.role] : []);

  if (!allowedRoles.some(role => roles.includes(role))) {
    return res.status(403).json({ success: false, error: "Access denied" });
  }
  next();
};
