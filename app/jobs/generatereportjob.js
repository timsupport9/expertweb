class GenerateReportJob {
  async handle(payload = {}) {
    return { job: "GenerateReportJob", status: "completed", payload };
  }
}
module.exports = new GenerateReportJob();
