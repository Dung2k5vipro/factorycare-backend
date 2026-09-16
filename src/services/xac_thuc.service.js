const bcrypt = require("bcryptjs");

const { pool } = require("../config/database");
const VAI_TRO = require("../constants/vai_tro");
const nguoiDungModel = require("../models/nguoi_dung.model");
const nguoiDungService = require("./nguoi_dung.service");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const { taoToken } = require("../utils/jwt");

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

function dinhDangNguoiDung(nguoiDung) {
  return {
    id: nguoiDung.id,
    hoTen: nguoiDung.ho_ten,
    email: nguoiDung.email,
    soDienThoai: nguoiDung.so_dien_thoai,
    anhDaiDien: nguoiDung.anh_dai_dien,
    vaiTro: nguoiDung.vai_tro,
    trangThai: nguoiDung.trang_thai,
    ngayTao: nguoiDung.ngay_tao,
    ngayCapNhat: nguoiDung.ngay_cap_nhat
  };
}

async function dangNhap(email, matKhau) {
  if (
    typeof email !== "string" ||
    typeof matKhau !== "string" ||
    email.trim() === "" ||
    matKhau.trim() === ""
  ) {
    throw taoLoi("Vui lòng nhập email và mật khẩu", 400);
  }

  const emailChuanHoa = email.trim().toLowerCase();

  const nguoiDung = await nguoiDungModel.timTheoEmail(emailChuanHoa);

  if (!nguoiDung) {
    throw taoLoi("Email hoặc mật khẩu không chính xác", 401);
  }

  if (nguoiDung.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG) {
    throw taoLoi("Tài khoản đã ngừng hoạt động", 403);
  }

  const matKhauDung = await bcrypt.compare(matKhau, nguoiDung.mat_khau);

  if (!matKhauDung) {
    throw taoLoi("Email hoặc mật khẩu không chính xác", 401);
  }

  const token = taoToken(nguoiDung);

  return {
    nguoiDung: dinhDangNguoiDung(nguoiDung),
    token
  };
}

async function layThongTinCaNhan(id) {
  const nguoiDung = await nguoiDungModel.timTheoId(id);

  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng", 404);
  }

  if (nguoiDung.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG) {
    throw taoLoi("Tài khoản đã ngừng hoạt động", 403);
  }

  return dinhDangNguoiDung(nguoiDung);
}

async function khoiTaoQuanTriVienDauTien(duLieu) {
  const tenKhoa = "factorycare:khoi_tao_admin_dau_tien";
  const connection = await pool.getConnection();
  let daKhoa = false;

  try {
    daKhoa = await nguoiDungModel.khoaKhoiTaoAdminDauTien(connection, tenKhoa);

    if (!daKhoa) {
      throw taoLoi("Hệ thống đang khởi tạo quản trị viên, vui lòng thử lại", 409);
    }

    const tongNguoiDung = await nguoiDungModel.demTongTatCaNguoiDung(connection);

    if (tongNguoiDung > 0) {
      throw taoLoi("Hệ thống đã có tài khoản, vui lòng đăng nhập bằng quản trị viên hiện có", 409);
    }

    const nguoiDung = await nguoiDungService.taoNguoiDung({
      ...duLieu,
      vaiTro: VAI_TRO.QUAN_TRI_VIEN
    });

    return nguoiDung;
  } finally {
    if (daKhoa) {
      try {
        await nguoiDungModel.moKhoaKhoiTaoAdminDauTien(connection, tenKhoa);
      } catch (loi) {
        // Khong ghi de loi nghiep vu chinh khi chi loi mo khoa.
      }
    }

    connection.release();
  }
}

module.exports = {
  dangNhap,
  layThongTinCaNhan,
  khoiTaoQuanTriVienDauTien
};
