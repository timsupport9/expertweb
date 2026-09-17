const BaseRepository = require("./BaseRepository");
const Subscription = require("../models/Subscription");

class SubscriptionRepository extends BaseRepository {
  constructor() {
    super(Subscription);
  }
}

module.exports = new SubscriptionRepository();
