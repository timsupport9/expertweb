class SendNotificationJob {
  async handle(payload = {}) {
    return { job: "SendNotificationJob", status: "completed", payload };
  }
}
module.exports = new SendNotificationJob();
