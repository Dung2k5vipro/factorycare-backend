const mysql = require("mysql2/promise");

const { env } = require("./env");

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const checkDatabaseConnection = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1 AS connected");
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  pool,
  checkDatabaseConnection
};
