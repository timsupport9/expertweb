const PaymentProvider = require("./PaymentProvider");
class StripeProvider extends PaymentProvider {
  async initiatePayment(payload) { return { provider: "stripe", status: "pending", payload }; }
  async verifyPayment(reference) { return { provider: "stripe", reference, verified: false }; }
}
module.exports = StripeProvider;
