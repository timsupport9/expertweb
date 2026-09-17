const db = require("../config/database");

class UserRepository {
  constructor() { this.table = "users"; }

  async findById(id) {
    return db.queryOne(`SELECT * FROM \`${this.table}\` WHERE id = ? LIMIT 1`, [id]);
  }

  async findByEmail(email) {
    if (!email) return null;
    return db.queryOne(
      `SELECT * FROM \`${this.table}\` WHERE email = ? LIMIT 1`,
      [String(email).toLowerCase().trim()]
    );
  }

  async create(data) {
    return db.insert(this.table, {
      name: data.name,
      email: String(data.email).toLowerCase().trim(),
      password_hash: data.password_hash,
      role: data.role || "student",
      is_active: 1,
    });
  }

  async update(id, data) { return db.update(this.table, data, { id }); }
  async delete(id) { return db.delete(this.table, { id }); }

  async all(limit = 100) {
    return db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM \`${this.table}\` ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
  }
}

module.exports = UserRepository;
