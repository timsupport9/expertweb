const BaseRepository = require("./BaseRepository");
const Role = require("../models/Role");

class RoleRepository extends BaseRepository {
  constructor() {
    super(Role);
  }
}

module.exports = new RoleRepository();
