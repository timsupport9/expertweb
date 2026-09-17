module.exports = {
  payments: {
    MpesaProvider: require("./payments/MpesaProvider"),
    PayPalProvider: require("./payments/PayPalProvider"),
    StripeProvider: require("./payments/StripeProvider")
  }
};
