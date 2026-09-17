const BaseRepository = require("./BaseRepository");
const AnalyticsEvent = require("../models/AnalyticsEvent");

class AnalyticsRepository extends BaseRepository {
  constructor() {
    super(AnalyticsEvent);
  }
}

module.exports = new AnalyticsRepository();
