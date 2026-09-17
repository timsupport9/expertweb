class EmailProvider {
  async send(payload = {}) {
    return { provider: "EmailProvider", status: "not_configured", payload };
  }
}
module.exports = EmailProvider;
