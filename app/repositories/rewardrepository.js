const BaseRepository = require("./BaseRepository");
const RewardTransaction = require("../models/RewardTransaction");

class RewardRepository extends BaseRepository {
  constructor() {
    super(RewardTransaction);
  }
}

module.exports = new RewardRepository();
