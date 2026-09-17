const BaseRepository = require("./BaseRepository");
const Quiz = require("../models/Quiz");

class QuizRepository extends BaseRepository {
  constructor() {
    super(Quiz);
  }
}

module.exports = new QuizRepository();
