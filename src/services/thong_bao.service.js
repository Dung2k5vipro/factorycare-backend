const thongBaoModel = require("../models/thong_bao.model");

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

function laySoNguyenDuong(giaTri, tenTruong) {
  const ketQua = Number(giaTri);

  if (!Number.isInteger(ketQua) || ketQua <= 0) {
    throw taoLoi(`${tenTruong} không hợp lệ`, 400);
  }

  return ketQua;
}

function layThongTinPhanTrang({ trang = 1, gioiHan = 20 } = {}) {
  const trangHienTai = laySoNguyenDuong(trang, "Trang");
  const soBanGhiMoiTrang = laySoNguyenDuong(gioiHan, "Giới hạn");

  if (soBanGhiMoiTrang > 100) {
    throw taoLoi("Giới hạn không được vượt quá 100", 400);
  }

  return {
    trangHienTai,
    soBanGhiMoiTrang,
    boQua: (trangHienTai - 1) * soBanGhiMoiTrang
  };
}

function dinhDangThongBao(thongBao) {
  return {
    id: thongBao.id,
    tieuDe: thongBao.tieu_de,
    noiDung: thongBao.noi_dung,
    loaiThongBao: thongBao.loai_thong_bao,
    doiTuongLienQuanId: thongBao.doi_tuong_lien_quan_id,
    daDoc: Boolean(thongBao.da_doc),
    ngayTao: thongBao.ngay_tao,
    ngayDoc: thongBao.ngay_doc
  };
}

async function layDanhSachThongBao(nguoiDungId, query = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const [danhSach, thongKe] = await Promise.all([
    thongBaoModel.layDanhSachThongBao({
      nguoiDungId,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    thongBaoModel.demThongBao(nguoiDungId)
  ]);

  return {
    danhSach: danhSach.map(dinhDangThongBao),
    tongChuaDoc: thongKe.tongChuaDoc,
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi: thongKe.tongBanGhi,
      tongTrang: Math.ceil(thongKe.tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function danhDauDaDoc(id, nguoiDungId) {
  const thongBaoId = laySoNguyenDuong(id, "Id thông báo");
  const thongBao = await thongBaoModel.timTheoIdCuaNguoiDung(
    thongBaoId,
    nguoiDungId
  );

  if (!thongBao) {
    throw taoLoi("Không tìm thấy thông báo", 404);
  }

  await thongBaoModel.danhDauDaDoc(thongBaoId, nguoiDungId);

  return { id: thongBaoId, daDoc: true };
}

async function danhDauTatCaDaDoc(nguoiDungId) {
  const soLuongDaCapNhat = await thongBaoModel.danhDauTatCaDaDoc(nguoiDungId);

  return { soLuongDaCapNhat };
}

async function xoaThongBaoDaDoc(id, nguoiDungId) {
  const thongBaoId = laySoNguyenDuong(id, "Id thông báo");
  const thongBao = await thongBaoModel.timTheoIdCuaNguoiDung(
    thongBaoId,
    nguoiDungId
  );

  if (!thongBao) {
    throw taoLoi("Không tìm thấy thông báo", 404);
  }
  if (!Boolean(thongBao.da_doc)) {
    throw taoLoi("Chỉ có thể xóa thông báo đã đọc", 409);
  }

  const daXoa = await thongBaoModel.xoaThongBaoDaDoc(
    thongBaoId,
    nguoiDungId
  );
  if (!daXoa) {
    throw taoLoi("Thông báo đã thay đổi, vui lòng tải lại dữ liệu", 409);
  }

  return { id: thongBaoId };
}

module.exports = {
  layDanhSachThongBao,
  danhDauDaDoc,
  danhDauTatCaDaDoc,
  xoaThongBaoDaDoc
};
