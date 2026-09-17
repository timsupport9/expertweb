const BaseRepository = require("./BaseRepository");
const BlogPost = require("../models/BlogPost");

class ContentRepository extends BaseRepository {
  constructor() {
    super(BlogPost);
  }
}

module.exports = new ContentRepository();
