const thongBaoService = require("../services/thong_bao.service");

async function layDanhSachThongBao(req, res, next) {
  try {
    const ketQua = await thongBaoService.layDanhSachThongBao(
      req.nguoiDung.id,
      req.query
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách thông báo thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function danhDauDaDoc(req, res, next) {
  try {
    const ketQua = await thongBaoService.danhDauDaDoc(
      req.params.id,
      req.nguoiDung.id
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Đã đánh dấu thông báo là đã đọc",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function danhDauTatCaDaDoc(req, res, next) {
  try {
    const ketQua = await thongBaoService.danhDauTatCaDaDoc(req.nguoiDung.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Đã đánh dấu tất cả thông báo là đã đọc",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc
};
