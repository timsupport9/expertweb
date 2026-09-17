module.exports = function meController(req, res) { if (!req.user) return res.status(401).json({ success: false, error: "Unauthenticated" }); return res.json({ success: true, user: req.user }); };
