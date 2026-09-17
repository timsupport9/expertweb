class AuditLog {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "audit_logs";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = AuditLog;
