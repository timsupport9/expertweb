require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

async function run() {
  const dir = path.join(__dirname, "..", "database", "migrations");
  if (!fs.existsSync(dir)) {
    console.warn("No migrations directory.");
    return;
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [applied] = await conn.query("SELECT name FROM migrations");
  const set = new Set(applied.map((r) => r.name));

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (set.has(file)) { console.log(`skip  ${file}`); continue; }
    console.log(`apply ${file}`);
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const stmts = sql.split(/;\s*(?:\r?\n|$)/).map((s) => s.trim()).filter(Boolean);
    for (const stmt of stmts) await conn.query(stmt);
    await conn.query("INSERT INTO migrations (name) VALUES (?)", [file]);
  }

  console.log("Migrations complete.");
  await conn.end();
}

run().catch((err) => { console.error(err); process.exit(1); });
