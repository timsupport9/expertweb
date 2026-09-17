class SMSProvider {
  async send(payload = {}) {
    return { provider: "SMSProvider", status: "not_configured", payload };
  }
}
module.exports = SMSProvider;
