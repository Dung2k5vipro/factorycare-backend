const loaiThietBiModel = require("../models/loai_thiet_bi.model");

function taoLoi(thongBao, maTrangThai, duLieu = undefined) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  if (duLieu !== undefined) {
    loi.duLieu = duLieu;
  }

  return loi;
}

function dinhDangLoaiThietBi(loaiThietBi) {
  return {
    id: loaiThietBi.id,
    tenLoai: loaiThietBi.ten_loai,
    moTa: loaiThietBi.mo_ta,
    ngayTao: loaiThietBi.ngay_tao,
    ngayCapNhat: loaiThietBi.ngay_cap_nhat
  };
}

function chuanHoaChuoi(giaTri) {
  if (giaTri === undefined || giaTri === null) {
    return null;
  }

  const giaTriChuanHoa = String(giaTri).trim();

  return giaTriChuanHoa === "" ? null : giaTriChuanHoa;
}

function kiemTraChuoiBatBuoc(giaTri, tenTruong) {
  const giaTriChuanHoa = chuanHoaChuoi(giaTri);

  if (!giaTriChuanHoa) {
    throw taoLoi(`${tenTruong} khong duoc de trong`, 400);
  }

  return giaTriChuanHoa;
}

function layIdHopLe(id, tenDoiTuong) {
  const idDaChuyen = Number(id);

  if (!Number.isInteger(idDaChuyen) || idDaChuyen <= 0) {
    throw taoLoi(`${tenDoiTuong} khong hop le`, 400);
  }

  return idDaChuyen;
}

function layThongTinPhanTrang({
  trang = 1,
  page = undefined,
  gioiHan = 10,
  limit = undefined
} = {}) {
  const trangHienTai = Number(page !== undefined ? page : trang);
  const soBanGhiMoiTrang = Number(limit !== undefined ? limit : gioiHan);

  if (!Number.isInteger(trangHienTai) || trangHienTai < 1) {
    throw taoLoi("Trang khong hop le", 400);
  }

  if (
    !Number.isInteger(soBanGhiMoiTrang) ||
    soBanGhiMoiTrang < 1 ||
    soBanGhiMoiTrang > 100
  ) {
    throw taoLoi("Gioi han khong hop le", 400);
  }

  return {
    trangHienTai,
    soBanGhiMoiTrang,
    boQua: (trangHienTai - 1) * soBanGhiMoiTrang
  };
}

function xuLyLoiTrungTen(loi) {
  if (loi.code === "ER_DUP_ENTRY") {
    throw taoLoi("Ten loai thiet bi da ton tai", 409);
  }

  throw loi;
}

async function layDanhSachLoaiThietBi(query = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const tuKhoa = typeof query.tuKhoa === "string" ? query.tuKhoa.trim() : "";

  const dieuKienLoc = { tuKhoa };
  const [danhSachLoaiThietBi, tongBanGhi] = await Promise.all([
    loaiThietBiModel.layDanhSachLoaiThietBi({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    loaiThietBiModel.demTongLoaiThietBi(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachLoaiThietBi.map(dinhDangLoaiThietBi),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layChiTietLoaiThietBi(id) {
  const loaiThietBiId = layIdHopLe(id, "Id loai thiet bi");
  const loaiThietBi = await loaiThietBiModel.timTheoId(loaiThietBiId);

  if (!loaiThietBi) {
    throw taoLoi("Khong tim thay loai thiet bi", 404);
  }

  return dinhDangLoaiThietBi(loaiThietBi);
}

async function taoLoaiThietBi(duLieu) {
  const tenLoai = kiemTraChuoiBatBuoc(duLieu.tenLoai, "Ten loai thiet bi");
  const moTa = chuanHoaChuoi(duLieu.moTa);

  const loaiThietBiTonTai = await loaiThietBiModel.timTheoTen(tenLoai);

  if (loaiThietBiTonTai) {
    throw taoLoi("Ten loai thiet bi da ton tai", 409);
  }

  try {
    const loaiThietBiId = await loaiThietBiModel.taoLoaiThietBi({ tenLoai, moTa });
    const loaiThietBiMoi = await loaiThietBiModel.timTheoId(loaiThietBiId);

    return dinhDangLoaiThietBi(loaiThietBiMoi);
  } catch (loi) {
    xuLyLoiTrungTen(loi);
  }
}

async function capNhatLoaiThietBi(id, duLieu) {
  const loaiThietBiId = layIdHopLe(id, "Id loai thiet bi");
  const loaiThietBiHienTai = await loaiThietBiModel.timTheoId(loaiThietBiId);

  if (!loaiThietBiHienTai) {
    throw taoLoi("Khong tim thay loai thiet bi", 404);
  }

  const tenLoaiMoi = duLieu.tenLoai !== undefined ? duLieu.tenLoai : loaiThietBiHienTai.ten_loai;
  const moTaMoi = duLieu.moTa !== undefined ? duLieu.moTa : loaiThietBiHienTai.mo_ta;
  const tenLoai = kiemTraChuoiBatBuoc(tenLoaiMoi, "Ten loai thiet bi");
  const moTa = chuanHoaChuoi(moTaMoi);

  const loaiThietBiTheoTen = await loaiThietBiModel.timTheoTen(tenLoai);

  if (loaiThietBiTheoTen && String(loaiThietBiTheoTen.id) !== String(loaiThietBiId)) {
    throw taoLoi("Ten loai thiet bi da ton tai", 409);
  }

  try {
    await loaiThietBiModel.capNhatLoaiThietBi(loaiThietBiId, { tenLoai, moTa });

    const loaiThietBiDaCapNhat = await loaiThietBiModel.timTheoId(loaiThietBiId);

    return dinhDangLoaiThietBi(loaiThietBiDaCapNhat);
  } catch (loi) {
    xuLyLoiTrungTen(loi);
  }
}

module.exports = {
  layDanhSachLoaiThietBi,
  layChiTietLoaiThietBi,
  taoLoaiThietBi,
  capNhatLoaiThietBi
};
