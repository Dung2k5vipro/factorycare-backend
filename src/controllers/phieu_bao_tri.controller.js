const baoTriService = require("../services/bao_tri.service");

async function layDanhSachPhieu(req, res, next) {
  try {
    const ketQua = await baoTriService.layDanhSachPhieu(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách phiếu bảo trì thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layPhieuCuaToi(req, res, next) {
  try {
    const ketQua = await baoTriService.layPhieuCuaToi(
      req.query,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy công việc bảo trì của tôi thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietPhieu(req, res, next) {
  try {
    const phieuBaoTri = await baoTriService.layChiTietPhieu(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy chi tiết phiếu bảo trì thành công",
      duLieu: phieuBaoTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function batDauBaoTri(req, res, next) {
  try {
    const phieuBaoTri = await baoTriService.batDauBaoTri(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Bắt đầu bảo trì thành công",
      duLieu: phieuBaoTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatChecklist(req, res, next) {
  try {
    const phieuBaoTri = await baoTriService.capNhatChecklist(
      req.params.id,
      req.body,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật kết quả checklist thành công",
      duLieu: phieuBaoTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatKetQuaBaoTri(req, res, next) {
  try {
    const phieuBaoTri = await baoTriService.capNhatKetQuaBaoTri(
      req.params.id,
      req.body,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật kết quả bảo trì thành công",
      duLieu: phieuBaoTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function hoanThanhBaoTri(req, res, next) {
  try {
    const phieuBaoTri = await baoTriService.hoanThanhBaoTri(
      req.params.id,
      req.body,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Hoàn thành bảo trì thành công",
      duLieu: phieuBaoTri
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachSapDenHan(req, res, next) {
  try {
    const ketQua = await baoTriService.layDanhSachSapDenHan(
      req.query,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách bảo trì sắp đến hạn thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachQuaHan(req, res, next) {
  try {
    const ketQua = await baoTriService.layDanhSachQuaHan(req.nguoiDung);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách bảo trì quá hạn thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function xuLyCanhBaoBaoTri(req, res, next) {
  try {
    const ketQua = await baoTriService.xuLyCanhBaoBaoTri(req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Xử lý cảnh báo bảo trì thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachPhieu,
  layPhieuCuaToi,
  layChiTietPhieu,
  batDauBaoTri,
  capNhatChecklist,
  capNhatKetQuaBaoTri,
  hoanThanhBaoTri,
  layDanhSachSapDenHan,
  layDanhSachQuaHan,
  xuLyCanhBaoBaoTri
};
