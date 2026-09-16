const nhaCungCapModel = require("../models/nha_cung_cap.model");
const loNhapModel = require("../models/lo_nhap.model");

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

function layTenTruongTrongDuLieu(duLieu, danhSachTen) {
  return danhSachTen.find((tenTruong) =>
    Object.prototype.hasOwnProperty.call(duLieu || {}, tenTruong)
  );
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

  if (String(id).trim().toLowerCase() === "null") {
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

function layNgayHomNay() {
  const homNay = new Date();
  const nam = homNay.getFullYear();
  const thang = String(homNay.getMonth() + 1).padStart(2, "0");
  const ngay = String(homNay.getDate()).padStart(2, "0");

  return `${nam}-${thang}-${ngay}`;
}

function layNgayBatBuoc(giaTri, tenTruong) {
  const ngay = chuanHoaChuoi(giaTri);

  if (!ngay) {
    throw taoLoi(`${tenTruong} không được để trống`, 400);
  }

  const laDinhDangNgayHopLe = /^\d{4}-\d{2}-\d{2}$/.test(ngay);
  const thoiGian = Date.parse(`${ngay}T00:00:00Z`);

  if (!laDinhDangNgayHopLe || Number.isNaN(thoiGian)) {
    throw taoLoi(`${tenTruong} phải có định dạng YYYY-MM-DD`, 400);
  }

  return ngay;
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

function dinhDangNhaCungCap(loNhap) {
  if (!loNhap.nha_cung_cap_id) {
    return null;
  }

  return {
    id: loNhap.nha_cung_cap_id,
    tenNhaCungCap: loNhap.ten_nha_cung_cap,
    email: loNhap.email_nha_cung_cap,
    soDienThoai: loNhap.so_dien_thoai_nha_cung_cap
  };
}

function dinhDangLoNhap(loNhap, thongKe = undefined) {
  const duLieu = {
    id: loNhap.id,
    maLo: loNhap.ma_lo,
    nhaCungCap: dinhDangNhaCungCap(loNhap),
    soHoaDon: loNhap.so_hoa_don,
    fileHoaDon: loNhap.file_hoa_don,
    ngayNhap: loNhap.ngay_nhap,
    tongGiaTri: loNhap.tong_gia_tri === null ? null : Number(loNhap.tong_gia_tri),
    ghiChu: loNhap.ghi_chu,
    ngayTao: loNhap.ngay_tao,
    ngayCapNhat: loNhap.ngay_cap_nhat
  };

  if (thongKe) {
    duLieu.thongKe = thongKe;
  }

  return duLieu;
}

function dinhDangThietBi(thietBi) {
  return {
    id: thietBi.id,
    maThietBi: thietBi.ma_thiet_bi,
    tenThietBi: thietBi.ten_thiet_bi,
    loaiThietBi: {
      id: thietBi.loai_thiet_bi_id,
      tenLoai: thietBi.ten_loai
    },
    viTri: thietBi.vi_tri_id
      ? {
          id: thietBi.vi_tri_id,
          tenViTri: thietBi.ten_vi_tri
        }
      : null,
    soSerial: thietBi.so_serial,
    model: thietBi.model,
    hangSanXuat: thietBi.hang_san_xuat,
    trangThai: thietBi.trang_thai,
    ngayTao: thietBi.ngay_tao,
    ngayCapNhat: thietBi.ngay_cap_nhat
  };
}

async function kiemTraNhaCungCapTonTai(nhaCungCapId) {
  if (!nhaCungCapId) {
    return null;
  }

  const nhaCungCap = await nhaCungCapModel.timTheoId(nhaCungCapId);

  if (!nhaCungCap) {
    throw taoLoi("Nhà cung cấp không tồn tại", 400);
  }

  return nhaCungCap;
}

async function kiemTraMaLoChuaTonTai(maLo, boQuaId = null) {
  const loNhap = await loNhapModel.timTheoMaLo(maLo);

  if (loNhap && (!boQuaId || Number(loNhap.id) !== Number(boQuaId))) {
    throw taoLoi("Mã lô đã tồn tại", 409);
  }
}

function layDuLieuLoNhapHopLe(duLieu = {}, loNhapHienTai = null, fileHoaDonUpload = null) {
  const truongMaLo = layTenTruongTrongDuLieu(duLieu, ["maLo", "ma_lo"]);
  const truongNhaCungCapId = layTenTruongTrongDuLieu(duLieu, [
    "nhaCungCapId",
    "nha_cung_cap_id"
  ]);
  const truongSoHoaDon = layTenTruongTrongDuLieu(duLieu, ["soHoaDon", "so_hoa_don"]);
  const truongFileHoaDon = layTenTruongTrongDuLieu(duLieu, ["fileHoaDon", "file_hoa_don"]);
  const truongNgayNhap = layTenTruongTrongDuLieu(duLieu, ["ngayNhap", "ngay_nhap"]);
  const truongTongGiaTri = layTenTruongTrongDuLieu(duLieu, ["tongGiaTri", "tong_gia_tri"]);
  const truongGhiChu = layTenTruongTrongDuLieu(duLieu, ["ghiChu", "ghi_chu"]);
  const maLo = truongMaLo
    ? chuanHoaChuoi(duLieu[truongMaLo])
    : loNhapHienTai && loNhapHienTai.ma_lo;
  const nhaCungCapId = truongNhaCungCapId
    ? layIdTuyChon(duLieu[truongNhaCungCapId], "Nhà cung cấp")
    : loNhapHienTai && loNhapHienTai.nha_cung_cap_id;
  const soHoaDon = truongSoHoaDon
    ? chuanHoaChuoi(duLieu[truongSoHoaDon])
    : loNhapHienTai && loNhapHienTai.so_hoa_don;
  const fileHoaDon = fileHoaDonUpload || (
    truongFileHoaDon
      ? chuanHoaChuoi(duLieu[truongFileHoaDon])
      : loNhapHienTai && loNhapHienTai.file_hoa_don
  );
  const ngayNhap = truongNgayNhap
    ? layNgayBatBuoc(duLieu[truongNgayNhap], "Ngày nhập")
    : loNhapHienTai && loNhapHienTai.ngay_nhap
      ? loNhapHienTai.ngay_nhap
      : layNgayHomNay();
  const tongGiaTri = truongTongGiaTri
    ? laySoTienTuyChon(duLieu[truongTongGiaTri], "Tổng giá trị")
    : loNhapHienTai && loNhapHienTai.tong_gia_tri;
  const ghiChu = truongGhiChu
    ? chuanHoaChuoi(duLieu[truongGhiChu])
    : loNhapHienTai && loNhapHienTai.ghi_chu;

  if (!maLo) {
    throw taoLoi("Mã lô không được để trống", 400);
  }

  return {
    maLo,
    nhaCungCapId,
    soHoaDon,
    fileHoaDon,
    ngayNhap,
    tongGiaTri,
    ghiChu
  };
}

function xuLyLoiTrungLoNhap(loi) {
  if (loi.code === "ER_DUP_ENTRY") {
    throw taoLoi("Mã lô đã tồn tại", 409);
  }

  throw loi;
}

async function layDanhSachLoNhap(query = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const tuKhoa = typeof query.tuKhoa === "string" ? query.tuKhoa.trim() : "";
  const nhaCungCapId = layIdTuyChon(
    query.nhaCungCapId || query.nha_cung_cap_id,
    "Nhà cung cấp"
  );
  const dieuKienLoc = {
    tuKhoa,
    nhaCungCapId
  };

  const [danhSachLoNhap, tongBanGhi] = await Promise.all([
    loNhapModel.layDanhSachLoNhap({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    loNhapModel.demTongLoNhap(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachLoNhap.map((loNhap) => dinhDangLoNhap(loNhap)),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layChiTietLoNhap(id) {
  const loNhapId = layIdHopLe(id, "Id lô nhập");
  const loNhap = await loNhapModel.timTheoId(loNhapId);

  if (!loNhap) {
    throw taoLoi("Không tìm thấy lô nhập", 404);
  }

  const soThietBi = await loNhapModel.demThietBiTheoLoNhap(loNhapId);

  return dinhDangLoNhap(loNhap, {
    soThietBi
  });
}

async function taoLoNhap(duLieu = {}, fileHoaDonUpload = null) {
  const duLieuHopLe = layDuLieuLoNhapHopLe(duLieu, null, fileHoaDonUpload);

  await Promise.all([
    kiemTraNhaCungCapTonTai(duLieuHopLe.nhaCungCapId),
    kiemTraMaLoChuaTonTai(duLieuHopLe.maLo)
  ]);

  try {
    const loNhap = await loNhapModel.taoLoNhap(duLieuHopLe);

    return dinhDangLoNhap(loNhap);
  } catch (loi) {
    xuLyLoiTrungLoNhap(loi);
  }
}

async function capNhatLoNhap(id, duLieu = {}, fileHoaDonUpload = null) {
  const loNhapId = layIdHopLe(id, "Id lô nhập");
  const loNhapHienTai = await loNhapModel.timTheoId(loNhapId);

  if (!loNhapHienTai) {
    throw taoLoi("Không tìm thấy lô nhập", 404);
  }

  const duLieuHopLe = layDuLieuLoNhapHopLe(duLieu, loNhapHienTai, fileHoaDonUpload);

  await Promise.all([
    kiemTraNhaCungCapTonTai(duLieuHopLe.nhaCungCapId),
    kiemTraMaLoChuaTonTai(duLieuHopLe.maLo, loNhapId)
  ]);

  try {
    const loNhap = await loNhapModel.capNhatLoNhap(loNhapId, duLieuHopLe);

    return dinhDangLoNhap(loNhap);
  } catch (loi) {
    xuLyLoiTrungLoNhap(loi);
  }
}

async function xoaLoNhap(id) {
  const loNhapId = layIdHopLe(id, "Id lô nhập");
  const loNhap = await loNhapModel.timTheoId(loNhapId);

  if (!loNhap) {
    throw taoLoi("Không tìm thấy lô nhập", 404);
  }

  const soThietBi = await loNhapModel.demThietBiTheoLoNhap(loNhapId);

  if (soThietBi > 0) {
    throw taoLoi("Không thể xóa lô nhập đã có thiết bị", 409, {
      soThietBi
    });
  }

  await loNhapModel.xoaLoNhap(loNhapId);

  return {
    id: loNhapId,
    daXoa: true
  };
}

async function layThietBiTheoLoNhap(id, query = {}) {
  const loNhapId = layIdHopLe(id, "Id lô nhập");
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const loNhap = await loNhapModel.timTheoId(loNhapId);

  if (!loNhap) {
    throw taoLoi("Không tìm thấy lô nhập", 404);
  }

  const [danhSachThietBi, tongBanGhi] = await Promise.all([
    loNhapModel.layDanhSachThietBiTheoLoNhap({
      loNhapId,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    loNhapModel.demThietBiTheoLoNhap(loNhapId)
  ]);

  return {
    loNhap: dinhDangLoNhap(loNhap),
    danhSach: danhSachThietBi.map(dinhDangThietBi),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

module.exports = {
  layDanhSachLoNhap,
  layChiTietLoNhap,
  taoLoNhap,
  capNhatLoNhap,
  xoaLoNhap,
  layThietBiTheoLoNhap
};
