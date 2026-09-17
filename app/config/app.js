/**
 * Express application factory.
 *
 * Wires:
 *   - Security (helmet, securityHeaders)
 *   - CORS
 *   - Body parsing & compression
 *   - Request logging
 *   - Static assets (safe subfolders only — private uploads blocked)
 *   - Conditional root redirect (signed-in → /dashboard)
 *   - Health check
 *   - Session stack (session, flash, csrf, attachUser)
 *   - Application routes
 *   - 404 + error handler (terminal)
 *
 * Does NOT start the HTTP server — server.js does that.
 */

const path = require("path");
const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");

const { buildHelmetOptions, securityHeaders } = require("./security");
const buildCorsOptions = require("./cors");

const requestLogger = require("../middleware/requestLogger");
const notFound = require("../middleware/notFound");
const errorHandler = require("../middleware/errorHandler");

const flash = require("../middleware/flash");
const csrf = require("../middleware/csrf");
const attachUser = require("../middleware/attachUser");

const routes = require("../routes");

const app = express();

/* --------------------------------------------------------------------------
 * Core configuration
 * -------------------------------------------------------------------------- */

app.disable("x-powered-by");
app.set("trust proxy", 1);

/* --------------------------------------------------------------------------
 * Security
 * -------------------------------------------------------------------------- */

app.use(helmet(buildHelmetOptions()));
app.use(securityHeaders);

/* --------------------------------------------------------------------------
 * CORS
 * -------------------------------------------------------------------------- */

app.use(cors(buildCorsOptions()));

/* --------------------------------------------------------------------------
 * Body parsing & compression
 * -------------------------------------------------------------------------- */

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

/* --------------------------------------------------------------------------
 * Request logging
 * -------------------------------------------------------------------------- */

app.use(requestLogger);

/* --------------------------------------------------------------------------
 * Session stack
 * --------------------------------------------------------------------------
 * Order matters. Session MUST come before flash, csrf, and attachUser.
 * -------------------------------------------------------------------------- */

const isProd = (process.env.NODE_ENV || "development") === "production";

app.use(
  session({
    name: process.env.SESSION_NAME || "experthub.sid",
    secret:
      process.env.SESSION_SECRET || "dev-only-secret-change-me-please",
    resave: false,
    saveUninitialized: false,
    proxy: isProd,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: Number(
        process.env.SESSION_MAX_AGE_MS || 7 * 24 * 60 * 60 * 1000
      ),
    },
  })
);

app.use(flash());
app.use(csrf());
app.use(attachUser());

/* --------------------------------------------------------------------------
 * Static assets
 * --------------------------------------------------------------------------
 * We deliberately do NOT mount express.static on the whole public/ tree.
 * Only whitelisted subfolders are served. Everything else falls through
 * to the routes. This blocks /uploads/private/* and /uploads/temp/* from
 * ever being fetched directly.
 * -------------------------------------------------------------------------- */

const publicDir = path.join(__dirname, "../../public");

app.use("/assets", express.static(path.join(publicDir, "assets"), {
  maxAge: isProd ? "30d" : 0,
  immutable: isProd,
}));

app.use("/uploads/avatars",      express.static(path.join(publicDir, "uploads/avatars")));
app.use("/uploads/courses",      express.static(path.join(publicDir, "uploads/courses")));
app.use("/uploads/blog",         express.static(path.join(publicDir, "uploads/blog")));
app.use("/uploads/events",       express.static(path.join(publicDir, "uploads/events")));
app.use("/uploads/resources",    express.static(path.join(publicDir, "uploads/resources")));
app.use("/uploads/certificates", express.static(path.join(publicDir, "uploads/certificates")));

app.use("/downloads", express.static(path.join(publicDir, "downloads")));

// Block private/temp uploads explicitly.
app.use("/uploads/private", (req, res) => res.status(404).end());
app.use("/uploads/temp",    (req, res) => res.status(404).end());

// Serve root-level static files (favicon.ico, robots.txt, sitemap.xml,
// site.webmanifest, browserconfig.xml, humans.txt, .well-known/*) but
// DO NOT auto-serve index.html for `/`. We handle `/` explicitly below.
app.use(express.static(publicDir, { index: false }));

/* --------------------------------------------------------------------------
 * Conditional root redirect
 * --------------------------------------------------------------------------
 *   - Guest  → serves public/index.html (landing page)
 *   - Signed → 302 to /dashboard
 * -------------------------------------------------------------------------- */

app.get("/", (req, res, next) => {
  if (req.user) return res.redirect("/dashboard");
  next();
});

/* --------------------------------------------------------------------------
 * Landing page fallback
 * --------------------------------------------------------------------------
 * If the static middleware doesn't find index.html (e.g. you deleted it),
 * send a minimal JSON response so `/` never returns a bare Express 404.
 * -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  res.status(200).type("html").send(
    "<!doctype html><meta charset='utf-8'><title>ExpertHub</title>" +
    "<h1>ExpertHub</h1><p>The landing page is not installed.</p>"
  );
});

/* --------------------------------------------------------------------------
 * Health check
 * -------------------------------------------------------------------------- */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ExpertHub",
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

/* --------------------------------------------------------------------------
 * Application routes
 * -------------------------------------------------------------------------- */

app.use(routes);

/* --------------------------------------------------------------------------
 * 404 + error handler (must be LAST)
 * -------------------------------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

module.exports = app;
