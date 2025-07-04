import pkg from "pg";
const { Pool } = pkg;

// Configuración para Railway (usando DATABASE_URL)
const pool = new Pool({
  user: process.env.DB_NAME || "postgres",
  password: process.env.DB_PASSWORD || "12345678",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 6599,
  database: process.env.DB_DATABASE || "funkyvaso",
  connectionString: process.env.DATABASE_URL,
});

export default pool;
