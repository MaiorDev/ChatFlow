import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: parseInt(process.env.PGPORT), // convertir a número
  ssl: {
    rejectUnauthorized: false, // necesario para evitar errores de certificados
  },
});

export default pool;
