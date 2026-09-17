const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

class Auth {
  constructor(container) { this.container = container; }

  get userRepo() { return this.container.make("UserRepository"); }

  async hash(password) { return bcrypt.hash(password, SALT_ROUNDS); }
  async verify(password, hash) { return bcrypt.compare(password, hash); }

  async attempt(email, password) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return null;
    if (!user.is_active) return null;
    const ok = await this.verify(password, user.password_hash);
    if (!ok) return null;
    return user;
  }

  async register({ name, email, password, role = "student" }) {
    const hash = await this.hash(password);
    const id = await this.userRepo.create({ name, email, password_hash: hash, role });
    return this.userRepo.findById(id);
  }

  login(req, user) {
    return new Promise((resolve, reject) => {
      if (!req.session) return reject(new Error("No session on request"));
      req.session.regenerate((err) => {
        if (err) return reject(err);
        req.session.user = {
          id: user.id, name: user.name, email: user.email, role: user.role,
        };
        resolve();
      });
    });
  }

  logout(req) {
    return new Promise((resolve) => {
      if (!req.session) return resolve();
      req.session.destroy(() => resolve());
    });
  }
}

module.exports = Auth;
