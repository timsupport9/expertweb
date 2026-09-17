const BaseRepository = require("./BaseRepository");
const CorporateAccount = require("../models/CorporateAccount");

class CorporateRepository extends BaseRepository {
  constructor() {
    super(CorporateAccount);
  }
}

module.exports = new CorporateRepository();
