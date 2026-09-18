/**
 * ============================================================
 * EXPERTHUB — EXPRESS APPLICATION FACTORY
 * ============================================================
 *
 * File:
 *     app/config/app.js
 *
 * Serves:
 *     /assets/*   →  public/assets/*
 *     /uploads/*  →  public/uploads/*
 *     /downloads/* → public/downloads/*
 *     /           →  public/index.html  (guests only)
 *
 * Does NOT start the HTTP server — that is server.js's job.
 * ============================================================
 */

const path = require("path");
const fs = require("fs");
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

/**
 * Absolute path to the public/ folder.
 *
 * __dirname        = <root>/app/config
 * ../../public     = <root>/public
 *
 * On Render this resolves to: /opt/render/project/src/public
 */
const publicDir = path.resolve(__dirname, "../../public");
const assetsDir = path.join(publicDir, "assets");

/* ==================================================================
 * BOOT-TIME VERIFICATION
 * ==================================================================
 * Runs once when this module is first required (i.e. when the server
 * starts). Prints an obvious log line for each critical path so that
 * a misconfigured deploy shows up immediately in the Render logs
 * instead of silently returning 404s to every visitor.
 * ================================================================== */

function verifyAssets() {
  const lines = [];

  lines.push("");
  lines.push("╔══════════════════════════════════════════════════════════╗");
  lines.push("║  ExpertHub — asset verification                          ║");
  lines.push("╚══════════════════════════════════════════════════════════╝");
  lines.push(`  publicDir:  ${publicDir}`);
  lines.push(`  assetsDir:  ${assetsDir}`);
  lines.push("");

  if (!fs.existsSync(publicDir)) {
    lines.push("  ✗ public/ DIRECTORY NOT FOUND");
    lines.push("    → Did you push the public/ folder to git?");
    lines.push("    → Is the working directory correct?");
  } else {
    lines.push("  ✓ public/ exists");
  }

  if (!fs.existsSync(assetsDir)) {
    lines.push("  ✗ public/assets/ DIRECTORY NOT FOUND");
    lines.push("    → Create it and push:");
    lines.push("        git add public/assets");
  } else {
    lines.push("  ✓ public/assets/ exists");

    const css = path.join(assetsDir, "css", "style.css");
    const appJs = path.join(assetsDir, "js", "app.js");
    const homeJs = path.join(assetsDir, "js", "home.js");
    const logo = path.join(assetsDir, "img", "logo.svg");

    const checks = [
      ["css/style.css", css],
      ["js/app.js", appJs],
      ["js/home.js", homeJs],
      ["img/logo.svg", logo],
    ];

    for (const [label, file] of checks) {
      if (fs.existsSync(file)) {
        const stat = fs.statSync(file);
        lines.push(`  ✓ public/assets/${label}  (${stat.size} bytes)`);
      } else {
        lines.push(`  ✗ public/assets/${label}  MISSING`);
      }
    }
  }

  lines.push("");

  // Print once, on a single block so it isn't interleaved with the
  // logger's line format.
  console.log(lines.join("\n"));
}

verifyAssets();

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

/* ==================================================================
 * 7. STATIC ASSETS
 * ==================================================================
 *
 * The three lines below are the entire link between the app and the
 * public/assets folder:
 *
 *     /assets/css/style.css   →  public/assets/css/style.css
 *     /assets/js/app.js       →  public/assets/js/app.js
 *     /assets/images/logo.svg    →  public/assets/images/logo.svg
 *
 * If a file is missing, express.static calls next(), and the request
 * falls through to the routes — which return HTML, not the file.
 * That's why a missing CSS file looks like "assets not loading".
 *
 * `fallthrough: false` on a diagnostic sub-mount is deliberately NOT
 * used here because it would break the /  handler for missing paths.
 * ================================================================== */

// /assets → public/assets
app.use(
  "/assets",
  express.static(assetsDir, {
    maxAge: isProd ? "30d" : 0,
    immutable: isProd,
    etag: true,
    lastModified: true,
    index: false,
  })
);

// /uploads/<sub> → public/uploads/<sub>
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

// /downloads → public/downloads
app.use(
  "/downloads",
  express.static(path.join(publicDir, "downloads"), {
    maxAge: isProd ? "7d" : 0,
  })
);

/* ------------------------------------------------------------------
 * 8. Blocked paths (must run before the general static mount)
 * ---------------------------------------------------------------- */

app.use(["/uploads/private", "/uploads/temp"], (req, res) =>
  res.status(404).end()
);

/* ------------------------------------------------------------------
 * 9. Root-level static files
 * ----------------------------------------------------------------
 * Serves favicon.ico, robots.txt, sitemap.xml, site.webmanifest,
 * browserconfig.xml, humans.txt, .well-known/*.
 *
 * index: false so that `/` is handled explicitly below.
 * ---------------------------------------------------------------- */

app.use(
  express.static(publicDir, {
    index: false,
    maxAge: isProd ? "1h" : 0,
    etag: true,
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

/* ==================================================================
 * 10. DIAGNOSTIC ENDPOINTS
 * ==================================================================
 * Two endpoints that let you verify what's actually being served
 * from the live server — no shell access required.
 *
 *     GET /health          → existing health check
 *     GET /assets-status   → shows every critical file and its status
 * ================================================================== */

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ExpertHub",
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

app.get("/assets-status", (req, res) => {
  const targets = [
    "css/style.css",
    "js/app.js",
    "js/home.js",
    "js/forms.js",
    "img/logo.svg",
    "img/hero.svg",
    "img/favicon.svg",
    "img/icons/student.svg",
    "img/icons/expert.svg",
    "img/icons/corporate.svg",
    "img/icons/admin.svg",
    "img/icons/course.svg",
    "img/icons/event.svg",
    "img/icons/certificate.svg",
    "img/icons/chat.svg",
  ];

  const report = targets.map((rel) => {
    const full = path.join(assetsDir, rel);
    const exists = fs.existsSync(full);
    let size = 0;
    if (exists) {
      try {
        size = fs.statSync(full).size;
      } catch {
        size = -1;
      }
    }
    return {
      file: `/assets/${rel}`,
      exists,
      size,
      localPath: full,
    };
  });

  const missing = report.filter((r) => !r.exists);

  res.status(missing.length ? 500 : 200).json({
    publicDir,
    assetsDir,
    publicExists: fs.existsSync(publicDir),
    assetsExists: fs.existsSync(assetsDir),
    total: report.length,
    missing: missing.length,
    files: report,
  });
});

/* ------------------------------------------------------------------
 * 11. Landing page for /
 * ---------------------------------------------------------------- */

app.get("/", (req, res, next) => {
  if (req.user) {
    return res.redirect("/dashboard");
  }

  const indexPath = path.join(publicDir, "index.html");

  if (!fs.existsSync(indexPath)) {
    return res
      .status(500)
      .type("html")
      .send(
        "<h1>Configuration error</h1>" +
        "<p>public/index.html is missing on the server.</p>" +
        "<p>Push it to your git repository and redeploy.</p>"
      );
  }

  res.sendFile(indexPath, (err) => {
    if (err) return next(err);
  });
});

/* ------------------------------------------------------------------
 * 12. Application routes
 * ---------------------------------------------------------------- */

app.use(routes);

/* ------------------------------------------------------------------
 * 13. Terminal handlers
 * ---------------------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------
 * 14. Export
 * ---------------------------------------------------------------- */

module.exports = app;
