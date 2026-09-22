const { pool } = require("../config/database");
const LOAI_THONG_BAO = require("../constants/loai_thong_bao");
const TRANG_THAI_KE_HOACH_BAO_TRI = require("../constants/trang_thai_ke_hoach_bao_tri");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const TRANG_THAI_PHIEU_BAO_TRI = require("../constants/trang_thai_phieu_bao_tri");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const VAI_TRO = require("../constants/vai_tro");
const keHoachBaoTriModel = require("../models/ke_hoach_bao_tri.model");
const mauChecklistModel = require("../models/mau_checklist.model");
const nguoiDungModel = require("../models/nguoi_dung.model");
const phieuBaoTriModel = require("../models/phieu_bao_tri.model");
const thietBiModel = require("../models/thiet_bi.model");
const thongBaoModel = require("../models/thong_bao.model");
const { chuyenNgayThanhChuoi } = require("../utils/ngay");

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;
  return loi;
}

function kiemTraDuLieuBody(duLieu) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw taoLoi("Dữ liệu phân công không hợp lệ", 400);
  }
}

function layGiaTri(duLieu, danhSachTen) {
  const tenTruong = danhSachTen.find((ten) =>
    Object.prototype.hasOwnProperty.call(duLieu || {}, ten)
  );
  return tenTruong ? duLieu[tenTruong] : undefined;
}

function layIdHopLe(giaTri, tenTruong) {
  const id = Number(giaTri);
  if (!Number.isInteger(id) || id <= 0) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return id;
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

function taoChecklistSnapshot(danhSachHangMuc) {
  const danhSach = chuyenJsonThanhMang(danhSachHangMuc);
  if (danhSach.length === 0) {
    throw taoLoi("Mẫu checklist không có hạng mục hợp lệ", 409);
  }

  return danhSach.map((hangMuc, viTri) => {
    const noiDungRaw = layGiaTri(hangMuc, ["noiDung", "noi_dung"]);
    if (typeof noiDungRaw !== "string" || noiDungRaw.trim() === "") {
      throw taoLoi(`Hạng mục checklist tại vị trí ${viTri + 1} không hợp lệ`, 409);
    }
    return {
      ...(hangMuc.id !== undefined ? { id: hangMuc.id } : {}),
      noiDung: noiDungRaw.trim(),
      loai: "CHECKLIST",
      trangThai: null,
      ghiChu: null
    };
  });
}

async function kiemTraKyThuatVien(kyThuatVienId, connection) {
  const kyThuatVien = await nguoiDungModel.timTheoIdDeCapNhat(
    kyThuatVienId,
    connection
  );
  if (!kyThuatVien) throw taoLoi("Không tìm thấy kỹ thuật viên", 404);
  if (kyThuatVien.vai_tro !== VAI_TRO.KY_THUAT_VIEN) {
    throw taoLoi("Người được phân công phải có vai trò kỹ thuật viên", 400);
  }
  if (kyThuatVien.trang_thai !== TRANG_THAI_NGUOI_DUNG.HOAT_DONG) {
    throw taoLoi("Kỹ thuật viên đã ngừng hoạt động", 409);
  }
  return kyThuatVien;
}

async function taoThongBaoPhanCong({
  connection,
  kyThuatVien,
  phieuBaoTriId,
  thietBi
}) {
  const tieuDe = "Phân công bảo trì";
  const daTonTai = await thongBaoModel.daTonTaiThongBaoTrongNgay({
    nguoiDungId: kyThuatVien.id,
    tieuDe,
    loaiThongBao: LOAI_THONG_BAO.PHAN_CONG,
    doiTuongLienQuanId: phieuBaoTriId
  }, connection);

  if (!daTonTai) {
    await thongBaoModel.taoThongBao({
      nguoiDungId: kyThuatVien.id,
      tieuDe,
      noiDung: `Bạn được phân công bảo trì thiết bị ${thietBi.ma_thiet_bi} - ${thietBi.ten_thiet_bi}`,
      loaiThongBao: LOAI_THONG_BAO.PHAN_CONG,
      doiTuongLienQuanId: phieuBaoTriId
    }, connection);
  }
}

async function taoHoacCapNhatPhieuPhanCong({
  connection,
  keHoach,
  mauChecklist,
  kyThuatVien,
  thietBi
}) {
  const phieuHienTai = await phieuBaoTriModel
    .timPhieuChuaKetThucTheoKeHoachDeCapNhat(keHoach.id, connection);
  let phieuBaoTriId;

  if (phieuHienTai) {
    if (phieuHienTai.trang_thai === TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN) {
      throw taoLoi("Không thể đổi phân công khi phiếu bảo trì đang được thực hiện", 409);
    }
    await phieuBaoTriModel.capNhatPhanCongPhieu(
      connection,
      phieuHienTai.id,
      kyThuatVien.id
    );
    phieuBaoTriId = phieuHienTai.id;
  } else {
    const ketQuaChecklist = taoChecklistSnapshot(mauChecklist.danh_sach_hang_muc);
    phieuBaoTriId = await phieuBaoTriModel.taoPhieuBaoTri(connection, {
      keHoachBaoTriId: keHoach.id,
      thietBiId: keHoach.thiet_bi_id,
      kyThuatVienId: kyThuatVien.id,
      ngayDuKien: keHoach.ngay_bao_tri_tiep_theo,
      ketQuaChecklist
    });
  }

  await taoThongBaoPhanCong({
    connection,
    kyThuatVien,
    phieuBaoTriId,
    thietBi
  });
  return phieuBaoTriId;
}

function chuyenKeHoachCuaToi(keHoach) {
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
      tenMau: keHoach.mau_checklist_ten
    },
    giaTriChuKy: keHoach.gia_tri_chu_ky,
    donViChuKy: keHoach.don_vi_chu_ky,
    ngayBatDau: chuyenNgayThanhChuoi(keHoach.ngay_bat_dau),
    ngayBaoTriTiepTheo: chuyenNgayThanhChuoi(
      keHoach.ngay_bao_tri_tiep_theo
    ),
    trangThai: keHoach.trang_thai,
    moTa: keHoach.mo_ta
  };
}

async function phanCongKeHoach(id, duLieu) {
  const keHoachId = layIdHopLe(id, "Kế hoạch bảo trì");
  kiemTraDuLieuBody(duLieu);
  const kyThuatVienId = layIdHopLe(
    layGiaTri(duLieu, ["kyThuatVienId", "ky_thuat_vien_id"]),
    "Kỹ thuật viên"
  );
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const keHoach = await keHoachBaoTriModel.timTheoIdDeCapNhat(keHoachId, connection);
    if (!keHoach) throw taoLoi("Không tìm thấy kế hoạch bảo trì", 404);
    if (keHoach.trang_thai !== TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG) {
      throw taoLoi("Không thể phân công kế hoạch đã ngừng hoạt động", 409);
    }

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(keHoach.thiet_bi_id, connection);
    if (!thietBi) throw taoLoi("Không tìm thấy thiết bị của kế hoạch", 404);
    if (thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY) {
      throw taoLoi("Không thể phân công bảo trì cho thiết bị đã thanh lý", 409);
    }
    const mauChecklist = await mauChecklistModel.timTheoIdDeCapNhat(
      keHoach.mau_checklist_id,
      connection
    );
    if (!mauChecklist) throw taoLoi("Không tìm thấy mẫu checklist", 404);
    const kyThuatVien = await kiemTraKyThuatVien(kyThuatVienId, connection);

    await keHoachBaoTriModel.phanCongKyThuatVien(
      connection,
      keHoachId,
      kyThuatVienId
    );
    const phieuBaoTriId = await taoHoacCapNhatPhieuPhanCong({
      connection,
      keHoach,
      mauChecklist,
      kyThuatVien,
      thietBi
    });
    await connection.commit();
    return { keHoachBaoTriId: keHoachId, phieuBaoTriId, kyThuatVienId };
  } catch (loi) {
    await connection.rollback();
    throw loi;
  } finally {
    connection.release();
  }
}

async function layKeHoachCuaToi(query, nguoiDung) {
  if (!nguoiDung || nguoiDung.vaiTro !== VAI_TRO.KY_THUAT_VIEN) {
    throw taoLoi("Chỉ kỹ thuật viên được xem kế hoạch của mình", 403);
  }
  const trang = Number(query.page ?? query.trang ?? 1);
  const gioiHan = Number(query.limit ?? query.gioiHan ?? 10);
  if (!Number.isInteger(trang) || trang < 1) throw taoLoi("Trang không hợp lệ", 400);
  if (!Number.isInteger(gioiHan) || gioiHan < 1 || gioiHan > 100) {
    throw taoLoi("Giới hạn phải là số nguyên từ 1 đến 100", 400);
  }
  const dieuKien = {
    trangThai: TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG,
    kyThuatVienId: layIdHopLe(nguoiDung.id, "Kỹ thuật viên")
  };
  const [danhSach, tongBanGhi] = await Promise.all([
    keHoachBaoTriModel.layDanhSachKeHoach({
      ...dieuKien,
      gioiHan,
      boQua: (trang - 1) * gioiHan
    }),
    keHoachBaoTriModel.demTongKeHoach(dieuKien)
  ]);
  return {
    danhSach: danhSach.map(chuyenKeHoachCuaToi),
    phanTrang: { trang, gioiHan, tongBanGhi, tongTrang: Math.ceil(tongBanGhi / gioiHan) }
  };
}

async function layLichSuPhanCong(id) {
  const keHoachId = layIdHopLe(id, "Kế hoạch bảo trì");
  const keHoach = await keHoachBaoTriModel.timTheoId(keHoachId);
  if (!keHoach) throw taoLoi("Không tìm thấy kế hoạch bảo trì", 404);
  const danhSach = await phieuBaoTriModel.layLichSuPhanCongTheoKeHoach(keHoachId);
  return danhSach.map((phieu) => ({
    phieuBaoTriId: phieu.id,
    keHoachBaoTriId: phieu.ke_hoach_bao_tri_id,
    kyThuatVien: phieu.ky_thuat_vien_id
      ? {
        id: phieu.ky_thuat_vien_id,
        hoTen: phieu.ky_thuat_vien_ho_ten,
        email: phieu.ky_thuat_vien_email
      }
      : null,
    ngayDuKien: chuyenNgayThanhChuoi(phieu.ngay_du_kien),
    trangThai: phieu.trang_thai,
    thoiGianBatDau: phieu.thoi_gian_bat_dau,
    thoiGianHoanThanh: phieu.thoi_gian_hoan_thanh,
    ngayTao: phieu.ngay_tao,
    ngayCapNhat: phieu.ngay_cap_nhat
  }));
}

module.exports = {
  phanCongKeHoach,
  layKeHoachCuaToi,
  layLichSuPhanCong,
  kiemTraKyThuatVien,
  taoHoacCapNhatPhieuPhanCong
};
