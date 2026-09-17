const db = require("../config/database");

class BaseRepository {
  constructor(Model) {
    this.Model = Model;
    this.table = Model.table;
  }

  async findById(id) {
    const rows = await db.query(`SELECT * FROM \`${this.table}\` WHERE id = ? LIMIT 1`, [id]);
    return rows[0] ? new this.Model(rows[0]) : null;
  }

  async findAll({ limit = 20, offset = 0 } = {}) {
    const rows = await db.query(
      `SELECT * FROM \`${this.table}\` ORDER BY id DESC LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    return rows.map(row => new this.Model(row));
  }

  async count() {
    const rows = await db.query(`SELECT COUNT(*) AS total FROM \`${this.table}\``);
    return Number(rows[0]?.total || 0);
  }
}

module.exports = BaseRepository;
