const courseService = require("../services/CourseService");
const { escapeHtml } = require("../utils/helpers");

class HomeController {
  static async index(req, res, next) {
    try {
      let courses = [];
      try { courses = await courseService.list(); } catch { /* db may be empty */ }

      const user = req.user;

      res.type("html").send(`
<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>ExpertHub</title>
<style>
  :root{--bg:#0b1220;--fg:#e6ecff;--accent:#4c8dff;--muted:rgba(230,236,255,.6);--line:rgba(255,255,255,.08);--panel:rgba(255,255,255,.03)}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100vh;background:var(--bg);color:var(--fg);
            font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  header{border-bottom:1px solid var(--line);padding:1rem 0}
  .container{max-width:1100px;margin:0 auto;padding:0 1.25rem}
  .nav{display:flex;justify-content:space-between;align-items:center}
  .brand{font-weight:700;font-size:1.2rem;color:var(--fg);text-decoration:none}
  nav a{color:var(--muted);text-decoration:none;margin-left:1rem;font-size:.95rem}
  nav a:hover{color:var(--fg)}
  main{padding:4rem 0}
  h1{font-size:clamp(2rem,5vw,3rem);margin:0 0 1rem;letter-spacing:-.02em}
  p.lede{color:var(--muted);font-size:1.1rem;margin:0 0 2rem;max-width:640px}
  .btn{display:inline-block;padding:.75rem 1.25rem;border-radius:10px;
       background:var(--accent);color:#fff;text-decoration:none;font-weight:600}
  .grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:2rem}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1.25rem}
  .card h3{margin:0 0 .5rem}
  .card a{color:var(--fg);text-decoration:none}
  .pill{display:inline-block;padding:.2rem .6rem;border-radius:999px;
        background:rgba(255,255,255,.05);font-size:.75rem;color:var(--muted)}
</style></head>
<body>
  <header><div class="container nav">
    <a class="brand" href="/">ExpertHub</a>
    <nav>
      <a href="/courses">Courses</a>
      ${user
        ? `<a href="/dashboard">Dashboard</a><a href="/logout">Sign out</a>`
        : `<a href="/login">Sign in</a><a href="/register">Get started</a>`}
    </nav>
  </div></header>
  <main><div class="container">
    <h1>Learn from experts.<br/>Consult with confidence.</h1>
    <p class="lede">ExpertHub connects students, professionals and organizations with
       qualified experts for learning, consultation and corporate training.</p>
    <a class="btn" href="${user ? "/dashboard" : "/register"}">
      ${user ? "Go to dashboard" : "Create account"}
    </a>

    <h2 style="margin-top:4rem">Featured courses</h2>
    <div class="grid">
      ${courses.length
        ? courses.slice(0, 6).map((c) => `
          <div class="card">
            <h3><a href="/courses/${escapeHtml(c.slug)}">${escapeHtml(c.title)}</a></h3>
            <p style="color:var(--muted);margin:0 0 .75rem">
              ${escapeHtml((c.description || "").slice(0, 120))}
            </p>
            <span class="pill">KSh ${Number(c.price).toFixed(2)}</span>
          </div>`).join("")
        : `<p style="color:var(--muted)">No courses published yet.</p>`}
    </div>
  </div></main>
</body></html>
      `);
    } catch (err) { next(err); }
  }
}

module.exports = HomeController;
