const mauChecklistService = require("../services/mau_checklist.service");

async function layDanhSachMauChecklist(req, res, next) {
  try {
    const ketQua = await mauChecklistService.layDanhSachMauChecklist(req.query);
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách mẫu checklist thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietMauChecklist(req, res, next) {
  try {
    const mauChecklist = await mauChecklistService.layChiTietMauChecklist(
      req.params.id
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy chi tiết mẫu checklist thành công",
      duLieu: mauChecklist
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoMauChecklist(req, res, next) {
  try {
    const mauChecklist = await mauChecklistService.taoMauChecklist(
      req.body,
      req.nguoiDung
    );
    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tạo mẫu checklist thành công",
      duLieu: mauChecklist
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatMauChecklist(req, res, next) {
  try {
    const mauChecklist = await mauChecklistService.capNhatMauChecklist(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật mẫu checklist thành công",
      duLieu: mauChecklist
    });
  } catch (loi) {
    return next(loi);
  }
}

async function ngungHoatDongMauChecklist(req, res, next) {
  try {
    const mauChecklist = await mauChecklistService.ngungHoatDongMauChecklist(
      req.params.id
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Ngừng hoạt động mẫu checklist thành công",
      duLieu: mauChecklist
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachMauChecklist,
  layChiTietMauChecklist,
  taoMauChecklist,
  capNhatMauChecklist,
  ngungHoatDongMauChecklist
};
