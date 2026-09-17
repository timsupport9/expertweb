class Wallet {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "wallets";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Wallet;
