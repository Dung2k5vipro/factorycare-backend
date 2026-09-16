const { pool } = require("../config/database");
const KET_QUA_SUA_CHUA = require("../constants/ket_qua_sua_chua");
const LOAI_THONG_BAO = require("../constants/loai_thong_bao");
const MUC_DO_SU_CO = require("../constants/muc_do_su_co");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const TRANG_THAI_SU_CO = require("../constants/trang_thai_su_co");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const VAI_TRO = require("../constants/vai_tro");
const hoSoSuaChuaModel = require("../models/ho_so_sua_chua.model");
const nguoiDungModel = require("../models/nguoi_dung.model");
const suCoModel = require("../models/su_co.model");
const thietBiModel = require("../models/thiet_bi.model");
const thongBaoModel = require("../models/thong_bao.model");

const SO_ANH_TOI_DA = 10;
const DO_DAI_DUONG_DAN_ANH_TOI_DA = 1000;
const DO_DAI_TIEU_DE_TOI_DA = 200;
const DO_DAI_MO_TA_TOI_DA = 10000;
const DO_DAI_TU_KHOA_TOI_DA = 200;
const DO_DAI_NOI_DUNG_SUA_CHUA_TOI_DA = 10000;
const DO_DAI_TEN_LINH_KIEN_TOI_DA = 200;
const SO_LINH_KIEN_TOI_DA = 100;

function taoLoi(thongBao, maTrangThai, duLieu = undefined) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  if (duLieu !== undefined) {
    loi.duLieu = duLieu;
  }

  return loi;
}

function layGiaTriTheoNhieuTen(duLieu, danhSachTen) {
  const tenTruong = danhSachTen.find((ten) =>
    Object.prototype.hasOwnProperty.call(duLieu || {}, ten)
  );

  return tenTruong ? duLieu[tenTruong] : undefined;
}

function chuanHoaChuoi(giaTri) {
  if (giaTri === undefined || giaTri === null) {
    return null;
  }

  const giaTriChuanHoa = String(giaTri).trim();

  return giaTriChuanHoa === "" ? null : giaTriChuanHoa;
}

function layChuoiBatBuoc(giaTri, tenTruong, doDaiToiDa) {
  if (typeof giaTri !== "string" || giaTri.trim() === "") {
    throw taoLoi(`${tenTruong} không được để trống`, 400);
  }

  const giaTriChuanHoa = giaTri.trim();

  if (giaTriChuanHoa.length > doDaiToiDa) {
    throw taoLoi(`${tenTruong} không được vượt quá ${doDaiToiDa} ký tự`, 400);
  }

  return giaTriChuanHoa;
}

function layChuoiTuyChon(giaTri, tenTruong, doDaiToiDa) {
  if (giaTri === undefined) {
    return undefined;
  }

  if (giaTri === null || String(giaTri).trim() === "") {
    return null;
  }

  if (typeof giaTri !== "string") {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  const giaTriChuanHoa = giaTri.trim();

  if (giaTriChuanHoa.length > doDaiToiDa) {
    throw taoLoi(`${tenTruong} không được vượt quá ${doDaiToiDa} ký tự`, 400);
  }

  return giaTriChuanHoa;
}

function layIdHopLe(id, tenDoiTuong) {
  const idDaChuyen = Number(id);

  if (!Number.isInteger(idDaChuyen) || idDaChuyen <= 0) {
    throw taoLoi(`${tenDoiTuong} không hợp lệ`, 400);
  }

  return idDaChuyen;
}

function layIdTuyChon(id, tenDoiTuong) {
  if (id === undefined || id === null || String(id).trim() === "") {
    return null;
  }

  return layIdHopLe(id, tenDoiTuong);
}

function layGiaTriEnum(giaTri, danhSachHopLe, tenTruong, batBuoc = false) {
  const giaTriChuanHoa = chuanHoaChuoi(giaTri);

  if (!giaTriChuanHoa) {
    if (batBuoc) {
      throw taoLoi(`${tenTruong} không được để trống`, 400);
    }

    return null;
  }

  const giaTriVietHoa = giaTriChuanHoa.toUpperCase();

  if (!danhSachHopLe.includes(giaTriVietHoa)) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return giaTriVietHoa;
}

function layMucDo(giaTri, batBuoc = false) {
  return layGiaTriEnum(
    giaTri,
    Object.values(MUC_DO_SU_CO),
    "Mức độ sự cố",
    batBuoc
  );
}

function layTrangThai(giaTri) {
  return layGiaTriEnum(
    giaTri,
    Object.values(TRANG_THAI_SU_CO),
    "Trạng thái sự cố"
  );
}

function layKetQuaSuaChua(giaTri, batBuoc = false) {
  return layGiaTriEnum(
    giaTri,
    Object.values(KET_QUA_SUA_CHUA),
    "Kết quả sửa chữa",
    batBuoc
  );
}

function layDanhSachLinhKienThayThe(giaTri) {
  if (giaTri === undefined) {
    return undefined;
  }

  if (giaTri === null) {
    return null;
  }

  if (!Array.isArray(giaTri)) {
    throw taoLoi("Linh kiện thay thế phải là một mảng", 400);
  }

  if (giaTri.length > SO_LINH_KIEN_TOI_DA) {
    throw taoLoi(`Chỉ được ghi tối đa ${SO_LINH_KIEN_TOI_DA} linh kiện`, 400);
  }

  const danhSachLinhKien = giaTri.map((linhKien, viTri) => {
    if (!linhKien || typeof linhKien !== "object" || Array.isArray(linhKien)) {
      throw taoLoi(`Linh kiện tại vị trí ${viTri + 1} không hợp lệ`, 400);
    }

    const ten = layChuoiBatBuoc(
      linhKien.ten,
      `Tên linh kiện tại vị trí ${viTri + 1}`,
      DO_DAI_TEN_LINH_KIEN_TOI_DA
    );
    const soLuongRaw = layGiaTriTheoNhieuTen(linhKien, ["soLuong", "so_luong"]);
    const soLuong = Number(soLuongRaw);

    if (!Number.isFinite(soLuong) || soLuong <= 0) {
      throw taoLoi(`Số lượng linh kiện tại vị trí ${viTri + 1} phải lớn hơn 0`, 400);
    }

    return { ten, soLuong };
  });

  return danhSachLinhKien.length > 0 ? danhSachLinhKien : null;
}

function kiemTraKhongGuiTruongHeThongSuaChua(duLieu = {}) {
  const danhSachTruongCam = [
    "id",
    "suCoId",
    "su_co_id",
    "kyThuatVienId",
    "ky_thuat_vien_id",
    "thoiGianBatDau",
    "thoi_gian_bat_dau",
    "thoiGianHoanThanh",
    "thoi_gian_hoan_thanh"
  ];
  const coTruongHeThong = danhSachTruongCam.some((tenTruong) =>
    Object.prototype.hasOwnProperty.call(duLieu, tenTruong)
  );

  if (coTruongHeThong) {
    throw taoLoi("Không được tự thiết lập sự cố, kỹ thuật viên hoặc thời gian sửa chữa", 400);
  }
}

function layDuLieuSuaChuaTuBody(duLieu = {}) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw taoLoi("Dữ liệu sửa chữa không hợp lệ", 400);
  }

  kiemTraKhongGuiTruongHeThongSuaChua(duLieu);

  const nguyenNhan = layChuoiTuyChon(
    layGiaTriTheoNhieuTen(duLieu, ["nguyenNhan", "nguyen_nhan"]),
    "Nguyên nhân",
    DO_DAI_NOI_DUNG_SUA_CHUA_TOI_DA
  );
  const cachXuLy = layChuoiTuyChon(
    layGiaTriTheoNhieuTen(duLieu, ["cachXuLy", "cach_xu_ly"]),
    "Cách xử lý",
    DO_DAI_NOI_DUNG_SUA_CHUA_TOI_DA
  );
  const ketQuaRaw = layGiaTriTheoNhieuTen(duLieu, ["ketQua", "ket_qua"]);
  const ketQua = ketQuaRaw === undefined
    ? undefined
    : layKetQuaSuaChua(ketQuaRaw, true);
  const linhKienThayThe = layDanhSachLinhKienThayThe(
    layGiaTriTheoNhieuTen(duLieu, ["linhKienThayThe", "linh_kien_thay_the"])
  );
  const ghiChu = layChuoiTuyChon(
    layGiaTriTheoNhieuTen(duLieu, ["ghiChu", "ghi_chu"]),
    "Ghi chú",
    DO_DAI_NOI_DUNG_SUA_CHUA_TOI_DA
  );

  return {
    nguyenNhan,
    cachXuLy,
    ketQua,
    linhKienThayThe,
    ghiChu
  };
}

function layNgayLocTuyChon(giaTri, tenTruong) {
  const ngay = chuanHoaChuoi(giaTri);

  if (!ngay) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }

  const [nam, thang, ngayTrongThang] = ngay.split("-").map(Number);
  const ngayKiemTra = new Date(Date.UTC(nam, thang - 1, ngayTrongThang));
  const laNgayHopLe =
    ngayKiemTra.getUTCFullYear() === nam &&
    ngayKiemTra.getUTCMonth() === thang - 1 &&
    ngayKiemTra.getUTCDate() === ngayTrongThang;

  if (!laNgayHopLe) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return ngay;
}

function layThoiGianTuyChon(giaTri, tenTruong) {
  const thoiGian = chuanHoaChuoi(giaTri);

  if (!thoiGian) {
    return null;
  }

  const bieuThucThoiGian = /^\d{4}-\d{2}-\d{2}(?:[T ](?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

  if (!bieuThucThoiGian.test(thoiGian)) {
    throw taoLoi(`${tenTruong} phải có định dạng ngày giờ ISO hợp lệ`, 400);
  }

  const [nam, thang, ngayTrongThang] = thoiGian
    .slice(0, 10)
    .split("-")
    .map(Number);
  const ngayKiemTra = new Date(Date.UTC(nam, thang - 1, ngayTrongThang));

  if (
    ngayKiemTra.getUTCFullYear() !== nam ||
    ngayKiemTra.getUTCMonth() !== thang - 1 ||
    ngayKiemTra.getUTCDate() !== ngayTrongThang
  ) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  const ngayGio = new Date(thoiGian);

  if (Number.isNaN(ngayGio.getTime())) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return ngayGio;
}

function layDanhSachHinhAnh(giaTri) {
  if (giaTri === undefined || giaTri === null) {
    return null;
  }

  if (!Array.isArray(giaTri)) {
    throw taoLoi("Hình ảnh phải là một mảng đường dẫn", 400);
  }

  if (giaTri.length > SO_ANH_TOI_DA) {
    throw taoLoi(`Chỉ được gửi tối đa ${SO_ANH_TOI_DA} hình ảnh`, 400);
  }

  const danhSachHinhAnh = giaTri.map((duongDan, viTri) => {
    if (typeof duongDan !== "string" || duongDan.trim() === "") {
      throw taoLoi(`Hình ảnh tại vị trí ${viTri + 1} không hợp lệ`, 400);
    }

    const duongDanChuanHoa = duongDan.trim();

    if (duongDanChuanHoa.length > DO_DAI_DUONG_DAN_ANH_TOI_DA) {
      throw taoLoi(`Đường dẫn hình ảnh tại vị trí ${viTri + 1} quá dài`, 400);
    }

    return duongDanChuanHoa;
  });

  return danhSachHinhAnh.length > 0 ? danhSachHinhAnh : null;
}

function kiemTraKhongGuiTruongHeThong(duLieu = {}) {
  const danhSachTruongCam = [
    "maSuCo",
    "ma_su_co",
    "nguoiBaoId",
    "nguoi_bao_id",
    "kyThuatVienId",
    "ky_thuat_vien_id",
    "trangThai",
    "trang_thai",
    "thoiGianBao",
    "thoi_gian_bao",
    "thoiGianPhanCong",
    "thoi_gian_phan_cong",
    "thoiGianHoanThanh",
    "thoi_gian_hoan_thanh"
  ];
  const coTruongHeThong = danhSachTruongCam.some((tenTruong) =>
    Object.prototype.hasOwnProperty.call(duLieu, tenTruong)
  );

  if (coTruongHeThong) {
    throw taoLoi("Không được tự thiết lập mã, người báo hoặc trạng thái sự cố", 400);
  }
}

function layThongTinPhanTrang(query = {}) {
  const trangHienTai = Number(
    query.page !== undefined ? query.page : query.trang || 1
  );
  const soBanGhiMoiTrang = Number(
    query.limit !== undefined ? query.limit : query.gioiHan || 10
  );

  if (!Number.isInteger(trangHienTai) || trangHienTai < 1) {
    throw taoLoi("Trang không hợp lệ", 400);
  }

  if (
    !Number.isInteger(soBanGhiMoiTrang) ||
    soBanGhiMoiTrang < 1 ||
    soBanGhiMoiTrang > 100
  ) {
    throw taoLoi("Giới hạn phải là số nguyên từ 1 đến 100", 400);
  }

  return {
    trangHienTai,
    soBanGhiMoiTrang,
    boQua: (trangHienTai - 1) * soBanGhiMoiTrang
  };
}

function layDieuKienLoc(query = {}) {
  const tuKhoaRaw = layGiaTriTheoNhieuTen(query, ["tuKhoa", "tu_khoa", "keyword"]);

  if (tuKhoaRaw !== undefined && typeof tuKhoaRaw !== "string") {
    throw taoLoi("Từ khóa không hợp lệ", 400);
  }

  const tuKhoa = chuanHoaChuoi(tuKhoaRaw) || "";

  if (tuKhoa.length > DO_DAI_TU_KHOA_TOI_DA) {
    throw taoLoi(`Từ khóa không được vượt quá ${DO_DAI_TU_KHOA_TOI_DA} ký tự`, 400);
  }

  const mucDo = layMucDo(
    layGiaTriTheoNhieuTen(query, ["mucDo", "muc_do"])
  );
  const trangThai = layTrangThai(
    layGiaTriTheoNhieuTen(query, ["trangThai", "trang_thai"])
  );
  const thietBiId = layIdTuyChon(
    layGiaTriTheoNhieuTen(query, ["thietBiId", "thiet_bi_id"]),
    "Thiết bị"
  );
  const kyThuatVienId = layIdTuyChon(
    layGiaTriTheoNhieuTen(query, ["kyThuatVienId", "ky_thuat_vien_id"]),
    "Kỹ thuật viên"
  );
  const tuNgay = layNgayLocTuyChon(
    layGiaTriTheoNhieuTen(query, ["tuNgay", "tu_ngay"]),
    "Từ ngày"
  );
  const denNgay = layNgayLocTuyChon(
    layGiaTriTheoNhieuTen(query, ["denNgay", "den_ngay"]),
    "Đến ngày"
  );

  if (tuNgay && denNgay && tuNgay > denNgay) {
    throw taoLoi("Từ ngày không được lớn hơn đến ngày", 400);
  }

  return {
    tuKhoa,
    mucDo,
    trangThai,
    thietBiId,
    kyThuatVienId,
    tuNgay,
    denNgay
  };
}

function chuyenJsonThanhMang(giaTri) {
  if (!giaTri) {
    return [];
  }

  if (Array.isArray(giaTri)) {
    return giaTri;
  }

  try {
    const duLieu = JSON.parse(String(giaTri));

    return Array.isArray(duLieu) ? duLieu : [];
  } catch (loi) {
    return [];
  }
}

function hopNhatDuLieuSuaChua(duLieuMoi, hoSoHienTai = null) {
  const duLieuDaHopNhat = {
    nguyenNhan: duLieuMoi.nguyenNhan !== undefined
      ? duLieuMoi.nguyenNhan
      : hoSoHienTai && hoSoHienTai.nguyen_nhan,
    cachXuLy: duLieuMoi.cachXuLy !== undefined
      ? duLieuMoi.cachXuLy
      : hoSoHienTai && hoSoHienTai.cach_xu_ly,
    ketQua: duLieuMoi.ketQua !== undefined
      ? duLieuMoi.ketQua
      : hoSoHienTai && hoSoHienTai.ket_qua,
    linhKienThayThe: duLieuMoi.linhKienThayThe !== undefined
      ? duLieuMoi.linhKienThayThe
      : hoSoHienTai
        ? chuyenJsonThanhDanhSachLinhKien(hoSoHienTai.linh_kien_thay_the)
        : null,
    ghiChu: duLieuMoi.ghiChu !== undefined
      ? duLieuMoi.ghiChu
      : hoSoHienTai && hoSoHienTai.ghi_chu
  };

  duLieuDaHopNhat.nguyenNhan = layChuoiBatBuoc(
    duLieuDaHopNhat.nguyenNhan,
    "Nguyên nhân",
    DO_DAI_NOI_DUNG_SUA_CHUA_TOI_DA
  );
  duLieuDaHopNhat.cachXuLy = layChuoiBatBuoc(
    duLieuDaHopNhat.cachXuLy,
    "Cách xử lý",
    DO_DAI_NOI_DUNG_SUA_CHUA_TOI_DA
  );
  duLieuDaHopNhat.ketQua = layKetQuaSuaChua(
    duLieuDaHopNhat.ketQua,
    true
  );

  return duLieuDaHopNhat;
}

function chuyenLinhKienThanhJson(danhSachLinhKien) {
  return danhSachLinhKien && danhSachLinhKien.length > 0
    ? JSON.stringify(danhSachLinhKien.map((linhKien) => ({
        ten: linhKien.ten,
        so_luong: linhKien.soLuong
      })))
    : null;
}

function chuyenJsonThanhDanhSachLinhKien(giaTri) {
  return chuyenJsonThanhMang(giaTri).map((linhKien) => ({
    ten: linhKien.ten,
    soLuong: Number(
      linhKien.soLuong !== undefined
        ? linhKien.soLuong
        : linhKien.so_luong
    )
  }));
}

function dinhDangHoSoSuaChua(hoSo, baoGomKyThuatVien = true) {
  const duLieu = {
    id: hoSo.id,
    suCoId: hoSo.su_co_id,
    nguyenNhan: hoSo.nguyen_nhan,
    cachXuLy: hoSo.cach_xu_ly,
    linhKienThayThe: chuyenJsonThanhDanhSachLinhKien(
      hoSo.linh_kien_thay_the
    ),
    ketQua: hoSo.ket_qua,
    thoiGianBatDau: hoSo.thoi_gian_bat_dau,
    thoiGianHoanThanh: hoSo.thoi_gian_hoan_thanh,
    ghiChu: hoSo.ghi_chu,
    ngayTao: hoSo.ngay_tao,
    ngayCapNhat: hoSo.ngay_cap_nhat
  };

  if (baoGomKyThuatVien) {
    duLieu.kyThuatVien = {
      id: hoSo.ky_thuat_vien_id,
      hoTen: hoSo.ky_thuat_vien_ho_ten,
      email: hoSo.ky_thuat_vien_email
    };
  }

  return duLieu;
}

function dinhDangKetQuaSuaChuaChoNhanVien(hoSo) {
  if (!hoSo || !hoSo.thoi_gian_hoan_thanh) {
    return null;
  }

  return {
    ketQua: hoSo.ket_qua,
    cachXuLy: hoSo.cach_xu_ly,
    thoiGianHoanThanh: hoSo.thoi_gian_hoan_thanh
  };
}

function kiemTraKyThuatVienXuLyHopLe(
  suCo,
  kyThuatVienId,
  kyThuatVien
) {
  if (Number(suCo.ky_thuat_vien_id) !== kyThuatVienId) {
    throw taoLoi("Bạn không được phân công xử lý sự cố này", 403);
  }

  if (
    !kyThuatVien ||
    kyThuatVien.vai_tro !== VAI_TRO.KY_THUAT_VIEN ||
    kyThuatVien.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG
  ) {
    throw taoLoi("Tài khoản kỹ thuật viên không hợp lệ hoặc đã ngừng hoạt động", 403);
  }
}

function dinhDangThietBi(suCo) {
  return {
    id: suCo.thiet_bi_id,
    maThietBi: suCo.ma_thiet_bi,
    tenThietBi: suCo.ten_thiet_bi,
    trangThai: suCo.thiet_bi_trang_thai,
    viTri: suCo.vi_tri_id
      ? {
          id: suCo.vi_tri_id,
          tenViTri: suCo.ten_vi_tri,
          loaiViTri: suCo.loai_vi_tri
        }
      : null
  };
}

function dinhDangNguoiBao(suCo) {
  return {
    id: suCo.nguoi_bao_id,
    hoTen: suCo.nguoi_bao_ho_ten,
    email: suCo.nguoi_bao_email,
    soDienThoai: suCo.nguoi_bao_so_dien_thoai
  };
}

function dinhDangNguoiBaoTomTat(suCo) {
  return {
    id: suCo.nguoi_bao_id,
    hoTen: suCo.nguoi_bao_ho_ten
  };
}

function dinhDangKyThuatVien(suCo) {
  if (!suCo.ky_thuat_vien_id) {
    return null;
  }

  return {
    id: suCo.ky_thuat_vien_id,
    hoTen: suCo.ky_thuat_vien_ho_ten,
    email: suCo.ky_thuat_vien_email,
    soDienThoai: suCo.ky_thuat_vien_so_dien_thoai,
    trangThai: suCo.ky_thuat_vien_trang_thai
  };
}

function dinhDangKyThuatVienTomTat(suCo) {
  if (!suCo.ky_thuat_vien_id) {
    return null;
  }

  return {
    id: suCo.ky_thuat_vien_id,
    hoTen: suCo.ky_thuat_vien_ho_ten,
    trangThai: suCo.ky_thuat_vien_trang_thai
  };
}

function dinhDangSuCoDanhSach(suCo, {
  baoGomNguoiBao = false,
  baoGomKyThuatVien = true
} = {}) {
  const duLieu = {
    id: suCo.id,
    maSuCo: suCo.ma_su_co,
    tieuDe: suCo.tieu_de,
    mucDo: suCo.muc_do,
    trangThai: suCo.trang_thai,
    thietBi: dinhDangThietBi(suCo),
    thoiGianBao: suCo.thoi_gian_bao,
    thoiGianPhanCong: suCo.thoi_gian_phan_cong
  };

  if (baoGomNguoiBao) {
    duLieu.nguoiBao = dinhDangNguoiBaoTomTat(suCo);
  }

  if (baoGomKyThuatVien) {
    duLieu.kyThuatVien = dinhDangKyThuatVienTomTat(suCo);
  }

  return duLieu;
}

function dinhDangSuCoChiTiet(suCo, tuyChon = {}) {
  const duLieu = {
    ...dinhDangSuCoDanhSach(suCo, tuyChon),
    moTa: suCo.mo_ta,
    hinhAnh: chuyenJsonThanhMang(suCo.hinh_anh),
    thoiGianXayRa: suCo.thoi_gian_xay_ra,
    thoiGianHoanThanh: suCo.thoi_gian_hoan_thanh,
    ngayTao: suCo.ngay_tao,
    ngayCapNhat: suCo.ngay_cap_nhat
  };

  if (tuyChon.baoGomNguoiBao) {
    duLieu.nguoiBao = dinhDangNguoiBao(suCo);
  }

  if (tuyChon.baoGomKyThuatVien) {
    duLieu.kyThuatVien = dinhDangKyThuatVien(suCo);
  }

  return duLieu;
}

function dinhDangKyThuatVienHoatDong(nguoiDung) {
  return {
    id: nguoiDung.id,
    hoTen: nguoiDung.ho_ten,
    email: nguoiDung.email,
    soDienThoai: nguoiDung.so_dien_thoai,
    anhDaiDien: nguoiDung.anh_dai_dien
  };
}

function layTienToMaSuCo() {
  const hienTai = new Date();
  const nam = hienTai.getFullYear();
  const thang = String(hienTai.getMonth() + 1).padStart(2, "0");
  const ngay = String(hienTai.getDate()).padStart(2, "0");

  return `SC-${nam}${thang}${ngay}`;
}

function taoMaSuCo(tienTo, soThuTu) {
  return `${tienTo}-${String(soThuTu).padStart(4, "0")}`;
}

function taoTenKhoaSinhMa(tienTo) {
  return `factorycare:ma_su_co:${tienTo}`;
}

async function moKhoaSinhMaAnToan(connection, tenKhoa) {
  if (!connection || !tenKhoa) {
    return;
  }

  try {
    await suCoModel.moKhoaSinhMaSuCo(connection, tenKhoa);
  } catch (loi) {
    return;
  }
}

function layDuLieuTaoSuCo(duLieu = {}) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw taoLoi("Dữ liệu sự cố không hợp lệ", 400);
  }

  kiemTraKhongGuiTruongHeThong(duLieu);

  const thietBiId = layIdHopLe(
    layGiaTriTheoNhieuTen(duLieu, ["thietBiId", "thiet_bi_id"]),
    "Thiết bị"
  );
  const tieuDe = layChuoiBatBuoc(
    layGiaTriTheoNhieuTen(duLieu, ["tieuDe", "tieu_de"]),
    "Tiêu đề",
    DO_DAI_TIEU_DE_TOI_DA
  );
  const moTa = layChuoiBatBuoc(
    layGiaTriTheoNhieuTen(duLieu, ["moTa", "mo_ta"]),
    "Mô tả",
    DO_DAI_MO_TA_TOI_DA
  );
  const mucDo = layMucDo(
    layGiaTriTheoNhieuTen(duLieu, ["mucDo", "muc_do"]),
    true
  );
  const thoiGianXayRa = layThoiGianTuyChon(
    layGiaTriTheoNhieuTen(duLieu, ["thoiGianXayRa", "thoi_gian_xay_ra"]),
    "Thời gian xảy ra"
  );
  const danhSachHinhAnh = layDanhSachHinhAnh(
    layGiaTriTheoNhieuTen(duLieu, ["hinhAnh", "hinh_anh"])
  );

  return {
    thietBiId,
    tieuDe,
    moTa,
    mucDo,
    thoiGianXayRa,
    hinhAnh: danhSachHinhAnh ? JSON.stringify(danhSachHinhAnh) : null
  };
}

async function taoThongBaoSuCoNghiemTrong(
  connection,
  suCoId,
  maSuCo,
  thietBi,
  tieuDe
) {
  const danhSachQuanTriVien = await nguoiDungModel.layDanhSachTheoVaiTroVaTrangThai(
    VAI_TRO.QUAN_TRI_VIEN,
    TRANG_THAI_NGUOI_DUNG.HOAT_DONG,
    connection
  );

  for (const quanTriVien of danhSachQuanTriVien) {
    await thongBaoModel.taoThongBao({
      nguoiDungId: quanTriVien.id,
      tieuDe: `Sự cố nghiêm trọng ${maSuCo}`,
      noiDung: `Thiết bị ${thietBi.ma_thiet_bi} - ${thietBi.ten_thiet_bi} vừa được báo sự cố nghiêm trọng: ${tieuDe}.`,
      loaiThongBao: LOAI_THONG_BAO.SU_CO,
      doiTuongLienQuanId: suCoId
    }, connection);
  }
}

async function taoSuCo(duLieu = {}, nguoiDungHienTai = {}) {
  const nguoiBaoId = layIdHopLe(nguoiDungHienTai.id, "Người báo");
  const duLieuHopLe = layDuLieuTaoSuCo(duLieu);
  const tienTo = layTienToMaSuCo();
  const tenKhoa = taoTenKhoaSinhMa(tienTo);
  let connection;
  let daKhoa = false;
  let daBatDauTransaction = false;

  try {
    connection = await pool.getConnection();
    daKhoa = await suCoModel.khoaSinhMaSuCo(connection, tenKhoa);

    if (!daKhoa) {
      throw taoLoi("Không thể sinh mã sự cố, vui lòng thử lại", 409);
    }

    await connection.beginTransaction();
    daBatDauTransaction = true;

    const nguoiBao = await nguoiDungModel.timTheoIdDeCapNhat(
      nguoiBaoId,
      connection
    );

    if (
      !nguoiBao ||
      nguoiBao.vai_tro !== VAI_TRO.NHAN_VIEN ||
      nguoiBao.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG
    ) {
      throw taoLoi("Người báo sự cố không hợp lệ hoặc đã ngừng hoạt động", 403);
    }

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(
      duLieuHopLe.thietBiId,
      connection
    );

    if (!thietBi) {
      throw taoLoi("Không tìm thấy thiết bị", 404);
    }

    if (thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY) {
      throw taoLoi("Không thể báo sự cố cho thiết bị đã thanh lý", 409);
    }

    const danhSachSuCoDangMo = await suCoModel.laySuCoDangMoTheoThietBi(
      duLieuHopLe.thietBiId,
      connection
    );
    const soThuTuHienTai = await suCoModel.laySoThuTuMaLonNhatTheoTienTo(
      connection,
      tienTo
    );
    const maSuCo = taoMaSuCo(tienTo, soThuTuHienTai + 1);
    const suCoId = await suCoModel.taoSuCo(connection, {
      maSuCo,
      thietBiId: duLieuHopLe.thietBiId,
      nguoiBaoId,
      tieuDe: duLieuHopLe.tieuDe,
      moTa: duLieuHopLe.moTa,
      hinhAnh: duLieuHopLe.hinhAnh,
      mucDo: duLieuHopLe.mucDo,
      trangThai: TRANG_THAI_SU_CO.MOI,
      thoiGianXayRa: duLieuHopLe.thoiGianXayRa
    });

    if (duLieuHopLe.mucDo === MUC_DO_SU_CO.NGHIEM_TRONG) {
      await taoThongBaoSuCoNghiemTrong(
        connection,
        suCoId,
        maSuCo,
        thietBi,
        duLieuHopLe.tieuDe
      );
    }

    await connection.commit();
    daBatDauTransaction = false;

    const suCoMoi = await suCoModel.timTheoId(suCoId, connection);
    const ketQua = dinhDangSuCoChiTiet(suCoMoi, {
      baoGomNguoiBao: false,
      baoGomKyThuatVien: true
    });

    if (danhSachSuCoDangMo.length > 0) {
      ketQua.canhBao = {
        coSuCoDangMo: true,
        thongBao: "Thiết bị đang có sự cố chưa đóng; sự cố mới vẫn được ghi nhận để tránh mất báo cáo.",
        danhSachSuCo: danhSachSuCoDangMo.map((suCo) => ({
          id: suCo.id,
          maSuCo: suCo.ma_su_co,
          tieuDe: suCo.tieu_de,
          mucDo: suCo.muc_do,
          trangThai: suCo.trang_thai,
          thoiGianBao: suCo.thoi_gian_bao
        }))
      };
    }

    return ketQua;
  } catch (loi) {
    if (connection && daBatDauTransaction) {
      await connection.rollback();
    }

    if (loi.code === "ER_DUP_ENTRY") {
      throw taoLoi("Mã sự cố đã tồn tại, vui lòng thử lại", 409);
    }

    throw loi;
  } finally {
    if (connection) {
      if (daKhoa) {
        await moKhoaSinhMaAnToan(connection, tenKhoa);
      }

      connection.release();
    }
  }
}

async function layKetQuaDanhSach(dieuKienLoc, thongTinPhanTrang, tuyChonDinhDang) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = thongTinPhanTrang;
  const [danhSachSuCo, tongBanGhi] = await Promise.all([
    suCoModel.layDanhSachSuCo({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    suCoModel.demTongSuCo(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachSuCo.map((suCo) =>
      dinhDangSuCoDanhSach(suCo, tuyChonDinhDang)
    ),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layDanhSachSuCoCuaToi(query = {}, nguoiDungHienTai = {}) {
  const nguoiBaoId = layIdHopLe(nguoiDungHienTai.id, "Người báo");
  const dieuKienLoc = {
    ...layDieuKienLoc(query),
    nguoiBaoId,
    kyThuatVienId: null
  };

  return layKetQuaDanhSach(
    dieuKienLoc,
    layThongTinPhanTrang(query),
    { baoGomNguoiBao: false, baoGomKyThuatVien: true }
  );
}

async function layChiTietSuCoCuaToi(id, nguoiDungHienTai = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const nguoiBaoId = layIdHopLe(nguoiDungHienTai.id, "Người báo");
  const suCo = await suCoModel.timTheoId(suCoId);

  if (!suCo) {
    throw taoLoi("Không tìm thấy sự cố", 404);
  }

  if (Number(suCo.nguoi_bao_id) !== nguoiBaoId) {
    throw taoLoi("Bạn không có quyền xem sự cố này", 403);
  }

  const danhSachHoSo = await hoSoSuaChuaModel.layDanhSachTheoSuCoId(suCoId);
  const hoSoDaHoanThanh = danhSachHoSo.find(
    (hoSo) => Boolean(hoSo.thoi_gian_hoan_thanh)
  );
  const duLieuSuCo = dinhDangSuCoChiTiet(suCo, {
    baoGomNguoiBao: false,
    baoGomKyThuatVien: true
  });

  duLieuSuCo.ketQuaSuaChua = dinhDangKetQuaSuaChuaChoNhanVien(
    hoSoDaHoanThanh
  );

  return duLieuSuCo;
}

async function layDanhSachSuCo(query = {}) {
  return layKetQuaDanhSach(
    layDieuKienLoc(query),
    layThongTinPhanTrang(query),
    { baoGomNguoiBao: true, baoGomKyThuatVien: true }
  );
}

async function layChiTietSuCo(id) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const suCo = await suCoModel.timTheoId(suCoId);

  if (!suCo) {
    throw taoLoi("Không tìm thấy sự cố", 404);
  }

  const danhSachHoSo = await hoSoSuaChuaModel.layDanhSachTheoSuCoId(suCoId);
  const duLieuSuCo = dinhDangSuCoChiTiet(suCo, {
    baoGomNguoiBao: true,
    baoGomKyThuatVien: true
  });

  duLieuSuCo.danhSachHoSoSuaChua = danhSachHoSo.map((hoSo) =>
    dinhDangHoSoSuaChua(hoSo, true)
  );

  return duLieuSuCo;
}

async function layDanhSachKyThuatVien(query = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const tuKhoaRaw = layGiaTriTheoNhieuTen(query, ["tuKhoa", "tu_khoa", "keyword"]);

  if (tuKhoaRaw !== undefined && typeof tuKhoaRaw !== "string") {
    throw taoLoi("Từ khóa không hợp lệ", 400);
  }

  const tuKhoa = chuanHoaChuoi(tuKhoaRaw) || "";

  if (tuKhoa.length > DO_DAI_TU_KHOA_TOI_DA) {
    throw taoLoi(`Từ khóa không được vượt quá ${DO_DAI_TU_KHOA_TOI_DA} ký tự`, 400);
  }

  const dieuKienLoc = {
    tuKhoa,
    vaiTro: VAI_TRO.KY_THUAT_VIEN,
    trangThai: TRANG_THAI_NGUOI_DUNG.HOAT_DONG
  };
  const [danhSachKyThuatVien, tongBanGhi] = await Promise.all([
    nguoiDungModel.layDanhSachNguoiDung({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    nguoiDungModel.demTongNguoiDung(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachKyThuatVien.map(dinhDangKyThuatVienHoatDong),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function phanCongKyThuatVien(id, duLieu = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const kyThuatVienId = layIdHopLe(
    layGiaTriTheoNhieuTen(duLieu, ["kyThuatVienId", "ky_thuat_vien_id"]),
    "Kỹ thuật viên"
  );
  let connection;
  let daBatDauTransaction = false;
  let kyThuatVienCuId = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    daBatDauTransaction = true;

    const suCo = await suCoModel.timTheoIdDeCapNhat(suCoId, connection);

    if (!suCo) {
      throw taoLoi("Không tìm thấy sự cố", 404);
    }

    if (
      suCo.trang_thai !== TRANG_THAI_SU_CO.MOI &&
      suCo.trang_thai !== TRANG_THAI_SU_CO.DA_PHAN_CONG
    ) {
      throw taoLoi("Chỉ có thể phân công sự cố mới hoặc sự cố đã phân công", 409);
    }

    const kyThuatVien = await nguoiDungModel.timTheoIdDeCapNhat(
      kyThuatVienId,
      connection
    );

    if (!kyThuatVien) {
      throw taoLoi("Không tìm thấy kỹ thuật viên", 404);
    }

    if (kyThuatVien.vai_tro !== VAI_TRO.KY_THUAT_VIEN) {
      throw taoLoi("Người dùng được chọn không phải kỹ thuật viên", 400);
    }

    if (kyThuatVien.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG) {
      throw taoLoi("Không thể phân công kỹ thuật viên đã ngừng hoạt động", 409);
    }

    if (Number(suCo.ky_thuat_vien_id) === kyThuatVienId) {
      throw taoLoi("Sự cố đã được phân công cho kỹ thuật viên này", 409);
    }

    kyThuatVienCuId = suCo.ky_thuat_vien_id;
    const soBanGhiDaCapNhat = await suCoModel.capNhatPhanCong(
      connection,
      suCoId,
      kyThuatVienId
    );

    if (soBanGhiDaCapNhat !== 1) {
      throw taoLoi("Trạng thái sự cố đã thay đổi, vui lòng tải lại dữ liệu", 409);
    }

    await thongBaoModel.taoThongBao({
      nguoiDungId: kyThuatVienId,
      tieuDe: `Phân công sự cố ${suCo.ma_su_co}`,
      noiDung: `Bạn vừa được phân công xử lý sự cố ${suCo.ma_su_co}: ${suCo.tieu_de}.`,
      loaiThongBao: LOAI_THONG_BAO.PHAN_CONG,
      doiTuongLienQuanId: suCoId
    }, connection);

    if (kyThuatVienCuId) {
      await thongBaoModel.taoThongBao({
        nguoiDungId: kyThuatVienCuId,
        tieuDe: `Thay đổi phân công sự cố ${suCo.ma_su_co}`,
        noiDung: `Sự cố ${suCo.ma_su_co} đã được quản trị viên phân công lại cho kỹ thuật viên khác.`,
        loaiThongBao: LOAI_THONG_BAO.PHAN_CONG,
        doiTuongLienQuanId: suCoId
      }, connection);
    }

    await connection.commit();
    daBatDauTransaction = false;

    const suCoDaPhanCong = await suCoModel.timTheoId(suCoId, connection);

    return {
      ...dinhDangSuCoChiTiet(suCoDaPhanCong, {
        baoGomNguoiBao: true,
        baoGomKyThuatVien: true
      }),
      daPhanCongLai: Boolean(kyThuatVienCuId)
    };
  } catch (loi) {
    if (connection && daBatDauTransaction) {
      await connection.rollback();
    }

    throw loi;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function layCongViecCuaToi(query = {}, nguoiDungHienTai = {}) {
  const kyThuatVienId = layIdHopLe(
    nguoiDungHienTai.id,
    "Kỹ thuật viên"
  );
  const dieuKienLoc = {
    ...layDieuKienLoc(query),
    nguoiBaoId: null,
    kyThuatVienId
  };

  return layKetQuaDanhSach(
    dieuKienLoc,
    layThongTinPhanTrang(query),
    { baoGomNguoiBao: false, baoGomKyThuatVien: false }
  );
}

async function layChiTietCongViecCuaToi(id, nguoiDungHienTai = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const kyThuatVienId = layIdHopLe(
    nguoiDungHienTai.id,
    "Kỹ thuật viên"
  );
  const suCo = await suCoModel.timTheoId(suCoId);

  if (!suCo) {
    throw taoLoi("Không tìm thấy sự cố", 404);
  }

  if (Number(suCo.ky_thuat_vien_id) !== kyThuatVienId) {
    throw taoLoi("Bạn không có quyền xem công việc này", 403);
  }

  const danhSachHoSo = await hoSoSuaChuaModel.layDanhSachTheoSuCoVaKyThuatVien(
    suCoId,
    kyThuatVienId
  );
  const duLieuSuCo = dinhDangSuCoChiTiet(suCo, {
    baoGomNguoiBao: true,
    baoGomKyThuatVien: false
  });

  duLieuSuCo.danhSachHoSoSuaChua = danhSachHoSo.map((hoSo) =>
    dinhDangHoSoSuaChua(hoSo, false)
  );

  return duLieuSuCo;
}

function layTrangThaiThietBiKhiBatDau(thietBi) {
  if (thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY) {
    throw taoLoi("Không thể xử lý sự cố của thiết bị đã thanh lý", 409);
  }

  if (thietBi.trang_thai === TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG) {
    return TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG;
  }

  return TRANG_THAI_THIET_BI.DANG_HONG;
}

async function layTrangThaiThietBiKhiHoanThanh(
  connection,
  thietBi,
  suCoId,
  ketQuaSuaChua
) {
  if (thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY) {
    throw taoLoi("Không thể hoàn thành sửa chữa cho thiết bị đã thanh lý", 409);
  }

  if (thietBi.trang_thai === TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG) {
    return TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG;
  }

  if (ketQuaSuaChua !== KET_QUA_SUA_CHUA.DA_SUA_XONG) {
    return TRANG_THAI_THIET_BI.DANG_HONG;
  }

  const tongSuCoDangMoKhac = await suCoModel.demSuCoDangMoKhac(
    connection,
    thietBi.id,
    suCoId
  );

  return tongSuCoDangMoKhac > 0
    ? TRANG_THAI_THIET_BI.DANG_HONG
    : TRANG_THAI_THIET_BI.DANG_HOAT_DONG;
}

async function layChiTietCongViecKemHoSo(
  suCoId,
  kyThuatVienId,
  connection
) {
  const [suCo, danhSachHoSo] = await Promise.all([
    suCoModel.timTheoId(suCoId, connection),
    hoSoSuaChuaModel.layDanhSachTheoSuCoVaKyThuatVien(
      suCoId,
      kyThuatVienId,
      connection
    )
  ]);
  const duLieuSuCo = dinhDangSuCoChiTiet(suCo, {
    baoGomNguoiBao: true,
    baoGomKyThuatVien: false
  });

  duLieuSuCo.danhSachHoSoSuaChua = danhSachHoSo.map((hoSo) =>
    dinhDangHoSoSuaChua(hoSo, false)
  );

  return duLieuSuCo;
}

async function batDauXuLySuCo(id, nguoiDungHienTai = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const kyThuatVienId = layIdHopLe(
    nguoiDungHienTai.id,
    "Kỹ thuật viên"
  );
  let connection;
  let daBatDauTransaction = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    daBatDauTransaction = true;

    const suCo = await suCoModel.timTheoIdDeCapNhat(suCoId, connection);

    if (!suCo) {
      throw taoLoi("Không tìm thấy sự cố", 404);
    }

    const kyThuatVien = await nguoiDungModel.timTheoIdDeCapNhat(
      kyThuatVienId,
      connection
    );

    kiemTraKyThuatVienXuLyHopLe(suCo, kyThuatVienId, kyThuatVien);

    if (suCo.trang_thai === TRANG_THAI_SU_CO.DANG_XU_LY) {
      await connection.commit();
      daBatDauTransaction = false;

      return {
        ...await layChiTietCongViecKemHoSo(
          suCoId,
          kyThuatVienId,
          connection
        ),
        daBatDauTruocDo: true
      };
    }

    if (suCo.trang_thai !== TRANG_THAI_SU_CO.DA_PHAN_CONG) {
      throw taoLoi("Chỉ có thể bắt đầu sự cố đã được phân công", 409);
    }

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(
      suCo.thiet_bi_id,
      connection
    );

    if (!thietBi) {
      throw taoLoi("Không tìm thấy thiết bị của sự cố", 404);
    }

    const trangThaiThietBiMoi = layTrangThaiThietBiKhiBatDau(thietBi);
    const soSuCoDaCapNhat = await suCoModel.batDauXuLy(
      connection,
      suCoId,
      kyThuatVienId
    );

    if (soSuCoDaCapNhat !== 1) {
      throw taoLoi("Trạng thái sự cố đã thay đổi, vui lòng tải lại dữ liệu", 409);
    }

    if (trangThaiThietBiMoi !== thietBi.trang_thai) {
      const soThietBiDaCapNhat = await thietBiModel.capNhatTrangThai(
        thietBi.id,
        trangThaiThietBiMoi,
        connection
      );

      if (soThietBiDaCapNhat !== 1) {
        throw taoLoi("Không thể cập nhật trạng thái thiết bị", 409);
      }
    }

    await connection.commit();
    daBatDauTransaction = false;

    return {
      ...await layChiTietCongViecKemHoSo(
        suCoId,
        kyThuatVienId,
        connection
      ),
      daBatDauTruocDo: false
    };
  } catch (loi) {
    if (connection && daBatDauTransaction) {
      await connection.rollback();
    }

    throw loi;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function capNhatHoSoSuaChua(id, duLieu = {}, nguoiDungHienTai = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const kyThuatVienId = layIdHopLe(
    nguoiDungHienTai.id,
    "Kỹ thuật viên"
  );
  const duLieuMoi = layDuLieuSuaChuaTuBody(duLieu);
  const coDuLieuMoi = Object.values(duLieuMoi).some(
    (giaTri) => giaTri !== undefined
  );

  if (!coDuLieuMoi) {
    throw taoLoi("Cần gửi ít nhất một thông tin sửa chữa", 400);
  }

  let connection;
  let daBatDauTransaction = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    daBatDauTransaction = true;

    const suCo = await suCoModel.timTheoIdDeCapNhat(suCoId, connection);

    if (!suCo) {
      throw taoLoi("Không tìm thấy sự cố", 404);
    }

    const kyThuatVien = await nguoiDungModel.timTheoIdDeCapNhat(
      kyThuatVienId,
      connection
    );

    kiemTraKyThuatVienXuLyHopLe(suCo, kyThuatVienId, kyThuatVien);

    if (suCo.trang_thai !== TRANG_THAI_SU_CO.DANG_XU_LY) {
      if (suCo.trang_thai === TRANG_THAI_SU_CO.DA_XU_LY) {
        throw taoLoi("Sự cố đã hoàn thành, không thể sửa hồ sơ", 409);
      }

      throw taoLoi("Chỉ có thể cập nhật hồ sơ khi sự cố đang xử lý", 409);
    }

    const hoSoHienTai = await hoSoSuaChuaModel.timHoSoDangXuLyDeCapNhat(
      suCoId,
      connection
    );

    if (
      hoSoHienTai &&
      Number(hoSoHienTai.ky_thuat_vien_id) !== kyThuatVienId
    ) {
      throw taoLoi("Hồ sơ sửa chữa thuộc về kỹ thuật viên khác", 403);
    }

    const duLieuHopLe = hopNhatDuLieuSuaChua(duLieuMoi, hoSoHienTai);
    const linhKienThayThe = chuyenLinhKienThanhJson(
      duLieuHopLe.linhKienThayThe
    );

    if (hoSoHienTai) {
      const soBanGhiDaCapNhat = await hoSoSuaChuaModel.capNhatHoSoSuaChua(
        connection,
        hoSoHienTai.id,
        {
          ...duLieuHopLe,
          linhKienThayThe
        }
      );

      if (soBanGhiDaCapNhat !== 1) {
        throw taoLoi("Hồ sơ sửa chữa đã thay đổi, vui lòng tải lại dữ liệu", 409);
      }
    } else {
      await hoSoSuaChuaModel.taoHoSoSuaChua(connection, {
        suCoId,
        kyThuatVienId,
        ...duLieuHopLe,
        linhKienThayThe,
        thoiGianBatDau: suCo.ngay_cap_nhat,
        thoiGianHoanThanh: null
      });
    }

    await connection.commit();
    daBatDauTransaction = false;

    const hoSoDaLuu = await hoSoSuaChuaModel.timHoSoDangXuLyTheoSuCoId(
      suCoId,
      connection
    );

    return dinhDangHoSoSuaChua(hoSoDaLuu, false);
  } catch (loi) {
    if (connection && daBatDauTransaction) {
      await connection.rollback();
    }

    throw loi;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function layHoSoSuaChuaCuaToi(id, nguoiDungHienTai = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const kyThuatVienId = layIdHopLe(
    nguoiDungHienTai.id,
    "Kỹ thuật viên"
  );
  const suCo = await suCoModel.timTheoId(suCoId);

  if (!suCo) {
    throw taoLoi("Không tìm thấy sự cố", 404);
  }

  if (Number(suCo.ky_thuat_vien_id) !== kyThuatVienId) {
    throw taoLoi("Bạn không có quyền xem hồ sơ sửa chữa này", 403);
  }

  const danhSachHoSo = await hoSoSuaChuaModel.layDanhSachTheoSuCoVaKyThuatVien(
    suCoId,
    kyThuatVienId
  );

  return {
    danhSach: danhSachHoSo.map((hoSo) =>
      dinhDangHoSoSuaChua(hoSo, false)
    )
  };
}

async function hoanThanhSuaChua(id, duLieu = {}, nguoiDungHienTai = {}) {
  const suCoId = layIdHopLe(id, "Sự cố");
  const kyThuatVienId = layIdHopLe(
    nguoiDungHienTai.id,
    "Kỹ thuật viên"
  );
  const duLieuMoi = layDuLieuSuaChuaTuBody(duLieu);
  let connection;
  let daBatDauTransaction = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    daBatDauTransaction = true;

    const suCo = await suCoModel.timTheoIdDeCapNhat(suCoId, connection);

    if (!suCo) {
      throw taoLoi("Không tìm thấy sự cố", 404);
    }

    const kyThuatVien = await nguoiDungModel.timTheoIdDeCapNhat(
      kyThuatVienId,
      connection
    );

    kiemTraKyThuatVienXuLyHopLe(suCo, kyThuatVienId, kyThuatVien);

    if (suCo.trang_thai === TRANG_THAI_SU_CO.DA_XU_LY) {
      throw taoLoi("Sự cố đã hoàn thành trước đó", 409);
    }

    if (suCo.trang_thai !== TRANG_THAI_SU_CO.DANG_XU_LY) {
      throw taoLoi("Chỉ có thể hoàn thành sự cố đang xử lý", 409);
    }

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(
      suCo.thiet_bi_id,
      connection
    );

    if (!thietBi) {
      throw taoLoi("Không tìm thấy thiết bị của sự cố", 404);
    }

    const hoSoHienTai = await hoSoSuaChuaModel.timHoSoDangXuLyDeCapNhat(
      suCoId,
      connection
    );

    if (
      hoSoHienTai &&
      Number(hoSoHienTai.ky_thuat_vien_id) !== kyThuatVienId
    ) {
      throw taoLoi("Hồ sơ sửa chữa thuộc về kỹ thuật viên khác", 403);
    }

    const duLieuHopLe = hopNhatDuLieuSuaChua(duLieuMoi, hoSoHienTai);
    const linhKienThayThe = chuyenLinhKienThanhJson(
      duLieuHopLe.linhKienThayThe
    );
    const thoiGianHoanThanh = await suCoModel.layThoiGianHienTai(connection);

    if (hoSoHienTai) {
      const soHoSoDaCapNhat = await hoSoSuaChuaModel.hoanThanhHoSoSuaChua(
        connection,
        hoSoHienTai.id,
        {
          ...duLieuHopLe,
          linhKienThayThe,
          thoiGianHoanThanh
        }
      );

      if (soHoSoDaCapNhat !== 1) {
        throw taoLoi("Hồ sơ sửa chữa đã hoàn thành trước đó", 409);
      }
    } else {
      await hoSoSuaChuaModel.taoHoSoSuaChua(connection, {
        suCoId,
        kyThuatVienId,
        ...duLieuHopLe,
        linhKienThayThe,
        thoiGianBatDau: suCo.ngay_cap_nhat,
        thoiGianHoanThanh
      });
    }

    const trangThaiThietBiMoi = await layTrangThaiThietBiKhiHoanThanh(
      connection,
      thietBi,
      suCoId,
      duLieuHopLe.ketQua
    );
    const soSuCoDaCapNhat = await suCoModel.hoanThanhXuLy(
      connection,
      suCoId,
      kyThuatVienId,
      thoiGianHoanThanh
    );

    if (soSuCoDaCapNhat !== 1) {
      throw taoLoi("Trạng thái sự cố đã thay đổi, vui lòng tải lại dữ liệu", 409);
    }

    if (trangThaiThietBiMoi !== thietBi.trang_thai) {
      const soThietBiDaCapNhat = await thietBiModel.capNhatTrangThai(
        thietBi.id,
        trangThaiThietBiMoi,
        connection
      );

      if (soThietBiDaCapNhat !== 1) {
        throw taoLoi("Không thể cập nhật trạng thái thiết bị", 409);
      }
    }

    await thongBaoModel.taoThongBao({
      nguoiDungId: suCo.nguoi_bao_id,
      tieuDe: `Sự cố ${suCo.ma_su_co} đã được xử lý`,
      noiDung: `Sự cố ${suCo.ma_su_co} của thiết bị ${thietBi.ma_thiet_bi} đã được xử lý với kết quả ${duLieuHopLe.ketQua}.`,
      loaiThongBao: LOAI_THONG_BAO.SU_CO,
      doiTuongLienQuanId: suCoId
    }, connection);

    await connection.commit();
    daBatDauTransaction = false;

    return layChiTietCongViecKemHoSo(
      suCoId,
      kyThuatVienId,
      connection
    );
  } catch (loi) {
    if (connection && daBatDauTransaction) {
      await connection.rollback();
    }

    throw loi;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  taoSuCo,
  layDanhSachSuCoCuaToi,
  layChiTietSuCoCuaToi,
  layDanhSachSuCo,
  layChiTietSuCo,
  layDanhSachKyThuatVien,
  phanCongKyThuatVien,
  layCongViecCuaToi,
  layChiTietCongViecCuaToi,
  batDauXuLySuCo,
  capNhatHoSoSuaChua,
  layHoSoSuaChuaCuaToi,
  hoanThanhSuaChua
};
