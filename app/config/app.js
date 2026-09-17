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
 * Notes:
 *     The landing page for `/` is rendered inline here, but ALL
 *     styles and scripts come from /assets/* — nothing is inlined.
 *     If you later move the landing page to a controller or view
 *     engine, delete the `app.get("/", ...)` block below and let
 *     the controller's route take over.
 *
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
 * 6. Session stack (session → flash → csrf → attachUser)
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
 * 7. Static assets — MUST come before the `/` handler so the
 *    browser can reach /assets/css/style.css and /assets/js/app.js
 * ---------------------------------------------------------------- */

app.use(
  "/assets",
  express.static(path.join(publicDir, "assets"), {
    maxAge: isProd ? "30d" : 0,
    immutable: isProd,
    etag: true,
  })
);

// Safe upload subfolders.
for (const sub of [
  "avatars",
  "courses",
  "blog",
  "events",
  "resources",
  "certificates",
]) {
  app.use(
    `/uploads/${sub}`,
    express.static(path.join(publicDir, "uploads", sub), {
      maxAge: isProd ? "7d" : 0,
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

// Blocked upload folders.
app.use(["/uploads/private", "/uploads/temp"], (req, res) =>
  res.status(404).end()
);

// Root-level static files (favicon.ico, robots.txt, site.webmanifest,
// .well-known/*, etc.). index: false so `/` is handled explicitly
// below — we don't want the static middleware auto-serving index.html.
app.use(
  express.static(publicDir, {
    index: false,
    maxAge: isProd ? "1h" : 0,
    etag: true,
  })
);

/* ------------------------------------------------------------------
 * 8. Health check
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
 * 9. Landing page for /
 * ----------------------------------------------------------------
 *   Signed-in users → 302 /dashboard.
 *   Guests          → full landing page.
 *
 *   IMPORTANT: this HTML only links to /assets/* — no inline styles
 *   or scripts except the tiny /health poller below, which has to
 *   stay inline because it's specific to this page.
 * ---------------------------------------------------------------- */

app.get("/", (req, res) => {
  if (req.user) return res.redirect("/dashboard");

  const user = req.user;
  const csrfToken = req.session?.csrfToken || "";
  const year = new Date().getFullYear();

  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0b1220" />
  <meta name="csrf-token" content="${csrfToken}" />

  <title>ExpertHub — Turn expertise into progress</title>
  <meta name="description" content="ExpertHub connects students, professionals and organizations with qualified experts for learning, consultation, events and corporate training." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://timbackend-ylc0.onrender.com/" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="ExpertHub" />
  <meta property="og:title" content="ExpertHub — Turn expertise into progress" />
  <meta property="og:description" content="Structured learning, expert consultations, events and corporate training in one hub." />
  <meta property="og:image" content="/assets/img/og-image.png" />

  <!-- Icons & manifest -->
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <link rel="apple-touch-icon" href="/assets/img/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- ============================================================
       STYLES — single entry point from public/assets/css/
       style.css @imports base, layout, components, utilities, etc.
       ============================================================ -->
  <link rel="stylesheet" href="/assets/css/style.css" />
</head>

<body data-page="home">

  <!-- ============================================================
       Header
       ============================================================ -->
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="ExpertHub home">
        <img src="/assets/img/logo.svg" alt="ExpertHub" height="28" />
      </a>

      <nav aria-label="Primary">
        <a href="#features">Features</a>
        <a href="/courses">Courses</a>
        ${user
          ? `<a href="/dashboard">Dashboard</a>
             <form method="post" action="/logout" class="inline">
               <input type="hidden" name="_csrf" value="${csrfToken}" />
               <button class="link-btn" type="submit">Sign out</button>
             </form>`
          : `<a href="/login">Sign in</a>
             <a class="btn btn-primary btn-sm" href="/register">Get started</a>`}
      </nav>
    </div>
  </header>

  <!-- ============================================================
       Main
       ============================================================ -->
  <main>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <span class="pill pill-ok" style="margin-bottom:1rem;display:inline-block">
          Live on Render
        </span>
        <h1>Turn expertise into <em>progress</em>.</h1>
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
        <div class="section-head">
          <span class="kicker">Built for growth</span>
          <h2>What you can do</h2>
          <p>ExpertHub brings learning, consultation and training into one platform.</p>
        </div>

        <div class="grid">
          <article class="feature-card">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8 H24 V26 A2 2 0 0 1 22 28 H8 A2 2 0 0 1 6 26 Z"/>
                <path d="M10 8 V4 A2 2 0 0 1 12 2 H20 A2 2 0 0 1 22 4 V8"/>
                <path d="M11 15 H21 M11 20 H21 M11 25 H17"/>
              </svg>
            </div>
            <h3>Learn</h3>
            <p>Structured courses with modules, lessons and assessments.</p>
            <a class="feature-link" href="/courses">Browse courses</a>
          </article>

          <article class="feature-card">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="16" cy="16" r="14"/>
                <circle cx="16" cy="13" r="3"/>
                <path d="M10 24 C10 20 13 18 16 18 C19 18 22 20 22 24"/>
                <path d="M22 9 L24 11 L28 7"/>
              </svg>
            </div>
            <h3>Consult</h3>
            <p>Book one-to-one sessions with qualified experts.</p>
            <a class="feature-link" href="/login?next=/dashboard">Find an expert</a>
          </article>

          <article class="feature-card">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="8" width="24" height="20" rx="3"/>
                <path d="M4 14 H28"/>
                <path d="M10 4 V10 M22 4 V10"/>
              </svg>
            </div>
            <h3>Participate</h3>
            <p>Join events, webinars and live training sessions.</p>
            <a class="feature-link" href="/login?next=/dashboard">See events</a>
          </article>

          <article class="feature-card">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="16" cy="16" r="14"/>
                <rect x="9" y="14" width="14" height="11" rx="1.5"/>
                <path d="M11 14 V10 A1 1 0 0 1 12 9 H20 A1 1 0 0 1 21 10 V14"/>
                <path d="M14 25 V19 H18 V25"/>
              </svg>
            </div>
            <h3>Corporate training</h3>
            <p>Upskill teams with measurable programs and reports.</p>
            <a class="feature-link" href="/register?role=corporate">Request a demo</a>
          </article>

          <article class="feature-card">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 4 H24 V22 H8 Z"/>
                <path d="M12 9 H20 M12 13 H20 M12 17 H17"/>
                <circle cx="21" cy="23" r="4"/>
                <path d="M19 26 L18 31 L21 29 L24 31 L23 26"/>
              </svg>
            </div>
            <h3>Your dashboard</h3>
            <p>Track enrollments, progress and certificates in one view.</p>
            <a class="feature-link" href="/dashboard">Open dashboard</a>
          </article>

          <article class="feature-card">
            <div class="icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/>
              </svg>
            </div>
            <h3>Open API</h3>
            <p>Integrate ExpertHub into your tools with a clean JSON API.</p>
            <a class="feature-link" href="/api/health" target="_blank" rel="noopener">Explore API</a>
          </article>
        </div>
      </div>
    </section>

    <!-- Platform status -->
    <section class="landing-section" id="status">
      <div class="container">
        <div class="section-head">
          <span class="kicker">Live</span>
          <h2>Platform status</h2>
          <p>Backend health is checked every 30 seconds.</p>
        </div>

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
      </div>
    </section>

    <!-- Final CTA -->
    <section class="landing-section">
      <div class="container">
        <div class="final-cta">
          <h2>Ready to get started?</h2>
          <p>Create a free account and start learning, consulting or training today.</p>
          <div class="cta" style="justify-content:center">
            <a class="btn btn-primary btn-lg" href="/register">Create account</a>
            <a class="btn btn-ghost btn-lg" href="/login">Sign in</a>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- ============================================================
       Footer
       ============================================================ -->
  <footer class="footer">
    <div class="container">
      <span>© <span id="year">${year}</span> ExpertHub</span>
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

  <!-- ============================================================
       SCRIPTS — from public/assets/js/
       app.js handles: year, flash dismiss, CSRF fetch, smooth
       anchors, external link safety.
       ============================================================ -->
  <script src="/assets/js/app.js" defer></script>

  <!-- ============================================================
       Landing-page–specific: /health poller.
       Kept inline because it is only needed here. If you want
       zero inline JS, move this to /assets/js/home.js and add
       <script src="/assets/js/home.js" defer></script> above.
       ============================================================ -->
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
      setInterval(function () { if (!document.hidden) check(); }, 30000);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) check();
      });
    })();
  </script>

</body>
</html>`);
});

/* ------------------------------------------------------------------
 * 10. Application routes
 * ---------------------------------------------------------------- */

app.use(routes);

/* ------------------------------------------------------------------
 * 11. Terminal handlers — must be LAST
 * ---------------------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------
 * 12. Export
 * ---------------------------------------------------------------- */

module.exports = app;
