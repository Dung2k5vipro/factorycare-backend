const nhaCungCapModel = require("../models/nha_cung_cap.model");

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

function layIdHopLe(id, tenDoiTuong) {
  const idDaChuyen = Number(id);

  if (!Number.isInteger(idDaChuyen) || idDaChuyen <= 0) {
    throw taoLoi(`${tenDoiTuong} không hợp lệ`, 400);
  }

  return idDaChuyen;
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

function kiemTraEmail(email) {
  if (!email) {
    return null;
  }

  const emailChuanHoa = chuanHoaChuoi(email).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailChuanHoa)) {
    throw taoLoi("Email nhà cung cấp không hợp lệ", 400);
  }

  return emailChuanHoa;
}

function dinhDangNhaCungCap(nhaCungCap, thongKe = undefined) {
  const duLieu = {
    id: nhaCungCap.id,
    tenNhaCungCap: nhaCungCap.ten_nha_cung_cap,
    nguoiLienHe: nhaCungCap.nguoi_lien_he,
    soDienThoai: nhaCungCap.so_dien_thoai,
    email: nhaCungCap.email,
    diaChi: nhaCungCap.dia_chi,
    ghiChu: nhaCungCap.ghi_chu,
    ngayTao: nhaCungCap.ngay_tao,
    ngayCapNhat: nhaCungCap.ngay_cap_nhat
  };

  if (thongKe) {
    duLieu.thongKe = thongKe;
  }

  return duLieu;
}

function dinhDangLoNhap(loNhap) {
  return {
    id: loNhap.id,
    maLo: loNhap.ma_lo,
    nhaCungCapId: loNhap.nha_cung_cap_id,
    soHoaDon: loNhap.so_hoa_don,
    fileHoaDon: loNhap.file_hoa_don,
    ngayNhap: loNhap.ngay_nhap,
    tongGiaTri: loNhap.tong_gia_tri === null ? null : Number(loNhap.tong_gia_tri),
    ghiChu: loNhap.ghi_chu,
    ngayTao: loNhap.ngay_tao,
    ngayCapNhat: loNhap.ngay_cap_nhat
  };
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
    loNhapId: thietBi.lo_nhap_id,
    soSerial: thietBi.so_serial,
    model: thietBi.model,
    hangSanXuat: thietBi.hang_san_xuat,
    trangThai: thietBi.trang_thai,
    ngayTao: thietBi.ngay_tao,
    ngayCapNhat: thietBi.ngay_cap_nhat
  };
}

function layDuLieuNhaCungCapHopLe(duLieu = {}, nhaCungCapHienTai = null) {
  const tenNhaCungCap = duLieu.tenNhaCungCap !== undefined || duLieu.ten_nha_cung_cap !== undefined
    ? chuanHoaChuoi(duLieu.tenNhaCungCap || duLieu.ten_nha_cung_cap)
    : nhaCungCapHienTai && nhaCungCapHienTai.ten_nha_cung_cap;
  const nguoiLienHe = duLieu.nguoiLienHe !== undefined || duLieu.nguoi_lien_he !== undefined
    ? chuanHoaChuoi(duLieu.nguoiLienHe || duLieu.nguoi_lien_he)
    : nhaCungCapHienTai && nhaCungCapHienTai.nguoi_lien_he;
  const soDienThoai = duLieu.soDienThoai !== undefined || duLieu.so_dien_thoai !== undefined
    ? chuanHoaChuoi(duLieu.soDienThoai || duLieu.so_dien_thoai)
    : nhaCungCapHienTai && nhaCungCapHienTai.so_dien_thoai;
  const email = duLieu.email !== undefined
    ? kiemTraEmail(duLieu.email)
    : nhaCungCapHienTai && nhaCungCapHienTai.email;
  const diaChi = duLieu.diaChi !== undefined || duLieu.dia_chi !== undefined
    ? chuanHoaChuoi(duLieu.diaChi || duLieu.dia_chi)
    : nhaCungCapHienTai && nhaCungCapHienTai.dia_chi;
  const ghiChu = duLieu.ghiChu !== undefined || duLieu.ghi_chu !== undefined
    ? chuanHoaChuoi(duLieu.ghiChu || duLieu.ghi_chu)
    : nhaCungCapHienTai && nhaCungCapHienTai.ghi_chu;

  if (!tenNhaCungCap) {
    throw taoLoi("Tên nhà cung cấp không được để trống", 400);
  }

  return {
    tenNhaCungCap,
    nguoiLienHe,
    soDienThoai,
    email,
    diaChi,
    ghiChu
  };
}

async function layDanhSachNhaCungCap(query = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const tuKhoa = typeof query.tuKhoa === "string" ? query.tuKhoa.trim() : "";

  const [danhSachNhaCungCap, tongBanGhi] = await Promise.all([
    nhaCungCapModel.layDanhSachNhaCungCap({
      tuKhoa,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    nhaCungCapModel.demTongNhaCungCap({ tuKhoa })
  ]);

  return {
    danhSach: danhSachNhaCungCap.map((nhaCungCap) => dinhDangNhaCungCap(nhaCungCap)),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layChiTietNhaCungCap(id) {
  const nhaCungCapId = layIdHopLe(id, "Id nhà cung cấp");
  const nhaCungCap = await nhaCungCapModel.timTheoId(nhaCungCapId);

  if (!nhaCungCap) {
    throw taoLoi("Không tìm thấy nhà cung cấp", 404);
  }

  const [soLoNhap, soThietBi] = await Promise.all([
    nhaCungCapModel.demLoNhapTheoNhaCungCap(nhaCungCapId),
    nhaCungCapModel.demThietBiTheoNhaCungCap(nhaCungCapId)
  ]);

  return dinhDangNhaCungCap(nhaCungCap, {
    soLoNhap,
    soThietBi
  });
}

async function taoNhaCungCap(duLieu = {}) {
  const duLieuHopLe = layDuLieuNhaCungCapHopLe(duLieu);
  const nhaCungCap = await nhaCungCapModel.taoNhaCungCap(duLieuHopLe);

  return dinhDangNhaCungCap(nhaCungCap);
}

async function capNhatNhaCungCap(id, duLieu = {}) {
  const nhaCungCapId = layIdHopLe(id, "Id nhà cung cấp");
  const nhaCungCapHienTai = await nhaCungCapModel.timTheoId(nhaCungCapId);

  if (!nhaCungCapHienTai) {
    throw taoLoi("Không tìm thấy nhà cung cấp", 404);
  }

  const duLieuHopLe = layDuLieuNhaCungCapHopLe(duLieu, nhaCungCapHienTai);
  const nhaCungCap = await nhaCungCapModel.capNhatNhaCungCap(nhaCungCapId, duLieuHopLe);

  return dinhDangNhaCungCap(nhaCungCap);
}

async function xoaNhaCungCap(id) {
  const nhaCungCapId = layIdHopLe(id, "Id nhà cung cấp");
  const nhaCungCap = await nhaCungCapModel.timTheoId(nhaCungCapId);

  if (!nhaCungCap) {
    throw taoLoi("Không tìm thấy nhà cung cấp", 404);
  }

  const [soLoNhap, soThietBi] = await Promise.all([
    nhaCungCapModel.demLoNhapTheoNhaCungCap(nhaCungCapId),
    nhaCungCapModel.demThietBiTheoNhaCungCap(nhaCungCapId)
  ]);

  if (soLoNhap > 0 || soThietBi > 0) {
    throw taoLoi("Không thể xóa nhà cung cấp đã phát sinh dữ liệu", 409, {
      soLoNhap,
      soThietBi
    });
  }

  await nhaCungCapModel.xoaNhaCungCap(nhaCungCapId);

  return {
    id: nhaCungCapId,
    daXoa: true
  };
}

async function layLoNhapTheoNhaCungCap(id, query = {}) {
  const nhaCungCapId = layIdHopLe(id, "Id nhà cung cấp");
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const nhaCungCap = await nhaCungCapModel.timTheoId(nhaCungCapId);

  if (!nhaCungCap) {
    throw taoLoi("Không tìm thấy nhà cung cấp", 404);
  }

  const [danhSachLoNhap, tongBanGhi] = await Promise.all([
    nhaCungCapModel.layDanhSachLoNhapTheoNhaCungCap({
      nhaCungCapId,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    nhaCungCapModel.demLoNhapTheoNhaCungCap(nhaCungCapId)
  ]);

  return {
    nhaCungCap: dinhDangNhaCungCap(nhaCungCap),
    danhSach: danhSachLoNhap.map(dinhDangLoNhap),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layThietBiTheoNhaCungCap(id, query = {}) {
  const nhaCungCapId = layIdHopLe(id, "Id nhà cung cấp");
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const nhaCungCap = await nhaCungCapModel.timTheoId(nhaCungCapId);

  if (!nhaCungCap) {
    throw taoLoi("Không tìm thấy nhà cung cấp", 404);
  }

  const [danhSachThietBi, tongBanGhi] = await Promise.all([
    nhaCungCapModel.layDanhSachThietBiTheoNhaCungCap({
      nhaCungCapId,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    nhaCungCapModel.demThietBiTheoNhaCungCap(nhaCungCapId)
  ]);

  return {
    nhaCungCap: dinhDangNhaCungCap(nhaCungCap),
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
  layDanhSachNhaCungCap,
  layChiTietNhaCungCap,
  taoNhaCungCap,
  capNhatNhaCungCap,
  xoaNhaCungCap,
  layLoNhapTheoNhaCungCap,
  layThietBiTheoNhaCungCap
};
