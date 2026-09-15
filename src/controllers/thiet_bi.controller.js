const thietBiService = require("../services/thiet_bi.service");

async function layDanhSachThietBi(req, res, next) {
  try {
    const ketQua = await thietBiService.layDanhSachThietBi(req.query, req.nguoiDung);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay danh sach thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietThietBi(req, res, next) {
  try {
    const thietBi = await thietBiService.layChiTietThietBi(req.params.id, req.nguoiDung);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay chi tiet thiet bi thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoThietBi(req, res, next) {
  try {
    const thietBi = await thietBiService.taoThietBi(req.body);

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tao thiet bi thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatThietBi(req, res, next) {
  try {
    const thietBi = await thietBiService.capNhatThietBi(req.params.id, req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cap nhat thiet bi thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatTrangThai(req, res, next) {
  try {
    const { trangThai } = req.body;
    const thietBi = await thietBiService.capNhatTrangThai(req.params.id, trangThai);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cap nhat trang thai thiet bi thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function dieuChuyenThietBi(req, res, next) {
  try {
    const ketQua = await thietBiService.dieuChuyenThietBi(
      req.params.id,
      req.body,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Dieu chuyen thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layLichSuDieuChuyen(req, res, next) {
  try {
    const ketQua = await thietBiService.layLichSuDieuChuyen(req.params.id, req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay lich su dieu chuyen thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatBaoHanh(req, res, next) {
  try {
    const thietBi = await thietBiService.capNhatBaoHanh(req.params.id, req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cap nhat bao hanh thiet bi thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layBaoHanh(req, res, next) {
  try {
    const ketQua = await thietBiService.layBaoHanh(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay bao hanh thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layHealthScore(req, res, next) {
  try {
    const ketQua = await thietBiService.layHealthScore(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay health score thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layTimelineThietBi(req, res, next) {
  try {
    const ketQua = await thietBiService.layTimelineThietBi(req.params.id, req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay timeline thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layQrThietBi(req, res, next) {
  try {
    const ketQua = await thietBiService.layQrThietBi(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay QR thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layThietBiTheoQr(req, res, next) {
  try {
    const thietBi = await thietBiService.layThietBiTheoQr(req.params.maQr, req.nguoiDung);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lay thiet bi tu QR thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function quetQrThietBi(req, res, next) {
  try {
    const noiDungQr = req.body.noiDungQr || req.body.maQr;
    const thietBi = await thietBiService.layThietBiTheoQr(noiDungQr, req.nguoiDung);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Quet QR thiet bi thanh cong",
      duLieu: thietBi
    });
  } catch (loi) {
    return next(loi);
  }
}

async function previewImportThietBi(req, res, next) {
  try {
    const ketQua = await thietBiService.previewImportThietBi(req.file);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Preview import thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function importThietBi(req, res, next) {
  try {
    const ketQua = await thietBiService.importThietBi({
      tep: req.file,
      body: req.body
    });

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Import thiet bi thanh cong",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachThietBi,
  layChiTietThietBi,
  taoThietBi,
  capNhatThietBi,
  capNhatTrangThai,
  dieuChuyenThietBi,
  layLichSuDieuChuyen,
  layBaoHanh,
  capNhatBaoHanh,
  layHealthScore,
  layTimelineThietBi,
  layQrThietBi,
  layThietBiTheoQr,
  quetQrThietBi,
  previewImportThietBi,
  importThietBi
};
