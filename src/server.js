require("dotenv").config();

const app = require("./app");
const { env } = require("./config/env");
const { checkDatabaseConnection } = require("./config/database");

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    const server = app.listen(env.port, () => {
      console.log(`${env.appName} is running at ${env.appUrl}`);
    });

    server.on("error", (error) => {
      console.error("Server failed to start:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Application failed to start because database is unavailable.");
    process.exit(1);
  }
};

startServer();
