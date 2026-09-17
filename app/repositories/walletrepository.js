const BaseRepository = require("./BaseRepository");
const Wallet = require("../models/Wallet");

class WalletRepository extends BaseRepository {
  constructor() {
    super(Wallet);
  }
}

module.exports = new WalletRepository();
