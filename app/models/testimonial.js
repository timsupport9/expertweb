class Testimonial {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "testimonials";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Testimonial;
