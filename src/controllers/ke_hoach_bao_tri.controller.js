const keHoachBaoTriService = require("../services/ke_hoach_bao_tri.service");

async function layDanhSachKeHoach(req, res, next) {
  try {
    const ketQua = await keHoachBaoTriService.layDanhSachKeHoach(req.query);
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách kế hoạch bảo trì thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietKeHoach(req, res, next) {
  try {
    const keHoach = await keHoachBaoTriService.layChiTietKeHoach(req.params.id);
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy chi tiết kế hoạch bảo trì thành công",
      duLieu: keHoach
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoKeHoach(req, res, next) {
  try {
    const keHoach = await keHoachBaoTriService.taoKeHoach(req.body);
    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tạo kế hoạch bảo trì thành công",
      duLieu: keHoach
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatKeHoach(req, res, next) {
  try {
    const keHoach = await keHoachBaoTriService.capNhatKeHoach(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật kế hoạch bảo trì thành công",
      duLieu: keHoach
    });
  } catch (loi) {
    return next(loi);
  }
}

async function ngungHoatDongKeHoach(req, res, next) {
  try {
    const keHoach = await keHoachBaoTriService.ngungHoatDongKeHoach(
      req.params.id
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Ngừng hoạt động kế hoạch bảo trì thành công",
      duLieu: keHoach
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachKeHoach,
  layChiTietKeHoach,
  taoKeHoach,
  capNhatKeHoach,
  ngungHoatDongKeHoach
};
