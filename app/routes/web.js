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

router.get("/", homeController.index);

// Auth pages — form posts hit the same controllers
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

// Dashboard (all roles)
router.get("/dashboard", requireAuth(), dashboardController.index);

// Courses
router.get("/courses", courseController.index);
router.get("/courses/:slug", courseController.show);
router.post(
  "/courses",
  requireAuth(),
  requireRole("expert", "admin"),
  courseController.create
);

function renderAuthPage(title, mode) {
  const isLogin = mode === "login";
  const next = "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · ExpertHub</title>
<style>
  :root{--bg:#0b1220;--fg:#e6ecff;--accent:#4c8dff;--muted:rgba(230,236,255,.6);--line:rgba(255,255,255,.08);--panel:rgba(255,255,255,.03)}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100vh;background:var(--bg);color:var(--fg);
            font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  main{max-width:420px;margin:4rem auto;padding:2rem;
       background:var(--panel);border:1px solid var(--line);border-radius:14px}
  h1{margin:0 0 1.5rem;font-size:1.5rem;text-align:center}
  label{display:block;font-size:.9rem;color:var(--muted);margin-bottom:.35rem}
  input,select{width:100%;padding:.65rem .8rem;background:var(--panel);
               border:1px solid var(--line);border-radius:10px;color:var(--fg);
               font:inherit;margin-bottom:1rem}
  input:focus,select:focus{outline:none;border-color:var(--accent)}
  button{width:100%;padding:.75rem;background:var(--accent);color:#fff;border:none;
         border-radius:10px;font-weight:600;cursor:pointer;font-size:.95rem}
  p{text-align:center;color:var(--muted);font-size:.9rem;margin-top:1.5rem}
  a{color:var(--accent);text-decoration:none}
</style></head>
<body><main>
  <h1>${title}</h1>
  <form method="post" action="/${isLogin ? "login" : "register"}">
    ${isLogin ? "" : `<label>Full name</label><input name="name" required />`}
    <label>Email</label><input type="email" name="email" required />
    ${isLogin ? "" : `
      <label>I am a</label>
      <select name="role">
        <option value="student">Student</option>
        <option value="expert">Expert</option>
        <option value="corporate">Corporate</option>
      </select>`}
    <label>Password</label><input type="password" name="password" minlength="8" required />
    ${isLogin ? "" : `<label>Confirm password</label><input type="password" name="password_confirmation" minlength="8" required />`}
    <button type="submit">${isLogin ? "Sign in" : "Create account"}</button>
  </form>
  <p>${isLogin
    ? `No account? <a href="/register">Create one</a>`
    : `Already registered? <a href="/login">Sign in</a>`}</p>
</main></body></html>`;
}

module.exports = router;
