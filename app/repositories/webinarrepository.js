const BaseRepository = require("./BaseRepository");
const Webinar = require("../models/Webinar");

class WebinarRepository extends BaseRepository {
  constructor() {
    super(Webinar);
  }
}

module.exports = new WebinarRepository();
