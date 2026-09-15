const xacThucService = require("../services/xac_thuc.service");

async function dangNhap(req, res, next) {
  try {
    const { email, matKhau } = req.body;
    const ketQua = await xacThucService.dangNhap(email, matKhau);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Đăng nhập thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function khoiTaoQuanTriVienDauTien(req, res, next) {
  try {
    const nguoiDung = await xacThucService.khoiTaoQuanTriVienDauTien(req.body);

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Khoi tao quan tri vien dau tien thanh cong",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layThongTinCaNhan(req, res, next) {
  try {
    const nguoiDung = await xacThucService.layThongTinCaNhan(req.nguoiDung.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy thông tin cá nhân thành công",
      duLieu: nguoiDung
    });
  } catch (loi) {
    return next(loi);
  }
}

async function dangXuat(req, res, next) {
  try {
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Đăng xuất thành công",
      duLieu: null
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  dangNhap,
  khoiTaoQuanTriVienDauTien,
  layThongTinCaNhan,
  dangXuat
};
