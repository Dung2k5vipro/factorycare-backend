const jwt = require("jsonwebtoken");

function layJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const loi = new Error("Cấu hình xác thực chưa hợp lệ");
    loi.statusCode = 500;

    throw loi;
  }

  return process.env.JWT_SECRET;
}

function taoToken(nguoiDung) {
  return jwt.sign(
    {
      id: nguoiDung.id,
      vaiTro: nguoiDung.vai_tro
    },
    layJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
}

function xacThucToken(token) {
  return jwt.verify(token, layJwtSecret());
}

module.exports = {
  taoToken,
  xacThucToken
};
