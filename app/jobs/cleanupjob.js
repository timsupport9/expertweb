class CleanupJob {
  async handle(payload = {}) {
    return { job: "CleanupJob", status: "completed", payload };
  }
}
module.exports = new CleanupJob();
