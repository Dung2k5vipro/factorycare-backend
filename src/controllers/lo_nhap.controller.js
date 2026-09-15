const fs = require("fs");
const path = require("path");

const loNhapService = require("../services/lo_nhap.service");

function layDuongDanFileHoaDon(fileHoaDon) {
  if (!fileHoaDon) {
    return null;
  }

  return path.relative(process.cwd(), fileHoaDon.path).replace(/\\/g, "/");
}

function xoaFileUploadNeuCo(fileHoaDon) {
  if (!fileHoaDon || !fileHoaDon.path) {
    return;
  }

  fs.unlink(fileHoaDon.path, () => {});
}

async function layDanhSachLoNhap(req, res, next) {
  try {
    const ketQua = await loNhapService.layDanhSachLoNhap(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay danh sach lo nhap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietLoNhap(req, res, next) {
  try {
    const loNhap = await loNhapService.layChiTietLoNhap(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay chi tiet lo nhap thanh cong",
      duLieu: loNhap
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoLoNhap(req, res, next) {
  try {
    const loNhap = await loNhapService.taoLoNhap(
      req.body,
      layDuongDanFileHoaDon(req.fileHoaDon)
    );

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tao lo nhap thanh cong",
      duLieu: loNhap
    });
  } catch (loi) {
    xoaFileUploadNeuCo(req.fileHoaDon);

    return next(loi);
  }
}

async function capNhatLoNhap(req, res, next) {
  try {
    const loNhap = await loNhapService.capNhatLoNhap(
      req.params.id,
      req.body,
      layDuongDanFileHoaDon(req.fileHoaDon)
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cap nhat lo nhap thanh cong",
      duLieu: loNhap
    });
  } catch (loi) {
    xoaFileUploadNeuCo(req.fileHoaDon);

    return next(loi);
  }
}

async function xoaLoNhap(req, res, next) {
  try {
    const ketQua = await loNhapService.xoaLoNhap(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Xoa lo nhap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layThietBiTheoLoNhap(req, res, next) {
  try {
    const ketQua = await loNhapService.layThietBiTheoLoNhap(req.params.id, req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay thiet bi theo lo nhap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachLoNhap,
  layChiTietLoNhap,
  taoLoNhap,
  capNhatLoNhap,
  xoaLoNhap,
  layThietBiTheoLoNhap
};
