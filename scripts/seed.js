require("dotenv").config();

const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const email = process.env.ADMIN_EMAIL || "admin@experthub.local";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

  const [existing] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    console.log(`admin already exists: ${email}`);
    await conn.end();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await conn.query(
    `INSERT INTO users (name, email, password_hash, role, is_active)
     VALUES (?, ?, ?, 'admin', 1)`,
    ["ExpertHub Admin", email, hash]
  );

  console.log(`created admin: ${email} / ${password}`);
  await conn.end();
}

run().catch((err) => { console.error(err); process.exit(1); });
