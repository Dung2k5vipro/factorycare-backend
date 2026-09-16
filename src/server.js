require("dotenv").config();

const app = require("./app");
const { env } = require("./config/env");
const { checkDatabaseConnection } = require("./config/database");

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    const server = app.listen(env.port, () => {
      console.log(`${env.appName} đang hoạt động tại ${env.appUrl}`);
    });

    server.on("error", (error) => {
      console.error("Không thể khởi động máy chủ:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Không thể khởi động ứng dụng vì cơ sở dữ liệu không khả dụng.");
    process.exit(1);
  }
};

startServer();
