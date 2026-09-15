const jwt = require("jsonwebtoken");
const VAI_TRO = require("../constants/roles");
function taoToken(nguoiDung) {
  return jwt.sign(
    {
      id: nguoiDung.id,
      hoTen: nguoiDung.ho_ten,
      vaiTro: nguoiDung.vai_tro,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
}
function xacThucToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  taoToken,
  xacThucToken,
};
