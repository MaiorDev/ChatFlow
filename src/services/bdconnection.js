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
pool.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
  } else {
    console.log("Conexión exitosa a la base de datos");
  }
});

export default pool;
