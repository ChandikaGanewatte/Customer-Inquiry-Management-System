
require("dotenv").config();

const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "coffee_ninja",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

async function seedStaff() {
  const { STAFF_NAME, STAFF_EMAIL, STAFF_PASSWORD } = process.env;

  if (!STAFF_NAME || !STAFF_EMAIL || !STAFF_PASSWORD) {
    throw new Error("Missing staff configuration in .env");
  }

  const passwordHash = await bcrypt.hash(STAFF_PASSWORD, 12);

  await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET
       name = EXCLUDED.name,
       password_hash = EXCLUDED.password_hash`,
    [STAFF_NAME, STAFF_EMAIL.toLowerCase(), passwordHash]
  );

  console.log("Staff account created or updated.");
  console.log("Email:", STAFF_EMAIL.toLowerCase());
}

seedStaff()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
