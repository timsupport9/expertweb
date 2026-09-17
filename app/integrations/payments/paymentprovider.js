class PaymentProvider {
  async initiatePayment() { throw new Error("initiatePayment() must be implemented"); }
  async verifyPayment() { throw new Error("verifyPayment() must be implemented"); }
  async refundPayment() { throw new Error("refundPayment() must be implemented"); }
}
module.exports = PaymentProvider;
