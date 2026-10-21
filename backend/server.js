
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");


if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json({ limit: "20kb" }));

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "coffee_ninja",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
});

app.get("/", (req, res) => {
  res.json({ message: "Coffee Ninja API is running" });
});

app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      connected: true,
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      connected: false,
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/inquiries", require("./routes/inquiries"));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
