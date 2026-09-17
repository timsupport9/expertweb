const BaseRepository = require("./BaseRepository");
const Invoice = require("../models/Invoice");

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }
}

module.exports = new InvoiceRepository();
