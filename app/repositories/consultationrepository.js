const BaseRepository = require("./BaseRepository");
const Consultation = require("../models/Consultation");

class ConsultationRepository extends BaseRepository {
  constructor() {
    super(Consultation);
  }
}

module.exports = new ConsultationRepository();
