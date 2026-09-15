const loaiThietBiService = require("../services/loai_thiet_bi.service");

async function layDanhSachLoaiThietBi(req, res, next) {
  try {
    const ketQua = await loaiThietBiService.layDanhSachLoaiThietBi(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay danh sach loai thiet bi thanh cong",
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
      thongBao: "Lay chi tiet loai thiet bi thanh cong",
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
      thongBao: "Tao loai thiet bi thanh cong",
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
      thongBao: "Cap nhat loai thiet bi thanh cong",
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
