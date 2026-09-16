const path = require("path");
const { Readable } = require("stream");

const ExcelJS = require("exceljs");
const QRCode = require("qrcode");

const { pool } = require("../config/database");
const VAI_TRO = require("../constants/vai_tro");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const dieuChuyenThietBiModel = require("../models/dieu_chuyen_thiet_bi.model");
const loaiThietBiModel = require("../models/loai_thiet_bi.model");
const loNhapModel = require("../models/lo_nhap.model");
const thietBiModel = require("../models/thiet_bi.model");
const thongKeThietBiModel = require("../models/thong_ke_thiet_bi.model");
const viTriModel = require("../models/vi_tri.model");

const SO_DONG_IMPORT_TOI_DA = 500;
const DANH_SACH_DUOI_TEP_HOP_LE = [".xlsx", ".csv"];
const DANH_SACH_TU_BO_QUA_TIEN_TO = [
  "MAY",
  "THIET",
  "BI",
  "LOAI",
  "HE",
  "THONG",
  "CONG",
  "CU"
];

const CHUYEN_TRANG_THAI_HOP_LE = {
  [TRANG_THAI_THIET_BI.DANG_HOAT_DONG]: [
    TRANG_THAI_THIET_BI.DANG_BAO_TRI,
    TRANG_THAI_THIET_BI.DANG_HONG,
    TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG,
    TRANG_THAI_THIET_BI.THANH_LY
  ],
  [TRANG_THAI_THIET_BI.DANG_BAO_TRI]: [
    TRANG_THAI_THIET_BI.DANG_HOAT_DONG,
    TRANG_THAI_THIET_BI.DANG_HONG,
    TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG,
    TRANG_THAI_THIET_BI.THANH_LY
  ],
  [TRANG_THAI_THIET_BI.DANG_HONG]: [
    TRANG_THAI_THIET_BI.DANG_HOAT_DONG,
    TRANG_THAI_THIET_BI.DANG_BAO_TRI,
    TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG,
    TRANG_THAI_THIET_BI.THANH_LY
  ],
  [TRANG_THAI_THIET_BI.NGUNG_HOAT_DONG]: [
    TRANG_THAI_THIET_BI.DANG_HOAT_DONG,
    TRANG_THAI_THIET_BI.THANH_LY
  ],
  [TRANG_THAI_THIET_BI.THANH_LY]: []
};

const BAN_DO_COT_IMPORT = {
  tenthietbi: "tenThietBi",
  tenthibi: "tenThietBi",
  ten: "tenThietBi",
  loaithietbiid: "loaiThietBiId",
  idloaithietbi: "loaiThietBiId",
  tenloai: "tenLoai",
  loaithietbi: "tenLoai",
  serial: "soSerial",
  soserial: "soSerial",
  model: "model",
  hangsanxuat: "hangSanXuat",
  hang: "hangSanXuat",
  vitriid: "viTriId",
  idvitri: "viTriId",
  tenvitri: "tenViTri",
  vitri: "tenViTri",
  lonhapid: "loNhapId",
  idlonhap: "loNhapId",
  malo: "maLo",
  trangthai: "trangThai",
  anhthietbi: "anhThietBi",
  giamua: "giaMua",
  ngaybatdaubaohanh: "ngayBatDauBaoHanh",
  ngayhetbaohanh: "ngayHetBaoHanh",
  mota: "moTa",
  ghichu: "moTa"
};

function taoLoi(thongBao, maTrangThai, duLieu = undefined) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  if (duLieu !== undefined) {
    loi.duLieu = duLieu;
  }

  return loi;
}

function chuanHoaChuoi(giaTri) {
  if (giaTri === undefined || giaTri === null) {
    return null;
  }

  const giaTriChuanHoa = String(giaTri).trim();

  return giaTriChuanHoa === "" ? null : giaTriChuanHoa;
}

function layGiaTriTheoNhieuTen(duLieu, danhSachTen) {
  return danhSachTen.find((tenTruong) =>
    Object.prototype.hasOwnProperty.call(duLieu || {}, tenTruong)
  );
}

function chuanHoaChuoiKhongDau(giaTri) {
  return String(giaTri || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");
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

function laySoTienTuyChon(giaTri, tenTruong) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }

  const soTien = Number(giaTri);

  if (!Number.isFinite(soTien) || soTien < 0) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return soTien;
}

function layNgayTuyChon(giaTri, tenTruong) {
  if (giaTri === undefined || giaTri === null || String(giaTri).trim() === "") {
    return null;
  }

  const ngay = String(giaTri).trim();
  const laDinhDangNgayHopLe = /^\d{4}-\d{2}-\d{2}$/.test(ngay);
  const thoiGian = Date.parse(`${ngay}T00:00:00Z`);

  if (!laDinhDangNgayHopLe || Number.isNaN(thoiGian)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }

  return ngay;
}

function chuyenNgayVeChuoi(giaTri) {
  if (!giaTri) {
    return null;
  }

  if (giaTri instanceof Date) {
    const nam = giaTri.getFullYear();
    const thang = String(giaTri.getMonth() + 1).padStart(2, "0");
    const ngay = String(giaTri.getDate()).padStart(2, "0");

    return `${nam}-${thang}-${ngay}`;
  }

  return String(giaTri).slice(0, 10);
}

function kiemTraKhoangNgayBaoHanh(ngayBatDauBaoHanh, ngayHetBaoHanh) {
  const ngayBatDau = chuyenNgayVeChuoi(ngayBatDauBaoHanh);
  const ngayKetThuc = chuyenNgayVeChuoi(ngayHetBaoHanh);

  if (!ngayBatDau || !ngayKetThuc) {
    return;
  }

  const thoiGianBatDau = Date.parse(`${ngayBatDau}T00:00:00Z`);
  const thoiGianKetThuc = Date.parse(`${ngayKetThuc}T00:00:00Z`);

  if (thoiGianKetThuc < thoiGianBatDau) {
    throw taoLoi("Ngày hết bảo hành phải lớn hơn hoặc bằng ngày bắt đầu bảo hành", 400);
  }
}

function kiemTraChuoiBatBuoc(giaTri, tenTruong) {
  const giaTriChuanHoa = chuanHoaChuoi(giaTri);

  if (!giaTriChuanHoa) {
    throw taoLoi(`${tenTruong} không được để trống`, 400);
  }

  return giaTriChuanHoa;
}

function kiemTraTrangThaiHopLe(trangThai, tenTruong = "Trạng thái thiết bị") {
  const trangThaiChuanHoa = chuanHoaChuoi(trangThai);

  if (!trangThaiChuanHoa) {
    return TRANG_THAI_THIET_BI.DANG_HOAT_DONG;
  }

  const trangThaiVietHoa = trangThaiChuanHoa.toUpperCase();
  const danhSachTrangThaiHopLe = Object.values(TRANG_THAI_THIET_BI);

  if (!danhSachTrangThaiHopLe.includes(trangThaiVietHoa)) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return trangThaiVietHoa;
}

function layThongTinPhanTrang(query = {}) {
  const trangHienTai = Number(query.page !== undefined ? query.page : query.trang || 1);
  const soBanGhiMoiTrang = Number(query.limit !== undefined ? query.limit : query.gioiHan || 10);

  if (!Number.isInteger(trangHienTai) || trangHienTai < 1) {
    throw taoLoi("Trang không hợp lệ", 400);
  }

  if (
    !Number.isInteger(soBanGhiMoiTrang) ||
    soBanGhiMoiTrang < 1 ||
    soBanGhiMoiTrang > 100
  ) {
    throw taoLoi("Giới hạn không hợp lệ", 400);
  }

  return {
    trangHienTai,
    soBanGhiMoiTrang,
    boQua: (trangHienTai - 1) * soBanGhiMoiTrang
  };
}

function dinhDangLoaiThietBiTuDong(thietBi) {
  return {
    id: thietBi.loai_thiet_bi_id,
    tenLoai: thietBi.ten_loai
  };
}

function dinhDangViTriTuDong(thietBi) {
  if (!thietBi.vi_tri_id) {
    return null;
  }

  return {
    id: thietBi.vi_tri_id,
    tenViTri: thietBi.ten_vi_tri,
    loaiViTri: thietBi.loai_vi_tri
  };
}

function dinhDangLoNhapTuDong(thietBi) {
  if (!thietBi.lo_nhap_id) {
    return null;
  }

  return {
    id: thietBi.lo_nhap_id,
    maLo: thietBi.ma_lo,
    soHoaDon: thietBi.so_hoa_don || null,
    ngayNhap: thietBi.ngay_nhap || null,
    nhaCungCap: thietBi.nha_cung_cap_id
      ? {
          id: thietBi.nha_cung_cap_id,
          tenNhaCungCap: thietBi.ten_nha_cung_cap
        }
      : null
  };
}

function layTrangThaiBaoHanh(thietBi) {
  if (!thietBi.ngay_bat_dau_bao_hanh && !thietBi.ngay_het_bao_hanh) {
    return "CHUA_CO_THONG_TIN";
  }

  const homNay = new Date();
  const ngayHomNay = `${homNay.getFullYear()}-${String(homNay.getMonth() + 1).padStart(2, "0")}-${String(homNay.getDate()).padStart(2, "0")}`;
  const dauNgayHomNay = Date.parse(`${ngayHomNay}T00:00:00Z`);

  if (thietBi.ngay_bat_dau_bao_hanh) {
    const thoiGianBatDau = Date.parse(`${chuyenNgayVeChuoi(thietBi.ngay_bat_dau_bao_hanh)}T00:00:00Z`);

    if (!Number.isNaN(thoiGianBatDau) && thoiGianBatDau > dauNgayHomNay) {
      return "CHUA_BAT_DAU";
    }
  }

  if (thietBi.ngay_het_bao_hanh) {
    const thoiGianKetThuc = Date.parse(`${chuyenNgayVeChuoi(thietBi.ngay_het_bao_hanh)}T00:00:00Z`);

    if (!Number.isNaN(thoiGianKetThuc) && thoiGianKetThuc < dauNgayHomNay) {
      return "HET_BAO_HANH";
    }
  }

  return "CON_BAO_HANH";
}

function dinhDangBaoHanh(thietBi) {
  return {
    ngayBatDauBaoHanh: thietBi.ngay_bat_dau_bao_hanh,
    ngayHetBaoHanh: thietBi.ngay_het_bao_hanh,
    trangThaiBaoHanh: layTrangThaiBaoHanh(thietBi)
  };
}

function dinhDangThietBi(thietBi, vaiTro = VAI_TRO.NHAN_VIEN) {
  const duLieu = {
    id: thietBi.id,
    maThietBi: thietBi.ma_thiet_bi,
    tenThietBi: thietBi.ten_thiet_bi,
    loaiThietBi: dinhDangLoaiThietBiTuDong(thietBi),
    soSerial: thietBi.so_serial,
    model: thietBi.model,
    hangSanXuat: thietBi.hang_san_xuat,
    trangThai: thietBi.trang_thai,
    viTri: dinhDangViTriTuDong(thietBi),
    maQr: thietBi.ma_qr,
    anhThietBi: thietBi.anh_thiet_bi,
    moTa: thietBi.mo_ta,
    coTheBaoSuCo: thietBi.trang_thai !== TRANG_THAI_THIET_BI.THANH_LY,
    ngayTao: thietBi.ngay_tao,
    ngayCapNhat: thietBi.ngay_cap_nhat
  };

  if (vaiTro === VAI_TRO.QUAN_TRI_VIEN) {
    duLieu.loNhap = dinhDangLoNhapTuDong(thietBi);
    duLieu.giaMua = thietBi.gia_mua === null ? null : Number(thietBi.gia_mua);
    duLieu.ngayBatDauBaoHanh = thietBi.ngay_bat_dau_bao_hanh;
    duLieu.ngayHetBaoHanh = thietBi.ngay_het_bao_hanh;
    duLieu.baoHanh = dinhDangBaoHanh(thietBi);
  }

  return duLieu;
}

function taoTienToMaThietBi(tenLoai) {
  const tenKhongDau = chuanHoaChuoiKhongDau(tenLoai).toUpperCase();
  const danhSachTu = tenKhongDau.match(/[A-Z0-9]+/g) || [];
  const tuUuTien = danhSachTu.find(
    (tu) => tu.length >= 2 && !DANH_SACH_TU_BO_QUA_TIEN_TO.includes(tu)
  );

  if (tuUuTien) {
    return tuUuTien.slice(0, 6);
  }

  const tienToTuChuCaiDau = danhSachTu
    .filter((tu) => !DANH_SACH_TU_BO_QUA_TIEN_TO.includes(tu))
    .map((tu) => tu[0])
    .join("")
    .slice(0, 6);

  return tienToTuChuCaiDau || "TB";
}

function taoMaThietBi(tienTo, soThuTuMa) {
  const soThuTu = String(soThuTuMa).padStart(4, "0");

  return `${tienTo}-${soThuTu}`;
}

function taoMaQr(maThietBi) {
  return `FC-${maThietBi}`;
}

async function taoAnhQr(maQr) {
  return QRCode.toDataURL(maQr, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240
  });
}

function taoTenKhoaSinhMa(tienTo) {
  return `factorycare:ma_thiet_bi:${tienTo}`;
}

async function khoaTienToSinhMa(connection, tienTo) {
  const tenKhoa = taoTenKhoaSinhMa(tienTo);
  const daKhoa = await thietBiModel.khoaSinhMaThietBi(connection, tenKhoa);

  if (!daKhoa) {
    throw taoLoi("Không thể khóa sinh mã thiết bị, vui lòng thử lại", 409);
  }

  return tenKhoa;
}

async function moKhoaTienToSinhMa(connection, tenKhoa) {
  try {
    await thietBiModel.moKhoaSinhMaThietBi(connection, tenKhoa);
  } catch (loi) {
    return false;
  }

  return true;
}

function xuLyLoiTrungThietBi(loi) {
  if (loi.code !== "ER_DUP_ENTRY") {
    throw loi;
  }

  const thongBaoLoi = String(loi.message || "");

  if (thongBaoLoi.includes("uk_thiet_bi_serial") || thongBaoLoi.includes("so_serial")) {
    throw taoLoi("Serial thiết bị đã tồn tại", 409);
  }

  if (thongBaoLoi.includes("uk_thiet_bi_qr") || thongBaoLoi.includes("ma_qr")) {
    throw taoLoi("Mã QR thiết bị đã tồn tại", 409);
  }

  if (thongBaoLoi.includes("ma_thiet_bi")) {
    throw taoLoi("Mã thiết bị đã tồn tại", 409);
  }

  throw taoLoi("Dữ liệu thiết bị đã tồn tại", 409);
}

async function kiemTraLoaiThietBiTonTai(loaiThietBiId, connection = null) {
  const loaiThietBi = await loaiThietBiModel.timTheoId(loaiThietBiId, connection);

  if (!loaiThietBi) {
    throw taoLoi("Loại thiết bị không tồn tại", 400);
  }

  return loaiThietBi;
}

async function kiemTraViTriTonTai(viTriId, connection = null) {
  if (!viTriId) {
    return null;
  }

  const viTri = await viTriModel.timTheoId(viTriId, connection);

  if (!viTri) {
    throw taoLoi("Vị trí không tồn tại", 400);
  }

  return viTri;
}

async function kiemTraLoNhapTonTai(loNhapId, connection = null) {
  if (!loNhapId) {
    return null;
  }

  const loNhap = await loNhapModel.timTheoId(loNhapId, connection);

  if (!loNhap) {
    throw taoLoi("Lô nhập không tồn tại", 400);
  }

  return loNhap;
}

async function kiemTraSerialChuaTonTai(soSerial, thietBiIdBoQua = null) {
  if (!soSerial) {
    return;
  }

  const thietBiTheoSerial = await thietBiModel.timTheoSerial(soSerial, thietBiIdBoQua);

  if (thietBiTheoSerial) {
    throw taoLoi("Serial thiết bị đã tồn tại", 409);
  }
}

async function layDuLieuTaoThietBiHopLe(duLieu) {
  const tenThietBi = kiemTraChuoiBatBuoc(duLieu.tenThietBi, "Tên thiết bị");
  const loaiThietBiId = layIdHopLe(duLieu.loaiThietBiId, "Loại thiết bị");
  const viTriId = layIdTuyChon(duLieu.viTriId, "Vị trí");
  const loNhapId = layIdTuyChon(duLieu.loNhapId, "Lô nhập");
  const soSerial = chuanHoaChuoi(duLieu.soSerial);
  const model = chuanHoaChuoi(duLieu.model);
  const hangSanXuat = chuanHoaChuoi(duLieu.hangSanXuat);
  const anhThietBi = chuanHoaChuoi(duLieu.anhThietBi);
  const giaMua = laySoTienTuyChon(duLieu.giaMua, "Giá mua");
  const ngayBatDauBaoHanh = layNgayTuyChon(duLieu.ngayBatDauBaoHanh, "Ngày bắt đầu bảo hành");
  const ngayHetBaoHanh = layNgayTuyChon(duLieu.ngayHetBaoHanh, "Ngày hết bảo hành");
  const trangThai = kiemTraTrangThaiHopLe(duLieu.trangThai);
  const moTa = chuanHoaChuoi(duLieu.moTa);

  kiemTraKhoangNgayBaoHanh(ngayBatDauBaoHanh, ngayHetBaoHanh);

  const [loaiThietBi] = await Promise.all([
    kiemTraLoaiThietBiTonTai(loaiThietBiId),
    kiemTraViTriTonTai(viTriId),
    kiemTraLoNhapTonTai(loNhapId),
    kiemTraSerialChuaTonTai(soSerial)
  ]);

  return {
    tenThietBi,
    loaiThietBiId,
    loaiThietBi,
    viTriId,
    loNhapId,
    soSerial,
    model,
    hangSanXuat,
    anhThietBi,
    giaMua,
    ngayBatDauBaoHanh,
    ngayHetBaoHanh,
    trangThai,
    moTa
  };
}

async function taoThietBiDaKiemTra(duLieuHopLe) {
  const connection = await pool.getConnection();
  const tienTo = taoTienToMaThietBi(duLieuHopLe.loaiThietBi.ten_loai);
  let tenKhoa = null;
  let daBatDauTransaction = false;

  try {
    tenKhoa = await khoaTienToSinhMa(connection, tienTo);
    await connection.beginTransaction();
    daBatDauTransaction = true;

    const soThuTuLonNhat = await thietBiModel.laySoThuTuMaLonNhatTheoTienTo(connection, tienTo);
    const maThietBi = taoMaThietBi(tienTo, soThuTuLonNhat + 1);
    const maQr = taoMaQr(maThietBi);
    const thietBiId = await thietBiModel.taoThietBi(connection, {
      ...duLieuHopLe,
      maThietBi,
      maQr
    });

    await connection.commit();
    daBatDauTransaction = false;

    return thietBiId;
  } catch (loi) {
    if (daBatDauTransaction) {
      await connection.rollback();
    }

    xuLyLoiTrungThietBi(loi);
  } finally {
    if (tenKhoa) {
      await moKhoaTienToSinhMa(connection, tenKhoa);
    }

    connection.release();
  }
}

async function taoThietBi(duLieu) {
  const duLieuHopLe = await layDuLieuTaoThietBiHopLe(duLieu);
  const thietBiId = await taoThietBiDaKiemTra(duLieuHopLe);
  const thietBiMoi = await thietBiModel.timTheoId(thietBiId);

  return dinhDangThietBi(thietBiMoi, VAI_TRO.QUAN_TRI_VIEN);
}

function kiemTraKhongSuaTruongHeThong(duLieu) {
  const danhSachTruongKhongDuocSua = [
    "maThietBi",
    "ma_thiet_bi",
    "maQr",
    "ma_qr",
    "trangThai",
    "trang_thai",
    "viTriId",
    "vi_tri_id"
  ];
  const truongDangSua = danhSachTruongKhongDuocSua.find(
    (tenTruong) => duLieu[tenTruong] !== undefined
  );

  if (truongDangSua) {
    throw taoLoi(`Không được sửa trực tiếp trường ${truongDangSua}`, 400);
  }
}

async function capNhatThietBi(id, duLieu) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const thietBiHienTai = await thietBiModel.timTheoId(thietBiId);

  if (!thietBiHienTai) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  kiemTraKhongSuaTruongHeThong(duLieu);

  const tenThietBi = kiemTraChuoiBatBuoc(
    duLieu.tenThietBi !== undefined ? duLieu.tenThietBi : thietBiHienTai.ten_thiet_bi,
    "Tên thiết bị"
  );
  const loaiThietBiId =
    duLieu.loaiThietBiId !== undefined
      ? layIdHopLe(duLieu.loaiThietBiId, "Loại thiết bị")
      : thietBiHienTai.loai_thiet_bi_id;
  const loNhapId =
    duLieu.loNhapId !== undefined
      ? layIdTuyChon(duLieu.loNhapId, "Lô nhập")
      : thietBiHienTai.lo_nhap_id;
  const soSerial =
    duLieu.soSerial !== undefined ? chuanHoaChuoi(duLieu.soSerial) : thietBiHienTai.so_serial;
  const model = duLieu.model !== undefined ? chuanHoaChuoi(duLieu.model) : thietBiHienTai.model;
  const hangSanXuat =
    duLieu.hangSanXuat !== undefined
      ? chuanHoaChuoi(duLieu.hangSanXuat)
      : thietBiHienTai.hang_san_xuat;
  const anhThietBi =
    duLieu.anhThietBi !== undefined
      ? chuanHoaChuoi(duLieu.anhThietBi)
      : thietBiHienTai.anh_thiet_bi;
  const giaMua =
    duLieu.giaMua !== undefined
      ? laySoTienTuyChon(duLieu.giaMua, "Giá mua")
      : thietBiHienTai.gia_mua;
  const ngayBatDauBaoHanh =
    duLieu.ngayBatDauBaoHanh !== undefined
      ? layNgayTuyChon(duLieu.ngayBatDauBaoHanh, "Ngày bắt đầu bảo hành")
      : thietBiHienTai.ngay_bat_dau_bao_hanh;
  const ngayHetBaoHanh =
    duLieu.ngayHetBaoHanh !== undefined
      ? layNgayTuyChon(duLieu.ngayHetBaoHanh, "Ngày hết bảo hành")
      : thietBiHienTai.ngay_het_bao_hanh;
  const moTa = duLieu.moTa !== undefined ? chuanHoaChuoi(duLieu.moTa) : thietBiHienTai.mo_ta;

  kiemTraKhoangNgayBaoHanh(ngayBatDauBaoHanh, ngayHetBaoHanh);

  await Promise.all([
    kiemTraLoaiThietBiTonTai(loaiThietBiId),
    kiemTraLoNhapTonTai(loNhapId),
    kiemTraSerialChuaTonTai(soSerial, thietBiId)
  ]);

  try {
    await thietBiModel.capNhatThietBi(thietBiId, {
      tenThietBi,
      loaiThietBiId,
      loNhapId,
      soSerial,
      model,
      hangSanXuat,
      anhThietBi,
      giaMua,
      ngayBatDauBaoHanh,
      ngayHetBaoHanh,
      moTa
    });
  } catch (loi) {
    xuLyLoiTrungThietBi(loi);
  }

  const thietBiDaCapNhat = await thietBiModel.timTheoId(thietBiId);

  return dinhDangThietBi(thietBiDaCapNhat, VAI_TRO.QUAN_TRI_VIEN);
}

async function layDanhSachThietBi(query = {}, nguoiDung = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const tuKhoa = typeof query.tuKhoa === "string" ? query.tuKhoa.trim() : "";
  const loaiThietBiId = layIdTuyChon(
    query.loaiThietBiId || query.loai_thiet_bi_id || query.loai_thiet_bi,
    "Loại thiết bị"
  );
  const viTriId = layIdTuyChon(query.viTriId || query.vi_tri_id || query.vi_tri, "Vị trí");
  const trangThai = query.trangThai || query.trang_thai
    ? kiemTraTrangThaiHopLe(query.trangThai || query.trang_thai)
    : null;

  const dieuKienLoc = {
    tuKhoa,
    loaiThietBiId,
    trangThai,
    viTriId
  };

  const [danhSachThietBi, tongBanGhi] = await Promise.all([
    thietBiModel.layDanhSachThietBi({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    thietBiModel.demTongThietBi(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachThietBi.map((thietBi) => dinhDangThietBi(thietBi, nguoiDung.vaiTro)),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layChiTietThietBi(id, nguoiDung = {}) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  return dinhDangThietBi(thietBi, nguoiDung.vaiTro);
}

async function damBaoCoMaQr(thietBi) {
  if (thietBi.ma_qr) {
    return thietBi.ma_qr;
  }

  const maQr = taoMaQr(thietBi.ma_thiet_bi);

  try {
    await thietBiModel.capNhatMaQr(thietBi.id, maQr);
  } catch (loi) {
    xuLyLoiTrungThietBi(loi);
  }

  return maQr;
}

async function layQrThietBi(id) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  const maQr = await damBaoCoMaQr(thietBi);
  const anhQr = await taoAnhQr(maQr);

  return {
    id: thietBi.id,
    maThietBi: thietBi.ma_thiet_bi,
    maQr,
    noiDungQr: maQr,
    anhQr
  };
}

function chuanHoaMaQrTuNoiDung(noiDungQr) {
  const giaTri = chuanHoaChuoi(noiDungQr);

  if (!giaTri) {
    throw taoLoi("Mã QR không hợp lệ", 400);
  }

  if (giaTri.length > 255) {
    throw taoLoi("Mã QR không hợp lệ", 400);
  }

  try {
    const diaChi = new URL(giaTri);
    const danhSachPhanDuongDan = diaChi.pathname.split("/").filter(Boolean);
    const maQrTuDuongDan = danhSachPhanDuongDan[danhSachPhanDuongDan.length - 1];

    if (maQrTuDuongDan) {
      return decodeURIComponent(maQrTuDuongDan);
    }
  } catch (loi) {
    // Gia tri QR dang identifier thuan, khong phai URL.
  }

  return giaTri;
}

async function layThietBiTheoQr(noiDungQr, nguoiDung = {}) {
  const maQr = chuanHoaMaQrTuNoiDung(noiDungQr);

  if (!maQr.startsWith("FC-")) {
    throw taoLoi("Mã QR không thuộc hệ thống FactoryCare", 400);
  }

  const thietBi = await thietBiModel.timTheoMaQr(maQr);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị từ mã QR", 404);
  }

  const duLieu = dinhDangThietBi(thietBi, nguoiDung.vaiTro);

  return {
    ...duLieu,
    canhBao: thietBi.trang_thai === TRANG_THAI_THIET_BI.THANH_LY
      ? "Thiết bị đã thanh lý"
      : null
  };
}

async function capNhatTrangThai(id, trangThaiMoi) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const trangThai = kiemTraTrangThaiHopLe(trangThaiMoi);
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  if (thietBi.trang_thai === trangThai) {
    return dinhDangThietBi(thietBi, VAI_TRO.QUAN_TRI_VIEN);
  }

  const danhSachTrangThaiDuocChuyen = CHUYEN_TRANG_THAI_HOP_LE[thietBi.trang_thai] || [];

  if (!danhSachTrangThaiDuocChuyen.includes(trangThai)) {
    throw taoLoi("Không thể chuyển trạng thái thiết bị theo luồng hiện tại", 409);
  }

  await thietBiModel.capNhatTrangThai(thietBiId, trangThai);

  const thietBiDaCapNhat = await thietBiModel.timTheoId(thietBiId);

  return dinhDangThietBi(thietBiDaCapNhat, VAI_TRO.QUAN_TRI_VIEN);
}

function dinhDangViTriDieuChuyen(id, tenViTri, loaiViTri) {
  if (!id) {
    return null;
  }

  return {
    id,
    tenViTri,
    loaiViTri
  };
}

function dinhDangDieuChuyen(dieuChuyen) {
  return {
    id: dieuChuyen.id,
    thietBiId: dieuChuyen.thiet_bi_id,
    viTriCu: dinhDangViTriDieuChuyen(
      dieuChuyen.vi_tri_cu_id,
      dieuChuyen.ten_vi_tri_cu,
      dieuChuyen.loai_vi_tri_cu
    ),
    viTriMoi: dinhDangViTriDieuChuyen(
      dieuChuyen.vi_tri_moi_id,
      dieuChuyen.ten_vi_tri_moi,
      dieuChuyen.loai_vi_tri_moi
    ),
    nguoiThucHien: {
      id: dieuChuyen.nguoi_thuc_hien_id,
      hoTen: dieuChuyen.ten_nguoi_thuc_hien,
      email: dieuChuyen.email_nguoi_thuc_hien
    },
    lyDo: dieuChuyen.ly_do,
    ghiChu: dieuChuyen.ghi_chu,
    ngayDieuChuyen: dieuChuyen.ngay_dieu_chuyen,
    ngayTao: dieuChuyen.ngay_tao
  };
}

async function dieuChuyenThietBi(id, duLieu, nguoiDung = {}) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const viTriMoiId = layIdHopLe(
    duLieu.viTriMoiId || duLieu.vi_tri_moi_id || duLieu.viTriId,
    "Vị trí mới"
  );
  const nguoiThucHienId = layIdHopLe(nguoiDung.id, "Người thực hiện");
  const lyDo = kiemTraChuoiBatBuoc(duLieu.lyDo || duLieu.ly_do, "Lý do điều chuyển");
  const ghiChu = chuanHoaChuoi(duLieu.ghiChu || duLieu.ghi_chu);
  const connection = await pool.getConnection();
  let daBatDauTransaction = false;
  let dieuChuyenId = null;

  try {
    await connection.beginTransaction();
    daBatDauTransaction = true;

    const thietBi = await thietBiModel.timTheoIdDeCapNhat(thietBiId, connection);

    if (!thietBi) {
      throw taoLoi("Không tìm thấy thiết bị", 404);
    }

    const viTriMoi = await viTriModel.timTheoId(viTriMoiId, connection);

    if (!viTriMoi) {
      throw taoLoi("Vị trí mới không tồn tại", 400);
    }

    const viTriCuId = thietBi.vi_tri_id || null;

    if (viTriCuId && Number(viTriCuId) === viTriMoiId) {
      throw taoLoi("Thiết bị đang ở vị trí này, không cần điều chuyển", 409);
    }

    dieuChuyenId = await dieuChuyenThietBiModel.taoDieuChuyenThietBi(connection, {
      thietBiId,
      viTriCuId,
      viTriMoiId,
      nguoiThucHienId,
      lyDo,
      ghiChu
    });

    await thietBiModel.capNhatViTriThietBi(connection, thietBiId, viTriMoiId);

    await connection.commit();
    daBatDauTransaction = false;
  } catch (loi) {
    if (daBatDauTransaction) {
      await connection.rollback();
    }

    throw loi;
  } finally {
    connection.release();
  }

  const [dieuChuyen, thietBiDaCapNhat] = await Promise.all([
    dieuChuyenThietBiModel.timTheoId(dieuChuyenId),
    thietBiModel.timTheoId(thietBiId)
  ]);

  return {
    dieuChuyen: dinhDangDieuChuyen(dieuChuyen),
    thietBi: dinhDangThietBi(thietBiDaCapNhat, VAI_TRO.QUAN_TRI_VIEN)
  };
}

async function layLichSuDieuChuyen(id, query = {}) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  const [danhSachDieuChuyen, tongBanGhi] = await Promise.all([
    dieuChuyenThietBiModel.layLichSuDieuChuyenTheoThietBi({
      thietBiId,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    dieuChuyenThietBiModel.demLichSuDieuChuyenTheoThietBi(thietBiId)
  ]);

  return {
    thietBi: {
      id: thietBi.id,
      maThietBi: thietBi.ma_thiet_bi,
      tenThietBi: thietBi.ten_thiet_bi
    },
    danhSach: danhSachDieuChuyen.map(dinhDangDieuChuyen),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function capNhatBaoHanh(id, duLieu = {}) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const thietBiHienTai = await thietBiModel.timTheoId(thietBiId);

  if (!thietBiHienTai) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  const truongNgayBatDau = layGiaTriTheoNhieuTen(duLieu, [
    "ngayBatDauBaoHanh",
    "ngay_bat_dau_bao_hanh"
  ]);
  const truongNgayKetThuc = layGiaTriTheoNhieuTen(duLieu, [
    "ngayHetBaoHanh",
    "ngay_het_bao_hanh"
  ]);
  const ngayBatDauBaoHanh = truongNgayBatDau
    ? layNgayTuyChon(duLieu[truongNgayBatDau], "Ngày bắt đầu bảo hành")
    : thietBiHienTai.ngay_bat_dau_bao_hanh;
  const ngayHetBaoHanh = truongNgayKetThuc
    ? layNgayTuyChon(duLieu[truongNgayKetThuc], "Ngày hết bảo hành")
    : thietBiHienTai.ngay_het_bao_hanh;

  kiemTraKhoangNgayBaoHanh(ngayBatDauBaoHanh, ngayHetBaoHanh);

  await thietBiModel.capNhatBaoHanh(thietBiId, {
    ngayBatDauBaoHanh,
    ngayHetBaoHanh
  });

  const thietBiDaCapNhat = await thietBiModel.timTheoId(thietBiId);

  return dinhDangThietBi(thietBiDaCapNhat, VAI_TRO.QUAN_TRI_VIEN);
}

async function layBaoHanh(id) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  return {
    thietBi: {
      id: thietBi.id,
      maThietBi: thietBi.ma_thiet_bi,
      tenThietBi: thietBi.ten_thiet_bi
    },
    ...dinhDangBaoHanh(thietBi)
  };
}

function laySoThongKe(duLieu, tenTruong) {
  return Number(duLieu && duLieu[tenTruong] ? duLieu[tenTruong] : 0);
}

function taoTacDongHealthScore(ten, soLuong, diemTruMoiBanGhi) {
  return {
    ten,
    soLuong,
    diemTruMoiBanGhi,
    tongDiemTru: soLuong * diemTruMoiBanGhi
  };
}

function layMucHealthScore(diem) {
  if (diem >= 80) {
    return "TOT";
  }

  if (diem >= 60) {
    return "CAN_THEO_DOI";
  }

  if (diem >= 40) {
    return "CAN_BAO_TRI";
  }

  return "NGUY_CO_CAO";
}

function taoCanhBaoHealthScore(thietBi, thongKeSuCo, thongKeSuaChua, thongKeBaoTri) {
  const danhSachCanhBao = [];

  if (thietBi.trang_thai === TRANG_THAI_THIET_BI.DANG_HONG) {
    danhSachCanhBao.push("Thiết bị đang ở trạng thái hỏng");
  }

  if (laySoThongKe(thongKeSuCo, "so_su_co_dang_mo") > 0) {
    danhSachCanhBao.push("Thiết bị đang có sự cố chưa xử lý xong");
  }

  if (laySoThongKe(thongKeBaoTri, "so_qua_han") > 0) {
    danhSachCanhBao.push("Thiết bị có phiếu bảo trì quá hạn");
  }

  if (laySoThongKe(thongKeSuaChua, "so_khong_sua_duoc") > 0) {
    danhSachCanhBao.push("Thiết bị từng có hồ sơ sửa chữa không sửa được");
  }

  return danhSachCanhBao;
}

function dinhDangThongKeHealthScore(thongKeSuCo, thongKeSuaChua, thongKeBaoTri) {
  return {
    suCo: {
      tongSuCo: laySoThongKe(thongKeSuCo, "tong_su_co"),
      soSuCoThap: laySoThongKe(thongKeSuCo, "so_su_co_thap"),
      soSuCoTrungBinh: laySoThongKe(thongKeSuCo, "so_su_co_trung_binh"),
      soSuCoCao: laySoThongKe(thongKeSuCo, "so_su_co_cao"),
      soSuCoNghiemTrong: laySoThongKe(thongKeSuCo, "so_su_co_nghiem_trong"),
      soSuCoDangMo: laySoThongKe(thongKeSuCo, "so_su_co_dang_mo")
    },
    suaChua: {
      tongHoSoSuaChua: laySoThongKe(thongKeSuaChua, "tong_ho_so_sua_chua"),
      soDaSuaXong: laySoThongKe(thongKeSuaChua, "so_da_sua_xong"),
      soSuaMotPhan: laySoThongKe(thongKeSuaChua, "so_sua_mot_phan"),
      soKhongSuaDuoc: laySoThongKe(thongKeSuaChua, "so_khong_sua_duoc")
    },
    baoTri: {
      tongPhieuBaoTri: laySoThongKe(thongKeBaoTri, "tong_phieu_bao_tri"),
      soHoanThanh: laySoThongKe(thongKeBaoTri, "so_hoan_thanh"),
      soQuaHan: laySoThongKe(thongKeBaoTri, "so_qua_han"),
      soBaoTriDangMo: laySoThongKe(thongKeBaoTri, "so_bao_tri_dang_mo")
    }
  };
}

async function layHealthScore(id) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  const [thongKeSuCo, thongKeSuaChua, thongKeBaoTri] = await Promise.all([
    thongKeThietBiModel.layThongKeSuCoTheoThietBi(thietBiId),
    thongKeThietBiModel.layThongKeSuaChuaTheoThietBi(thietBiId),
    thongKeThietBiModel.layThongKeBaoTriTheoThietBi(thietBiId)
  ]);
  const tongDuLieuDanhGia =
    laySoThongKe(thongKeSuCo, "tong_su_co") +
    laySoThongKe(thongKeSuaChua, "tong_ho_so_sua_chua") +
    laySoThongKe(thongKeBaoTri, "tong_phieu_bao_tri");

  if (tongDuLieuDanhGia === 0) {
    return {
      thietBi: dinhDangThietBi(thietBi, VAI_TRO.QUAN_TRI_VIEN),
      trangThaiDanhGia: "CHUA_DU_DU_LIEU",
      diem: null,
      mucDanhGia: null,
      lyDo: [
        "Chưa có sự cố, hồ sơ sửa chữa hoặc phiếu bảo trì nào để đánh giá sức khỏe thiết bị"
      ],
      thongKe: dinhDangThongKeHealthScore(thongKeSuCo, thongKeSuaChua, thongKeBaoTri)
    };
  }

  const danhSachTacDong = [
    taoTacDongHealthScore("SU_CO_THAP", laySoThongKe(thongKeSuCo, "so_su_co_thap"), 2),
    taoTacDongHealthScore("SU_CO_TRUNG_BINH", laySoThongKe(thongKeSuCo, "so_su_co_trung_binh"), 5),
    taoTacDongHealthScore("SU_CO_CAO", laySoThongKe(thongKeSuCo, "so_su_co_cao"), 10),
    taoTacDongHealthScore("SU_CO_NGHIEM_TRONG", laySoThongKe(thongKeSuCo, "so_su_co_nghiem_trong"), 20),
    taoTacDongHealthScore("SU_CO_DANG_MO", laySoThongKe(thongKeSuCo, "so_su_co_dang_mo"), 10),
    taoTacDongHealthScore("BAO_TRI_QUA_HAN", laySoThongKe(thongKeBaoTri, "so_qua_han"), 10),
    taoTacDongHealthScore("SUA_MOT_PHAN", laySoThongKe(thongKeSuaChua, "so_sua_mot_phan"), 8),
    taoTacDongHealthScore("KHONG_SUA_DUOC", laySoThongKe(thongKeSuaChua, "so_khong_sua_duoc"), 15)
  ].filter((tacDong) => tacDong.soLuong > 0);
  const tongDiemTru = danhSachTacDong.reduce(
    (tong, tacDong) => tong + tacDong.tongDiemTru,
    0
  );
  const diem = Math.max(0, 100 - tongDiemTru);

  return {
    thietBi: dinhDangThietBi(thietBi, VAI_TRO.QUAN_TRI_VIEN),
    trangThaiDanhGia: "DA_DANH_GIA",
    diem,
    mucDanhGia: layMucHealthScore(diem),
    canhBao: taoCanhBaoHealthScore(thietBi, thongKeSuCo, thongKeSuaChua, thongKeBaoTri),
    quyTacApDung: {
      diemGoc: 100,
      tongDiemTru,
      danhSachTacDong
    },
    thongKe: dinhDangThongKeHealthScore(thongKeSuCo, thongKeSuaChua, thongKeBaoTri)
  };
}

function layNgayLocTimeline(giaTri, tenTruong, laCuoiNgay = false) {
  const ngay = layNgayTuyChon(giaTri, tenTruong);

  if (!ngay) {
    return null;
  }

  return new Date(`${ngay}T${laCuoiNgay ? "23:59:59.999" : "00:00:00.000"}`);
}

function layDanhSachLoaiSuKienLoc(giaTri) {
  const giaTriChuanHoa = chuanHoaChuoi(giaTri);

  if (!giaTriChuanHoa) {
    return null;
  }

  return new Set(
    giaTriChuanHoa
      .split(",")
      .map((loaiSuKien) => loaiSuKien.trim().toUpperCase())
      .filter(Boolean)
  );
}

function taoSuKienTimeline({ loaiSuKien, thoiGian, tieuDe, moTa = null, duLieu = {} }) {
  if (!thoiGian) {
    return null;
  }

  const thoiGianSuKien = thoiGian instanceof Date ? thoiGian : new Date(thoiGian);

  if (Number.isNaN(thoiGianSuKien.getTime())) {
    return null;
  }

  return {
    loaiSuKien,
    thoiGian: thoiGianSuKien,
    tieuDe,
    moTa,
    duLieu
  };
}

function locTimelineTheoQuery(danhSachSuKien, query = {}) {
  const tuNgay = layNgayLocTimeline(query.tuNgay || query.tu_ngay, "Từ ngày");
  const denNgay = layNgayLocTimeline(query.denNgay || query.den_ngay, "Đến ngày", true);
  const danhSachLoaiSuKien = layDanhSachLoaiSuKienLoc(query.loaiSuKien || query.loai_su_kien);

  if (tuNgay && denNgay && denNgay < tuNgay) {
    throw taoLoi("Đến ngày phải lớn hơn hoặc bằng từ ngày", 400);
  }

  return danhSachSuKien.filter((suKien) => {
    if (danhSachLoaiSuKien && !danhSachLoaiSuKien.has(suKien.loaiSuKien)) {
      return false;
    }

    if (tuNgay && suKien.thoiGian < tuNgay) {
      return false;
    }

    if (denNgay && suKien.thoiGian > denNgay) {
      return false;
    }

    return true;
  });
}

function taoTimelineTuDuLieu({ thietBi, loNhap, danhSachDieuChuyen, danhSachSuCo, danhSachSuaChua, danhSachBaoTri }) {
  const danhSachSuKien = [
    taoSuKienTimeline({
      loaiSuKien: "TAO_THIET_BI",
      thoiGian: thietBi.ngay_tao,
      tieuDe: "Tạo hồ sơ thiết bị",
      duLieu: {
        id: thietBi.id,
        maThietBi: thietBi.ma_thiet_bi,
        tenThietBi: thietBi.ten_thiet_bi
      }
    })
  ];

  if (loNhap) {
    danhSachSuKien.push(
      taoSuKienTimeline({
        loaiSuKien: "NHAP_LO",
        thoiGian: loNhap.ngay_nhap || thietBi.ngay_tao,
        tieuDe: "Gán thiết bị vào lô nhập",
        moTa: loNhap.ma_lo,
        duLieu: {
          loNhapId: loNhap.id,
          maLo: loNhap.ma_lo,
          soHoaDon: loNhap.so_hoa_don,
          nhaCungCap: loNhap.nha_cung_cap_id
            ? {
                id: loNhap.nha_cung_cap_id,
                tenNhaCungCap: loNhap.ten_nha_cung_cap
              }
            : null
        }
      })
    );
  }

  danhSachDieuChuyen.forEach((dieuChuyen) => {
    danhSachSuKien.push(
      taoSuKienTimeline({
        loaiSuKien: "DIEU_CHUYEN",
        thoiGian: dieuChuyen.ngay_dieu_chuyen || dieuChuyen.ngay_tao,
        tieuDe: "Điều chuyển thiết bị",
        moTa: dieuChuyen.ly_do,
        duLieu: dinhDangDieuChuyen(dieuChuyen)
      })
    );
  });

  danhSachSuCo.forEach((suCo) => {
    danhSachSuKien.push(
      taoSuKienTimeline({
        loaiSuKien: "BAO_SU_CO",
        thoiGian: suCo.thoi_gian_bao || suCo.ngay_tao,
        tieuDe: suCo.tieu_de,
        moTa: suCo.ma_su_co,
        duLieu: {
          id: suCo.id,
          maSuCo: suCo.ma_su_co,
          mucDo: suCo.muc_do,
          trangThai: suCo.trang_thai,
          thoiGianHoanThanh: suCo.thoi_gian_hoan_thanh
        }
      })
    );
  });

  danhSachSuaChua.forEach((suaChua) => {
    danhSachSuKien.push(
      taoSuKienTimeline({
        loaiSuKien: "SUA_CHUA",
        thoiGian: suaChua.thoi_gian_hoan_thanh || suaChua.thoi_gian_bat_dau || suaChua.ngay_tao,
        tieuDe: "Cập nhật hồ sơ sửa chữa",
        moTa: suaChua.ma_su_co,
        duLieu: {
          id: suaChua.id,
          suCoId: suaChua.su_co_id,
          maSuCo: suaChua.ma_su_co,
          kyThuatVien: suaChua.ky_thuat_vien_id
            ? {
                id: suaChua.ky_thuat_vien_id,
                hoTen: suaChua.ten_ky_thuat_vien
              }
            : null,
          ketQua: suaChua.ket_qua
        }
      })
    );
  });

  danhSachBaoTri.forEach((baoTri) => {
    danhSachSuKien.push(
      taoSuKienTimeline({
        loaiSuKien: "BAO_TRI",
        thoiGian:
          baoTri.thoi_gian_hoan_thanh ||
          baoTri.thoi_gian_bat_dau ||
          baoTri.ngay_du_kien ||
          baoTri.ngay_tao,
        tieuDe: "Phiếu bảo trì",
        moTa: baoTri.ket_qua_bao_tri,
        duLieu: {
          id: baoTri.id,
          keHoachBaoTriId: baoTri.ke_hoach_bao_tri_id,
          trangThai: baoTri.trang_thai,
          ngayDuKien: baoTri.ngay_du_kien,
          kyThuatVien: baoTri.ky_thuat_vien_id
            ? {
                id: baoTri.ky_thuat_vien_id,
                hoTen: baoTri.ten_ky_thuat_vien
              }
            : null
        }
      })
    );
  });

  return danhSachSuKien.filter(Boolean);
}

async function layTimelineThietBi(id, query = {}) {
  const thietBiId = layIdHopLe(id, "Id thiết bị");
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const thietBi = await thietBiModel.timTheoId(thietBiId);

  if (!thietBi) {
    throw taoLoi("Không tìm thấy thiết bị", 404);
  }

  const [
    loNhap,
    danhSachDieuChuyen,
    danhSachSuCo,
    danhSachSuaChua,
    danhSachBaoTri
  ] = await Promise.all([
    thongKeThietBiModel.layThongTinLoNhapCuaThietBi(thietBiId),
    dieuChuyenThietBiModel.layTatCaLichSuDieuChuyenTheoThietBi(thietBiId),
    thongKeThietBiModel.laySuKienSuCoTheoThietBi(thietBiId),
    thongKeThietBiModel.laySuKienSuaChuaTheoThietBi(thietBiId),
    thongKeThietBiModel.laySuKienBaoTriTheoThietBi(thietBiId)
  ]);
  const danhSachSuKien = taoTimelineTuDuLieu({
    thietBi,
    loNhap,
    danhSachDieuChuyen,
    danhSachSuCo,
    danhSachSuaChua,
    danhSachBaoTri
  }).sort((suKienA, suKienB) => suKienB.thoiGian - suKienA.thoiGian);
  const danhSachDaLoc = locTimelineTheoQuery(danhSachSuKien, query);
  const danhSachTheoTrang = danhSachDaLoc.slice(boQua, boQua + soBanGhiMoiTrang);
  const tongBanGhi = danhSachDaLoc.length;

  return {
    thietBi: {
      id: thietBi.id,
      maThietBi: thietBi.ma_thiet_bi,
      tenThietBi: thietBi.ten_thiet_bi
    },
    danhSach: danhSachTheoTrang,
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

function chuanHoaTenCotImport(tenCot) {
  return chuanHoaChuoiKhongDau(tenCot)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function layGiaTriImport(giaTri) {
  if (giaTri === undefined || giaTri === null) {
    return null;
  }

  const giaTriChuanHoa = String(giaTri).trim();

  return giaTriChuanHoa === "" ? null : giaTriChuanHoa;
}

function chuyenDongImportVeDuLieu(dong) {
  const duLieu = {};

  Object.entries(dong || {}).forEach(([tenCot, giaTri]) => {
    const tenCotChuanHoa = chuanHoaTenCotImport(tenCot);
    const tenTruong = BAN_DO_COT_IMPORT[tenCotChuanHoa] || tenCot;

    duLieu[tenTruong] = layGiaTriImport(giaTri);
  });

  return duLieu;
}

function layGiaTriOExcel(giaTri) {
  if (giaTri === undefined || giaTri === null) {
    return "";
  }

  if (giaTri instanceof Date) {
    return giaTri.toISOString().slice(0, 10);
  }

  if (typeof giaTri !== "object") {
    return giaTri;
  }

  if (giaTri.text !== undefined) {
    return giaTri.text;
  }

  if (giaTri.result !== undefined) {
    return giaTri.result;
  }

  if (Array.isArray(giaTri.richText)) {
    return giaTri.richText.map((phanChu) => phanChu.text || "").join("");
  }

  return String(giaTri);
}

async function docDanhSachTuTepImport(tep) {
  if (!tep) {
    throw taoLoi("Vui lòng tải lên file import", 400);
  }

  const duoiTep = path.extname(tep.originalname || "").toLowerCase();

  if (!DANH_SACH_DUOI_TEP_HOP_LE.includes(duoiTep)) {
    throw taoLoi("File import chỉ hỗ trợ Excel hoặc CSV", 400);
  }

  const workbook = new ExcelJS.Workbook();

  try {
    if (duoiTep === ".csv") {
      await workbook.csv.read(Readable.from([tep.buffer]));
    } else {
      await workbook.xlsx.load(tep.buffer);
    }
  } catch (loi) {
    throw taoLoi("Không đọc được file import", 400);
  }

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    throw taoLoi("File import không có sheet dữ liệu", 400);
  }

  const dongTieuDe = sheet.getRow(1);
  const danhSachTieuDe = [];

  dongTieuDe.eachCell({ includeEmpty: true }, (cell, cot) => {
    danhSachTieuDe[cot] = layGiaTriOExcel(cell.value);
  });

  const coTieuDe = danhSachTieuDe.some((tenCot) => chuanHoaChuoi(tenCot));

  if (!coTieuDe) {
    throw taoLoi("File import thiếu dòng tiêu đề cột", 400);
  }

  const danhSachDongCoDuLieu = [];

  for (let soDong = 2; soDong <= sheet.rowCount; soDong += 1) {
    const dong = sheet.getRow(soDong);
    const duLieuDong = {};
    let coDuLieu = false;

    for (let cot = 1; cot < danhSachTieuDe.length; cot += 1) {
      const tenCot = danhSachTieuDe[cot];

      if (!chuanHoaChuoi(tenCot)) {
        continue;
      }

      const giaTri = layGiaTriOExcel(dong.getCell(cot).value);
      duLieuDong[tenCot] = giaTri;

      if (chuanHoaChuoi(giaTri)) {
        coDuLieu = true;
      }
    }

    if (coDuLieu) {
      danhSachDongCoDuLieu.push({
        dong: soDong,
        duLieu: chuyenDongImportVeDuLieu(duLieuDong)
      });
    }
  }

  if (danhSachDongCoDuLieu.length === 0) {
    throw taoLoi("File import không có dữ liệu", 400);
  }

  if (danhSachDongCoDuLieu.length > SO_DONG_IMPORT_TOI_DA) {
    throw taoLoi(`File import không được vượt quá ${SO_DONG_IMPORT_TOI_DA} dòng`, 400);
  }

  return danhSachDongCoDuLieu;
}

function layDanhSachImportTuBody(body) {
  if (Array.isArray(body)) {
    return body.map((dong, index) => ({
      dong: index + 1,
      duLieu: chuyenDongImportVeDuLieu(dong)
    }));
  }

  if (Array.isArray(body.danhSachThietBi)) {
    return body.danhSachThietBi.map((dong, index) => ({
      dong: dong.dong || index + 1,
      duLieu: chuyenDongImportVeDuLieu(dong.duLieu || dong)
    }));
  }

  if (Array.isArray(body.danhSachDongHopLe)) {
    return body.danhSachDongHopLe.map((dong, index) => ({
      dong: dong.dong || index + 1,
      duLieu: chuyenDongImportVeDuLieu(dong.duLieu || dong)
    }));
  }

  throw taoLoi("Vui lòng gửi danh sách thiết bị cần import", 400);
}

function themLoiImport(danhSachLoi, dong, cot, thongBao) {
  danhSachLoi.push({
    dong,
    cot,
    thongBao
  });
}

function demSerialTrongFile(danhSachDongImport) {
  const thongKeSerial = new Map();

  danhSachDongImport.forEach(({ duLieu }) => {
    const soSerial = chuanHoaChuoi(duLieu.soSerial);

    if (!soSerial) {
      return;
    }

    const khoaSerial = soSerial.toLowerCase();
    thongKeSerial.set(khoaSerial, (thongKeSerial.get(khoaSerial) || 0) + 1);
  });

  return thongKeSerial;
}

async function layLoaiThietBiChoImport(duLieu, dong, danhSachLoi) {
  const loaiThietBiId = layGiaTriImport(duLieu.loaiThietBiId);
  const tenLoai = chuanHoaChuoi(duLieu.tenLoai);

  if (loaiThietBiId) {
    try {
      const id = layIdHopLe(loaiThietBiId, "Loại thiết bị");
      const loaiThietBi = await loaiThietBiModel.timTheoId(id);

      if (!loaiThietBi) {
        themLoiImport(danhSachLoi, dong, "loaiThietBiId", "Loại thiết bị không tồn tại");
        return null;
      }

      return loaiThietBi;
    } catch (loi) {
      themLoiImport(danhSachLoi, dong, "loaiThietBiId", loi.message);
      return null;
    }
  }

  if (!tenLoai) {
    themLoiImport(danhSachLoi, dong, "loaiThietBiId", "Thiếu loại thiết bị");
    return null;
  }

  const loaiThietBi = await loaiThietBiModel.timTheoTen(tenLoai);

  if (!loaiThietBi) {
    themLoiImport(danhSachLoi, dong, "tenLoai", "Loại thiết bị không tồn tại");
    return null;
  }

  return loaiThietBi;
}

async function layViTriChoImport(duLieu, dong, danhSachLoi) {
  const viTriId = layGiaTriImport(duLieu.viTriId);
  const tenViTri = chuanHoaChuoi(duLieu.tenViTri);

  if (viTriId) {
    try {
      const id = layIdHopLe(viTriId, "Vị trí");
      const viTri = await viTriModel.timTheoId(id);

      if (!viTri) {
        themLoiImport(danhSachLoi, dong, "viTriId", "Vị trí không tồn tại");
        return null;
      }

      return viTri;
    } catch (loi) {
      themLoiImport(danhSachLoi, dong, "viTriId", loi.message);
      return null;
    }
  }

  if (!tenViTri) {
    return null;
  }

  const danhSachViTri = await viTriModel.timDanhSachTheoTen(tenViTri);

  if (danhSachViTri.length === 0) {
    themLoiImport(danhSachLoi, dong, "tenViTri", "Vị trí không tồn tại");
    return null;
  }

  if (danhSachViTri.length > 1) {
    themLoiImport(danhSachLoi, dong, "tenViTri", "Tên vị trí bị trùng, vui lòng dùng viTriId");
    return null;
  }

  return danhSachViTri[0];
}

async function layLoNhapChoImport(duLieu, dong, danhSachLoi) {
  const loNhapId = layGiaTriImport(duLieu.loNhapId);
  const maLo = chuanHoaChuoi(duLieu.maLo);

  if (loNhapId) {
    try {
      const id = layIdHopLe(loNhapId, "Lô nhập");
      const loNhap = await loNhapModel.timTheoId(id);

      if (!loNhap) {
        themLoiImport(danhSachLoi, dong, "loNhapId", "Lô nhập không tồn tại");
        return null;
      }

      return loNhap;
    } catch (loi) {
      themLoiImport(danhSachLoi, dong, "loNhapId", loi.message);
      return null;
    }
  }

  if (!maLo) {
    return null;
  }

  const loNhap = await loNhapModel.timTheoMaLo(maLo);

  if (!loNhap) {
    themLoiImport(danhSachLoi, dong, "maLo", "Lô nhập không tồn tại");
    return null;
  }

  return loNhap;
}

function layGiaTriCoBaoLoi(danhSachLoi, dong, cot, hamLayGiaTri) {
  try {
    return hamLayGiaTri();
  } catch (loi) {
    themLoiImport(danhSachLoi, dong, cot, loi.message);
    return undefined;
  }
}

async function kiemTraDongImport({ dong, duLieu }, thongKeSerial) {
  const danhSachLoi = [];
  const tenThietBi = chuanHoaChuoi(duLieu.tenThietBi);
  const soSerial = chuanHoaChuoi(duLieu.soSerial);
  const model = chuanHoaChuoi(duLieu.model);
  const hangSanXuat = chuanHoaChuoi(duLieu.hangSanXuat);
  const anhThietBi = chuanHoaChuoi(duLieu.anhThietBi);
  const moTa = chuanHoaChuoi(duLieu.moTa);

  if (!tenThietBi) {
    themLoiImport(danhSachLoi, dong, "tenThietBi", "Thiếu tên thiết bị");
  }

  if (soSerial) {
    const soLanTrungTrongFile = thongKeSerial.get(soSerial.toLowerCase()) || 0;

    if (soLanTrungTrongFile > 1) {
      themLoiImport(danhSachLoi, dong, "soSerial", "Serial bị trùng trong file");
    }

    const thietBiTheoSerial = await thietBiModel.timTheoSerial(soSerial);

    if (thietBiTheoSerial) {
      themLoiImport(danhSachLoi, dong, "soSerial", "Serial bị trùng trong cơ sở dữ liệu");
    }
  }

  const [loaiThietBi, viTri, loNhap] = await Promise.all([
    layLoaiThietBiChoImport(duLieu, dong, danhSachLoi),
    layViTriChoImport(duLieu, dong, danhSachLoi),
    layLoNhapChoImport(duLieu, dong, danhSachLoi)
  ]);

  const trangThai = layGiaTriCoBaoLoi(danhSachLoi, dong, "trangThai", () =>
    kiemTraTrangThaiHopLe(duLieu.trangThai)
  );
  const giaMua = layGiaTriCoBaoLoi(danhSachLoi, dong, "giaMua", () =>
    laySoTienTuyChon(duLieu.giaMua, "Giá mua")
  );
  const ngayBatDauBaoHanh = layGiaTriCoBaoLoi(danhSachLoi, dong, "ngayBatDauBaoHanh", () =>
    layNgayTuyChon(duLieu.ngayBatDauBaoHanh, "Ngày bắt đầu bảo hành")
  );
  const ngayHetBaoHanh = layGiaTriCoBaoLoi(danhSachLoi, dong, "ngayHetBaoHanh", () =>
    layNgayTuyChon(duLieu.ngayHetBaoHanh, "Ngày hết bảo hành")
  );

  if (danhSachLoi.length > 0 || !loaiThietBi) {
    return {
      hopLe: false,
      danhSachLoi
    };
  }

  return {
    hopLe: true,
    duLieu: {
      tenThietBi,
      loaiThietBiId: loaiThietBi.id,
      loaiThietBi,
      viTriId: viTri ? viTri.id : null,
      loNhapId: loNhap ? loNhap.id : null,
      soSerial,
      model,
      hangSanXuat,
      anhThietBi,
      giaMua,
      ngayBatDauBaoHanh,
      ngayHetBaoHanh,
      trangThai,
      moTa
    }
  };
}

async function taoKetQuaPreviewImport(danhSachDongImport) {
  if (!Array.isArray(danhSachDongImport) || danhSachDongImport.length === 0) {
    throw taoLoi("Danh sách import không có dữ liệu", 400);
  }

  if (danhSachDongImport.length > SO_DONG_IMPORT_TOI_DA) {
    throw taoLoi(`Danh sách import không được vượt quá ${SO_DONG_IMPORT_TOI_DA} dòng`, 400);
  }

  const thongKeSerial = demSerialTrongFile(danhSachDongImport);
  const danhSachDongHopLe = [];
  const danhSachLoi = [];

  for (const dongImport of danhSachDongImport) {
    const ketQuaDong = await kiemTraDongImport(dongImport, thongKeSerial);

    if (ketQuaDong.hopLe) {
      const { loaiThietBi, ...duLieuHopLe } = ketQuaDong.duLieu;

      danhSachDongHopLe.push({
        dong: dongImport.dong,
        duLieu: duLieuHopLe
      });
    } else {
      danhSachLoi.push(...ketQuaDong.danhSachLoi);
    }
  }

  return {
    tongSoDong: danhSachDongImport.length,
    soDongHopLe: danhSachDongHopLe.length,
    soDongLoi: danhSachDongImport.length - danhSachDongHopLe.length,
    danhSachDongHopLe,
    danhSachLoi
  };
}

async function previewImportThietBi(tep) {
  const danhSachDongImport = await docDanhSachTuTepImport(tep);

  return taoKetQuaPreviewImport(danhSachDongImport);
}

async function importThietBi({ tep = null, body = {} }) {
  const danhSachDongImport = tep ? await docDanhSachTuTepImport(tep) : layDanhSachImportTuBody(body);
  const ketQuaPreview = await taoKetQuaPreviewImport(danhSachDongImport);

  if (ketQuaPreview.soDongLoi > 0) {
    throw taoLoi("Dữ liệu import còn lỗi, vui lòng kiểm tra lại", 400, ketQuaPreview);
  }

  const connection = await pool.getConnection();
  const danhSachDaTao = [];
  const danhSachTenKhoa = [];
  let daBatDauTransaction = false;

  try {
    const danhSachDuLieuCanImport = [];

    for (const dongHopLe of ketQuaPreview.danhSachDongHopLe) {
      const loaiThietBi = await loaiThietBiModel.timTheoId(dongHopLe.duLieu.loaiThietBiId, connection);

      if (!loaiThietBi) {
        throw taoLoi("Loại thiết bị không tồn tại", 400);
      }

      danhSachDuLieuCanImport.push({
        ...dongHopLe.duLieu,
        loaiThietBi,
        tienTo: taoTienToMaThietBi(loaiThietBi.ten_loai)
      });
    }

    const danhSachTienTo = [...new Set(danhSachDuLieuCanImport.map((duLieu) => duLieu.tienTo))];

    for (const tienTo of danhSachTienTo) {
      const tenKhoa = await khoaTienToSinhMa(connection, tienTo);
      danhSachTenKhoa.push(tenKhoa);
    }

    await connection.beginTransaction();
    daBatDauTransaction = true;

    const soThuTuTheoTienTo = new Map();

    for (const tienTo of danhSachTienTo) {
      const soThuTuLonNhat = await thietBiModel.laySoThuTuMaLonNhatTheoTienTo(connection, tienTo);
      soThuTuTheoTienTo.set(tienTo, soThuTuLonNhat);
    }

    for (const duLieuCanImport of danhSachDuLieuCanImport) {
      const soThuTuTiepTheo = soThuTuTheoTienTo.get(duLieuCanImport.tienTo) + 1;
      soThuTuTheoTienTo.set(duLieuCanImport.tienTo, soThuTuTiepTheo);
      const maThietBi = taoMaThietBi(duLieuCanImport.tienTo, soThuTuTiepTheo);
      const maQr = taoMaQr(maThietBi);
      const thietBiId = await thietBiModel.taoThietBi(connection, {
        ...duLieuCanImport,
        maThietBi,
        maQr
      });

      danhSachDaTao.push({
        id: thietBiId,
        maThietBi,
        maQr
      });
    }

    await connection.commit();
    daBatDauTransaction = false;
  } catch (loi) {
    if (daBatDauTransaction) {
      await connection.rollback();
    }

    xuLyLoiTrungThietBi(loi);
  } finally {
    for (const tenKhoa of danhSachTenKhoa.reverse()) {
      await moKhoaTienToSinhMa(connection, tenKhoa);
    }

    connection.release();
  }

  return {
    tongSoDong: ketQuaPreview.tongSoDong,
    soDongDaImport: danhSachDaTao.length,
    danhSachDaTao
  };
}

module.exports = {
  layDanhSachThietBi,
  layChiTietThietBi,
  taoThietBi,
  capNhatThietBi,
  layQrThietBi,
  layThietBiTheoQr,
  capNhatTrangThai,
  dieuChuyenThietBi,
  layLichSuDieuChuyen,
  layBaoHanh,
  capNhatBaoHanh,
  layHealthScore,
  layTimelineThietBi,
  previewImportThietBi,
  importThietBi
};
