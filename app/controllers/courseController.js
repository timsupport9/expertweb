const courseService = require("../services/CourseService");
const { escapeHtml } = require("../utils/helpers");

class CourseController {
  static async index(req, res, next) {
    try {
      const courses = await courseService.list();

      res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Courses · ExpertHub</title>
<style>
  :root{--bg:#0b1220;--fg:#e6ecff;--accent:#4c8dff;--muted:rgba(230,236,255,.6);--line:rgba(255,255,255,.08);--panel:rgba(255,255,255,.03)}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100vh;background:var(--bg);color:var(--fg);
            font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .container{max-width:1100px;margin:0 auto;padding:2rem 1.25rem}
  h1{margin:0 0 1.5rem}
  .grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:1.25rem}
  .card h2{font-size:1.1rem;margin:0 0 .5rem}
  .card a{color:var(--fg);text-decoration:none}
  .card a:hover{color:var(--accent)}
  .pill{display:inline-block;padding:.2rem .6rem;border-radius:999px;
        background:rgba(255,255,255,.05);font-size:.75rem;color:var(--muted)}
  .muted{color:var(--muted)}
</style></head>
<body><div class="container">
  <h1>Courses</h1>
  <div class="grid">
    ${courses.length
      ? courses.map((c) => `
        <div class="card">
          <h2><a href="/courses/${escapeHtml(c.slug)}">${escapeHtml(c.title)}</a></h2>
          <p class="muted">${escapeHtml((c.description || "").slice(0, 140))}</p>
          <span class="pill">KSh ${Number(c.price).toFixed(2)}</span>
        </div>`).join("")
      : `<p class="muted">No courses published yet.</p>`}
  </div>
</div></body></html>`);
    } catch (err) { next(err); }
  }

  static async show(req, res, next) {
    try {
      const course = await courseService.getBySlug(req.params.slug);

      res.type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(course.title)} · ExpertHub</title>
<style>
  :root{--bg:#0b1220;--fg:#e6ecff;--accent:#4c8dff;--muted:rgba(230,236,255,.6);--line:rgba(255,255,255,.08)}
  *{box-sizing:border-box}
  html,body{margin:0;min-height:100vh;background:var(--bg);color:var(--fg);
            font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
  .container{max-width:720px;margin:0 auto;padding:3rem 1.25rem}
  h1{margin:0 0 1rem;font-size:2rem}
  .pill{display:inline-block;padding:.25rem .7rem;border-radius:999px;
        background:rgba(76,141,255,.15);color:var(--accent);font-size:.85rem}
  .muted{color:var(--muted)}
  a{color:var(--accent);text-decoration:none}
</style></head>
<body><div class="container">
  <p><a href="/courses">← All courses</a></p>
  <h1>${escapeHtml(course.title)}</h1>
  <p><span class="pill">KSh ${Number(course.price).toFixed(2)}</span></p>
  <p>${escapeHtml(course.description || "No description yet.")}</p>
</div></body></html>`);
    } catch (err) { next(err); }
  }

  static async listJson(req, res, next) {
    try {
      const courses = await courseService.list();
      res.json({ success: true, data: courses });
    } catch (err) { next(err); }
  }

  static async create(req, res, next) {
    try {
      const { title, description, price = 0, is_published = 0 } = req.body || {};
      const course = await courseService.create({
        title, description,
        instructor_id: req.user.id,
        price: Number(price) || 0,
        is_published: Number(is_published) ? 1 : 0,
      });
      res.redirect(`/courses/${course.slug}`);
    } catch (err) { next(err); }
  }
}

module.exports = CourseController;
