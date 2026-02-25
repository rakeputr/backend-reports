const { Pool } = require("pg");

console.log("DB CONFIG READ:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  max: 20, 
  min: 5,
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 10000, 
  maxUses: 7500, 

  statement_timeout: 10000, 
  query_timeout: 10000,

  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on("error", (err, client) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

pool.on("connect", (client) => {
  console.log(`PostgreSQL connection established (PID: ${process.pid})`);
});

pool.on("remove", (client) => {
  console.log(`PostgreSQL connection removed (PID: ${process.pid})`);
});

pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL pool initialized successfully");
    client.release();
  })
  .catch((err) => console.error("PostgreSQL connection error:", err.message));

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing PostgreSQL pool...");
  await pool.end();
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing PostgreSQL pool...");
  await pool.end();
});

module.exports = pool;
