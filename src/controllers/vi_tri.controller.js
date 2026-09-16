const viTriService = require("../services/vi_tri.service");

async function layDanhSachViTri(req, res, next) {
  try {
    const ketQua = await viTriService.layDanhSachViTri(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách vị trí thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layCayViTri(req, res, next) {
  try {
    const ketQua = await viTriService.layCayViTri();

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy cây vị trí thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietViTri(req, res, next) {
  try {
    const viTri = await viTriService.layChiTietViTri(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy chi tiết vị trí thành công",
      duLieu: viTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoViTri(req, res, next) {
  try {
    const viTri = await viTriService.taoViTri(req.body);

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tạo vị trí thành công",
      duLieu: viTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatViTri(req, res, next) {
  try {
    const viTri = await viTriService.capNhatViTri(req.params.id, req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật vị trí thành công",
      duLieu: viTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function xoaViTri(req, res, next) {
  try {
    const ketQua = await viTriService.xoaViTri(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Xóa vị trí thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachViTri,
  layCayViTri,
  layChiTietViTri,
  taoViTri,
  capNhatViTri,
  xoaViTri
};
