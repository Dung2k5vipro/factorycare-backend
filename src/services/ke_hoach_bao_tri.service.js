const { pool } = require("../config/database");
const DON_VI_CHU_KY = require("../constants/don_vi_chu_ky");
const TRANG_THAI_KE_HOACH_BAO_TRI = require("../constants/trang_thai_ke_hoach_bao_tri");
const TRANG_THAI_MAU_CHECKLIST = require("../constants/trang_thai_mau_checklist");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const keHoachBaoTriModel = require("../models/ke_hoach_bao_tri.model");
const mauChecklistModel = require("../models/mau_checklist.model");
const phieuBaoTriModel = require("../models/phieu_bao_tri.model");
const thietBiModel = require("../models/thiet_bi.model");
const {
  kiemTraKyThuatVien,
  taoHoacCapNhatPhieuPhanCong
} = require("./phan_cong_bao_tri.service");

const DO_DAI_MO_TA_TOI_DA = 10000;

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;
  return loi;
}

function kiemTraDuLieuBody(duLieu) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw taoLoi("Dữ liệu kế hoạch bảo trì không hợp lệ", 400);
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
  if (!Number.isInteger(id) || id <= 0) throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  return id;
}

function layNgayHopLe(giaTri, tenTruong) {
  if (typeof giaTri !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(giaTri)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }
  const [nam, thang, ngay] = giaTri.split("-").map(Number);
  const ngayKiemTra = new Date(Date.UTC(nam, thang - 1, ngay));
  if (
    ngayKiemTra.getUTCFullYear() !== nam ||
    ngayKiemTra.getUTCMonth() !== thang - 1 ||
    ngayKiemTra.getUTCDate() !== ngay
  ) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return giaTri;
}

function dinhDangNgayTuCoSoDuLieu(giaTri) {
  if (typeof giaTri === "string") return giaTri.slice(0, 10);
  if (giaTri instanceof Date && !Number.isNaN(giaTri.getTime())) {
    const nam = giaTri.getFullYear();
    const thang = String(giaTri.getMonth() + 1).padStart(2, "0");
    const ngay = String(giaTri.getDate()).padStart(2, "0");
    return `${nam}-${thang}-${ngay}`;
  }
  return giaTri;
}

function layChuKy(giaTriChuKyRaw, donViChuKyRaw) {
  const giaTriChuKy = Number(giaTriChuKyRaw);
  if (!Number.isInteger(giaTriChuKy) || giaTriChuKy <= 0) {
    throw taoLoi("Giá trị chu kỳ phải là số nguyên lớn hơn 0", 400);
  }
  const donViChuKy = typeof donViChuKyRaw === "string"
    ? donViChuKyRaw.trim().toUpperCase()
    : "";
  if (!Object.values(DON_VI_CHU_KY).includes(donViChuKy)) {
    throw taoLoi("Đơn vị chu kỳ không hợp lệ", 400);
  }
  return { giaTriChuKy, donViChuKy };
}

function layMoTa(giaTri) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }
  if (typeof giaTri !== "string") throw taoLoi("Mô tả không hợp lệ", 400);
  const moTa = giaTri.trim();
  if (moTa.length > DO_DAI_MO_TA_TOI_DA) {
    throw taoLoi(`Mô tả không được vượt quá ${DO_DAI_MO_TA_TOI_DA} ký tự`, 400);
  }
  return moTa;
}

function chuyenKeHoach(keHoach) {
  return {
    id: keHoach.id,
    thietBi: {
      id: keHoach.thiet_bi_id,
      maThietBi: keHoach.ma_thiet_bi,
      tenThietBi: keHoach.ten_thiet_bi,
      trangThai: keHoach.thiet_bi_trang_thai
    },
    mauChecklist: {
      id: keHoach.mau_checklist_id,
      tenMau: keHoach.mau_checklist_ten,
      trangThai: keHoach.mau_checklist_trang_thai
    },
    kyThuatVien: keHoach.ky_thuat_vien_id
      ? {
        id: keHoach.ky_thuat_vien_id,
        hoTen: keHoach.ky_thuat_vien_ho_ten,
        email: keHoach.ky_thuat_vien_email,
        trangThai: keHoach.ky_thuat_vien_trang_thai
      }
      : null,
    giaTriChuKy: keHoach.gia_tri_chu_ky,
    donViChuKy: keHoach.don_vi_chu_ky,
    ngayBatDau: keHoach.ngay_bat_dau,
    ngayBaoTriTiepTheo: keHoach.ngay_bao_tri_tiep_theo,
    trangThai: keHoach.trang_thai,
    moTa: keHoach.mo_ta,
    ngayTao: keHoach.ngay_tao,
    ngayCapNhat: keHoach.ngay_cap_nhat
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
  if (!Object.values(TRANG_THAI_KE_HOACH_BAO_TRI).includes(trangThai)) {
    throw taoLoi("Trạng thái kế hoạch không hợp lệ", 400);
  }
  return trangThai;
}

async function kiemTraThietBi(thietBiId, connection) {
  const thietBi = await thietBiModel.timTheoIdDeCapNhat(thietBiId, connection);
  if (!thietBi) throw taoLoi("Không tìm thấy thiết bị", 404);
  if (thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY) {
    throw taoLoi("Không thể lập kế hoạch cho thiết bị đã thanh lý", 409);
  }
  return thietBi;
}

async function kiemTraMauChecklist(mauChecklistId, connection) {
  const mauChecklist = await mauChecklistModel.timTheoIdDeCapNhat(
    mauChecklistId,
    connection
  );
  if (!mauChecklist) throw taoLoi("Không tìm thấy mẫu checklist", 404);
  if (mauChecklist.trang_thai !== TRANG_THAI_MAU_CHECKLIST.HOAT_DONG) {
    throw taoLoi("Mẫu checklist đã ngừng hoạt động", 409);
  }
  return mauChecklist;
}

async function layDanhSachKeHoach(query = {}) {
  const { trang, gioiHan, boQua } = layPhanTrang(query);
  const trangThai = layTrangThai(layGiaTri(query, ["trangThai", "trang_thai"]));
  const thietBiRaw = layGiaTri(query, ["thietBiId", "thiet_bi_id"]);
  const kyThuatVienRaw = layGiaTri(query, ["kyThuatVienId", "ky_thuat_vien_id"]);
  const dieuKien = {
    trangThai,
    thietBiId: thietBiRaw === undefined || thietBiRaw === ""
      ? null
      : layIdHopLe(thietBiRaw, "Thiết bị"),
    kyThuatVienId: kyThuatVienRaw === undefined || kyThuatVienRaw === ""
      ? null
      : layIdHopLe(kyThuatVienRaw, "Kỹ thuật viên")
  };
  const [danhSach, tongBanGhi] = await Promise.all([
    keHoachBaoTriModel.layDanhSachKeHoach({ ...dieuKien, gioiHan, boQua }),
    keHoachBaoTriModel.demTongKeHoach(dieuKien)
  ]);
  return {
    danhSach: danhSach.map(chuyenKeHoach),
    phanTrang: { trang, gioiHan, tongBanGhi, tongTrang: Math.ceil(tongBanGhi / gioiHan) }
  };
}

async function layChiTietKeHoach(id) {
  const keHoachId = layIdHopLe(id, "Kế hoạch bảo trì");
  const keHoach = await keHoachBaoTriModel.timTheoId(keHoachId);
  if (!keHoach) throw taoLoi("Không tìm thấy kế hoạch bảo trì", 404);
  return chuyenKeHoach(keHoach);
}

async function taoKeHoach(duLieu) {
  kiemTraDuLieuBody(duLieu);
  const thietBiId = layIdHopLe(
    layGiaTri(duLieu, ["thietBiId", "thiet_bi_id"]),
    "Thiết bị"
  );
  const mauChecklistId = layIdHopLe(
    layGiaTri(duLieu, ["mauChecklistId", "mau_checklist_id"]),
    "Mẫu checklist"
  );
  const kyThuatVienId = layIdHopLe(
    layGiaTri(duLieu, ["kyThuatVienId", "ky_thuat_vien_id"]),
    "Kỹ thuật viên",
    true
  );
  const { giaTriChuKy, donViChuKy } = layChuKy(
    layGiaTri(duLieu, ["giaTriChuKy", "gia_tri_chu_ky"]),
    layGiaTri(duLieu, ["donViChuKy", "don_vi_chu_ky"])
  );
  const ngayBatDau = layNgayHopLe(
    layGiaTri(duLieu, ["ngayBatDau", "ngay_bat_dau"]),
    "Ngày bắt đầu"
  );
  const ngayBaoTriTiepTheo = layNgayHopLe(
    layGiaTri(duLieu, ["ngayBaoTriTiepTheo", "ngay_bao_tri_tiep_theo"]),
    "Ngày bảo trì tiếp theo"
  );
  if (ngayBaoTriTiepTheo < ngayBatDau) {
    throw taoLoi("Ngày bảo trì tiếp theo không được trước ngày bắt đầu", 400);
  }
  const moTa = layMoTa(layGiaTri(duLieu, ["moTa", "mo_ta"]));
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const thietBi = await kiemTraThietBi(thietBiId, connection);
    const mauChecklist = await kiemTraMauChecklist(mauChecklistId, connection);
    const kyThuatVien = kyThuatVienId
      ? await kiemTraKyThuatVien(kyThuatVienId, connection)
      : null;
    const id = await keHoachBaoTriModel.taoKeHoach(connection, {
      thietBiId,
      mauChecklistId,
      kyThuatVienId,
      giaTriChuKy,
      donViChuKy,
      ngayBatDau,
      ngayBaoTriTiepTheo,
      moTa
    });

    if (kyThuatVien) {
      await taoHoacCapNhatPhieuPhanCong({
        connection,
        keHoach: {
          id,
          thiet_bi_id: thietBiId,
          ngay_bao_tri_tiep_theo: ngayBaoTriTiepTheo
        },
        mauChecklist,
        kyThuatVien,
        thietBi
      });
    }
    await connection.commit();
    return layChiTietKeHoach(id);
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

function kiemTraKhongDoiDinhDanhKeHoach(duLieu, thietBiIdHienTai) {
  const thietBiRaw = layGiaTri(duLieu, ["thietBiId", "thiet_bi_id"]);
  if (thietBiRaw !== undefined && layIdHopLe(thietBiRaw, "Thiết bị") !== Number(thietBiIdHienTai)) {
    throw taoLoi("Không được thay đổi thiết bị của kế hoạch bảo trì", 409);
  }
  const kyThuatVienRaw = layGiaTri(duLieu, ["kyThuatVienId", "ky_thuat_vien_id"]);
  if (kyThuatVienRaw !== undefined) {
    throw taoLoi("Hãy dùng chức năng phân công để thay đổi kỹ thuật viên", 400);
  }
}

async function capNhatKeHoach(id, duLieu) {
  const keHoachId = layIdHopLe(id, "Kế hoạch bảo trì");
  kiemTraDuLieuBody(duLieu);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hienTai = await keHoachBaoTriModel.timTheoIdDeCapNhat(keHoachId, connection);
    if (!hienTai) throw taoLoi("Không tìm thấy kế hoạch bảo trì", 404);
    if (hienTai.trang_thai !== TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG) {
      throw taoLoi("Không thể sửa kế hoạch đã ngừng hoạt động", 409);
    }
    kiemTraKhongDoiDinhDanhKeHoach(duLieu, hienTai.thiet_bi_id);

    await kiemTraThietBi(hienTai.thiet_bi_id, connection);
    const mauRaw = layGiaTri(duLieu, ["mauChecklistId", "mau_checklist_id"]);
    const mauChecklistId = mauRaw === undefined
      ? hienTai.mau_checklist_id
      : layIdHopLe(mauRaw, "Mẫu checklist");
    if (mauRaw !== undefined) {
      await kiemTraMauChecklist(mauChecklistId, connection);
    }

    const giaTriRaw = layGiaTri(duLieu, ["giaTriChuKy", "gia_tri_chu_ky"]);
    const donViRaw = layGiaTri(duLieu, ["donViChuKy", "don_vi_chu_ky"]);
    const { giaTriChuKy, donViChuKy } = layChuKy(
      giaTriRaw ?? hienTai.gia_tri_chu_ky,
      donViRaw ?? hienTai.don_vi_chu_ky
    );
    const ngayBatDauRaw = layGiaTri(duLieu, ["ngayBatDau", "ngay_bat_dau"]);
    const ngayTiepTheoRaw = layGiaTri(duLieu, ["ngayBaoTriTiepTheo", "ngay_bao_tri_tiep_theo"]);
    const ngayBatDau = ngayBatDauRaw === undefined
      ? dinhDangNgayTuCoSoDuLieu(hienTai.ngay_bat_dau)
      : layNgayHopLe(ngayBatDauRaw, "Ngày bắt đầu");
    const ngayBaoTriTiepTheo = ngayTiepTheoRaw === undefined
      ? dinhDangNgayTuCoSoDuLieu(hienTai.ngay_bao_tri_tiep_theo)
      : layNgayHopLe(ngayTiepTheoRaw, "Ngày bảo trì tiếp theo");
    if (ngayBaoTriTiepTheo < ngayBatDau) {
      throw taoLoi("Ngày bảo trì tiếp theo không được trước ngày bắt đầu", 400);
    }
    const moTaRaw = layGiaTri(duLieu, ["moTa", "mo_ta"]);
    const moTa = moTaRaw === undefined ? hienTai.mo_ta : layMoTa(moTaRaw);

    await keHoachBaoTriModel.capNhatKeHoach(connection, keHoachId, {
      mauChecklistId,
      giaTriChuKy,
      donViChuKy,
      ngayBatDau,
      ngayBaoTriTiepTheo,
      moTa
    });
    if (ngayTiepTheoRaw !== undefined) {
      await phieuBaoTriModel.capNhatNgayDuKienTheoKeHoach(
        connection,
        keHoachId,
        ngayBaoTriTiepTheo
      );
    }
    await connection.commit();
    return layChiTietKeHoach(keHoachId);
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

async function ngungHoatDongKeHoach(id) {
  const keHoachId = layIdHopLe(id, "Kế hoạch bảo trì");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hienTai = await keHoachBaoTriModel.timTheoIdDeCapNhat(keHoachId, connection);
    if (!hienTai) throw taoLoi("Không tìm thấy kế hoạch bảo trì", 404);
    if (hienTai.trang_thai === TRANG_THAI_KE_HOACH_BAO_TRI.NGUNG_HOAT_DONG) {
      throw taoLoi("Kế hoạch bảo trì đã ngừng hoạt động", 409);
    }
    await keHoachBaoTriModel.ngungHoatDongKeHoach(connection, keHoachId);
    await connection.commit();
    return layChiTietKeHoach(keHoachId);
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

module.exports = {
  layDanhSachKeHoach,
  layChiTietKeHoach,
  taoKeHoach,
  capNhatKeHoach,
  ngungHoatDongKeHoach,
  chuyenKeHoach
};
