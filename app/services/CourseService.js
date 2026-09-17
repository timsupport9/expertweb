const CourseRepository = require("../repositories/CourseRepository");
const { slug: toSlug } = require("../utils/helpers");

class CourseService {
  constructor() {
    this.repo = new CourseRepository();
  }

  async list() { return this.repo.published(); }

  async get(id) {
    const c = await this.repo.findById(id);
    if (!c) throw Object.assign(new Error("Course not found"), { status: 404 });
    return c;
  }

  async getBySlug(slug) {
    const c = await this.repo.findBySlug(slug);
    if (!c) throw Object.assign(new Error("Course not found"), { status: 404 });
    return c;
  }

  async byInstructor(id) { return this.repo.byInstructor(id); }

  async create({ title, description, instructor_id, price = 0, is_published = 0 }) {
    if (!title) throw Object.assign(new Error("Title required"), { status: 422 });

    const base = toSlug(title);
    let slug = base;
    let i = 1;
    while (await this.repo.findBySlug(slug)) { slug = `${base}-${i++}`; }

    const id = await this.repo.create({
      title, slug, description, instructor_id, price, is_published,
    });
    return this.repo.findById(id);
  }

  async update(id, data) {
    await this.get(id);
    await this.repo.update(id, data);
    return this.repo.findById(id);
  }

  async delete(id) {
    await this.get(id);
    return this.repo.delete(id);
  }

  async count() { return this.repo.count(); }
}

module.exports = CourseService;
