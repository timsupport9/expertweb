const BaseRepository = require("./BaseRepository");
const Certificate = require("../models/Certificate");

class CertificateRepository extends BaseRepository {
  constructor() {
    super(Certificate);
  }
}

module.exports = new CertificateRepository();
