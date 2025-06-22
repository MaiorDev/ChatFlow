import pkg from "pg";
const { Pool } = pkg;
// Create a PostgreSQL client connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "funkyvaso",
  password: "12345678", // Replace this with your correct PostgreSQL password
  port: 5432,
});
// Connect to the database
console.log("Connected to PostgreSQL database");
// Export the pool directly so client.query will work
export default pool;
