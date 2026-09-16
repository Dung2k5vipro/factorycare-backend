const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const { xuLyKhongTimThay, xuLyLoi } = require("./middlewares/xu_ly_loi.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Máy chủ backend đang hoạt động",
    appName: process.env.APP_NAME || "QLSCvaQLBTI Backend"
  });
});

app.use("/api", routes);

app.use(xuLyKhongTimThay);
app.use(xuLyLoi);

module.exports = app;
