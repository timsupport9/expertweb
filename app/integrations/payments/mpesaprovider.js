const PaymentProvider = require("./PaymentProvider");
class MpesaProvider extends PaymentProvider {
  async initiatePayment(payload) {
    return { provider: "mpesa", status: "pending", payload };
  }
  async verifyPayment(reference) {
    return { provider: "mpesa", reference, verified: false };
  }
}
module.exports = MpesaProvider;
