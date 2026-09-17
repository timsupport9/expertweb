const jwt = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/password");
const userRepository = require("../repositories/UserRepository");

class AuthService {
  async register({ name, email, password, role = "student" }) {
    if (!name || !email || !password) throw new Error("Name, email and password are required");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");

    const passwordHash = await hashPassword(password);
    // The existing database schema determines the final INSERT implementation.
    const user = { name, email: email.toLowerCase().trim(), passwordHash, role };
    return user;
  }

  async authenticate(user, password) {
    if (!user?.password_hash && !user?.passwordHash) throw new Error("Invalid credentials");
    const valid = await verifyPassword(password, user.password_hash || user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles || (user.role ? [user.role] : [])
    };
    return { user, token: jwt.sign(payload) };
  }
}

module.exports = new AuthService();
