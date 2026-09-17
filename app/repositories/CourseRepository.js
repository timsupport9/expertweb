const db = require("../config/database");

class CourseRepository {
  constructor() { this.table = "courses"; }

  async findById(id) {
    return db.queryOne(`SELECT * FROM \`${this.table}\` WHERE id = ? LIMIT 1`, [id]);
  }

  async findBySlug(slug) {
    return db.queryOne(`SELECT * FROM \`${this.table}\` WHERE slug = ? LIMIT 1`, [slug]);
  }

  async published(limit = 50) {
    return db.query(
      `SELECT c.*, u.name AS instructor_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.is_published = 1
       ORDER BY c.created_at DESC
       LIMIT ?`,
      [limit]
    );
  }

  async byInstructor(instructorId) {
    return db.query(
      `SELECT * FROM \`${this.table}\` WHERE instructor_id = ? ORDER BY created_at DESC`,
      [instructorId]
    );
  }

  async create(data) { return db.insert(this.table, data); }
  async update(id, data) { return db.update(this.table, data, { id }); }
  async delete(id) { return db.delete(this.table, { id }); }

  async count() {
    const row = await db.queryOne(`SELECT COUNT(*) AS c FROM \`${this.table}\``);
    return row ? row.c : 0;
  }
}

module.exports = CourseRepository;
