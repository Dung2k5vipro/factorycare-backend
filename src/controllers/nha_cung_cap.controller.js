const nhaCungCapService = require("../services/nha_cung_cap.service");

async function layDanhSachNhaCungCap(req, res, next) {
  try {
    const ketQua = await nhaCungCapService.layDanhSachNhaCungCap(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay danh sach nha cung cap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietNhaCungCap(req, res, next) {
  try {
    const nhaCungCap = await nhaCungCapService.layChiTietNhaCungCap(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay chi tiet nha cung cap thanh cong",
      duLieu: nhaCungCap
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoNhaCungCap(req, res, next) {
  try {
    const nhaCungCap = await nhaCungCapService.taoNhaCungCap(req.body);

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tao nha cung cap thanh cong",
      duLieu: nhaCungCap
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatNhaCungCap(req, res, next) {
  try {
    const nhaCungCap = await nhaCungCapService.capNhatNhaCungCap(req.params.id, req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cap nhat nha cung cap thanh cong",
      duLieu: nhaCungCap
    });
  } catch (loi) {
    return next(loi);
  }
}

async function xoaNhaCungCap(req, res, next) {
  try {
    const ketQua = await nhaCungCapService.xoaNhaCungCap(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Xoa nha cung cap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layLoNhapTheoNhaCungCap(req, res, next) {
  try {
    const ketQua = await nhaCungCapService.layLoNhapTheoNhaCungCap(req.params.id, req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay lo nhap theo nha cung cap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layThietBiTheoNhaCungCap(req, res, next) {
  try {
    const ketQua = await nhaCungCapService.layThietBiTheoNhaCungCap(req.params.id, req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay thiet bi theo nha cung cap thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachNhaCungCap,
  layChiTietNhaCungCap,
  taoNhaCungCap,
  capNhatNhaCungCap,
  xoaNhaCungCap,
  layLoNhapTheoNhaCungCap,
  layThietBiTheoNhaCungCap
};
