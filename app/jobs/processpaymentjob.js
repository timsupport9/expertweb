class ProcessPaymentJob {
  async handle(payload = {}) {
    return { job: "ProcessPaymentJob", status: "completed", payload };
  }
}
module.exports = new ProcessPaymentJob();
