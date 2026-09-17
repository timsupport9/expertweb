/**
 * ExpertHub — HomeController
 *
 * Renders the public landing page.
 *
 * - Loads featured courses if the DB is available.
 * - Uses shared CSS from /assets/css/style.css.
 * - All class names match public/assets/css/components.css
 *   and public/assets/css/layout.css.
 */

const courseService = require("../services/CourseService");
const { escapeHtml } = require("../utils/helpers");

class HomeController {
  static async index(req, res, next) {
    try {
      // -----------------------------------------------------------
      // Load featured courses. Fail soft — landing page must render
      // even if the database is empty or unreachable.
      // -----------------------------------------------------------
      let courses = [];
      try {
        courses = await courseService.list();
      } catch {
        courses = [];
      }

      const user = req.user || null;
      const csrfToken = req.session?.csrfToken || "";

      // -----------------------------------------------------------
      // Render
      // -----------------------------------------------------------
      res.type("html").send(this.render({ user, courses, csrfToken }));
    } catch (err) {
      next(err);
    }
  }

  /**
   * Build the landing page HTML.
   * Kept as a separate method so tests can call it without HTTP.
   */
  static render({ user, courses, csrfToken }) {
    const year = new Date().getFullYear();
    const primaryCta = user ? "/dashboard" : "/register";
    const primaryLabel = user ? "Go to dashboard" : "Create account";
    const secondaryCta = user ? "/courses" : "/login";
    const secondaryLabel = user ? "Browse courses" : "Sign in";

    const features = [
      {
        icon: "course",
        title: "Learn",
        body: "Structured courses with modules, lessons and assessments.",
        href: "/courses",
        link: "Browse courses",
      },
      {
        icon: "expert",
        title: "Consult",
        body: "Book one-to-one sessions with vetted professionals.",
        href: "/login?next=/dashboard",
        link: "Find an expert",
      },
      {
        icon: "event",
        title: "Participate",
        body: "Join events, webinars and live training sessions.",
        href: "/login?next=/dashboard",
        link: "See events",
      },
      {
        icon: "corporate",
        title: "Corporate training",
        body: "Upskill teams with measurable programs and reports.",
        href: "/register?role=corporate",
        link: "Request a demo",
      },
      {
        icon: "certificate",
        title: "Your dashboard",
        body: "Track enrollments, progress and certificates in one view.",
        href: "/dashboard",
        link: "Open dashboard",
      },
      {
        icon: "chat",
        title: "Open API",
        body: "Integrate ExpertHub into your tools with a clean JSON API.",
        href: "/api/health",
        link: "Explore API",
      },
    ];

    const renderCourses = () => {
      if (!courses.length) {
        return `
          <div class="empty">
            <h3>No courses published yet</h3>
            <p class="muted">Check back soon — new content is on the way.</p>
            <a class="btn btn-primary" href="/register">Get notified</a>
          </div>`;
      }

      return `
        <div class="grid">
          ${courses
            .slice(0, 6)
            .map(
              (c) => `
            <article class="card">
              <h3>
                <a href="/courses/${escapeHtml(c.slug)}">
                  ${escapeHtml(c.title)}
                </a>
              </h3>
              <p>
                ${escapeHtml((c.description || "").slice(0, 140))}
              </p>
              <div class="meta">
                <span class="pill pill-info">
                  KSh ${Number(c.price || 0).toFixed(2)}
                </span>
                ${
                  c.instructor_name
                    ? `<span class="muted text-sm">by ${escapeHtml(
                        c.instructor_name
                      )}</span>`
                    : ""
                }
              </div>
            </article>
          `
            )
            .join("")}
        </div>`;
    };

    const renderFeatures = () =>
      features
        .map(
          (f) => `
        <article class="feature-card">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                 stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              ${HomeController.iconPath(f.icon)}
            </svg>
          </div>
          <h3>${f.title}</h3>
          <p>${f.body}</p>
          <a class="feature-link" href="${f.href}">${f.link}</a>
        </article>
      `
        )
        .join("");

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0b1220" />
  <meta name="csrf-token" content="${escapeHtml(csrfToken)}" />

  <title>ExpertHub — Turn expertise into progress</title>
  <meta name="description" content="ExpertHub connects students, professionals and organizations with qualified experts for learning, consultation, events and corporate training." />
  <link rel="canonical" href="/" />

  <!-- Icons & manifest -->
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg" />
  <link rel="apple-touch-icon" href="/assets/img/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="ExpertHub — Turn expertise into progress" />
  <meta property="og:description" content="Structured learning, expert consultations, events and corporate training." />
  <meta property="og:image" content="/assets/img/og-image.png" />

  <!-- Styles (shared system) -->
  <link rel="stylesheet" href="/assets/css/style.css" />
</head>

<body>

  <!-- ============================================================
       Header
       ============================================================ -->
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="ExpertHub home">
        <img src="/assets/img/logo.svg" alt="ExpertHub" height="28" />
      </a>

      <nav aria-label="Primary">
        <a href="/courses">Courses</a>
        ${
          user
            ? `<a href="/dashboard">Dashboard</a>
               <span class="user-chip">${escapeHtml(user.name)}</span>
               <form method="post" action="/logout" class="inline">
                 <input type="hidden" name="_csrf" value="${escapeHtml(csrfToken)}" />
                 <button class="link-btn" type="submit">Sign out</button>
               </form>`
            : `<a href="/login">Sign in</a>
               <a class="btn btn-primary btn-sm" href="/register">Get started</a>`
        }
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
        <h1>Turn expertise into <em>progress</em>.</h1>
        <p class="lede">
          Learn from vetted experts, book focused consultations, join
          professional events and train your team — all from one platform.
        </p>

        <div class="cta">
          <a class="btn btn-primary btn-lg" href="${primaryCta}">
            ${primaryLabel}
          </a>
          <a class="btn btn-ghost btn-lg" href="${secondaryCta}">
            ${secondaryLabel}
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="landing-section">
      <div class="container">
        <div class="section-head">
          <span class="kicker">Built for growth</span>
          <h2>Everything you need to learn, consult and grow.</h2>
          <p>
            ExpertHub brings structured learning, expert guidance,
            professional events and corporate training into one
            coherent platform.
          </p>
        </div>

        <div class="feature-grid grid">
          ${renderFeatures()}
        </div>
      </div>
    </section>

    <!-- Featured courses -->
    <section class="landing-section">
      <div class="container">
        <div class="section-head">
          <span class="kicker">Featured</span>
          <h2>Start with a course</h2>
          <p>
            Hand-picked programs from expert instructors — practical,
            structured and outcome-focused.
          </p>
        </div>

        ${renderCourses()}
      </div>
    </section>

    <!-- Final CTA -->
    <section class="landing-section">
      <div class="container">
        <div class="final-cta">
          <h2>Ready to turn expertise into progress?</h2>
          <p>
            Create a free account and start learning, consulting or
            training today — all from one hub.
          </p>
          <div class="cta">
            <a class="btn btn-primary btn-lg" href="/register">
              Create account
            </a>
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
      <span>&copy; ${year} ExpertHub</span>
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

  <!-- Scripts -->
  <script src="/assets/js/app.js" defer></script>

</body>
</html>`;
  }

  /**
   * Inline SVG path data for each feature icon.
   * Kept here so the page renders with zero external requests for
   * the icons. Uses 32×32 viewBox paths matching the design system.
   */
  static iconPath(name) {
    const paths = {
      course: `
        <path d="M6 8 H24 V26 A2 2 0 0 1 22 28 H8 A2 2 0 0 1 6 26 Z"/>
        <path d="M10 8 V4 A2 2 0 0 1 12 2 H20 A2 2 0 0 1 22 4 V8"/>
        <path d="M11 15 H21 M11 20 H21 M11 25 H17"/>`,
      expert: `
        <circle cx="16" cy="16" r="14"/>
        <circle cx="16" cy="13" r="3"/>
        <path d="M10 24 C10 20 13 18 16 18 C19 18 22 20 22 24"/>
        <path d="M22 9 L24 11 L28 7"/>`,
      corporate: `
        <circle cx="16" cy="16" r="14"/>
        <rect x="9" y="14" width="14" height="11" rx="1.5"/>
        <path d="M11 14 V10 A1 1 0 0 1 12 9 H20 A1 1 0 0 1 21 10 V14"/>
        <path d="M14 25 V19 H18 V25"/>`,
      admin: `
        <circle cx="16" cy="16" r="14"/>
        <path d="M16 8 L24 11 V16 C24 20 20 23 16 24 C12 23 8 20 8 16 V11 Z"/>
        <path d="M12 15 L15 18 L21 12"/>`,
      event: `
        <rect x="4" y="8" width="24" height="20" rx="3"/>
        <path d="M4 14 H28"/>
        <path d="M10 4 V10 M22 4 V10"/>
        <circle cx="12" cy="21" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="18" cy="21" r="1.5" fill="currentColor" stroke="none"/>`,
      webinar: `
        <rect x="3" y="8" width="20" height="16" rx="3"/>
        <path d="M23 13 L29 9 V23 L23 19 Z"/>
        <circle cx="13" cy="16" r="3"/>`,
      certificate: `
        <path d="M8 4 H24 V22 H8 Z"/>
        <path d="M12 9 H20 M12 13 H20 M12 17 H17"/>
        <circle cx="21" cy="23" r="4"/>
        <path d="M19 26 L18 31 L21 29 L24 31 L23 26"/>`,
      badge: `
        <path d="M12 3 L20 3 L22 10 L16 14 L10 10 Z"/>
        <circle cx="16" cy="20" r="8"/>
        <path d="M13 20 L15 22 L19 18"/>`,
      payment: `
        <rect x="3" y="7" width="26" height="18" rx="3"/>
        <path d="M3 13 H29"/>
        <path d="M8 19 H13"/>
        <circle cx="23" cy="19" r="2"/>`,
      chat: `
        <path d="M28 20 A3 3 0 0 1 25 23 H12 L6 28 V7 A3 3 0 0 1 9 4 H25 A3 3 0 0 1 28 7 Z"/>
        <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="17" cy="14" r="1.2" fill="currentColor" stroke="none"/>
        <circle cx="22" cy="14" r="1.2" fill="currentColor" stroke="none"/>`,
      notification: `
        <path d="M22 12 A6 6 0 1 0 10 12 V18 L8 22 H24 L22 18 Z"/>
        <path d="M14 26 A2 2 0 0 0 18 26"/>`,
    };

    return paths[name] || paths.course;
  }
}

module.exports = HomeController;
