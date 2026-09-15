const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  appName: process.env.APP_NAME || "QLSCvaQLBTI Backend",
  appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: (process.env.DB_NAME || "").trim()
  }
};

module.exports = { env };
