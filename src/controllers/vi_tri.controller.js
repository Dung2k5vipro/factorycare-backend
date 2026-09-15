const viTriService = require("../services/vi_tri.service");

async function layDanhSachViTri(req, res, next) {
  try {
    const ketQua = await viTriService.layDanhSachViTri(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay danh sach vi tri thanh cong",
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
      thongBao: "Lay cay vi tri thanh cong",
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
      thongBao: "Lay chi tiet vi tri thanh cong",
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
      thongBao: "Tao vi tri thanh cong",
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
      thongBao: "Cap nhat vi tri thanh cong",
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
      thongBao: "Xoa vi tri thanh cong",
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
