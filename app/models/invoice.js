class Invoice {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "invoices";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Invoice;
