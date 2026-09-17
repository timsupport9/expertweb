const Auth = require("../utils/Auth");
const audit = require("./AuditService");
const userRepo = require("../repositories/UserRepository");
class AuthService {
  constructor() { this.auth = new Auth({ make: (name) => { if (name === "UserRepository") return userRepo; throw new Error(`Unknown binding: ${name}`); } }); }
  async register({ name, email, password, role = "student" }, ip = null) { if (!name || !email || !password) throw Object.assign(new Error("Name, email and password are required."), { status: 422 }); if (password.length < 8) throw Object.assign(new Error("Password must be at least 8 characters."), { status: 422 }); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error("Invalid email address."), { status: 422 }); if (await userRepo.findByEmail(email)) throw Object.assign(new Error("Email already registered."), { status: 409 }); const user = await this.auth.register({ name, email, password, role }); await audit.log({ user_id: user.id, action: "user.registered", entity: "user", entity_id: user.id, ip }); return user; }
  async login({ email, password }, ip = null) { if (!email || !password) throw Object.assign(new Error("Email and password are required."), { status: 422 }); const user = await this.auth.attempt(email, password); if (!user) throw Object.assign(new Error("Invalid credentials."), { status: 401 }); await audit.log({ user_id: user.id, action: "user.login", entity: "user", entity_id: user.id, ip }); return user; }
}
module.exports = new AuthService();
