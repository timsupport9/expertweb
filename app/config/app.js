/**
 * ============================================================
 * EXPERTHUB — EXPRESS APPLICATION FACTORY
 * ============================================================
 *
 * File:
 *     app/config/app.js
 *
 * Purpose:
 *     Builds and configures the Express app.
 *
 * Responsibilities:
 *     1.  Core app config (trust proxy, no x-powered-by)
 *     2.  Security (helmet + custom headers)
 *     3.  CORS
 *     4.  Body parsing & compression
 *     5.  Request logging
 *     6.  Session stack (session → flash → csrf → attachUser)
 *     7.  Static assets (safe subfolders only)
 *     8.  Blocked paths (private/temp uploads)
 *     9.  Health check
 *     10. Landing page for /
 *     11. Application routes
 *     12. 404 + error handler (terminal)
 *
 * Does NOT start the HTTP server — that is server.js's job.
 * ============================================================
 */

const path = require("path");
const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const { buildHelmetOptions, securityHeaders } = require("./security");
const buildCorsOptions = require("./cors");

const requestLogger = require("../middleware/requestLogger");
const notFound = require("../middleware/notFound");
const errorHandler = require("../middleware/errorHandler");

const flash = require("../middleware/flash");
const csrf = require("../middleware/csrf");
const attachUser = require("../middleware/attachUser");

const routes = require("../routes");

/* ------------------------------------------------------------------
 * Constants
 * ---------------------------------------------------------------- */

const app = express();
const isProd = (process.env.NODE_ENV || "development") === "production";
const publicDir = path.join(__dirname, "../../public");

/* ------------------------------------------------------------------
 * 1. Core configuration
 * ---------------------------------------------------------------- */

app.disable("x-powered-by");
app.set("trust proxy", 1);

/* ------------------------------------------------------------------
 * 2. Security headers
 * ---------------------------------------------------------------- */

app.use(helmet(buildHelmetOptions()));
app.use(securityHeaders);

/* ------------------------------------------------------------------
 * 3. CORS
 * ---------------------------------------------------------------- */

app.use(cors(buildCorsOptions()));

/* ------------------------------------------------------------------
 * 4. Body parsing & compression
 * ---------------------------------------------------------------- */

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

/* ------------------------------------------------------------------
 * 5. Request logging
 * ---------------------------------------------------------------- */

app.use(requestLogger);

/* ------------------------------------------------------------------
 * 6. Session stack
 * ----------------------------------------------------------------
 *   Order matters: session → flash → csrf → attachUser.
 *
 *   If you later extract this into app/config/session.js, replace
 *   the inline block below with:
 *
 *       const createSession = require("./session");
 *       app.use(createSession());
 *
 *   and leave flash/csrf/attachUser as they are.
 * ---------------------------------------------------------------- */

app.use(
  require("express-session")({
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

/* ------------------------------------------------------------------
 * 7. Static assets
 * ----------------------------------------------------------------
 *   Only whitelisted subfolders of public/ are served. Everything
 *   else falls through to routes. This blocks /uploads/private/*
 *   and /uploads/temp/* from being fetched directly.
 * ---------------------------------------------------------------- */

// Versioned, long-cacheable asset folder.
app.use(
  "/assets",
  express.static(path.join(publicDir, "assets"), {
    maxAge: isProd ? "30d" : 0,
    immutable: isProd,
    etag: true,
    lastModified: true,
  })
);

// Safe upload subfolders — served directly.
const publicUploadDirs = [
  "avatars",
  "courses",
  "blog",
  "events",
  "resources",
  "certificates",
];

for (const sub of publicUploadDirs) {
  app.use(
    `/uploads/${sub}`,
    express.static(path.join(publicDir, "uploads", sub), {
      maxAge: isProd ? "7d" : 0,
      etag: true,
    })
  );
}

// Downloadable files.
app.use(
  "/downloads",
  express.static(path.join(publicDir, "downloads"), {
    maxAge: isProd ? "7d" : 0,
  })
);

/* ------------------------------------------------------------------
 * 8. Blocked paths
 * ----------------------------------------------------------------
 *   Must run BEFORE the general static mount below, otherwise the
 *   general mount would pick these up.
 * ---------------------------------------------------------------- */

app.use(["/uploads/private", "/uploads/temp"], (req, res) =>
  res.status(404).end()
);

/* ------------------------------------------------------------------
 * 9. Root-level static files
 * ----------------------------------------------------------------
 *   Serves favicon.ico, robots.txt, sitemap.xml, site.webmanifest,
 *   browserconfig.xml, humans.txt, .well-known/*.
 *
 *   index: false so that `/` is NOT auto-served by the static
 *   middleware — the `/` route below handles it explicitly so we
 *   can conditionally redirect signed-in users.
 * ---------------------------------------------------------------- */

app.use(
  express.static(publicDir, {
    index: false,
    maxAge: isProd ? "1h" : 0,
    etag: true,
    setHeaders(res, filePath) {
      // Give the HTML page a shorter cache than assets.
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

/* ------------------------------------------------------------------
 * 10. Health check
 * ----------------------------------------------------------------
 *   The landing page pings /health. Keep this lightweight — it must
 *   not touch the database.
 * ---------------------------------------------------------------- */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ExpertHub",
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

/* ------------------------------------------------------------------
 * 11. Landing page for /
 * ----------------------------------------------------------------
 *   Signed-in users skip the landing page and go straight to their
 *   dashboard. Guests get public/index.html.
 *
 *   If you'd rather render this from a controller/view engine,
 *   replace the body of this handler with:
 *
 *       res.render("home", { user: req.user });
 *
 *   and delete this route — the controller's route will take over.
 * ---------------------------------------------------------------- */

app.get("/", (req, res, next) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }

  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) return next(err);
  });
});

/* ------------------------------------------------------------------
 * 12. Application routes
 * ----------------------------------------------------------------
 *   Routes are mounted AFTER static and the / handler, so a route
 *   like /courses will not accidentally shadow /assets/css/style.css.
 * ---------------------------------------------------------------- */

app.use(routes);

/* ------------------------------------------------------------------
 * 13. Terminal handlers
 * ----------------------------------------------------------------
 *   Order is fixed: 404 first, then the error handler. The error
 *   handler must have 4 arguments or Express won't recognize it.
 * ---------------------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------
 * 14. Export
 * ---------------------------------------------------------------- */

module.exports = app;
