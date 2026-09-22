const KET_QUA_SUA_CHUA = require("../constants/ket_qua_sua_chua");
const MUC_DO_SU_CO = require("../constants/muc_do_su_co");
const TRANG_THAI_PHIEU_BAO_TRI = require("../constants/trang_thai_phieu_bao_tri");
const TRANG_THAI_SU_CO = require("../constants/trang_thai_su_co");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const VAI_TRO = require("../constants/vai_tro");
const baoCaoModel = require("../models/bao_cao.model");
const loaiThietBiModel = require("../models/loai_thiet_bi.model");
const nguoiDungModel = require("../models/nguoi_dung.model");
const thietBiModel = require("../models/thiet_bi.model");
const viTriModel = require("../models/vi_tri.model");

const LOAI_BAO_CAO = {
  SU_CO: "su-co",
  SUA_CHUA: "sua-chua",
  BAO_TRI: "bao-tri",
  THIET_BI: "thiet-bi"
};
const GIOI_HAN_MAC_DINH = 10;
const GIOI_HAN_TOI_DA = 100;
const GIOI_HAN_XUAT_FILE = 5000;

const CAU_HINH_SAP_XEP = {
  [LOAI_BAO_CAO.SU_CO]: ["thoiGianBao", "maSuCo", "mucDo", "trangThai"],
  [LOAI_BAO_CAO.SUA_CHUA]: ["ngayTao", "thoiGianHoanThanh", "ketQua"],
  [LOAI_BAO_CAO.BAO_TRI]: ["ngayDuKien", "thoiGianHoanThanh", "trangThai"],
  [LOAI_BAO_CAO.THIET_BI]: ["maThietBi", "tenThietBi", "trangThai", "ngayTao"]
};

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;
  return loi;
}

function layGiaTri(duLieu, danhSachTen) {
  const tenTruong = danhSachTen.find((ten) =>
    Object.prototype.hasOwnProperty.call(duLieu || {}, ten)
  );
  return tenTruong ? duLieu[tenTruong] : undefined;
}

function layIdTuyChon(giaTri, tenTruong) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }
  const id = Number(giaTri);
  if (!Number.isInteger(id) || id <= 0) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return id;
}

function layNgayTuyChon(giaTri, tenTruong) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }
  const ngay = String(giaTri).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }
  const [nam, thang, ngayTrongThang] = ngay.split("-").map(Number);
  const ngayKiemTra = new Date(nam, thang - 1, ngayTrongThang);
  if (
    ngayKiemTra.getFullYear() !== nam ||
    ngayKiemTra.getMonth() !== thang - 1 ||
    ngayKiemTra.getDate() !== ngayTrongThang
  ) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return ngay;
}

function layEnumTuyChon(giaTri, danhSachHopLe, tenTruong) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }
  const giaTriChuanHoa = String(giaTri).trim().toUpperCase();
  if (!danhSachHopLe.includes(giaTriChuanHoa)) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return giaTriChuanHoa;
}

function layPhanTrang(query, xuatFile) {
  if (xuatFile) {
    return { trang: 1, gioiHan: GIOI_HAN_XUAT_FILE, boQua: 0 };
  }
  const trang = Number(query.page ?? query.trang ?? 1);
  const gioiHan = Number(query.limit ?? query.gioiHan ?? GIOI_HAN_MAC_DINH);
  if (!Number.isInteger(trang) || trang < 1) throw taoLoi("Trang không hợp lệ", 400);
  if (!Number.isInteger(gioiHan) || gioiHan < 1 || gioiHan > GIOI_HAN_TOI_DA) {
    throw taoLoi(`Giới hạn phải là số nguyên từ 1 đến ${GIOI_HAN_TOI_DA}`, 400);
  }
  return { trang, gioiHan, boQua: (trang - 1) * gioiHan };
}

function laySapXep(query, loaiBaoCao) {
  const danhSachCot = CAU_HINH_SAP_XEP[loaiBaoCao];
  const sapXepTheo = String(
    layGiaTri(query, ["sapXepTheo", "sap_xep_theo"]) || danhSachCot[0]
  ).trim();
  const thuTu = String(layGiaTri(query, ["thuTu", "thu_tu"]) || "DESC")
    .trim()
    .toUpperCase();
  if (!danhSachCot.includes(sapXepTheo)) {
    throw taoLoi("Cột sắp xếp không hợp lệ", 400);
  }
  if (!["ASC", "DESC"].includes(thuTu)) {
    throw taoLoi("Thứ tự sắp xếp chỉ nhận ASC hoặc DESC", 400);
  }
  return { sapXepTheo, thuTu };
}

function layBoLoc(query, loaiBaoCao) {
  const tuNgay = layNgayTuyChon(layGiaTri(query, ["tuNgay", "tu_ngay"]), "Từ ngày");
  const denNgay = layNgayTuyChon(layGiaTri(query, ["denNgay", "den_ngay"]), "Đến ngày");
  if (tuNgay && denNgay && tuNgay > denNgay) {
    throw taoLoi("Từ ngày không được lớn hơn đến ngày", 400);
  }
  const boLoc = {
    tuNgay,
    denNgay,
    thietBiId: layIdTuyChon(
      layGiaTri(query, ["thietBiId", "thiet_bi_id"]),
      "Thiết bị"
    ),
    loaiThietBiId: layIdTuyChon(
      layGiaTri(query, ["loaiThietBiId", "loai_thiet_bi_id"]),
      "Loại thiết bị"
    ),
    viTriId: layIdTuyChon(
      layGiaTri(query, ["viTriId", "vi_tri_id"]),
      "Vị trí"
    ),
    kyThuatVienId: layIdTuyChon(
      layGiaTri(query, ["kyThuatVienId", "ky_thuat_vien_id"]),
      "Kỹ thuật viên"
    ),
    mucDo: null,
    trangThai: null,
    ketQua: null
  };

  if (loaiBaoCao === LOAI_BAO_CAO.SU_CO) {
    boLoc.mucDo = layEnumTuyChon(
      layGiaTri(query, ["mucDo", "muc_do"]),
      Object.values(MUC_DO_SU_CO),
      "Mức độ sự cố"
    );
    boLoc.trangThai = layEnumTuyChon(
      layGiaTri(query, ["trangThai", "trang_thai"]),
      Object.values(TRANG_THAI_SU_CO),
      "Trạng thái sự cố"
    );
  } else if (loaiBaoCao === LOAI_BAO_CAO.SUA_CHUA) {
    boLoc.ketQua = layEnumTuyChon(
      layGiaTri(query, ["ketQua", "ket_qua"]),
      Object.values(KET_QUA_SUA_CHUA),
      "Kết quả sửa chữa"
    );
  } else if (loaiBaoCao === LOAI_BAO_CAO.BAO_TRI) {
    boLoc.trangThai = layEnumTuyChon(
      layGiaTri(query, ["trangThai", "trang_thai"]),
      Object.values(TRANG_THAI_PHIEU_BAO_TRI),
      "Trạng thái phiếu bảo trì"
    );
  } else if (loaiBaoCao === LOAI_BAO_CAO.THIET_BI) {
    if (boLoc.tuNgay || boLoc.denNgay) {
      throw taoLoi(
        "Báo cáo thiết bị là dữ liệu hiện tại và không hỗ trợ lọc theo thời gian",
        400
      );
    }
    if (boLoc.kyThuatVienId) {
      throw taoLoi("Báo cáo thiết bị không hỗ trợ lọc theo kỹ thuật viên", 400);
    }
    boLoc.trangThai = layEnumTuyChon(
      layGiaTri(query, ["trangThai", "trang_thai"]),
      Object.values(TRANG_THAI_THIET_BI),
      "Trạng thái thiết bị"
    );
  }

  return boLoc;
}

async function kiemTraDoiTuongBoLoc(boLoc) {
  const danhSachKiemTra = [];
  if (boLoc.thietBiId) {
    danhSachKiemTra.push(
      thietBiModel.timTheoId(boLoc.thietBiId).then((banGhi) => {
        if (!banGhi) throw taoLoi("Không tìm thấy thiết bị dùng để lọc", 404);
      })
    );
  }
  if (boLoc.loaiThietBiId) {
    danhSachKiemTra.push(
      loaiThietBiModel.timTheoId(boLoc.loaiThietBiId).then((banGhi) => {
        if (!banGhi) throw taoLoi("Không tìm thấy loại thiết bị dùng để lọc", 404);
      })
    );
  }
  if (boLoc.viTriId) {
    danhSachKiemTra.push(
      viTriModel.timTheoId(boLoc.viTriId).then((banGhi) => {
        if (!banGhi) throw taoLoi("Không tìm thấy vị trí dùng để lọc", 404);
      })
    );
  }
  if (boLoc.kyThuatVienId) {
    danhSachKiemTra.push(
      nguoiDungModel.timTheoId(boLoc.kyThuatVienId).then((banGhi) => {
        if (!banGhi) throw taoLoi("Không tìm thấy kỹ thuật viên dùng để lọc", 404);
        if (banGhi.vai_tro !== VAI_TRO.KY_THUAT_VIEN) {
          throw taoLoi("Người dùng lọc theo kỹ thuật viên không đúng vai trò", 400);
        }
      })
    );
  }
  await Promise.all(danhSachKiemTra);
}

function chuyenSo(giaTri) {
  return Number(giaTri) || 0;
}

function chuyenThietBi(dong) {
  return {
    id: dong.thiet_bi_id,
    maThietBi: dong.ma_thiet_bi,
    tenThietBi: dong.ten_thiet_bi
  };
}

function chuyenLoaiThietBi(dong) {
  return dong.loai_thiet_bi_id
    ? { id: dong.loai_thiet_bi_id, tenLoai: dong.ten_loai }
    : null;
}

function chuyenViTri(dong) {
  return dong.vi_tri_id
    ? { id: dong.vi_tri_id, tenViTri: dong.ten_vi_tri }
    : null;
}

function chuyenKyThuatVien(dong) {
  return dong.ky_thuat_vien_id
    ? { id: dong.ky_thuat_vien_id, hoTen: dong.ky_thuat_vien_ho_ten }
    : null;
}

function chuyenThongKe(danhSach, truongNhom) {
  return danhSach.map((dong) => ({
    [truongNhom]: dong[
      truongNhom === "trangThai" ? "trang_thai" :
        truongNhom === "mucDo" ? "muc_do" :
          truongNhom === "ketQua" ? "ket_qua" : "ngay"
    ],
    soLuong: chuyenSo(dong.so_luong)
  }));
}

function taoPhanTrang(phanTrang, tongBanGhi) {
  return {
    trang: phanTrang.trang,
    gioiHan: phanTrang.gioiHan,
    tongBanGhi,
    tongTrang: Math.ceil(tongBanGhi / phanTrang.gioiHan)
  };
}

async function layBaoCaoSuCo(boLoc, phanTrang, sapXep) {
  const [tongQuan, thongKe, tongBanGhi, danhSach] = await Promise.all([
    baoCaoModel.layTongQuanSuCo(boLoc),
    baoCaoModel.layThongKeSuCo(boLoc),
    baoCaoModel.demTongSuCo(boLoc),
    baoCaoModel.layDanhSachSuCo(boLoc, { ...phanTrang, ...sapXep })
  ]);
  return {
    tongQuan: {
      tongSuCo: chuyenSo(tongQuan.tong_su_co),
      soDangMo: chuyenSo(tongQuan.so_dang_mo),
      soDaXuLy: chuyenSo(tongQuan.so_da_xu_ly),
      soDaHuy: chuyenSo(tongQuan.so_da_huy),
      soNghiemTrongDangMo: chuyenSo(tongQuan.so_nghiem_trong_dang_mo),
      thoiGianXuLyTrungBinh: {
        giaTri: tongQuan.thoi_gian_xu_ly_trung_binh_phut === null
          ? 0
          : Number(Number(tongQuan.thoi_gian_xu_ly_trung_binh_phut).toFixed(2)),
        donVi: "PHUT"
      }
    },
    thongKe: {
      theoTrangThai: chuyenThongKe(thongKe.theoTrangThai, "trangThai"),
      theoMucDo: chuyenThongKe(thongKe.theoMucDo, "mucDo"),
      theoThoiGian: chuyenThongKe(thongKe.theoThoiGian, "ngay")
    },
    danhSach: danhSach.map((dong) => ({
      id: dong.id,
      maSuCo: dong.ma_su_co,
      tieuDe: dong.tieu_de,
      mucDo: dong.muc_do,
      trangThai: dong.trang_thai,
      thoiGianBao: dong.thoi_gian_bao,
      thoiGianHoanThanh: dong.thoi_gian_hoan_thanh,
      thietBi: chuyenThietBi(dong),
      loaiThietBi: chuyenLoaiThietBi(dong),
      viTriHienTai: chuyenViTri(dong),
      kyThuatVien: chuyenKyThuatVien(dong)
    })),
    phanTrang: taoPhanTrang(phanTrang, tongBanGhi),
    truongThoiGian: "thoi_gian_bao"
  };
}

async function layBaoCaoSuaChua(boLoc, phanTrang, sapXep) {
  const [tongQuan, thongKe, tongBanGhi, danhSach] = await Promise.all([
    baoCaoModel.layTongQuanSuaChua(boLoc),
    baoCaoModel.layThongKeSuaChua(boLoc),
    baoCaoModel.demTongSuaChua(boLoc),
    baoCaoModel.layDanhSachSuaChua(boLoc, { ...phanTrang, ...sapXep })
  ]);
  return {
    tongQuan: {
      tongHoSo: chuyenSo(tongQuan.tong_ho_so),
      soDaSuaXong: chuyenSo(tongQuan.so_da_sua_xong),
      soSuaMotPhan: chuyenSo(tongQuan.so_sua_mot_phan),
      soKhongSuaDuoc: chuyenSo(tongQuan.so_khong_sua_duoc),
      thoiGianSuaChuaTrungBinh: {
        giaTri: tongQuan.thoi_gian_sua_chua_trung_binh_phut === null
          ? 0
          : Number(Number(tongQuan.thoi_gian_sua_chua_trung_binh_phut).toFixed(2)),
        donVi: "PHUT"
      }
    },
    thongKe: {
      theoKetQua: chuyenThongKe(thongKe.theoKetQua, "ketQua"),
      theoKyThuatVien: thongKe.theoKyThuatVien.map((dong) => ({
        kyThuatVien: { id: dong.ky_thuat_vien_id, hoTen: dong.ho_ten },
        soLuong: chuyenSo(dong.so_luong)
      }))
    },
    danhSach: danhSach.map((dong) => ({
      id: dong.id,
      suCoId: dong.su_co_id,
      maSuCo: dong.ma_su_co,
      nguyenNhan: dong.nguyen_nhan,
      cachXuLy: dong.cach_xu_ly,
      ketQua: dong.ket_qua,
      thoiGianBatDau: dong.thoi_gian_bat_dau,
      thoiGianHoanThanh: dong.thoi_gian_hoan_thanh,
      ghiChu: dong.ghi_chu,
      ngayTao: dong.ngay_tao,
      thietBi: chuyenThietBi(dong),
      loaiThietBi: chuyenLoaiThietBi(dong),
      viTriHienTai: chuyenViTri(dong),
      kyThuatVien: chuyenKyThuatVien(dong)
    })),
    phanTrang: taoPhanTrang(phanTrang, tongBanGhi),
    truongThoiGian: "ngay_tao"
  };
}

async function layBaoCaoBaoTri(boLoc, phanTrang, sapXep) {
  const [tongQuan, thongKe, tongBanGhi, danhSach] = await Promise.all([
    baoCaoModel.layTongQuanBaoTri(boLoc),
    baoCaoModel.layThongKeBaoTri(boLoc),
    baoCaoModel.demTongBaoTri(boLoc),
    baoCaoModel.layDanhSachBaoTri(boLoc, { ...phanTrang, ...sapXep })
  ]);
  return {
    tongQuan: {
      tongPhieu: chuyenSo(tongQuan.tong_phieu),
      soHoanThanh: chuyenSo(tongQuan.so_hoan_thanh),
      soDangThucHien: chuyenSo(tongQuan.so_dang_thuc_hien),
      soQuaHan: chuyenSo(tongQuan.so_qua_han),
      soDaHuy: chuyenSo(tongQuan.so_da_huy)
    },
    thongKe: {
      theoTrangThai: chuyenThongKe(thongKe.theoTrangThai, "trangThai"),
      theoKyThuatVien: thongKe.theoKyThuatVien.map((dong) => ({
        kyThuatVien: dong.ky_thuat_vien_id
          ? { id: dong.ky_thuat_vien_id, hoTen: dong.ho_ten }
          : null,
        soLuong: chuyenSo(dong.so_luong)
      }))
    },
    danhSach: danhSach.map((dong) => ({
      id: dong.id,
      keHoachBaoTriId: dong.ke_hoach_bao_tri_id,
      ngayDuKien: dong.ngay_du_kien,
      thoiGianBatDau: dong.thoi_gian_bat_dau,
      thoiGianHoanThanh: dong.thoi_gian_hoan_thanh,
      trangThai: dong.trang_thai,
      daQuaHan: Boolean(dong.da_qua_han),
      ketQuaBaoTri: dong.ket_qua_bao_tri,
      thietBi: chuyenThietBi(dong),
      loaiThietBi: chuyenLoaiThietBi(dong),
      viTriHienTai: chuyenViTri(dong),
      kyThuatVien: chuyenKyThuatVien(dong)
    })),
    phanTrang: taoPhanTrang(phanTrang, tongBanGhi),
    truongThoiGian: "ngay_du_kien"
  };
}

async function layBaoCaoThietBi(boLoc, phanTrang, sapXep) {
  const [tongQuan, thongKe, tongBanGhi, danhSach] = await Promise.all([
    baoCaoModel.layTongQuanThietBi(boLoc),
    baoCaoModel.layThongKeThietBi(boLoc),
    baoCaoModel.demTongThietBi(boLoc),
    baoCaoModel.layDanhSachThietBi(boLoc, { ...phanTrang, ...sapXep })
  ]);
  return {
    tongQuan: {
      tongHoSo: chuyenSo(tongQuan.tong_ho_so),
      tongDangQuanLy: chuyenSo(tongQuan.tong_dang_quan_ly),
      soDangHoatDong: chuyenSo(tongQuan.so_dang_hoat_dong),
      soDangBaoTri: chuyenSo(tongQuan.so_dang_bao_tri),
      soDangHong: chuyenSo(tongQuan.so_dang_hong),
      soNgungHoatDong: chuyenSo(tongQuan.so_ngung_hoat_dong),
      soThanhLy: chuyenSo(tongQuan.so_thanh_ly)
    },
    thongKe: {
      theoTrangThai: chuyenThongKe(thongKe.theoTrangThai, "trangThai"),
      theoLoai: thongKe.theoLoai.map((dong) => ({
        loaiThietBi: { id: dong.loai_thiet_bi_id, tenLoai: dong.ten_loai },
        soLuong: chuyenSo(dong.so_luong)
      })),
      theoViTri: thongKe.theoViTri.map((dong) => ({
        viTri: dong.vi_tri_id
          ? { id: dong.vi_tri_id, tenViTri: dong.ten_vi_tri }
          : null,
        soLuong: chuyenSo(dong.so_luong)
      }))
    },
    danhSach: danhSach.map((dong) => ({
      id: dong.id,
      maThietBi: dong.ma_thiet_bi,
      tenThietBi: dong.ten_thiet_bi,
      trangThai: dong.trang_thai,
      model: dong.model,
      hangSanXuat: dong.hang_san_xuat,
      ngayTao: dong.ngay_tao,
      loaiThietBi: chuyenLoaiThietBi(dong),
      viTriHienTai: chuyenViTri(dong),
      soSuCo: chuyenSo(dong.so_su_co),
      soBaoTriQuaHan: chuyenSo(dong.so_bao_tri_qua_han)
    })),
    phanTrang: taoPhanTrang(phanTrang, tongBanGhi),
    truongThoiGian: null,
    ghiChu: "Báo cáo thiết bị là snapshot hiện tại; bộ lọc ngày không áp dụng."
  };
}

async function layBaoCao(loaiBaoCao, query = {}, tuyChon = {}) {
  if (!Object.values(LOAI_BAO_CAO).includes(loaiBaoCao)) {
    throw taoLoi("Loại báo cáo không hợp lệ", 400);
  }
  const xuatFile = Boolean(tuyChon.xuatFile);
  const boLoc = layBoLoc(query, loaiBaoCao);
  await kiemTraDoiTuongBoLoc(boLoc);
  const phanTrang = layPhanTrang(query, xuatFile);
  const sapXep = laySapXep(query, loaiBaoCao);
  let baoCao;

  if (loaiBaoCao === LOAI_BAO_CAO.SU_CO) {
    baoCao = await layBaoCaoSuCo(boLoc, phanTrang, sapXep);
  } else if (loaiBaoCao === LOAI_BAO_CAO.SUA_CHUA) {
    baoCao = await layBaoCaoSuaChua(boLoc, phanTrang, sapXep);
  } else if (loaiBaoCao === LOAI_BAO_CAO.BAO_TRI) {
    baoCao = await layBaoCaoBaoTri(boLoc, phanTrang, sapXep);
  } else {
    baoCao = await layBaoCaoThietBi(boLoc, phanTrang, sapXep);
  }

  if (xuatFile && baoCao.phanTrang.tongBanGhi > GIOI_HAN_XUAT_FILE) {
    throw taoLoi(
      `Báo cáo vượt quá ${GIOI_HAN_XUAT_FILE} dòng; vui lòng thu hẹp bộ lọc`,
      400
    );
  }

  return {
    loaiBaoCao,
    boLoc: {
      ...boLoc,
      sapXepTheo: sapXep.sapXepTheo,
      thuTu: sapXep.thuTu
    },
    ...baoCao
  };
}

module.exports = {
  LOAI_BAO_CAO,
  GIOI_HAN_XUAT_FILE,
  layBaoCao
};
