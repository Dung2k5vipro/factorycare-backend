const VAI_TRO = require("../constants/vai_tro");

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

function phanQuyen(...danhSachVaiTro) {
  return (req, res, next) => {
    if (!req.nguoiDung) {
      return next(taoLoi("Vui lòng đăng nhập", 401));
    }

    const danhSachVaiTroHopLe = Object.values(VAI_TRO);
    const coVaiTroKhongHopLe = danhSachVaiTro.some(
      (vaiTro) => !danhSachVaiTroHopLe.includes(vaiTro)
    );

    if (coVaiTroKhongHopLe) {
      return next(taoLoi("Cấu hình phân quyền không hợp lệ", 500));
    }

    if (!danhSachVaiTro.includes(req.nguoiDung.vaiTro)) {
      return next(taoLoi("Không có quyền truy cập", 403));
    }

    return next();
  };
}

module.exports = {
  phanQuyen
};
