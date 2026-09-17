class BaseService {
  constructor(repository) {
    this.repository = repository;
  }

  async findById(id) {
    if (!id) throw new Error("ID is required");
    return this.repository.findById(id);
  }

  async list(options = {}) {
    return this.repository.findAll(options);
  }
}

module.exports = BaseService;
