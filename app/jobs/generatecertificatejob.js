class GenerateCertificateJob {
  async handle(payload = {}) {
    return { job: "GenerateCertificateJob", status: "completed", payload };
  }
}
module.exports = new GenerateCertificateJob();
