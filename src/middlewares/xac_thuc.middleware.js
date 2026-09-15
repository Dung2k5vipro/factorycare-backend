const nguoiDungModel = require("../models/nguoi_dung.model");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const { xacThucToken } = require("../utils/jwt");

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

function layTokenTuTieuDe(req) {
  const tieuDeXacThuc = req.headers.authorization;

  if (!tieuDeXacThuc) {
    throw taoLoi("Vui lòng đăng nhập để tiếp tục", 401);
  }

  const [loaiToken, token] = tieuDeXacThuc.split(" ");

  if (loaiToken !== "Bearer" || !token) {
    throw taoLoi("Phiên đăng nhập không hợp lệ", 401);
  }

  return token;
}

async function xacThuc(req, res, next) {
  try {
    const token = layTokenTuTieuDe(req);
    const duLieuToken = xacThucToken(token);

    if (!duLieuToken.id) {
      throw taoLoi("Phiên đăng nhập không hợp lệ", 401);
    }

    const nguoiDung = await nguoiDungModel.timTheoId(duLieuToken.id);

    if (!nguoiDung) {
      throw taoLoi("Phiên đăng nhập không hợp lệ", 401);
    }

    if (nguoiDung.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG) {
      throw taoLoi("Tài khoản đã ngừng hoạt động", 403);
    }

    req.nguoiDung = {
      id: nguoiDung.id,
      hoTen: nguoiDung.ho_ten,
      email: nguoiDung.email,
      vaiTro: nguoiDung.vai_tro,
      trangThai: nguoiDung.trang_thai
    };

    return next();
  } catch (loi) {
    if (loi.name === "TokenExpiredError") {
      return next(taoLoi("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", 401));
    }

    if (loi.name === "JsonWebTokenError") {
      return next(taoLoi("Phiên đăng nhập không hợp lệ", 401));
    }

    return next(loi);
  }
}

module.exports = {
  xacThuc
};
