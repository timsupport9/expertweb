const PaymentProvider = require("./PaymentProvider");
class PayPalProvider extends PaymentProvider {
  async initiatePayment(payload) { return { provider: "paypal", status: "pending", payload }; }
  async verifyPayment(reference) { return { provider: "paypal", reference, verified: false }; }
}
module.exports = PayPalProvider;
