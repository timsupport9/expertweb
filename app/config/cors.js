/**
 * CORS options.
 *
 * Reads:
 *   APP_URL          — public origin (single)
 *   CORS_ORIGINS     — comma-separated additional origins
 *   CORS_CREDENTIALS — "true" or "false" (default true)
 *
 * In development, all origins are allowed.
 * In production, only the allowed list is honored.
 */

function buildCorsOptions() {
  const env = process.env.NODE_ENV || "development";
  const isProd = env === "production";

  const appUrl = process.env.APP_URL;
  const extra = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowed = new Set([appUrl, ...extra].filter(Boolean));

  return {
    origin(origin, callback) {
      // No origin → curl, server-to-server, same-origin fetch.
      if (!origin) return callback(null, true);

      if (!isProd) return callback(null, true);

      if (allowed.has(origin)) return callback(null, true);

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: process.env.CORS_CREDENTIALS !== "false",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 600,
  };
}

module.exports = buildCorsOptions;
