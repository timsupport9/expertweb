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
  if (req.user) return res.redirect("/dashboard");

  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0b1220" />
  <title>ExpertHub — Turn expertise into progress</title>
  <meta name="description" content="ExpertHub connects students, professionals and organizations with qualified experts for learning, consultation, events and corporate training." />
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <style>
    :root{--bg:#0b1220;--fg:#e6ecff;--muted:rgba(230,236,255,.6);--accent:#4c8dff;--line:rgba(255,255,255,.08);--panel:rgba(255,255,255,.03);--radius:14px}
    *{box-sizing:border-box}
    html,body{margin:0;min-height:100vh;background:var(--bg);color:var(--fg);
      font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
      -webkit-font-smoothing:antialiased}
    a{color:var(--accent);text-decoration:none}
    a:hover{text-decoration:underline}
    .container{max-width:1100px;margin:0 auto;padding:0 1.25rem}
    header{border-bottom:1px solid var(--line);position:sticky;top:0;
      background:rgba(11,18,32,.85);backdrop-filter:blur(10px);z-index:10}
    .nav{display:flex;justify-content:space-between;align-items:center;height:64px;gap:1rem}
    .brand{font-weight:700;font-size:1.2rem;color:var(--fg)}
    nav a{color:var(--muted);margin-left:1rem;font-size:.95rem}
    nav a:hover{color:var(--fg);text-decoration:none}
    .btn{display:inline-flex;align-items:center;justify-content:center;
      padding:.6rem 1rem;border-radius:10px;border:1px solid var(--line);
      background:var(--panel);color:var(--fg);font-size:.95rem;cursor:pointer;
      font-weight:500;text-decoration:none}
    .btn:hover{background:rgba(255,255,255,.05);text-decoration:none}
    .btn-primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
    .btn-primary:hover{background:#6ea2ff;border-color:#6ea2ff}
    .btn-ghost{background:transparent}
    .btn-sm{padding:.45rem .85rem;font-size:.85rem}
    .btn-lg{padding:.85rem 1.5rem;font-size:1rem}
    .hero{padding:5rem 0 4rem;max-width:720px}
    .hero h1{font-size:clamp(2rem,5vw,3.25rem);line-height:1.05;
      letter-spacing:-.025em;margin:0 0 1rem}
    .lede{color:var(--muted);font-size:1.15rem;margin:0 0 2rem;max-width:640px}
    .cta{display:flex;gap:.75rem;flex-wrap:wrap}
    section{padding:4rem 0;border-top:1px solid var(--line)}
    .grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
    .card{background:var(--panel);border:1px solid var(--line);
      border-radius:var(--radius);padding:1.25rem}
    .card h3{margin:0 0 .5rem;font-size:1.1rem}
    .card p{color:var(--muted);margin:0 0 .75rem;font-size:.95rem;line-height:1.55}
    footer{border-top:1px solid var(--line);padding:1.5rem 0;text-align:center;
      color:var(--muted);font-size:.85rem;margin-top:3rem}
    footer .container{display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap;align-items:center}
    footer a{color:var(--muted)}
    footer a:hover{color:var(--fg);text-decoration:none}
  </style>
</head>
<body>
  <header>
    <div class="container nav">
      <a class="brand" href="/">ExpertHub</a>
      <nav>
        <a href="/courses">Courses</a>
        <a href="/login">Sign in</a>
        <a class="btn btn-primary btn-sm" href="/register">Get started</a>
      </nav>
    </div>
  </header>

  <main>
    <div class="container">
      <section class="hero" style="border:none">
        <h1>Turn expertise into progress.</h1>
        <p class="lede">
          Learn from vetted experts, book focused consultations, join
          professional events and train your team — all from one platform.
        </p>
        <div class="cta">
          <a class="btn btn-primary btn-lg" href="/register">Create account</a>
          <a class="btn btn-ghost btn-lg" href="/courses">Browse courses</a>
        </div>
      </section>
    </div>

    <section>
      <div class="container">
        <div class="grid">
          <article class="card">
            <h3>Learn</h3>
            <p>Structured courses with modules, lessons and assessments.</p>
            <a href="/courses">Browse courses →</a>
          </article>
          <article class="card">
            <h3>Consult</h3>
            <p>Book one-to-one sessions with qualified experts.</p>
            <a href="/login?next=/dashboard">Find an expert →</a>
          </article>
          <article class="card">
            <h3>Participate</h3>
            <p>Join events, webinars and live training sessions.</p>
            <a href="/login?next=/dashboard">See events →</a>
          </article>
          <article class="card">
            <h3>Corporate training</h3>
            <p>Upskill teams with measurable programs and reports.</p>
            <a href="/register?role=corporate">Request a demo →</a>
          </article>
          <article class="card">
            <h3>Your dashboard</h3>
            <p>Track enrollments, progress and certificates in one view.</p>
            <a href="/dashboard">Open dashboard →</a>
          </article>
          <article class="card">
            <h3>Open API</h3>
            <p>Integrate ExpertHub into your own tools with a clean JSON API.</p>
            <a href="/api/health" target="_blank" rel="noopener">Explore API →</a>
          </article>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <span>© <span id="year">2026</span> ExpertHub</span>
      <span>·</span>
      <a href="/courses">Courses</a>
      <span>·</span>
      <a href="/api/health" target="_blank" rel="noopener">API</a>
      <span>·</span>
      <a href="/login">Sign in</a>
      <span>·</span>
      <a href="/register">Get started</a>
    </div>
  </footer>

  <script>
    document.getElementById("year").textContent = new Date().getFullYear();
  </script>
</body>
</html>`);
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
