const loaiThietBiService = require("../services/loai_thiet_bi.service");

async function layDanhSachLoaiThietBi(req, res, next) {
  try {
    const ketQua = await loaiThietBiService.layDanhSachLoaiThietBi(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách loại thiết bị thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietLoaiThietBi(req, res, next) {
  try {
    const loaiThietBi = await loaiThietBiService.layChiTietLoaiThietBi(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy chi tiết loại thiết bị thành công",
      duLieu: loaiThietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoLoaiThietBi(req, res, next) {
  try {
    const loaiThietBi = await loaiThietBiService.taoLoaiThietBi(req.body);

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tạo loại thiết bị thành công",
      duLieu: loaiThietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatLoaiThietBi(req, res, next) {
  try {
    const loaiThietBi = await loaiThietBiService.capNhatLoaiThietBi(req.params.id, req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật loại thiết bị thành công",
      duLieu: loaiThietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachLoaiThietBi,
  layChiTietLoaiThietBi,
  taoLoaiThietBi,
  capNhatLoaiThietBi
};
