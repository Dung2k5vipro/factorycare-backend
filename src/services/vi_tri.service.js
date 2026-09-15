const { DANH_SACH_LOAI_VI_TRI, LOAI_VI_TRI } = require("../constants/loai_vi_tri");
const viTriModel = require("../models/vi_tri.model");

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
    throw taoLoi(`${tenDoiTuong} khong hop le`, 400);
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

function layThongTinPhanTrang(query = {}) {
  const trangHienTai = Number(query.page !== undefined ? query.page : query.trang || 1);
  const soBanGhiMoiTrang = Number(query.limit !== undefined ? query.limit : query.gioiHan || 10);

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

function chuanHoaLoaiViTri(loaiViTri) {
  const loaiViTriChuanHoa = chuanHoaChuoi(loaiViTri);

  if (!loaiViTriChuanHoa) {
    throw taoLoi("Loai vi tri khong duoc de trong", 400);
  }

  const loaiViTriVietHoa = loaiViTriChuanHoa.toUpperCase();
  const loaiViTriLuu = loaiViTriVietHoa === "O_MAY" ? LOAI_VI_TRI.KHU_VUC : loaiViTriVietHoa;

  if (!DANH_SACH_LOAI_VI_TRI.includes(loaiViTriLuu)) {
    throw taoLoi("Loai vi tri khong hop le", 400);
  }

  return loaiViTriLuu;
}

function dinhDangViTri(viTri, coKemCon = false) {
  const duLieu = {
    id: viTri.id,
    tenViTri: viTri.ten_vi_tri,
    loaiViTri: viTri.loai_vi_tri,
    viTriCha: viTri.vi_tri_cha_id
      ? {
          id: viTri.vi_tri_cha_id,
          tenViTri: viTri.ten_vi_tri_cha,
          loaiViTri: viTri.loai_vi_tri_cha
        }
      : null,
    moTa: viTri.mo_ta,
    ngayTao: viTri.ngay_tao,
    ngayCapNhat: viTri.ngay_cap_nhat
  };

  if (coKemCon) {
    duLieu.danhSachCon = viTri.danhSachCon || [];
  }

  return duLieu;
}

function layViTriChaIdTuQuery(query = {}) {
  if (query.viTriChaId === undefined && query.vi_tri_cha_id === undefined) {
    return undefined;
  }

  const giaTri = query.viTriChaId !== undefined ? query.viTriChaId : query.vi_tri_cha_id;

  return layIdTuyChon(giaTri, "Vi tri cha");
}

async function kiemTraTrungTenTrongCungCap(tenViTri, viTriChaId, boQuaId = null) {
  const danhSachCungTen = await viTriModel.timDanhSachTheoTen(tenViTri);
  const viTriBiTrung = danhSachCungTen.find((viTri) => {
    const cungCha = (viTri.vi_tri_cha_id || null) === (viTriChaId || null);
    const khacBanGhiDangSua = !boQuaId || Number(viTri.id) !== Number(boQuaId);

    return cungCha && khacBanGhiDangSua;
  });

  if (viTriBiTrung) {
    throw taoLoi("Ten vi tri da ton tai trong cung cap cha", 409);
  }
}

async function kiemTraKhongTaoVongLap(viTriId, viTriChaId) {
  if (!viTriId || !viTriChaId) {
    return;
  }

  let idDangKiemTra = viTriChaId;

  while (idDangKiemTra) {
    if (Number(idDangKiemTra) === Number(viTriId)) {
      throw taoLoi("Khong duoc chon vi tri con lam vi tri cha", 400);
    }

    const viTri = await viTriModel.timTheoId(idDangKiemTra);
    idDangKiemTra = viTri ? viTri.vi_tri_cha_id : null;
  }
}

async function kiemTraPhanCapViTri(loaiViTri, viTriChaId, viTriIdDangSua = null) {
  await kiemTraKhongTaoVongLap(viTriIdDangSua, viTriChaId);

  if (loaiViTri === LOAI_VI_TRI.NHA_MAY) {
    if (viTriChaId) {
      throw taoLoi("Nha may khong duoc co vi tri cha", 400);
    }

    return null;
  }

  if (loaiViTri === LOAI_VI_TRI.XUONG && !viTriChaId) {
    return null;
  }

  if (!viTriChaId) {
    throw taoLoi("Vi tri cha khong duoc de trong", 400);
  }

  const viTriCha = await viTriModel.timTheoId(viTriChaId);

  if (!viTriCha) {
    throw taoLoi("Vi tri cha khong ton tai", 400);
  }

  const loaiChaHopLe = {
    [LOAI_VI_TRI.XUONG]: [LOAI_VI_TRI.NHA_MAY],
    [LOAI_VI_TRI.DAY_CHUYEN]: [LOAI_VI_TRI.XUONG],
    [LOAI_VI_TRI.KHU_VUC]: [LOAI_VI_TRI.DAY_CHUYEN]
  };
  const danhSachLoaiChaHopLe = loaiChaHopLe[loaiViTri] || [];

  if (!danhSachLoaiChaHopLe.includes(viTriCha.loai_vi_tri)) {
    throw taoLoi("Phan cap vi tri khong hop le", 400);
  }

  return viTriCha;
}

async function layDanhSachViTri(query = {}) {
  const { trangHienTai, soBanGhiMoiTrang, boQua } = layThongTinPhanTrang(query);
  const tuKhoa = typeof query.tuKhoa === "string" ? query.tuKhoa.trim() : "";
  const loaiViTri = query.loaiViTri || query.loai_vi_tri
    ? chuanHoaLoaiViTri(query.loaiViTri || query.loai_vi_tri)
    : null;
  const viTriChaId = layViTriChaIdTuQuery(query);
  const dieuKienLoc = {
    tuKhoa,
    loaiViTri,
    viTriChaId
  };

  const [danhSachViTri, tongBanGhi] = await Promise.all([
    viTriModel.layDanhSachViTri({
      ...dieuKienLoc,
      gioiHan: soBanGhiMoiTrang,
      boQua
    }),
    viTriModel.demTongViTri(dieuKienLoc)
  ]);

  return {
    danhSach: danhSachViTri.map((viTri) => dinhDangViTri(viTri)),
    phanTrang: {
      trang: trangHienTai,
      gioiHan: soBanGhiMoiTrang,
      tongBanGhi,
      tongTrang: Math.ceil(tongBanGhi / soBanGhiMoiTrang)
    }
  };
}

async function layCayViTri() {
  const danhSachViTri = await viTriModel.layTatCaViTri();
  const banDoViTri = new Map();
  const danhSachGoc = [];

  danhSachViTri.forEach((viTri) => {
    banDoViTri.set(viTri.id, {
      ...dinhDangViTri(viTri, true),
      danhSachCon: []
    });
  });

  danhSachViTri.forEach((viTri) => {
    const viTriDaDinhDang = banDoViTri.get(viTri.id);

    if (viTri.vi_tri_cha_id && banDoViTri.has(viTri.vi_tri_cha_id)) {
      banDoViTri.get(viTri.vi_tri_cha_id).danhSachCon.push(viTriDaDinhDang);
      return;
    }

    danhSachGoc.push(viTriDaDinhDang);
  });

  return danhSachGoc;
}

async function layChiTietViTri(id) {
  const viTriId = layIdHopLe(id, "Id vi tri");
  const viTri = await viTriModel.timTheoId(viTriId);

  if (!viTri) {
    throw taoLoi("Khong tim thay vi tri", 404);
  }

  return dinhDangViTri(viTri);
}

async function taoViTri(duLieu = {}) {
  const truongTenViTri = layTenTruongTrongDuLieu(duLieu, ["tenViTri", "ten_vi_tri"]);
  const truongLoaiViTri = layTenTruongTrongDuLieu(duLieu, ["loaiViTri", "loai_vi_tri"]);
  const truongViTriChaId = layTenTruongTrongDuLieu(duLieu, ["viTriChaId", "vi_tri_cha_id"]);
  const truongMoTa = layTenTruongTrongDuLieu(duLieu, ["moTa", "mo_ta"]);
  const tenViTri = chuanHoaChuoi(truongTenViTri ? duLieu[truongTenViTri] : undefined);
  const loaiViTri = chuanHoaLoaiViTri(truongLoaiViTri ? duLieu[truongLoaiViTri] : undefined);
  const viTriChaId = layIdTuyChon(
    truongViTriChaId ? duLieu[truongViTriChaId] : undefined,
    "Vi tri cha"
  );
  const moTa = chuanHoaChuoi(truongMoTa ? duLieu[truongMoTa] : undefined);

  if (!tenViTri) {
    throw taoLoi("Ten vi tri khong duoc de trong", 400);
  }

  const viTriChaHopLe = await kiemTraPhanCapViTri(loaiViTri, viTriChaId);

  await kiemTraTrungTenTrongCungCap(tenViTri, viTriChaHopLe ? viTriChaHopLe.id : null);

  const viTriMoi = await viTriModel.taoViTri({
    tenViTri,
    loaiViTri,
    viTriChaId: viTriChaHopLe ? viTriChaHopLe.id : null,
    moTa
  });

  return dinhDangViTri(viTriMoi);
}

async function capNhatViTri(id, duLieu = {}) {
  const viTriId = layIdHopLe(id, "Id vi tri");
  const viTriHienTai = await viTriModel.timTheoId(viTriId);

  if (!viTriHienTai) {
    throw taoLoi("Khong tim thay vi tri", 404);
  }

  const truongTenViTri = layTenTruongTrongDuLieu(duLieu, ["tenViTri", "ten_vi_tri"]);
  const truongLoaiViTri = layTenTruongTrongDuLieu(duLieu, ["loaiViTri", "loai_vi_tri"]);
  const truongViTriChaId = layTenTruongTrongDuLieu(duLieu, ["viTriChaId", "vi_tri_cha_id"]);
  const truongMoTa = layTenTruongTrongDuLieu(duLieu, ["moTa", "mo_ta"]);
  const tenViTri = truongTenViTri
    ? chuanHoaChuoi(duLieu[truongTenViTri])
    : viTriHienTai.ten_vi_tri;
  const loaiViTri = truongLoaiViTri
    ? chuanHoaLoaiViTri(duLieu[truongLoaiViTri])
    : viTriHienTai.loai_vi_tri;
  const viTriChaId = truongViTriChaId
    ? layIdTuyChon(duLieu[truongViTriChaId], "Vi tri cha")
    : viTriHienTai.vi_tri_cha_id;
  const moTa = truongMoTa
    ? chuanHoaChuoi(duLieu[truongMoTa])
    : viTriHienTai.mo_ta;

  if (!tenViTri) {
    throw taoLoi("Ten vi tri khong duoc de trong", 400);
  }

  const viTriChaHopLe = await kiemTraPhanCapViTri(loaiViTri, viTriChaId, viTriId);

  await kiemTraTrungTenTrongCungCap(
    tenViTri,
    viTriChaHopLe ? viTriChaHopLe.id : null,
    viTriId
  );

  const viTriDaCapNhat = await viTriModel.capNhatViTri(viTriId, {
    tenViTri,
    loaiViTri,
    viTriChaId: viTriChaHopLe ? viTriChaHopLe.id : null,
    moTa
  });

  return dinhDangViTri(viTriDaCapNhat);
}

async function xoaViTri(id) {
  const viTriId = layIdHopLe(id, "Id vi tri");
  const viTri = await viTriModel.timTheoId(viTriId);

  if (!viTri) {
    throw taoLoi("Khong tim thay vi tri", 404);
  }

  const [soViTriCon, soThietBi, soLichSuDieuChuyen] = await Promise.all([
    viTriModel.demViTriCon(viTriId),
    viTriModel.demThietBiTheoViTri(viTriId),
    viTriModel.demDieuChuyenTheoViTri(viTriId)
  ]);

  if (soViTriCon > 0 || soThietBi > 0 || soLichSuDieuChuyen > 0) {
    throw taoLoi("Khong the xoa vi tri da phat sinh du lieu", 409, {
      soViTriCon,
      soThietBi,
      soLichSuDieuChuyen
    });
  }

  await viTriModel.xoaViTri(viTriId);

  return {
    id: viTriId,
    daXoa: true
  };
}

module.exports = {
  layDanhSachViTri,
  layCayViTri,
  layChiTietViTri,
  taoViTri,
  capNhatViTri,
  xoaViTri
};
