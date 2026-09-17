const BaseRepository = require("./BaseRepository");
const Expert = require("../models/Expert");

class ExpertRepository extends BaseRepository {
  constructor() {
    super(Expert);
  }
}

module.exports = new ExpertRepository();
