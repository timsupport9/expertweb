class SendEmailJob {
  async handle(payload = {}) {
    return { job: "SendEmailJob", status: "completed", payload };
  }
}
module.exports = new SendEmailJob();
