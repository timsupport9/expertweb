const courseService = require("../services/CourseService");
const db = require("../config/database");
const { escapeHtml } = require("../utils/helpers");

class DashboardController {
  static async index(req, res, next) {
    try {
      const user = req.user;
      if (!user) return res.redirect("/login");

      let extra = {};
      if (user.role === "student") {
        extra.courses = await courseService.list();
      } else if (user.role === "expert") {
        extra.courses = await courseService.byInstructor(user.id);
      } else if (user.role === "admin") {
        const u = await db.queryOne("SELECT COUNT(*) AS c FROM users");
        const c = await db.queryOne("SELECT COUNT(*) AS c FROM courses");
        extra.counts = { users: u.c, courses: c.c };
      }

      res.type("html").send(renderDashboard(user, extra));
    } catch (err) { next(err); }
  }
}

function renderDashboard(user, extra) {
  const body = (() => {
    if (user.role === "admin") {
      return `
        <div class="stats">
          <div class="stat"><span class="num">${extra.counts.users}</span><span>Users</span></div>
          <div class="stat"><span class="num">${extra.counts.courses}</span><span>Courses</span></div>
        </div>`;
    }
    if (user.role === "expert") {
      return `
        <h2>Your courses</h2>
        <div class="grid">
          ${(extra.courses || []).length
            ? extra.courses.map((c) => `
              <div class="card">
                <h3><a href="/courses/${escapeHtml(c.slug)}">${escapeHtml(c.title)}</a></h3>
                <span class="pill">${c.is_published ? "Published" : "Draft"}</span>
              </div>`).join("")
            : `<p style="color:var(--muted)">No courses yet.</p>`}
        </div>`;
    }
    // student / corporate
    return `
      <h2>Discover courses</h2>
      <div class="grid">
        ${(extra.courses || []).slice(0, 6).map((c) => `
          <div class="card">
            <h3><a href="/courses/${escapeHtml(c.slug)}">${escapeHtml(c.title)}</a></h3>
            <p style="color:var(--muted);margin:0">${escapeHtml((c.description || "").slice(0, 120))}</p>
          </div>`).join("") || `<p style="color:var(--muted)">No courses yet.</p>`}
      </div>`;
  })();

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Dashboard · ExpertHub</title>
<style>
  :root{--bg:#0b1220;--fg:#e6ecff;--accent:#4c8dff;--muted:rgba(230,236,255,.6);--line:rgba(255,255,255,.08);--panel:rgba(255,255,255,.03)}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100vh;background:var(--bg);color:var(--fg);
            font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  header{border-bottom:1px solid var(--line);padding:1rem 0}
  .container{max-width:1100px;margin:0 auto;padding:1.5rem 1.25rem}
  .nav{display:flex;justify-content:space-between;align-items:center}
  .brand{font-weight:700;font-size:1.2rem;color:var(--fg);text-decoration:none}
  nav a{color:var(--muted);text-decoration:none;margin-left:1rem;font-size:.95rem}
  h1{font-size:1.5rem;margin:0 0 1.5rem}
  h2{font-size:1.15rem;margin:2rem 0 1rem}
  .stats{display:flex;gap:1rem;margin-bottom:1rem}
  .stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;
        padding:1rem 1.5rem;display:flex;flex-direction:column;gap:.25rem}
  .stat .num{font-size:1.75rem;font-weight:700}
  .stat span:last-child{color:var(--muted);font-size:.85rem}
  .grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1.25rem}
  .card h3{margin:0 0 .5rem}
  .card a{color:var(--fg);text-decoration:none}
  .card a:hover{color:var(--accent)}
  .pill{display:inline-block;padding:.2rem .6rem;border-radius:999px;
        background:rgba(255,255,255,.05);font-size:.75rem;color:var(--muted)}
</style></head>
<body>
  <header><div class="container nav">
    <a class="brand" href="/">ExpertHub</a>
    <nav>
      <a href="/courses">Courses</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/logout">Sign out</a>
    </nav>
  </div></header>
  <main><div class="container">
    <h1>Welcome, ${escapeHtml(user.name)} <span class="pill">${escapeHtml(user.role)}</span></h1>
    ${body}
  </div></main>
</body></html>`;
}

module.exports = DashboardController;
