const dashboardModel = require("../models/dashboard.model");

const KHOANG_THOI_GIAN_HOP_LE = ["7_NGAY", "30_NGAY", "THANG_NAY", "TUY_CHINH"];
const SO_NGAY_CANH_BAO_MAC_DINH = 7;
const SO_NGAY_CANH_BAO_TOI_DA = 90;
const SO_LUONG_TOP_MAC_DINH = 5;
const SO_LUONG_TOP_TOI_DA = 20;

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

function dinhDangNgay(ngay) {
  const nam = ngay.getFullYear();
  const thang = String(ngay.getMonth() + 1).padStart(2, "0");
  const ngayTrongThang = String(ngay.getDate()).padStart(2, "0");
  return `${nam}-${thang}-${ngayTrongThang}`;
}

function layNgayHopLe(giaTri, tenTruong) {
  if (typeof giaTri !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(giaTri)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }
  const [nam, thang, ngayTrongThang] = giaTri.split("-").map(Number);
  const ngayKiemTra = new Date(nam, thang - 1, ngayTrongThang);
  if (
    ngayKiemTra.getFullYear() !== nam ||
    ngayKiemTra.getMonth() !== thang - 1 ||
    ngayKiemTra.getDate() !== ngayTrongThang
  ) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }
  return giaTri;
}

function truNgay(ngay, soNgay) {
  const ketQua = new Date(ngay);
  ketQua.setDate(ketQua.getDate() - soNgay);
  return ketQua;
}

function layKhoangThoiGian(query = {}) {
  const tuNgayRaw = layGiaTri(query, ["tuNgay", "tu_ngay"]);
  const denNgayRaw = layGiaTri(query, ["denNgay", "den_ngay"]);
  let khoangThoiGian = String(
    layGiaTri(query, ["khoangThoiGian", "khoang_thoi_gian"]) ||
    (tuNgayRaw || denNgayRaw ? "TUY_CHINH" : "30_NGAY")
  ).trim().toUpperCase();

  if (!KHOANG_THOI_GIAN_HOP_LE.includes(khoangThoiGian)) {
    throw taoLoi("Khoảng thời gian Dashboard không hợp lệ", 400);
  }

  const homNay = new Date();
  let tuNgay;
  let denNgay;

  if (khoangThoiGian === "TUY_CHINH") {
    if (!tuNgayRaw || !denNgayRaw) {
      throw taoLoi("Khoảng tùy chỉnh cần có từ ngày và đến ngày", 400);
    }
    tuNgay = layNgayHopLe(tuNgayRaw, "Từ ngày");
    denNgay = layNgayHopLe(denNgayRaw, "Đến ngày");
  } else if (khoangThoiGian === "THANG_NAY") {
    tuNgay = dinhDangNgay(new Date(homNay.getFullYear(), homNay.getMonth(), 1));
    denNgay = dinhDangNgay(homNay);
  } else {
    const soNgay = khoangThoiGian === "7_NGAY" ? 7 : 30;
    tuNgay = dinhDangNgay(truNgay(homNay, soNgay - 1));
    denNgay = dinhDangNgay(homNay);
  }

  if (tuNgay > denNgay) {
    throw taoLoi("Từ ngày không được lớn hơn đến ngày", 400);
  }

  return { khoangThoiGian, tuNgay, denNgay };
}

function laySoNguyenTrongKhoang(giaTri, macDinh, toiDa, tenTruong) {
  const so = giaTri === undefined || giaTri === null || giaTri === ""
    ? macDinh
    : Number(giaTri);
  if (!Number.isInteger(so) || so < 1 || so > toiDa) {
    throw taoLoi(`${tenTruong} phải là số nguyên từ 1 đến ${toiDa}`, 400);
  }
  return so;
}

function chuyenSo(giaTri) {
  return Number(giaTri) || 0;
}

async function layTongQuanDashboard(query = {}) {
  const boLocThoiGian = layKhoangThoiGian(query);
  const soNgayCanhBao = laySoNguyenTrongKhoang(
    layGiaTri(query, ["soNgayCanhBao", "so_ngay_canh_bao"]),
    SO_NGAY_CANH_BAO_MAC_DINH,
    SO_NGAY_CANH_BAO_TOI_DA,
    "Số ngày cảnh báo"
  );
  const gioiHanTop = laySoNguyenTrongKhoang(
    layGiaTri(query, ["gioiHanTop", "gioi_han_top"]),
    SO_LUONG_TOP_MAC_DINH,
    SO_LUONG_TOP_TOI_DA,
    "Giới hạn top"
  );
  const dieuKienThoiGian = {
    tuNgay: boLocThoiGian.tuNgay,
    denNgay: boLocThoiGian.denNgay
  };

  const [
    tongQuanThietBi,
    tongQuanSuCo,
    thoiGianXuLy,
    tongQuanBaoTri,
    thietBiTheoTrangThai,
    suCoTheoMucDo,
    suCoTheoThoiGian,
    baoTriTheoTrangThai,
    topThietBi,
    suCoCanChuY,
    baoTriCanChuY
  ] = await Promise.all([
    dashboardModel.layTongQuanThietBi(),
    dashboardModel.layTongQuanSuCoHienTai(),
    dashboardModel.layThoiGianXuLySuCoTrungBinh(dieuKienThoiGian),
    dashboardModel.layTongQuanBaoTri(soNgayCanhBao),
    dashboardModel.layThietBiTheoTrangThai(),
    dashboardModel.laySuCoTheoMucDo(dieuKienThoiGian),
    dashboardModel.laySuCoTheoThoiGian(dieuKienThoiGian),
    dashboardModel.layBaoTriTheoTrangThai(),
    dashboardModel.layTopThietBiNhieuSuCo({
      ...dieuKienThoiGian,
      gioiHan: gioiHanTop
    }),
    dashboardModel.laySuCoCanChuY(gioiHanTop),
    dashboardModel.layBaoTriQuaHanCanChuY(gioiHanTop)
  ]);

  return {
    boLoc: {
      ...boLocThoiGian,
      soNgayCanhBao,
      gioiHanTop
    },
    kpi: {
      tongThietBiDangQuanLy: chuyenSo(tongQuanThietBi.tong_thiet_bi_dang_quan_ly),
      tongHoSoThietBi: chuyenSo(tongQuanThietBi.tong_ho_so_thiet_bi),
      soSuCoMo: chuyenSo(tongQuanSuCo.so_su_co_mo),
      soSuCoNghiemTrongMo: chuyenSo(tongQuanSuCo.so_su_co_nghiem_trong_mo),
      soBaoTriSapDenHan: chuyenSo(tongQuanBaoTri.so_bao_tri_sap_den_han),
      soBaoTriQuaHan: chuyenSo(tongQuanBaoTri.so_bao_tri_qua_han),
      thoiGianXuLySuCoTrungBinh: {
        giaTri: thoiGianXuLy.thoi_gian_xu_ly_trung_binh_phut === null
          ? 0
          : Number(Number(thoiGianXuLy.thoi_gian_xu_ly_trung_binh_phut).toFixed(2)),
        donVi: "PHUT",
        soSuCoDuocTinh: chuyenSo(thoiGianXuLy.so_su_co_duoc_tinh)
      }
    },
    bieuDo: {
      thietBiTheoTrangThai: thietBiTheoTrangThai.map((dong) => ({
        trangThai: dong.trang_thai,
        soLuong: chuyenSo(dong.so_luong)
      })),
      suCoTheoMucDo: suCoTheoMucDo.map((dong) => ({
        mucDo: dong.muc_do,
        soLuong: chuyenSo(dong.so_luong)
      })),
      suCoTheoThoiGian: suCoTheoThoiGian.map((dong) => ({
        ngay: dong.ngay,
        soLuong: chuyenSo(dong.so_luong)
      })),
      baoTriTheoTrangThai: baoTriTheoTrangThai.map((dong) => ({
        trangThai: dong.trang_thai,
        soLuong: chuyenSo(dong.so_luong)
      }))
    },
    topThietBiNhieuSuCo: topThietBi.map((dong) => ({
      id: dong.id,
      maThietBi: dong.ma_thiet_bi,
      tenThietBi: dong.ten_thiet_bi,
      trangThai: dong.trang_thai,
      soSuCo: chuyenSo(dong.so_su_co)
    })),
    canChuY: {
      suCoNghiemTrong: suCoCanChuY.map((dong) => ({
        id: dong.id,
        maSuCo: dong.ma_su_co,
        tieuDe: dong.tieu_de,
        mucDo: dong.muc_do,
        trangThai: dong.trang_thai,
        thoiGianBao: dong.thoi_gian_bao,
        thietBi: {
          id: dong.thiet_bi_id,
          maThietBi: dong.ma_thiet_bi,
          tenThietBi: dong.ten_thiet_bi
        }
      })),
      baoTriQuaHan: baoTriCanChuY.map((dong) => ({
        phieuBaoTriId: dong.id,
        keHoachBaoTriId: dong.ke_hoach_bao_tri_id,
        ngayDuKien: dong.ngay_du_kien,
        trangThai: dong.trang_thai,
        soNgayQuaHan: chuyenSo(dong.so_ngay_qua_han),
        thietBi: {
          id: dong.thiet_bi_id,
          maThietBi: dong.ma_thiet_bi,
          tenThietBi: dong.ten_thiet_bi
        },
        kyThuatVien: dong.ky_thuat_vien_id
          ? { id: dong.ky_thuat_vien_id, hoTen: dong.ky_thuat_vien_ho_ten }
          : null
      }))
    },
    drillDown: {
      thietBiDangHong: "/api/thiet-bi?trangThai=DANG_HONG",
      suCoMo: [
        "/api/su-co?trangThai=MOI",
        "/api/su-co?trangThai=DA_PHAN_CONG",
        "/api/su-co?trangThai=DANG_XU_LY"
      ],
      suCoNghiemTrong: "/api/su-co?mucDo=NGHIEM_TRONG",
      baoTriQuaHan: "/api/bao-tri/qua-han",
      baoTriSapDenHan: `/api/bao-tri/sap-den-han?soNgay=${soNgayCanhBao}`
    },
    ghiChuDuLieu: {
      kpiThietBiVaCongViecDangMo: "Snapshot tại thời điểm truy vấn, không áp dụng bộ lọc ngày.",
      metricLichSu: "Thời gian xử lý, biểu đồ sự cố và top thiết bị áp dụng bộ lọc ngày."
    }
  };
}

module.exports = {
  layTongQuanDashboard
};
