class Referral {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "referrals";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Referral;
