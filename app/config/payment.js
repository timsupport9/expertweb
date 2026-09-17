module.exports = {
  currency: process.env.CURRENCY || "KES",
  mpesa: {
    environment: process.env.MPESA_ENV || "sandbox",
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY
  }
};
