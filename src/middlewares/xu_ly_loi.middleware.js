const { env } = require("../config/env");

function xuLyKhongTimThay(req, res, next) {
  const loi = new Error(`Không tìm thấy API: ${req.originalUrl}`);
  loi.statusCode = 404;

  return next(loi);
}

function xuLyLoi(loi, req, res, next) {
  let maTrangThai = loi.statusCode || loi.status || 500;
  let thongBao = loi.message || "Lỗi server";

  if (loi.code === "ER_DUP_ENTRY") {
    maTrangThai = 409;
    thongBao = "Dữ liệu đã tồn tại";
  } else if (loi.type === "entity.parse.failed" || loi instanceof SyntaxError) {
    maTrangThai = 400;
    thongBao = "Dữ liệu JSON không hợp lệ";
  } else if (loi.code && String(loi.code).startsWith("ER_")) {
    maTrangThai = 500;
    thongBao = "Lỗi cơ sở dữ liệu";
  } else if (env.nodeEnv === "production" && maTrangThai === 500) {
    thongBao = "Lỗi server";
  }

  if (env.nodeEnv !== "production" && maTrangThai >= 500) {
    console.error(loi);
  }

  const phanHoi = {
    thanhCong: false,
    thongBao
  };

  if (loi.duLieu !== undefined) {
    phanHoi.duLieu = loi.duLieu;
  }

  return res.status(maTrangThai).json(phanHoi);
}

module.exports = {
  xuLyKhongTimThay,
  xuLyLoi
};
