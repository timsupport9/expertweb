class Container {
  constructor() {
    this.bindings = new Map();
    this.instances = new Map();
  }

  bind(name, factory, { singleton = false } = {}) {
    if (typeof factory !== "function") {
      throw new TypeError(`Binding "${name}" must be a factory function.`);
    }
    this.bindings.set(name, { factory, singleton });
    return this;
  }

  singleton(name, factory) { return this.bind(name, factory, { singleton: true }); }

  instance(name, value) { this.instances.set(name, value); return this; }

  has(name) { return this.instances.has(name) || this.bindings.has(name); }

  make(name) {
    if (this.instances.has(name)) return this.instances.get(name);
    const b = this.bindings.get(name);
    if (!b) throw new Error(`No binding registered for "${name}".`);
    const value = b.factory(this);
    if (b.singleton) this.instances.set(name, value);
    return value;
  }
}

module.exports = Container;
