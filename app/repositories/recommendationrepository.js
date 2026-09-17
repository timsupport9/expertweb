const BaseRepository = require("./BaseRepository");
const Recommendation = require("../models/Recommendation");

class RecommendationRepository extends BaseRepository {
  constructor() {
    super(Recommendation);
  }
}

module.exports = new RecommendationRepository();
