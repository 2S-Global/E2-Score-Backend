// config/sqldb.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

if (!global._mysqlPool) {
  global._mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  });

  // Add debugging listeners here
  global._mysqlPool.on("acquire", function (connection) {
    console.log("MySQL → Connection %d acquired", connection.threadId);
  });

  global._mysqlPool.on("release", function (connection) {
    console.log("MySQL → Connection %d released", connection.threadId);
  });
}

pool = global._mysqlPool;

export default pool;
