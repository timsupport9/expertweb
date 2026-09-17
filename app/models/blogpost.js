class BlogPost {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "blog_posts";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = BlogPost;
