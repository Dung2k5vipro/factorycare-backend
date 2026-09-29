const { pool } = require("../config/database");
const LOAI_THONG_BAO = require("../constants/loai_thong_bao");
const TRANG_THAI_PHIEU_BAO_TRI = require("../constants/trang_thai_phieu_bao_tri");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const VAI_TRO = require("../constants/vai_tro");
const keHoachBaoTriModel = require("../models/ke_hoach_bao_tri.model");
const phieuBaoTriModel = require("../models/phieu_bao_tri.model");
const thietBiModel = require("../models/thiet_bi.model");
const thongBaoModel = require("../models/thong_bao.model");
const { chuyenNgayThanhChuoi } = require("../utils/ngay");

const SO_NGAY_CANH_BAO_MAC_DINH = 7;
const SO_NGAY_CANH_BAO_TOI_DA = 90;
const SO_BAN_GHI_MOI_TRANG_MAC_DINH = 10;
const SO_BAN_GHI_MOI_TRANG_TOI_DA = 100;
const SO_HANG_MUC_TOI_DA = 200;
const SO_LINH_KIEN_TOI_DA = 100;
const DO_DAI_NOI_DUNG_TOI_DA = 10000;
const DO_DAI_HANG_MUC_TOI_DA = 500;
const DO_DAI_TEN_LINH_KIEN_TOI_DA = 200;
const LOAI_HANG_MUC_HOP_LE = ["CHECKLIST", "PHAT_HIEN_THEM"];
const TRANG_THAI_HANG_MUC_HOP_LE = ["TOT", "CO_LOI"];
const TRANG_THAI_THIET_BI_SAU_BAO_TRI_HOP_LE = [
  TRANG_THAI_THIET_BI.DANG_HOAT_DONG,
  TRANG_THAI_THIET_BI.DANG_HONG
];

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

function layNgayTuyChon(giaTri, tenTruong) {
  const ngay = chuanHoaChuoi(giaTri);

  if (!ngay) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }

  const [nam, thang, ngayTrongThang] = ngay.split("-").map(Number);
  const ngayKiemTra = new Date(Date.UTC(nam, thang - 1, ngayTrongThang));

  if (
    ngayKiemTra.getUTCFullYear() !== nam ||
    ngayKiemTra.getUTCMonth() !== thang - 1 ||
    ngayKiemTra.getUTCDate() !== ngayTrongThang
  ) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return ngay;
}

function layThongTinPhanTrang(query = {}) {
  const trangRaw = query.page !== undefined ? query.page : query.trang;
  const gioiHanRaw = query.limit !== undefined ? query.limit : query.gioiHan;
  const trangHienTai = Number(trangRaw === undefined ? 1 : trangRaw);
  const soBanGhiMoiTrang = Number(
    gioiHanRaw === undefined ? SO_BAN_GHI_MOI_TRANG_MAC_DINH : gioiHanRaw
  );

  if (!Number.isInteger(trangHienTai) || trangHienTai < 1) {
    throw taoLoi("Trang không hợp lệ", 400);
  }

  if (
    !Number.isInteger(soBanGhiMoiTrang) ||
    soBanGhiMoiTrang < 1 ||
    soBanGhiMoiTrang > SO_BAN_GHI_MOI_TRANG_TOI_DA
  ) {
    throw taoLoi(
      `Giới hạn phải là số nguyên từ 1 đến ${SO_BAN_GHI_MOI_TRANG_TOI_DA}`,
      400
    );
  }

  return {
    trangHienTai,
    soBanGhiMoiTrang,
    boQua: (trangHienTai - 1) * soBanGhiMoiTrang
  };
}

function layTrangThaiPhieu(giaTri) {
  const trangThai = chuanHoaChuoi(giaTri);

  if (!trangThai) {
    return null;
  }

  const trangThaiVietHoa = trangThai.toUpperCase();

  if (!Object.values(TRANG_THAI_PHIEU_BAO_TRI).includes(trangThaiVietHoa)) {
    throw taoLoi("Trạng thái phiếu bảo trì không hợp lệ", 400);
  }

  return trangThaiVietHoa;
}

function layDieuKienLoc(query = {}) {
  const trangThai = layTrangThaiPhieu(
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
  const tuNgay = layNgayTuyChon(
    layGiaTriTheoNhieuTen(query, ["tuNgay", "tu_ngay"]),
    "Từ ngày"
  );
  const denNgay = layNgayTuyChon(
    layGiaTriTheoNhieuTen(query, ["denNgay", "den_ngay"]),
    "Đến ngày"
  );

  if (tuNgay && denNgay && tuNgay > denNgay) {
    throw taoLoi("Từ ngày không được lớn hơn đến ngày", 400);
  }

  return {
    trangThai,
    thietBiId,
    kyThuatVienId,
    tuNgay,
    denNgay
  };
}

function chuyenJsonThanhMang(giaTri) {
  if (giaTri === undefined || giaTri === null || giaTri === "") {
    return [];
  }

  if (Array.isArray(giaTri)) {
    return giaTri;
  }

  try {
    const danhSach = JSON.parse(String(giaTri));

    return Array.isArray(danhSach) ? danhSach : [];
  } catch (loi) {
    return [];
  }
}

function chuyenHangMucChecklist(hangMuc) {
  if (!hangMuc || typeof hangMuc !== "object" || Array.isArray(hangMuc)) {
    return hangMuc;
  }

  return {
    ...(hangMuc.id !== undefined ? { id: hangMuc.id } : {}),
    noiDung: layGiaTriTheoNhieuTen(hangMuc, ["noiDung", "noi_dung"]),
    loai: hangMuc.loai || "CHECKLIST",
    trangThai: layGiaTriTheoNhieuTen(hangMuc, ["trangThai", "trang_thai"]) || null,
    ghiChu: layGiaTriTheoNhieuTen(hangMuc, ["ghiChu", "ghi_chu"]) || null
  };
}

function chuyenLinhKien(linhKien) {
  if (!linhKien || typeof linhKien !== "object" || Array.isArray(linhKien)) {
    return linhKien;
  }

  return {
    ten: linhKien.ten,
    soLuong: layGiaTriTheoNhieuTen(linhKien, ["soLuong", "so_luong"])
  };
}

function chuyenPhieuBaoTri(phieuBaoTri) {
  return {
    id: phieuBaoTri.id,
    keHoachBaoTriId: phieuBaoTri.ke_hoach_bao_tri_id,
    thietBi: {
      id: phieuBaoTri.thiet_bi_id,
      maThietBi: phieuBaoTri.ma_thiet_bi,
      tenThietBi: phieuBaoTri.ten_thiet_bi,
      trangThai: phieuBaoTri.thiet_bi_trang_thai
    },
    kyThuatVien: phieuBaoTri.ky_thuat_vien_id
      ? {
        id: phieuBaoTri.ky_thuat_vien_id,
        hoTen: phieuBaoTri.ky_thuat_vien_ho_ten,
        email: phieuBaoTri.ky_thuat_vien_email
      }
      : null,
    ngayDuKien: chuyenNgayThanhChuoi(phieuBaoTri.ngay_du_kien),
    thoiGianBatDau: phieuBaoTri.thoi_gian_bat_dau,
    thoiGianHoanThanh: phieuBaoTri.thoi_gian_hoan_thanh,
    trangThai: phieuBaoTri.trang_thai,
    ketQuaChecklist: chuyenJsonThanhMang(phieuBaoTri.ket_qua_checklist)
      .map(chuyenHangMucChecklist),
    linhKienThayThe: chuyenJsonThanhMang(phieuBaoTri.linh_kien_thay_the)
      .map(chuyenLinhKien),
    ketQuaBaoTri: phieuBaoTri.ket_qua_bao_tri,
    ghiChu: phieuBaoTri.ghi_chu,
    keHoach: {
      giaTriChuKy: phieuBaoTri.gia_tri_chu_ky,
      donViChuKy: phieuBaoTri.don_vi_chu_ky,
      ngayBaoTriTiepTheo: chuyenNgayThanhChuoi(
        phieuBaoTri.ngay_bao_tri_tiep_theo
      ),
      trangThai: phieuBaoTri.ke_hoach_trang_thai,
      tenMauChecklist: phieuBaoTri.mau_checklist_ten
    },
    ngayTao: phieuBaoTri.ngay_tao,
    ngayCapNhat: phieuBaoTri.ngay_cap_nhat
  };
}

function kiemTraKyThuatVienDangNhap(nguoiDung) {
  if (!nguoiDung || nguoiDung.vaiTro !== VAI_TRO.KY_THUAT_VIEN) {
    throw taoLoi("Chỉ kỹ thuật viên được thực hiện thao tác này", 403);
  }
}

function kiemTraOwnership(phieuBaoTri, nguoiDung) {
  kiemTraKyThuatVienDangNhap(nguoiDung);

  if (Number(phieuBaoTri.ky_thuat_vien_id) !== Number(nguoiDung.id)) {
    throw taoLoi("Bạn không được phân công thực hiện phiếu bảo trì này", 403);
  }
}

function kiemTraDuLieuBody(duLieu) {
  if (!duLieu || typeof duLieu !== "object" || Array.isArray(duLieu)) {
    throw taoLoi("Dữ liệu bảo trì không hợp lệ", 400);
  }
}

function kiemTraKhongGuiTruongHeThong(duLieu) {
  const danhSachTruongCam = [
    "id",
    "keHoachBaoTriId",
    "ke_hoach_bao_tri_id",
    "thietBiId",
    "thiet_bi_id",
    "kyThuatVienId",
    "ky_thuat_vien_id",
    "trangThai",
    "trang_thai",
    "thoiGianBatDau",
    "thoi_gian_bat_dau",
    "thoiGianHoanThanh",
    "thoi_gian_hoan_thanh",
    "ngayBaoTriTiepTheo",
    "ngay_bao_tri_tiep_theo"
  ];
  const coTruongHeThong = danhSachTruongCam.some((tenTruong) =>
    Object.prototype.hasOwnProperty.call(duLieu, tenTruong)
  );

  if (coTruongHeThong) {
    throw taoLoi("Không được tự thiết lập phiếu, kỹ thuật viên, trạng thái hoặc thời gian hệ thống", 400);
  }
}

function layDanhSachChecklist(giaTri) {
  if (!Array.isArray(giaTri)) {
    throw taoLoi("Kết quả checklist phải là một mảng", 400);
  }

  if (giaTri.length === 0) {
    throw taoLoi("Kết quả checklist không được để trống", 400);
  }

  if (giaTri.length > SO_HANG_MUC_TOI_DA) {
    throw taoLoi(`Checklist chỉ được có tối đa ${SO_HANG_MUC_TOI_DA} hạng mục`, 400);
  }

  return giaTri.map((hangMuc, viTri) => {
    if (!hangMuc || typeof hangMuc !== "object" || Array.isArray(hangMuc)) {
      throw taoLoi(`Hạng mục checklist tại vị trí ${viTri + 1} không hợp lệ`, 400);
    }

    const noiDung = layChuoiBatBuoc(
      layGiaTriTheoNhieuTen(hangMuc, ["noiDung", "noi_dung"]),
      `Nội dung hạng mục tại vị trí ${viTri + 1}`,
      DO_DAI_HANG_MUC_TOI_DA
    );
    const loai = chuanHoaChuoi(hangMuc.loai || "CHECKLIST").toUpperCase();
    const trangThaiRaw = layGiaTriTheoNhieuTen(hangMuc, ["trangThai", "trang_thai"]);
    const trangThai = chuanHoaChuoi(trangThaiRaw);
    const ghiChu = layChuoiTuyChon(
      layGiaTriTheoNhieuTen(hangMuc, ["ghiChu", "ghi_chu"]),
      `Ghi chú hạng mục tại vị trí ${viTri + 1}`,
      DO_DAI_HANG_MUC_TOI_DA
    );

    if (!LOAI_HANG_MUC_HOP_LE.includes(loai)) {
      throw taoLoi(`Loại hạng mục tại vị trí ${viTri + 1} không hợp lệ`, 400);
    }

    if (!trangThai || !TRANG_THAI_HANG_MUC_HOP_LE.includes(trangThai.toUpperCase())) {
      throw taoLoi(`Trạng thái hạng mục tại vị trí ${viTri + 1} không hợp lệ`, 400);
    }

    return {
      ...(hangMuc.id !== undefined ? { id: hangMuc.id } : {}),
      noiDung,
      loai,
      trangThai: trangThai.toUpperCase(),
      ghiChu
    };
  });
}

function taoChecklistSnapshot(danhSachHangMuc) {
  const danhSach = chuyenJsonThanhMang(danhSachHangMuc);

  if (danhSach.length === 0) {
    throw taoLoi("Mẫu checklist của kế hoạch không có hạng mục hợp lệ", 409);
  }

  return danhSach.map((hangMuc, viTri) => ({
    ...(hangMuc.id !== undefined ? { id: hangMuc.id } : {}),
    noiDung: layChuoiBatBuoc(
      layGiaTriTheoNhieuTen(hangMuc, ["noiDung", "noi_dung"]),
      `Nội dung mẫu checklist tại vị trí ${viTri + 1}`,
      DO_DAI_HANG_MUC_TOI_DA
    ),
    loai: "CHECKLIST",
    trangThai: null,
    ghiChu: null
  }));
}

function layDanhSachLinhKien(giaTri) {
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
    const soLuong = Number(
      layGiaTriTheoNhieuTen(linhKien, ["soLuong", "so_luong"])
    );

    if (!Number.isFinite(soLuong) || soLuong <= 0) {
      throw taoLoi(`Số lượng linh kiện tại vị trí ${viTri + 1} phải lớn hơn 0`, 400);
    }

    return { ten, soLuong };
  });

  return danhSachLinhKien.length > 0 ? danhSachLinhKien : null;
}

function layTrangThaiThietBiSauBaoTri(giaTri, ketQuaChecklist) {
  if (giaTri !== undefined && giaTri !== null && String(giaTri).trim() !== "") {
    const trangThai = String(giaTri).trim().toUpperCase();

    if (!TRANG_THAI_THIET_BI_SAU_BAO_TRI_HOP_LE.includes(trangThai)) {
      throw taoLoi("Trạng thái thiết bị sau bảo trì không hợp lệ", 400);
    }

    return trangThai;
  }

  const coLoi = ketQuaChecklist.some(
    (hangMuc) => hangMuc.trangThai === "CO_LOI"
  );

  return coLoi
    ? TRANG_THAI_THIET_BI.DANG_HONG
    : TRANG_THAI_THIET_BI.DANG_HOAT_DONG;
}

async function layDanhSachPhieu(query = {}) {
  const dieuKienLoc = layDieuKienLoc(query);
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const [danhSachPhieu, tongBanGhi] = await Promise.all([
    phieuBaoTriModel.layDanhSachPhieu({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    phieuBaoTriModel.demTongPhieu(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachPhieu.map(chuyenPhieuBaoTri),
    phanTrang: {
      trangHienTai,
      soBanGhiMoiTrang,
      tongBanGhi,
      tongSoTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layPhieuCuaToi(query = {}, nguoiDung) {
  kiemTraKyThuatVienDangNhap(nguoiDung);
  const dieuKienLoc = layDieuKienLoc(query);
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const dieuKienCuaToi = {
    ...dieuKienLoc,
    kyThuatVienId: nguoiDung.id
  };
  const [danhSachPhieu, tongBanGhi] = await Promise.all([
    phieuBaoTriModel.layDanhSachPhieu({
      ...dieuKienCuaToi,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    phieuBaoTriModel.demTongPhieu(dieuKienCuaToi)
  ]);

  return {
    danhSach: danhSachPhieu.map(chuyenPhieuBaoTri),
    phanTrang: {
      trangHienTai,
      soBanGhiMoiTrang,
      tongBanGhi,
      tongSoTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layChiTietPhieu(id, nguoiDung) {
  const phieuBaoTriId = layIdHopLe(id, "Phiếu bảo trì");
  const phieuBaoTri = await phieuBaoTriModel.timTheoId(phieuBaoTriId);

  if (!phieuBaoTri) {
    throw taoLoi("Không tìm thấy phiếu bảo trì", 404);
  }

  if (
    nguoiDung.vaiTro === VAI_TRO.KY_THUAT_VIEN &&
    Number(phieuBaoTri.ky_thuat_vien_id) !== Number(nguoiDung.id)
  ) {
    throw taoLoi("Bạn không có quyền xem phiếu bảo trì này", 403);
  }

  return chuyenPhieuBaoTri(phieuBaoTri);
}

async function batDauBaoTri(id, nguoiDung) {
  const phieuBaoTriId = layIdHopLe(id, "Phiếu bảo trì");
  kiemTraKyThuatVienDangNhap(nguoiDung);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const phieuBaoTri = await phieuBaoTriModel.timTheoIdDeCapNhat(
      phieuBaoTriId,
      connection
    );

    if (!phieuBaoTri) {
      throw taoLoi("Không tìm thấy phiếu bảo trì", 404);
    }

    kiemTraOwnership(phieuBaoTri, nguoiDung);

    if (phieuBaoTri.trang_thai === TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN) {
      throw taoLoi("Phiếu bảo trì đã được bắt đầu trước đó", 409);
    }

    if (![TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN, TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN]
      .includes(phieuBaoTri.trang_thai)) {
      throw taoLoi("Trạng thái phiếu không cho phép bắt đầu bảo trì", 409);
    }

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(
      phieuBaoTri.thiet_bi_id,
      connection
    );

    if (!thietBi) {
      throw taoLoi("Không tìm thấy thiết bị của phiếu bảo trì", 404);
    }

    if (thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY) {
      throw taoLoi("Không thể bảo trì thiết bị đã thanh lý", 409);
    }

    if (!phieuBaoTri.ket_qua_checklist) {
      const checklistSnapshot = taoChecklistSnapshot(phieuBaoTri.danh_sach_hang_muc);
      await phieuBaoTriModel.khoiTaoChecklist(
        connection,
        phieuBaoTriId,
        checklistSnapshot
      );
    }

    const soBanGhiCapNhat = await phieuBaoTriModel.batDauBaoTri(
      connection,
      phieuBaoTriId,
      nguoiDung.id
    );

    if (soBanGhiCapNhat !== 1) {
      throw taoLoi("Phiếu bảo trì đã thay đổi, vui lòng tải lại dữ liệu", 409);
    }

    if (thietBi.trang_thai === TRANG_THAI_THIET_BI.DANG_HOAT_DONG) {
      await thietBiModel.capNhatTrangThai(
        thietBi.id,
        TRANG_THAI_THIET_BI.DANG_BAO_TRI,
        connection
      );
    }

    await connection.commit();
  } catch (loi) {
    try {
      await connection.rollback();
    } catch (loiRollback) {
      console.error("Không thể rollback giao dịch bắt đầu bảo trì:", loiRollback.message);
    }

    throw loi;
  } finally {
    connection.release();
  }

  return layChiTietPhieu(phieuBaoTriId, nguoiDung);
}

async function capNhatChecklist(id, duLieu, nguoiDung) {
  const phieuBaoTriId = layIdHopLe(id, "Phiếu bảo trì");
  kiemTraKyThuatVienDangNhap(nguoiDung);
  kiemTraDuLieuBody(duLieu);
  kiemTraKhongGuiTruongHeThong(duLieu);
  const ketQuaChecklist = layDanhSachChecklist(
    layGiaTriTheoNhieuTen(duLieu, ["ketQuaChecklist", "ket_qua_checklist"])
  );
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const phieuBaoTri = await phieuBaoTriModel.timTheoIdDeCapNhat(
      phieuBaoTriId,
      connection
    );

    if (!phieuBaoTri) {
      throw taoLoi("Không tìm thấy phiếu bảo trì", 404);
    }

    kiemTraOwnership(phieuBaoTri, nguoiDung);

    if (phieuBaoTri.trang_thai !== TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN) {
      throw taoLoi("Chỉ được cập nhật checklist khi phiếu đang thực hiện", 409);
    }

    const soBanGhiCapNhat = await phieuBaoTriModel.capNhatChecklist(
      connection,
      phieuBaoTriId,
      nguoiDung.id,
      ketQuaChecklist
    );

    if (soBanGhiCapNhat !== 1) {
      throw taoLoi("Phiếu bảo trì đã thay đổi, vui lòng tải lại dữ liệu", 409);
    }

    await connection.commit();
  } catch (loi) {
    try {
      await connection.rollback();
    } catch (loiRollback) {
      console.error("Không thể rollback giao dịch cập nhật checklist:", loiRollback.message);
    }

    throw loi;
  } finally {
    connection.release();
  }

  return layChiTietPhieu(phieuBaoTriId, nguoiDung);
}

async function capNhatKetQuaBaoTri(id, duLieu, nguoiDung) {
  const phieuBaoTriId = layIdHopLe(id, "Phiếu bảo trì");
  kiemTraKyThuatVienDangNhap(nguoiDung);
  kiemTraDuLieuBody(duLieu);
  kiemTraKhongGuiTruongHeThong(duLieu);
  const linhKienThayTheRaw = layGiaTriTheoNhieuTen(
    duLieu,
    ["linhKienThayThe", "linh_kien_thay_the"]
  );
  const ketQuaBaoTriRaw = layGiaTriTheoNhieuTen(
    duLieu,
    ["ketQuaBaoTri", "ket_qua_bao_tri"]
  );
  const ghiChuRaw = layGiaTriTheoNhieuTen(duLieu, ["ghiChu", "ghi_chu"]);

  if (
    linhKienThayTheRaw === undefined &&
    ketQuaBaoTriRaw === undefined &&
    ghiChuRaw === undefined
  ) {
    throw taoLoi("Cần gửi ít nhất một nội dung kết quả bảo trì để cập nhật", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const phieuBaoTri = await phieuBaoTriModel.timTheoIdDeCapNhat(
      phieuBaoTriId,
      connection
    );

    if (!phieuBaoTri) {
      throw taoLoi("Không tìm thấy phiếu bảo trì", 404);
    }

    kiemTraOwnership(phieuBaoTri, nguoiDung);

    if (phieuBaoTri.trang_thai !== TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN) {
      throw taoLoi("Chỉ được cập nhật kết quả khi phiếu đang thực hiện", 409);
    }

    const linhKienThayTheMoi = layDanhSachLinhKien(linhKienThayTheRaw);
    const ketQuaBaoTriMoi = layChuoiTuyChon(
      ketQuaBaoTriRaw,
      "Kết quả bảo trì",
      DO_DAI_NOI_DUNG_TOI_DA
    );
    const ghiChuMoi = layChuoiTuyChon(
      ghiChuRaw,
      "Ghi chú",
      DO_DAI_NOI_DUNG_TOI_DA
    );
    const linhKienThayThe = linhKienThayTheMoi === undefined
      ? chuyenJsonThanhMang(phieuBaoTri.linh_kien_thay_the).map(chuyenLinhKien)
      : linhKienThayTheMoi;
    const ketQuaBaoTri = ketQuaBaoTriMoi === undefined
      ? phieuBaoTri.ket_qua_bao_tri
      : ketQuaBaoTriMoi;
    const ghiChu = ghiChuMoi === undefined ? phieuBaoTri.ghi_chu : ghiChuMoi;
    const soBanGhiCapNhat = await phieuBaoTriModel.capNhatKetQua(
      connection,
      phieuBaoTriId,
      nguoiDung.id,
      { linhKienThayThe, ketQuaBaoTri, ghiChu }
    );

    if (soBanGhiCapNhat !== 1) {
      throw taoLoi("Phiếu bảo trì đã thay đổi, vui lòng tải lại dữ liệu", 409);
    }

    await connection.commit();
  } catch (loi) {
    try {
      await connection.rollback();
    } catch (loiRollback) {
      console.error("Không thể rollback giao dịch cập nhật kết quả:", loiRollback.message);
    }

    throw loi;
  } finally {
    connection.release();
  }

  return layChiTietPhieu(phieuBaoTriId, nguoiDung);
}

async function hoanThanhBaoTri(id, duLieu, nguoiDung) {
  const phieuBaoTriId = layIdHopLe(id, "Phiếu bảo trì");
  kiemTraKyThuatVienDangNhap(nguoiDung);
  kiemTraDuLieuBody(duLieu || {});
  kiemTraKhongGuiTruongHeThong(duLieu || {});
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const phieuBaoTri = await phieuBaoTriModel.timTheoIdDeCapNhat(
      phieuBaoTriId,
      connection
    );

    if (!phieuBaoTri) {
      throw taoLoi("Không tìm thấy phiếu bảo trì", 404);
    }

    kiemTraOwnership(phieuBaoTri, nguoiDung);

    if (phieuBaoTri.trang_thai === TRANG_THAI_PHIEU_BAO_TRI.HOAN_THANH) {
      throw taoLoi("Phiếu bảo trì đã hoàn thành trước đó", 409);
    }

    if (phieuBaoTri.trang_thai !== TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN) {
      throw taoLoi("Phiếu phải ở trạng thái đang thực hiện trước khi hoàn thành", 409);
    }

    const ketQuaChecklistRaw = layGiaTriTheoNhieuTen(
      duLieu,
      ["ketQuaChecklist", "ket_qua_checklist"]
    );
    const linhKienThayTheRaw = layGiaTriTheoNhieuTen(
      duLieu,
      ["linhKienThayThe", "linh_kien_thay_the"]
    );
    const ketQuaBaoTriRaw = layGiaTriTheoNhieuTen(
      duLieu,
      ["ketQuaBaoTri", "ket_qua_bao_tri"]
    );
    const ghiChuRaw = layGiaTriTheoNhieuTen(duLieu, ["ghiChu", "ghi_chu"]);
    const trangThaiThietBiRaw = layGiaTriTheoNhieuTen(
      duLieu,
      ["trangThaiThietBi", "trang_thai_thiet_bi"]
    );
    const ketQuaChecklist = layDanhSachChecklist(
      ketQuaChecklistRaw === undefined
        ? chuyenJsonThanhMang(phieuBaoTri.ket_qua_checklist)
        : ketQuaChecklistRaw
    );
    const linhKienMoi = layDanhSachLinhKien(linhKienThayTheRaw);
    const linhKienThayThe = linhKienMoi === undefined
      ? chuyenJsonThanhMang(phieuBaoTri.linh_kien_thay_the).map(chuyenLinhKien)
      : linhKienMoi;
    const ketQuaBaoTriMoi = layChuoiTuyChon(
      ketQuaBaoTriRaw,
      "Kết quả bảo trì",
      DO_DAI_NOI_DUNG_TOI_DA
    );
    const ketQuaBaoTri = ketQuaBaoTriMoi === undefined
      ? phieuBaoTri.ket_qua_bao_tri
      : ketQuaBaoTriMoi;
    const ghiChuMoi = layChuoiTuyChon(
      ghiChuRaw,
      "Ghi chú",
      DO_DAI_NOI_DUNG_TOI_DA
    );
    const ghiChu = ghiChuMoi === undefined ? phieuBaoTri.ghi_chu : ghiChuMoi;

    if (!ketQuaBaoTri || String(ketQuaBaoTri).trim() === "") {
      throw taoLoi("Kết quả bảo trì không được để trống khi hoàn thành", 400);
    }

    const trangThaiThietBiSauBaoTri = layTrangThaiThietBiSauBaoTri(
      trangThaiThietBiRaw,
      ketQuaChecklist
    );
    const keHoachBaoTri = await keHoachBaoTriModel.timTheoIdDeCapNhat(
      phieuBaoTri.ke_hoach_bao_tri_id,
      connection
    );

    if (!keHoachBaoTri) {
      throw taoLoi("Không tìm thấy kế hoạch của phiếu bảo trì", 404);
    }

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(
      phieuBaoTri.thiet_bi_id,
      connection
    );

    if (!thietBi) {
      throw taoLoi("Không tìm thấy thiết bị của phiếu bảo trì", 404);
    }

    const thoiGianHoanThanh = await phieuBaoTriModel.layThoiGianHienTai(connection);
    const soPhieuCapNhat = await phieuBaoTriModel.hoanThanhBaoTri(
      connection,
      phieuBaoTriId,
      nguoiDung.id,
      {
        ketQuaChecklist,
        linhKienThayThe,
        ketQuaBaoTri: String(ketQuaBaoTri).trim(),
        ghiChu,
        thoiGianHoanThanh
      }
    );

    if (soPhieuCapNhat !== 1) {
      throw taoLoi("Phiếu bảo trì đã thay đổi hoặc đã được hoàn thành", 409);
    }

    const soKeHoachCapNhat = await keHoachBaoTriModel.capNhatNgayBaoTriTiepTheo(
      connection,
      keHoachBaoTri.id,
      thoiGianHoanThanh
    );

    if (soKeHoachCapNhat !== 1) {
      throw taoLoi("Không thể cập nhật ngày bảo trì tiếp theo", 409);
    }

    if (thietBi.trang_thai === TRANG_THAI_THIET_BI.DANG_BAO_TRI) {
      await thietBiModel.capNhatTrangThai(
        thietBi.id,
        trangThaiThietBiSauBaoTri,
        connection
      );
    }

    await connection.commit();
  } catch (loi) {
    try {
      await connection.rollback();
    } catch (loiRollback) {
      console.error("Không thể rollback giao dịch hoàn thành bảo trì:", loiRollback.message);
    }

    throw loi;
  } finally {
    connection.release();
  }

  return layChiTietPhieu(phieuBaoTriId, nguoiDung);
}

function laySoNgayCanhBao(duLieu = {}) {
  const giaTri = layGiaTriTheoNhieuTen(duLieu, ["soNgay", "so_ngay"]);

  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return SO_NGAY_CANH_BAO_MAC_DINH;
  }

  const soNgay = Number(giaTri);

  if (!Number.isInteger(soNgay) || soNgay < 0 || soNgay > SO_NGAY_CANH_BAO_TOI_DA) {
    throw taoLoi(
      `Số ngày cảnh báo phải là số nguyên từ 0 đến ${SO_NGAY_CANH_BAO_TOI_DA}`,
      400
    );
  }

  return soNgay;
}

function chuyenKeHoachSapDenHan(keHoachBaoTri) {
  return {
    keHoachBaoTriId: keHoachBaoTri.id,
    thietBi: {
      id: keHoachBaoTri.thiet_bi_id,
      maThietBi: keHoachBaoTri.ma_thiet_bi,
      tenThietBi: keHoachBaoTri.ten_thiet_bi,
      trangThai: keHoachBaoTri.thiet_bi_trang_thai
    },
    kyThuatVien: keHoachBaoTri.ky_thuat_vien_id
      ? {
        id: keHoachBaoTri.ky_thuat_vien_id,
        hoTen: keHoachBaoTri.ky_thuat_vien_ho_ten,
        email: keHoachBaoTri.ky_thuat_vien_email
      }
      : null,
    giaTriChuKy: keHoachBaoTri.gia_tri_chu_ky,
    donViChuKy: keHoachBaoTri.don_vi_chu_ky,
    ngayBaoTriTiepTheo: chuyenNgayThanhChuoi(
      keHoachBaoTri.ngay_bao_tri_tiep_theo
    ),
    soNgayConLai: Number(keHoachBaoTri.so_ngay_con_lai)
  };
}

function chuyenPhieuQuaHan(phieuBaoTri) {
  return {
    phieuBaoTriId: phieuBaoTri.id,
    keHoachBaoTriId: phieuBaoTri.ke_hoach_bao_tri_id,
    thietBi: {
      id: phieuBaoTri.thiet_bi_id,
      maThietBi: phieuBaoTri.ma_thiet_bi,
      tenThietBi: phieuBaoTri.ten_thiet_bi
    },
    kyThuatVien: phieuBaoTri.ky_thuat_vien_id
      ? {
        id: phieuBaoTri.ky_thuat_vien_id,
        hoTen: phieuBaoTri.ky_thuat_vien_ho_ten,
        email: phieuBaoTri.ky_thuat_vien_email
      }
      : null,
    ngayDuKien: chuyenNgayThanhChuoi(phieuBaoTri.ngay_du_kien),
    trangThai: phieuBaoTri.trang_thai,
    soNgayQuaHan: Number(phieuBaoTri.so_ngay_qua_han),
    dangThucHienTre: phieuBaoTri.trang_thai === TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN
  };
}

async function layDanhSachSapDenHan(query = {}, nguoiDung) {
  const soNgay = laySoNgayCanhBao(query);
  const kyThuatVienId = nguoiDung.vaiTro === VAI_TRO.KY_THUAT_VIEN
    ? nguoiDung.id
    : null;
  const danhSachKeHoach = await keHoachBaoTriModel.layDanhSachSapDenHan({
    soNgay,
    kyThuatVienId
  });

  return {
    soNgayCanhBao: soNgay,
    danhSach: danhSachKeHoach.map(chuyenKeHoachSapDenHan)
  };
}

async function layDanhSachQuaHan(nguoiDung) {
  const kyThuatVienId = nguoiDung.vaiTro === VAI_TRO.KY_THUAT_VIEN
    ? nguoiDung.id
    : null;
  const danhSachPhieu = await phieuBaoTriModel.layDanhSachQuaHan(kyThuatVienId);

  return danhSachPhieu.map(chuyenPhieuQuaHan);
}

async function taoThongBaoNeuChuaCo(connection, {
  nguoiDungId,
  tieuDe,
  noiDung,
  doiTuongLienQuanId
}) {
  const daTonTai = await thongBaoModel.daTonTaiThongBaoTrongNgay({
    nguoiDungId,
    tieuDe,
    loaiThongBao: LOAI_THONG_BAO.BAO_TRI,
    doiTuongLienQuanId
  }, connection);

  if (daTonTai) {
    return false;
  }

  await thongBaoModel.taoThongBao({
    nguoiDungId,
    tieuDe,
    noiDung,
    loaiThongBao: LOAI_THONG_BAO.BAO_TRI,
    doiTuongLienQuanId
  }, connection);

  return true;
}

async function xuLyCanhBaoBaoTri(duLieu = {}) {
  const soNgay = laySoNgayCanhBao(duLieu);
  const connection = await pool.getConnection();
  let soPhieuChuyenQuaHan = 0;
  let soThongBaoQuaHan = 0;
  let soThongBaoSapDenHan = 0;

  try {
    await connection.beginTransaction();
    const danhSachChoQuaHan = await phieuBaoTriModel
      .layDanhSachChoQuaHanDeCapNhat(connection);

    for (const phieuBaoTri of danhSachChoQuaHan) {
      const soBanGhiCapNhat = await phieuBaoTriModel.capNhatQuaHan(
        connection,
        phieuBaoTri.id
      );
      soPhieuChuyenQuaHan += soBanGhiCapNhat;

      if (soBanGhiCapNhat === 1 && phieuBaoTriModel.laKyThuatVienHoatDong(phieuBaoTri)) {
        const daTao = await taoThongBaoNeuChuaCo(connection, {
          nguoiDungId: phieuBaoTri.ky_thuat_vien_id,
          tieuDe: "Phiếu bảo trì quá hạn",
          noiDung: `Phiếu bảo trì thiết bị ${phieuBaoTri.ma_thiet_bi} - ${phieuBaoTri.ten_thiet_bi} đã quá thời gian dự kiến.`,
          doiTuongLienQuanId: phieuBaoTri.id
        });
        soThongBaoQuaHan += daTao ? 1 : 0;
      }
    }

    const danhSachSapDenHan = await keHoachBaoTriModel
      .layDanhSachSapDenHanDeThongBao(soNgay, connection);

    for (const keHoachBaoTri of danhSachSapDenHan) {
      const daTao = await taoThongBaoNeuChuaCo(connection, {
        nguoiDungId: keHoachBaoTri.ky_thuat_vien_id,
        tieuDe: "Bảo trì sắp đến hạn",
        noiDung: `Thiết bị ${keHoachBaoTri.ma_thiet_bi} - ${keHoachBaoTri.ten_thiet_bi} sắp đến ngày bảo trì.`,
        doiTuongLienQuanId: keHoachBaoTri.id
      });
      soThongBaoSapDenHan += daTao ? 1 : 0;
    }

    await connection.commit();

    return {
      soNgayCanhBao: soNgay,
      soPhieuChuyenQuaHan,
      soThongBaoQuaHan,
      soThongBaoSapDenHan
    };
  } catch (loi) {
    try {
      await connection.rollback();
    } catch (loiRollback) {
      console.error("Không thể rollback giao dịch xử lý cảnh báo bảo trì:", loiRollback.message);
    }

    throw loi;
  } finally {
    connection.release();
  }
}

module.exports = {
  layDanhSachPhieu,
  layPhieuCuaToi,
  layChiTietPhieu,
  batDauBaoTri,
  capNhatChecklist,
  capNhatKetQuaBaoTri,
  hoanThanhBaoTri,
  layDanhSachSapDenHan,
  layDanhSachQuaHan,
  xuLyCanhBaoBaoTri
};
