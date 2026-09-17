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
// Serve public/index.html for the exact root path.
app.get("/", (req, res, next) => {
  res.sendFile(
    require("path").join(__dirname, "../../public/index.html"),
    (err) => { if (err) next(); }
  );
});
/* --------------------------------------------------------------------------
 * Landing page fallback
 * --------------------------------------------------------------------------
 * If the static middleware doesn't find index.html (e.g. you deleted it),
 * send a minimal JSON response so `/` never returns a bare Express 404.
 * -------------------------------------------------------------------------- */

/* --------------------------------------------------------------------------
 * GET /
 * --------------------------------------------------------------------------
 *   - Signed-in users → 302 /dashboard
 *   - Guests          → full landing page (uses /assets/css + /assets/js)
 *
 * This route renders the public landing page. All styles and scripts
 * come from public/assets/ — nothing is inline. If you later move to a
 * view engine, this whole block becomes:
 *
 *     res.render("home", { user: req.user });
 * -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  // Signed-in users skip the landing page and go to their dashboard.
  if (req.user) return res.redirect("/dashboard");

  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0b1220" />

  <title>ExpertHub — Turn expertise into progress</title>
  <meta name="description" content="ExpertHub connects students, professionals and organizations with qualified experts for learning, consultation, events and corporate training." />
  <meta name="author" content="ExpertHub" />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ExpertHub" />
  <meta property="og:title" content="ExpertHub — Turn expertise into progress" />
  <meta property="og:description" content="Structured learning, expert consultations, events and corporate training in one hub." />
  <meta property="og:url" content="https://timbackend-ylc0.onrender.com/" />
  <meta property="og:image" content="/assets/img/og-image.png" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ExpertHub — Turn expertise into progress" />
  <meta name="twitter:description" content="Structured learning, expert consultations, events and corporate training in one hub." />
  <meta name="twitter:image" content="/assets/img/twitter-card.png" />

  <!-- Icons & manifest -->
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <link rel="apple-touch-icon" href="/assets/img/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="canonical" href="https://timbackend-ylc0.onrender.com/" />

  <!-- Styles: single entry point that @imports base, layout, components, etc. -->
  <link rel="stylesheet" href="/assets/css/style.css" />
</head>
<body data-page="home">

  <!-- =================================================================
       Header
       ================================================================= -->
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="ExpertHub home">
        <img src="/assets/img/logo.svg" alt="ExpertHub" height="28" />
      </a>

      <nav aria-label="Primary">
        <a href="#features">Features</a>
        <a href="/courses">Courses</a>
        <a href="/login">Sign in</a>
        <a class="btn btn-primary btn-sm" href="/register">Get started</a>
      </nav>
    </div>
  </header>

  <!-- =================================================================
       Main
       ================================================================= -->
  <main>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <span class="pill pill-ok" style="margin-bottom:1rem;display:inline-block">
          Live on Render
        </span>
        <h1>Turn expertise into progress.</h1>
        <p class="lede">
          Learn from vetted experts, book focused consultations, join
          professional events and train your team — all from one platform.
        </p>
        <div class="cta">
          <a class="btn btn-primary btn-lg" href="/register">Create account</a>
          <a class="btn btn-ghost btn-lg" href="/courses">Browse courses</a>
        </div>
        <ul class="list" style="margin-top:2.5rem;max-width:520px">
          <li><span>Expert-led content</span><span class="pill pill-ok">✓</span></li>
          <li><span>Structured learning paths</span><span class="pill pill-ok">✓</span></li>
          <li><span>Corporate-ready programs</span><span class="pill pill-ok">✓</span></li>
          <li><span>Session-authenticated API</span><span class="pill pill-ok">✓</span></li>
        </ul>
      </div>
    </section>

    <!-- Features -->
    <section class="landing-section" id="features">
      <div class="container">
        <h2 style="margin:0 0 1.5rem">What you can do</h2>
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

    <!-- Audiences -->
    <section class="landing-section">
      <div class="container">
        <h2 style="margin:0 0 1.5rem">Built for every role</h2>
        <div class="grid">

          <article class="card">
            <h3>Students</h3>
            <p>Enroll in expert-led courses, track progress, earn certificates and badges.</p>
          </article>

          <article class="card">
            <h3>Experts</h3>
            <p>Publish courses, set availability, book consultations, manage earnings.</p>
          </article>

          <article class="card">
            <h3>Corporate</h3>
            <p>Enroll employees, track training progress, generate consolidated reports.</p>
          </article>

          <article class="card">
            <h3>Administrators</h3>
            <p>Manage users, courses, payments, subscriptions and audit logs.</p>
          </article>

        </div>
      </div>
    </section>

    <!-- Platform status -->
    <section class="landing-section" id="status">
      <div class="container">
        <h2 style="margin:0 0 1.5rem">Platform status</h2>
        <div class="stats">
          <div class="stat">
            <span class="stat-num" id="status-dot">—</span>
            <span>Backend</span>
          </div>
          <div class="stat">
            <span class="stat-num" id="status-time">—</span>
            <span>Server time</span>
          </div>
          <div class="stat">
            <span class="stat-num" id="status-env">—</span>
            <span>Environment</span>
          </div>
        </div>
        <p class="muted text-sm" style="margin-top:1rem">
          Live check against <code>/health</code> — updates every 30 seconds.
        </p>
      </div>
    </section>

    <!-- API endpoints -->
    <section class="landing-section">
      <div class="container">
        <h2 style="margin:0 0 1.5rem">Available endpoints</h2>
        <ul class="list">
          <li>
            <a href="/health" target="_blank" rel="noopener">
              <code>GET /health</code>
            </a>
          </li>
          <li>
            <a href="/api/health" target="_blank" rel="noopener">
              <code>GET /api/health</code>
            </a>
          </li>
          <li>
            <a href="/api/courses" target="_blank" rel="noopener">
              <code>GET /api/courses</code>
            </a>
          </li>
          <li>
            <a href="/api/auth/me" target="_blank" rel="noopener">
              <code>GET /api/auth/me</code>
            </a>
          </li>
          <li>
            <a href="/login">
              <code>POST /login</code>
            </a>
          </li>
          <li>
            <a href="/register">
              <code>POST /register</code>
            </a>
          </li>
        </ul>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="landing-section">
      <div class="container text-center">
        <h2 style="margin:0 0 1rem">Ready to get started?</h2>
        <p class="lede" style="margin:0 auto 2rem">
          Create a free account and start learning, consulting or training today.
        </p>
        <div class="cta" style="justify-content:center">
          <a class="btn btn-primary btn-lg" href="/register">Create account</a>
          <a class="btn btn-ghost btn-lg" href="/login">Sign in</a>
        </div>
      </div>
    </section>

  </main>

  <!-- =================================================================
       Footer
       ================================================================= -->
  <footer class="footer">
    <div class="container">
      <span>© <span id="year">2026</span> ExpertHub</span>
      <span aria-hidden="true">·</span>
      <a href="/courses">Courses</a>
      <span aria-hidden="true">·</span>
      <a href="/api/health" target="_blank" rel="noopener">API</a>
      <span aria-hidden="true">·</span>
      <a href="/login">Sign in</a>
      <span aria-hidden="true">·</span>
      <a href="/register">Get started</a>
    </div>
  </footer>

  <!-- Global script. app.js handles:
       - year stamp
       - flash auto-dismiss
       - submit button busy state
       - CSRF token injection into fetch()
       - smooth scroll for in-page anchors
       - external link safety
       - auto-load of /assets/js/<body data-page>.js -->
  <script src="/assets/js/app.js" defer></script>

  <!-- Inline script that pings /health every 30 seconds and updates
       the three stat cells above. Kept inline so this route stays
       self-contained. Move it to /assets/js/home.js if you prefer. -->
  <script>
    (function () {
      var dot  = document.getElementById("status-dot");
      var time = document.getElementById("status-time");
      var env  = document.getElementById("status-env");
      if (!dot || !time || !env) return;

      function check() {
        dot.textContent = "Checking…";
        time.textContent = "—";
        env.textContent = "—";

        fetch("/health", {
          headers: { Accept: "application/json" },
          cache: "no-store"
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data && data.success) {
              dot.textContent = "Online";
              dot.style.color = "var(--ok)";
              time.textContent = new Date(data.time).toLocaleTimeString();
              env.textContent = data.environment || "—";
            } else {
              dot.textContent = "Degraded";
              dot.style.color = "var(--warn)";
            }
          })
          .catch(function () {
            dot.textContent = "Offline";
            dot.style.color = "var(--danger)";
          });
      }

      check();
      setInterval(function () {
        if (!document.hidden) check();
      }, 30000);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) check();
      });
    })();
  </script>

</body>
</html>`);
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
