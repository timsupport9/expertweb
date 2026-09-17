const BaseRepository = require("./BaseRepository");
const Event = require("../models/Event");

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }
}

module.exports = new EventRepository();
