const { pool } = require("../config/database");
const TRANG_THAI_MAU_CHECKLIST = require("../constants/trang_thai_mau_checklist");
const loaiThietBiModel = require("../models/loai_thiet_bi.model");
const mauChecklistModel = require("../models/mau_checklist.model");

const SO_HANG_MUC_TOI_DA = 200;
const DO_DAI_TEN_MAU_TOI_DA = 255;
const DO_DAI_HANG_MUC_TOI_DA = 500;
const DO_DAI_MO_TA_TOI_DA = 10000;

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;
  return loi;
}

function kiemTraDuLieuBody(duLieu) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw taoLoi("Dữ liệu mẫu checklist không hợp lệ", 400);
  }
}

function layGiaTri(duLieu, danhSachTen) {
  const tenTruong = danhSachTen.find((ten) =>
    Object.prototype.hasOwnProperty.call(duLieu || {}, ten)
  );
  return tenTruong ? duLieu[tenTruong] : undefined;
}

function layIdHopLe(giaTri, tenTruong, choPhepRong = false) {
  if (choPhepRong && (giaTri === undefined || giaTri === null || giaTri === "")) {
    return null;
  }

  const id = Number(giaTri);
  if (!Number.isInteger(id) || id <= 0) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return id;
}

function layChuoiBatBuoc(giaTri, tenTruong, doDaiToiDa) {
  if (typeof giaTri !== "string" || giaTri.trim() === "") {
    throw taoLoi(`${tenTruong} không được để trống`, 400);
  }
  const chuoi = giaTri.trim();
  if (chuoi.length > doDaiToiDa) {
    throw taoLoi(`${tenTruong} không được vượt quá ${doDaiToiDa} ký tự`, 400);
  }
  return chuoi;
}

function layChuoiTuyChon(giaTri, tenTruong, doDaiToiDa) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }
  if (typeof giaTri !== "string") {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  const chuoi = giaTri.trim();
  if (chuoi.length > doDaiToiDa) {
    throw taoLoi(`${tenTruong} không được vượt quá ${doDaiToiDa} ký tự`, 400);
  }
  return chuoi;
}

function chuyenJsonThanhMang(giaTri) {
  if (Array.isArray(giaTri)) return giaTri;
  try {
    const danhSach = JSON.parse(String(giaTri));
    return Array.isArray(danhSach) ? danhSach : [];
  } catch (loi) {
    return [];
  }
}

function layDanhSachHangMuc(giaTri) {
  let danhSach = giaTri;
  if (typeof giaTri === "string") {
    try {
      danhSach = JSON.parse(giaTri);
    } catch (loi) {
      throw taoLoi("Danh sách hạng mục không phải JSON hợp lệ", 400);
    }
  }

  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    throw taoLoi("Danh sách hạng mục phải là một mảng và không được để trống", 400);
  }
  if (danhSach.length > SO_HANG_MUC_TOI_DA) {
    throw taoLoi(`Mẫu checklist chỉ được có tối đa ${SO_HANG_MUC_TOI_DA} hạng mục`, 400);
  }

  return danhSach.map((hangMuc, viTri) => {
    if (!hangMuc || typeof hangMuc !== "object" || Array.isArray(hangMuc)) {
      throw taoLoi(`Hạng mục tại vị trí ${viTri + 1} không hợp lệ`, 400);
    }
    const noiDung = layChuoiBatBuoc(
      layGiaTri(hangMuc, ["noiDung", "noi_dung"]),
      `Nội dung hạng mục tại vị trí ${viTri + 1}`,
      DO_DAI_HANG_MUC_TOI_DA
    );

    return {
      id: hangMuc.id !== undefined && hangMuc.id !== null
        ? hangMuc.id
        : viTri + 1,
      noiDung
    };
  });
}

function chuyenMauChecklist(mauChecklist) {
  return {
    id: mauChecklist.id,
    tenMau: mauChecklist.ten_mau,
    loaiThietBi: mauChecklist.loai_thiet_bi_id
      ? {
        id: mauChecklist.loai_thiet_bi_id,
        tenLoai: mauChecklist.loai_thiet_bi_ten
      }
      : null,
    danhSachHangMuc: chuyenJsonThanhMang(mauChecklist.danh_sach_hang_muc).map(
      (hangMuc) => ({
        ...(hangMuc.id !== undefined ? { id: hangMuc.id } : {}),
        noiDung: layGiaTri(hangMuc, ["noiDung", "noi_dung"])
      })
    ),
    moTa: mauChecklist.mo_ta,
    trangThai: mauChecklist.trang_thai,
    nguoiTao: mauChecklist.nguoi_tao_id
      ? { id: mauChecklist.nguoi_tao_id, hoTen: mauChecklist.nguoi_tao_ho_ten }
      : null,
    ngayTao: mauChecklist.ngay_tao,
    ngayCapNhat: mauChecklist.ngay_cap_nhat
  };
}

function layPhanTrang(query = {}) {
  const trang = Number(query.page ?? query.trang ?? 1);
  const gioiHan = Number(query.limit ?? query.gioiHan ?? 10);
  if (!Number.isInteger(trang) || trang < 1) throw taoLoi("Trang không hợp lệ", 400);
  if (!Number.isInteger(gioiHan) || gioiHan < 1 || gioiHan > 100) {
    throw taoLoi("Giới hạn phải là số nguyên từ 1 đến 100", 400);
  }
  return { trang, gioiHan, boQua: (trang - 1) * gioiHan };
}

function layTrangThai(giaTri) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }
  const trangThai = String(giaTri).trim().toUpperCase();
  if (!Object.values(TRANG_THAI_MAU_CHECKLIST).includes(trangThai)) {
    throw taoLoi("Trạng thái mẫu checklist không hợp lệ", 400);
  }
  return trangThai;
}

async function layDanhSachMauChecklist(query = {}) {
  const { trang, gioiHan, boQua } = layPhanTrang(query);
  const trangThai = layTrangThai(layGiaTri(query, ["trangThai", "trang_thai"]));
  const loaiRaw = layGiaTri(query, ["loaiThietBiId", "loai_thiet_bi_id"]);
  const loaiThietBiId = loaiRaw === undefined || loaiRaw === ""
    ? null
    : layIdHopLe(loaiRaw, "Loại thiết bị");
  const dieuKien = { trangThai, loaiThietBiId };
  const [danhSach, tongBanGhi] = await Promise.all([
    mauChecklistModel.layDanhSachMauChecklist({ ...dieuKien, gioiHan, boQua }),
    mauChecklistModel.demTongMauChecklist(dieuKien)
  ]);

  return {
    danhSach: danhSach.map(chuyenMauChecklist),
    phanTrang: { trang, gioiHan, tongBanGhi, tongTrang: Math.ceil(tongBanGhi / gioiHan) }
  };
}

async function layChiTietMauChecklist(id) {
  const mauChecklistId = layIdHopLe(id, "Mẫu checklist");
  const mauChecklist = await mauChecklistModel.timTheoId(mauChecklistId);
  if (!mauChecklist) throw taoLoi("Không tìm thấy mẫu checklist", 404);
  return chuyenMauChecklist(mauChecklist);
}

async function kiemTraLoaiThietBi(loaiThietBiId, connection) {
  if (!loaiThietBiId) return;
  const loaiThietBi = await loaiThietBiModel.timTheoId(loaiThietBiId, connection);
  if (!loaiThietBi) throw taoLoi("Không tìm thấy loại thiết bị", 404);
}

async function taoMauChecklist(duLieu, nguoiDung) {
  kiemTraDuLieuBody(duLieu);
  const tenMau = layChuoiBatBuoc(
    layGiaTri(duLieu, ["tenMau", "ten_mau"]),
    "Tên mẫu",
    DO_DAI_TEN_MAU_TOI_DA
  );
  const loaiThietBiId = layIdHopLe(
    layGiaTri(duLieu, ["loaiThietBiId", "loai_thiet_bi_id"]),
    "Loại thiết bị",
    true
  );
  const danhSachHangMuc = layDanhSachHangMuc(
    layGiaTri(duLieu, ["danhSachHangMuc", "danh_sach_hang_muc"])
  );
  const moTa = layChuoiTuyChon(duLieu.moTa ?? duLieu.mo_ta, "Mô tả", DO_DAI_MO_TA_TOI_DA);
  const nguoiTaoId = layIdHopLe(nguoiDung && nguoiDung.id, "Người tạo");
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await kiemTraLoaiThietBi(loaiThietBiId, connection);
    const id = await mauChecklistModel.taoMauChecklist(connection, {
      tenMau, loaiThietBiId, danhSachHangMuc, moTa, nguoiTaoId
    });
    await connection.commit();
    return layChiTietMauChecklist(id);
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

async function capNhatMauChecklist(id, duLieu) {
  const mauChecklistId = layIdHopLe(id, "Mẫu checklist");
  kiemTraDuLieuBody(duLieu);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const hienTai = await mauChecklistModel.timTheoIdDeCapNhat(mauChecklistId, connection);
    if (!hienTai) throw taoLoi("Không tìm thấy mẫu checklist", 404);
    if (hienTai.trang_thai !== TRANG_THAI_MAU_CHECKLIST.HOAT_DONG) {
      throw taoLoi("Không thể sửa mẫu checklist đã ngừng hoạt động", 409);
    }

    const tenMau = layChuoiBatBuoc(
      layGiaTri(duLieu, ["tenMau", "ten_mau"]) ?? hienTai.ten_mau,
      "Tên mẫu",
      DO_DAI_TEN_MAU_TOI_DA
    );
    const loaiRaw = layGiaTri(duLieu, ["loaiThietBiId", "loai_thiet_bi_id"]);
    const loaiThietBiId = loaiRaw === undefined
      ? hienTai.loai_thiet_bi_id
      : layIdHopLe(loaiRaw, "Loại thiết bị", true);
    const danhSachRaw = layGiaTri(duLieu, ["danhSachHangMuc", "danh_sach_hang_muc"]);
    const danhSachHangMuc = danhSachRaw === undefined
      ? chuyenJsonThanhMang(hienTai.danh_sach_hang_muc)
      : layDanhSachHangMuc(danhSachRaw);
    const moTaRaw = layGiaTri(duLieu, ["moTa", "mo_ta"]);
    const moTa = moTaRaw === undefined
      ? hienTai.mo_ta
      : layChuoiTuyChon(moTaRaw, "Mô tả", DO_DAI_MO_TA_TOI_DA);

    await kiemTraLoaiThietBi(loaiThietBiId, connection);
    await mauChecklistModel.capNhatMauChecklist(connection, mauChecklistId, {
      tenMau, loaiThietBiId, danhSachHangMuc, moTa
    });
    await connection.commit();
    return layChiTietMauChecklist(mauChecklistId);
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

async function ngungHoatDongMauChecklist(id) {
  const mauChecklistId = layIdHopLe(id, "Mẫu checklist");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hienTai = await mauChecklistModel.timTheoIdDeCapNhat(mauChecklistId, connection);
    if (!hienTai) throw taoLoi("Không tìm thấy mẫu checklist", 404);
    if (hienTai.trang_thai === TRANG_THAI_MAU_CHECKLIST.NGUNG_HOAT_DONG) {
      throw taoLoi("Mẫu checklist đã ngừng hoạt động", 409);
    }
    await mauChecklistModel.ngungHoatDongMauChecklist(connection, mauChecklistId);
    await connection.commit();
    return layChiTietMauChecklist(mauChecklistId);
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

module.exports = {
  layDanhSachMauChecklist,
  layChiTietMauChecklist,
  taoMauChecklist,
  capNhatMauChecklist,
  ngungHoatDongMauChecklist,
  chuyenMauChecklist
};
