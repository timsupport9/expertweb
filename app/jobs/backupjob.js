class BackupJob {
  async handle(payload = {}) {
    return { job: "BackupJob", status: "completed", payload };
  }
}
module.exports = new BackupJob();
