class SendSMSJob {
  async handle(payload = {}) {
    return { job: "SendSMSJob", status: "completed", payload };
  }
}
module.exports = new SendSMSJob();
