class InvoiceItem {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "invoice_items";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = InvoiceItem;
