const BaseRepository = require("./BaseRepository");
const Referral = require("../models/Referral");

class ReferralRepository extends BaseRepository {
  constructor() {
    super(Referral);
  }
}

module.exports = new ReferralRepository();
