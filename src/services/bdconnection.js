import pkg from "pg";
const { Pool } = pkg;

// Configuración para Railway (usando DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_RAILWAY,
  // Opcional: configuración adicional para SSL si es necesario
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
