/**
 * Security configuration.
 *
 * Exports:
 *   buildHelmetOptions()  — returns the options object for helmet()
 *   securityHeaders       — an Express middleware that adds a few
 *                           headers helmet doesn't set for us
 *
 * Consumed by app/config/app.js:
 *
 *   const { buildHelmetOptions, securityHeaders } = require("./security");
 *   app.use(helmet(buildHelmetOptions()));
 *   app.use(securityHeaders);
 */

function buildHelmetOptions() {
  const isProd = (process.env.NODE_ENV || "development") === "production";

  return {
    // The app currently serves inline styles and scripts in some views,
    // so CSP is disabled by default. Turn it on and tune it once all
    // assets are external.
    contentSecurityPolicy: false,

    // Allow cross-origin reads of static assets (fonts, images).
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },

    referrerPolicy: { policy: "strict-origin-when-cross-origin" },

    // HSTS only in production, and only when the site is HTTPS.
    hsts: isProd
      ? { maxAge: 31536000, includeSubDomains: true, preload: false }
      : false,

    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,

    // Hide the "X-Powered-By: Express" header.
    hidePoweredBy: true,
  };
}

/**
 * Extra headers applied after helmet. Safe defaults for a web app.
 * These are intentionally conservative and don't break anything.
 */
function securityHeaders(req, res, next) {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.removeHeader("X-Powered-By");
  next();
}

module.exports = {
  buildHelmetOptions,
  securityHeaders,
};
