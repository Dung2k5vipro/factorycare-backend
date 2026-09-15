const bcrypt = require("bcryptjs");

const VAI_TRO = require("../constants/vai_tro");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const nguoiDungModel = require("../models/nguoi_dung.model");

const SO_VONG_BAM_MAT_KHAU = 10;

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

function chuanHoaEmail(email) {
  return String(email).trim().toLowerCase();
}

function kiemTraIdHopLe(id) {
  const idDaChuyen = Number(id);

  return Number.isInteger(idDaChuyen) && idDaChuyen > 0;
}

function layIdHopLe(id) {
  if (!kiemTraIdHopLe(id)) {
    throw taoLoi("Id người dùng không hợp lệ", 400);
  }

  return Number(id);
}

function kiemTraChuoiBatBuoc(giaTri, tenTruong) {
  if (typeof giaTri !== "string" || giaTri.trim() === "") {
    throw taoLoi(`${tenTruong} không được để trống`, 400);
  }
}

function kiemTraEmailHopLe(email) {
  kiemTraChuoiBatBuoc(email, "Email");

  const emailChuanHoa = chuanHoaEmail(email);
  const bieuThucEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!bieuThucEmail.test(emailChuanHoa)) {
    throw taoLoi("Email không hợp lệ", 400);
  }

  return emailChuanHoa;
}

function kiemTraVaiTroHopLe(vaiTro) {
  const danhSachVaiTroHopLe = Object.values(VAI_TRO);

  if (!danhSachVaiTroHopLe.includes(vaiTro)) {
    throw taoLoi("Vai trò không hợp lệ", 400);
  }
}

function kiemTraTrangThaiHopLe(trangThai) {
  const danhSachTrangThaiHopLe = Object.values(TRANG_THAI_NGUOI_DUNG);

  if (!danhSachTrangThaiHopLe.includes(trangThai)) {
    throw taoLoi("Trạng thái tài khoản không hợp lệ", 400);
  }
}

async function layDanhSachNguoiDung({
  trang = 1,
  gioiHan = 10,
  tuKhoa = "",
  vaiTro = null,
  trangThai = null
} = {}) {
  const trangHienTai = Number(trang);
  const soBanGhiMoiTrang = Number(gioiHan);

  if (!Number.isInteger(trangHienTai) || trangHienTai < 1) {
    throw taoLoi("Trang không hợp lệ", 400);
  }

  if (!Number.isInteger(soBanGhiMoiTrang) || soBanGhiMoiTrang < 1) {
    throw taoLoi("Giới hạn không hợp lệ", 400);
  }

  if (vaiTro) {
    kiemTraVaiTroHopLe(vaiTro);
  }

  if (trangThai) {
    kiemTraTrangThaiHopLe(trangThai);
  }

  const tuKhoaTimKiem = typeof tuKhoa === "string" ? tuKhoa.trim() : "";
  const boQua = (trangHienTai - 1) * soBanGhiMoiTrang;

  const dieuKienLoc = {
    tuKhoa: tuKhoaTimKiem,
    vaiTro,
    trangThai
  };

  const [danhSachNguoiDung, tongBanGhi] = await Promise.all([
    nguoiDungModel.layDanhSachNguoiDung({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    nguoiDungModel.demTongNguoiDung(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachNguoiDung.map(dinhDangNguoiDung),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layChiTietNguoiDung(id) {
  const nguoiDungId = layIdHopLe(id);
  const nguoiDung = await nguoiDungModel.timTheoId(nguoiDungId);

  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng", 404);
  }

  return dinhDangNguoiDung(nguoiDung);
}

async function taoNguoiDung(duLieu) {
  const {
    hoTen,
    email,
    matKhau,
    soDienThoai = null,
    anhDaiDien = null,
    vaiTro
  } = duLieu;

  kiemTraChuoiBatBuoc(hoTen, "Họ tên");
  kiemTraChuoiBatBuoc(matKhau, "Mật khẩu");
  kiemTraVaiTroHopLe(vaiTro);

  const emailChuanHoa = kiemTraEmailHopLe(email);
  const nguoiDungTonTai = await nguoiDungModel.timTheoEmail(emailChuanHoa);

  if (nguoiDungTonTai) {
    throw taoLoi("Email đã tồn tại", 409);
  }

  const matKhauDaBam = await bcrypt.hash(matKhau, SO_VONG_BAM_MAT_KHAU);

  const nguoiDungId = await nguoiDungModel.taoNguoiDung({
    hoTen: hoTen.trim(),
    email: emailChuanHoa,
    matKhau: matKhauDaBam,
    soDienThoai,
    anhDaiDien,
    vaiTro,
    trangThai: TRANG_THAI_NGUOI_DUNG.HOAT_DONG
  });

  const nguoiDungMoi = await nguoiDungModel.timTheoId(nguoiDungId);

  return dinhDangNguoiDung(nguoiDungMoi);
}

async function capNhatNguoiDung(id, duLieu) {
  const nguoiDungId = layIdHopLe(id);
  const nguoiDungHienTai = await nguoiDungModel.timTheoId(nguoiDungId);

  if (!nguoiDungHienTai) {
    throw taoLoi("Không tìm thấy người dùng", 404);
  }

  const hoTenMoi = duLieu.hoTen !== undefined ? duLieu.hoTen : nguoiDungHienTai.ho_ten;
  const emailMoi = duLieu.email !== undefined ? duLieu.email : nguoiDungHienTai.email;
  const vaiTroMoi = duLieu.vaiTro !== undefined ? duLieu.vaiTro : nguoiDungHienTai.vai_tro;
  const soDienThoaiMoi =
    duLieu.soDienThoai !== undefined ? duLieu.soDienThoai : nguoiDungHienTai.so_dien_thoai;
  const anhDaiDienMoi =
    duLieu.anhDaiDien !== undefined ? duLieu.anhDaiDien : nguoiDungHienTai.anh_dai_dien;

  kiemTraChuoiBatBuoc(hoTenMoi, "Họ tên");
  kiemTraVaiTroHopLe(vaiTroMoi);

  const emailChuanHoa = kiemTraEmailHopLe(emailMoi);
  const nguoiDungTheoEmail = await nguoiDungModel.timTheoEmail(emailChuanHoa);

  if (nguoiDungTheoEmail && String(nguoiDungTheoEmail.id) !== String(nguoiDungId)) {
    throw taoLoi("Email đã tồn tại", 409);
  }

  const laQuanTriVienCuoiCung =
    nguoiDungHienTai.vai_tro === VAI_TRO.QUAN_TRI_VIEN &&
    nguoiDungHienTai.trang_thai === TRANG_THAI_NGUOI_DUNG.HOAT_DONG &&
    vaiTroMoi !== VAI_TRO.QUAN_TRI_VIEN;

  if (laQuanTriVienCuoiCung) {
    const tongQuanTriVienHoatDong = await nguoiDungModel.demQuanTriVienHoatDong();

    if (tongQuanTriVienHoatDong <= 1) {
      throw taoLoi("Không được đổi vai trò quản trị viên cuối cùng đang hoạt động", 409);
    }
  }

  await nguoiDungModel.capNhatNguoiDung(nguoiDungId, {
    hoTen: hoTenMoi.trim(),
    email: emailChuanHoa,
    soDienThoai: soDienThoaiMoi,
    anhDaiDien: anhDaiDienMoi,
    vaiTro: vaiTroMoi
  });

  const nguoiDungDaCapNhat = await nguoiDungModel.timTheoId(nguoiDungId);

  return dinhDangNguoiDung(nguoiDungDaCapNhat);
}

async function capNhatTrangThai(id, trangThai) {
  const nguoiDungId = layIdHopLe(id);

  kiemTraTrangThaiHopLe(trangThai);

  const nguoiDung = await nguoiDungModel.timTheoId(nguoiDungId);

  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng", 404);
  }

  const dangKhoaQuanTriVienHoatDong =
    nguoiDung.vai_tro === VAI_TRO.QUAN_TRI_VIEN &&
    nguoiDung.trang_thai === TRANG_THAI_NGUOI_DUNG.HOAT_DONG &&
    trangThai === TRANG_THAI_NGUOI_DUNG.NGUNG_HOAT_DONG;

  if (dangKhoaQuanTriVienHoatDong) {
    const tongQuanTriVienHoatDong = await nguoiDungModel.demQuanTriVienHoatDong();

    if (tongQuanTriVienHoatDong <= 1) {
      throw taoLoi("Không được khóa quản trị viên cuối cùng đang hoạt động", 409);
    }
  }

  await nguoiDungModel.capNhatTrangThai(nguoiDungId, trangThai);

  const nguoiDungDaCapNhat = await nguoiDungModel.timTheoId(nguoiDungId);

  return dinhDangNguoiDung(nguoiDungDaCapNhat);
}

async function doiMatKhau(nguoiDungId, matKhauCu, matKhauMoi) {
  const id = layIdHopLe(nguoiDungId);

  kiemTraChuoiBatBuoc(matKhauCu, "Mật khẩu cũ");
  kiemTraChuoiBatBuoc(matKhauMoi, "Mật khẩu mới");

  const nguoiDung = await nguoiDungModel.timTheoIdCoMatKhau(id);

  if (!nguoiDung) {
    throw taoLoi("Không tìm thấy người dùng", 404);
  }

  if (nguoiDung.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG) {
    throw taoLoi("Tài khoản đã ngừng hoạt động", 403);
  }

  const matKhauDung = await bcrypt.compare(matKhauCu, nguoiDung.mat_khau);

  if (!matKhauDung) {
    throw taoLoi("Mật khẩu cũ không chính xác", 401);
  }

  const matKhauDaBam = await bcrypt.hash(matKhauMoi, SO_VONG_BAM_MAT_KHAU);

  await nguoiDungModel.capNhatMatKhau(id, matKhauDaBam);

  const nguoiDungDaCapNhat = await nguoiDungModel.timTheoId(id);

  return dinhDangNguoiDung(nguoiDungDaCapNhat);
}

module.exports = {
  layDanhSachNguoiDung,
  layChiTietNguoiDung,
  taoNguoiDung,
  capNhatNguoiDung,
  capNhatTrangThai,
  doiMatKhau
};
