class WalletTransaction {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "wallet_transactions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = WalletTransaction;
