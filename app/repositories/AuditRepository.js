const db = require("../config/database");

class AuditRepository {
  constructor() { this.table = "audit_logs"; }

  async create({ user_id = null, action, entity = null, entity_id = null, ip = null, meta = null }) {
    return db.insert(this.table, {
      user_id, action, entity, entity_id, ip,
      meta: meta ? JSON.stringify(meta) : null,
    });
  }

  async recent(limit = 100) {
    return db.query(
      `SELECT * FROM \`${this.table}\` ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
  }
}

module.exports = AuditRepository;
