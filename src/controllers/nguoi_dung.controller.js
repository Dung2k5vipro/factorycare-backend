const nguoiDungService = require("../services/nguoi_dung.service");

async function layDanhSachNguoiDung(req, res, next) {
  try {
    const ketQua = await nguoiDungService.layDanhSachNguoiDung(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy danh sách người dùng thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietNguoiDung(req, res, next) {
  try {
    const nguoiDung = await nguoiDungService.layChiTietNguoiDung(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy chi tiết người dùng thành công",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

async function taoNguoiDung(req, res, next) {
  try {
    const nguoiDung = await nguoiDungService.taoNguoiDung(req.body);

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Tạo người dùng thành công",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatNguoiDung(req, res, next) {
  try {
    const nguoiDung = await nguoiDungService.capNhatNguoiDung(req.params.id, req.body);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật người dùng thành công",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatTrangThai(req, res, next) {
  try {
    const { trangThai } = req.body;
    const nguoiDung = await nguoiDungService.capNhatTrangThai(req.params.id, trangThai);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Cập nhật trạng thái người dùng thành công",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

async function doiMatKhau(req, res, next) {
  try {
    const { matKhauCu, matKhauMoi } = req.body;
    const nguoiDung = await nguoiDungService.doiMatKhau(
      req.nguoiDung.id,
      matKhauCu,
      matKhauMoi
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Đổi mật khẩu thành công",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layDanhSachNguoiDung,
  layChiTietNguoiDung,
  taoNguoiDung,
  capNhatNguoiDung,
  capNhatTrangThai,
  doiMatKhau
};
