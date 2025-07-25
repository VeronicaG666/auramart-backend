require("dotenv").config();
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env file");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

pool
  .connect()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

module.exports = pool;
