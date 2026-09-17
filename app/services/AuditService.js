const repo = require("../repositories/AuditRepository");
class AuditService { async log(entry) { try { await repo.create(entry); } catch { /* audit must never break business flow */ } } }
module.exports = new AuditService();
