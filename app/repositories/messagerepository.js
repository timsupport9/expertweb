const BaseRepository = require("./BaseRepository");
const Message = require("../models/Message");

class MessageRepository extends BaseRepository {
  constructor() {
    super(Message);
  }
}

module.exports = new MessageRepository();
