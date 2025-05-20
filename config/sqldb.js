import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db_sql = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db_sql.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
});

export default db_sql;
