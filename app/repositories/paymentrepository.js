const BaseRepository = require("./BaseRepository");
const Payment = require("../models/Payment");

class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }
}

module.exports = new PaymentRepository();
