const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");
const dashboardController = require("../controllers/dashboardController");
const courseController = require("../controllers/courseController");
const loginController = require("../controllers/auth/loginController");
const registerController = require("../controllers/auth/registerController");
const logoutController = require("../controllers/auth/logoutController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

/* --------------------------------------------------------------------------
 * Landing-page fallback for GET /home (optional — remove if you don't want it)
 * -------------------------------------------------------------------------- */

router.get("/home", homeController.index);

/* --------------------------------------------------------------------------
 * Auth pages
 * -------------------------------------------------------------------------- */

router.get("/login", (req, res) => {
  res.type("html").send(renderAuthPage("Sign in", "login"));
});
router.post("/login", loginController);

router.get("/register", (req, res) => {
  res.type("html").send(renderAuthPage("Create your account", "register"));
});
router.post("/register", registerController);

router.get("/logout", logoutController);
router.post("/logout", logoutController);

/* --------------------------------------------------------------------------
 * Dashboard (all roles)
 * -------------------------------------------------------------------------- */

router.get("/dashboard", requireAuth(), dashboardController.index);

/* --------------------------------------------------------------------------
 * Courses
 * -------------------------------------------------------------------------- */

router.get("/courses", courseController.index);
router.get("/courses/:slug", courseController.show);
router.post(
  "/courses",
  requireAuth(),
  requireRole("expert", "admin"),
  courseController.create
);

/* --------------------------------------------------------------------------
 * Shared HTML for login/register pages
 * -------------------------------------------------------------------------- */

function renderAuthPage(title, mode) {
  const isLogin = mode === "login";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · ExpertHub</title>
<link rel="stylesheet" href="/assets/css/style.css"/>
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/">
      <img src="/assets/images/logo.svg" alt="ExpertHub" height="28"/>
    </a>
    <nav>
      <a href="/courses">Courses</a>
      ${isLogin
        ? `<a href="/register">Get started</a>`
        : `<a href="/login">Sign in</a>`}
    </nav>
  </div>
</header>

<main class="container">
  <section class="auth-card">
    <h1>${title}</h1>
    <form method="post" action="/${isLogin ? "login" : "register"}" class="stack">
      ${isLogin ? "" : `
        <label>Full name
          <input name="name" required autocomplete="name"/>
        </label>`}

      <label>Email
        <input type="email" name="email" required autocomplete="email"/>
      </label>

      ${isLogin ? "" : `
        <label>I am a
          <select name="role">
            <option value="student">Student</option>
            <option value="expert">Expert</option>
            <option value="corporate">Corporate</option>
          </select>
        </label>`}

      <label>Password
        <input type="password" name="password" minlength="8" required
               autocomplete="${isLogin ? "current-password" : "new-password"}"/>
      </label>

      ${isLogin ? "" : `
        <label>Confirm password
          <input type="password" name="password_confirmation" minlength="8" required
                 autocomplete="new-password"/>
        </label>`}

      <button class="btn btn-primary" type="submit">
        ${isLogin ? "Sign in" : "Create account"}
      </button>
    </form>
    <p class="muted" style="text-align:center;margin-top:1.25rem">
      ${isLogin
        ? `No account? <a href="/register">Create one</a>`
        : `Already registered? <a href="/login">Sign in</a>`}
    </p>
  </section>
</main>

<footer class="footer">
  <div class="container">
    <span>&copy; <span id="year">2026</span> ExpertHub</span>
  </div>
</footer>
<script>document.getElementById('year').textContent=new Date().getFullYear();</script>
<script src="/assets/js/app.js" defer></script>
</body></html>`;
}

module.exports = router;
