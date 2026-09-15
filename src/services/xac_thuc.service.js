const bcrypt = require("bcryptjs");

const nguoiDungModel = require("../models/nguoi_dung.model");
const { taoToken } = require("../utils/jwt");

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

async function dangNhap(email, matKhau) {
  if (!email || !matKhau) {
    throw taoLoi("Vui lòng nhập email và mật khẩu", 400);
  }

  const emailChuanHoa = email.trim().toLowerCase();

  const nguoiDung = await nguoiDungModel.timTheoEmail(emailChuanHoa);

  if (!nguoiDung) {
    throw taoLoi("Email hoặc mật khẩu không chính xác", 401);
  }

  if (nguoiDung.trang_thai !== "HOAT_DONG") {
    throw taoLoi("Tài khoản đã ngừng hoạt động ", 403);
  }

  const matKhauDung = await bcrypt.compare(matKhau, nguoiDung.mat_khau);

  if (!matKhauDung) {
    throw taoLoi("Email hoặc mật khẩu không chính xác", 401);
  }

  const token = taoToken(nguoiDung);

  return {
    nguoiDung: {
      id: nguoiDung.id,
      hoTen: nguoiDung.ho_ten,
      email: nguoiDung.email,
      soDienThoai: nguoiDung.so_dien_thoai,
      anhDaiDien: nguoiDung.anh_dai_dien,
      vaiTro: nguoiDung.vai_tro,
      trangThai: nguoiDung.trang_thai,
    },
    token,
  };
}

async function layThongTinCaNhan(id) {
  const nguoiDung = await nguoiDungModel.timTheoId(id);

  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng", 404);
  }

  if (nguoiDung.trang_thai !== "HOAT_DONG") {
    throw taoLoi("Tài khoản ngừng hoạt động ", 403);
  }

  return {
    id: nguoiDung.id,
    hoTen: nguoiDung.ho_ten,
    email: nguoiDung.email,
    soDienThoai: nguoiDung.so_dien_thoai,
    anhDaiDien: nguoiDung.anh_dai_dien,
    vaiTro: nguoiDung.vai_tro,
    trangThai: nguoiDung.trang_thai,
    ngayTao: nguoiDung.ngay_tao,
    ngayCapNhat: nguoiDung.ngay_cap_nhat,
  };
}

module.exports = {
  dangNhap,
  layThongTinCaNhan,
};
