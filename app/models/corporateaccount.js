class CorporateAccount {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "corporate_accounts";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = CorporateAccount;
