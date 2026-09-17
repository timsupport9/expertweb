class PaymentListener {
  async handle(event) {
    return { handled: true, listener: "PaymentListener", event };
  }
}
module.exports = new PaymentListener();
