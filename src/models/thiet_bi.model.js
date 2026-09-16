const { pool } = require("../config/database");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoDieuKienLoc({
  tuKhoa = "",
  loaiThietBiId = null,
  trangThai = null,
  viTriId = null
}) {
  let dieuKien = `
    WHERE (
      tb.ma_thiet_bi LIKE ?
      OR tb.ten_thiet_bi LIKE ?
      OR COALESCE(tb.so_serial, '') LIKE ?
      OR COALESCE(tb.model, '') LIKE ?
    )
  `;
  const tuKhoaTimKiem = `%${tuKhoa}%`;
  const thamSo = [
    tuKhoaTimKiem,
    tuKhoaTimKiem,
    tuKhoaTimKiem,
    tuKhoaTimKiem
  ];

  if (loaiThietBiId) {
    dieuKien += " AND tb.loai_thiet_bi_id = ?";
    thamSo.push(loaiThietBiId);
  }

  if (trangThai) {
    dieuKien += " AND tb.trang_thai = ?";
    thamSo.push(trangThai);
  }

  if (viTriId) {
    dieuKien += " AND tb.vi_tri_id = ?";
    thamSo.push(viTriId);
  }

  return { dieuKien, thamSo };
}

function taoCauSelectThietBi() {
  return `
    SELECT
      tb.id,
      tb.ma_thiet_bi,
      tb.ten_thiet_bi,
      tb.loai_thiet_bi_id,
      tb.vi_tri_id,
      tb.lo_nhap_id,
      tb.so_serial,
      tb.model,
      tb.hang_san_xuat,
      tb.ma_qr,
      tb.anh_thiet_bi,
      tb.gia_mua,
      tb.ngay_bat_dau_bao_hanh,
      tb.ngay_het_bao_hanh,
      tb.trang_thai,
      tb.mo_ta,
      tb.ngay_tao,
      tb.ngay_cap_nhat,
      ltb.ten_loai,
      vt.ten_vi_tri,
      vt.loai_vi_tri,
      ln.ma_lo,
      ln.so_hoa_don,
      ln.ngay_nhap,
      ncc.id AS nha_cung_cap_id,
      ncc.ten_nha_cung_cap
    FROM thiet_bi tb
    INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
    LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
    LEFT JOIN lo_nhap ln ON ln.id = tb.lo_nhap_id
    LEFT JOIN nha_cung_cap ncc ON ncc.id = ln.nha_cung_cap_id
  `;
}

async function layDanhSachThietBi({
  tuKhoa = "",
  loaiThietBiId = null,
  trangThai = null,
  viTriId = null,
  gioiHan = 10,
  boQua = 0
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    tuKhoa,
    loaiThietBiId,
    trangThai,
    viTriId
  });

  const [rows] = await pool.execute(
    `
      ${taoCauSelectThietBi()}
      ${dieuKien}
      ORDER BY tb.ngay_tao DESC
      LIMIT ?
      OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongThietBi({
  tuKhoa = "",
  loaiThietBiId = null,
  trangThai = null,
  viTriId = null
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    tuKhoa,
    loaiThietBiId,
    trangThai,
    viTriId
  });

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM thiet_bi tb
      INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
      LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
      LEFT JOIN lo_nhap ln ON ln.id = tb.lo_nhap_id
      ${dieuKien}
    `,
    thamSo
  );

  return rows[0].tong;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectThietBi()}
      WHERE tb.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function timTheoIdDeCapNhat(id, connection) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        ma_thiet_bi,
        ten_thiet_bi,
        vi_tri_id,
        trang_thai
      FROM thiet_bi
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function timTheoMaQr(maQr, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectThietBi()}
      WHERE tb.ma_qr = ?
      LIMIT 1
    `,
    [maQr]
  );

  return rows[0] || null;
}

async function timTheoSerial(soSerial, boQuaId = null, connection = null) {
  if (!soSerial) {
    return null;
  }

  const boThucThi = layBoThucThi(connection);
  let dieuKien = "WHERE so_serial = ?";
  const thamSo = [soSerial];

  if (boQuaId) {
    dieuKien += " AND id <> ?";
    thamSo.push(boQuaId);
  }

  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ma_thiet_bi,
        so_serial
      FROM thiet_bi
      ${dieuKien}
      LIMIT 1
    `,
    thamSo
  );

  return rows[0] || null;
}

async function khoaSinhMaThietBi(connection, tenKhoa) {
  const [rows] = await connection.execute(
    "SELECT GET_LOCK(?, 10) AS da_khoa",
    [tenKhoa]
  );

  return Number(rows[0].da_khoa) === 1;
}

async function moKhoaSinhMaThietBi(connection, tenKhoa) {
  const [rows] = await connection.execute(
    "SELECT RELEASE_LOCK(?) AS da_mo_khoa",
    [tenKhoa]
  );

  return Number(rows[0].da_mo_khoa) === 1;
}

async function laySoThuTuMaLonNhatTheoTienTo(connection, tienTo) {
  const [rows] = await connection.execute(
    `
      SELECT ma_thiet_bi
      FROM thiet_bi
      WHERE ma_thiet_bi LIKE CONCAT(?, '-%')
      ORDER BY CAST(SUBSTRING_INDEX(ma_thiet_bi, '-', -1) AS UNSIGNED) DESC
      LIMIT 1
    `,
    [tienTo]
  );

  if (!rows[0]) {
    return 0;
  }

  const ketQua = String(rows[0].ma_thiet_bi).match(/-(\d+)$/);

  return ketQua ? Number(ketQua[1]) : 0;
}

async function taoThietBi(connection, {
  maThietBi,
  tenThietBi,
  loaiThietBiId,
  viTriId = null,
  loNhapId = null,
  soSerial = null,
  model = null,
  hangSanXuat = null,
  maQr = null,
  anhThietBi = null,
  giaMua = null,
  ngayBatDauBaoHanh = null,
  ngayHetBaoHanh = null,
  trangThai,
  moTa = null
}) {
  const [ketQua] = await connection.execute(
    `
      INSERT INTO thiet_bi (
        ma_thiet_bi,
        ten_thiet_bi,
        loai_thiet_bi_id,
        vi_tri_id,
        lo_nhap_id,
        so_serial,
        model,
        hang_san_xuat,
        ma_qr,
        anh_thiet_bi,
        gia_mua,
        ngay_bat_dau_bao_hanh,
        ngay_het_bao_hanh,
        trang_thai,
        mo_ta
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      maThietBi,
      tenThietBi,
      loaiThietBiId,
      viTriId,
      loNhapId,
      soSerial,
      model,
      hangSanXuat,
      maQr,
      anhThietBi,
      giaMua,
      ngayBatDauBaoHanh,
      ngayHetBaoHanh,
      trangThai,
      moTa
    ]
  );

  return ketQua.insertId;
}

async function capNhatMaQr(id, maQr, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [ketQua] = await boThucThi.execute(
    `
      UPDATE thiet_bi
      SET ma_qr = ?
      WHERE id = ?
    `,
    [maQr, id]
  );

  return ketQua.affectedRows;
}

async function capNhatThietBi(id, {
  tenThietBi,
  loaiThietBiId,
  loNhapId = null,
  soSerial = null,
  model = null,
  hangSanXuat = null,
  anhThietBi = null,
  giaMua = null,
  ngayBatDauBaoHanh = null,
  ngayHetBaoHanh = null,
  moTa = null
}) {
  const [ketQua] = await pool.execute(
    `
      UPDATE thiet_bi
      SET
        ten_thiet_bi = ?,
        loai_thiet_bi_id = ?,
        lo_nhap_id = ?,
        so_serial = ?,
        model = ?,
        hang_san_xuat = ?,
        anh_thiet_bi = ?,
        gia_mua = ?,
        ngay_bat_dau_bao_hanh = ?,
        ngay_het_bao_hanh = ?,
        mo_ta = ?
      WHERE id = ?
    `,
    [
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
      moTa,
      id
    ]
  );

  return ketQua.affectedRows;
}

async function capNhatViTriThietBi(connection, id, viTriId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE thiet_bi
      SET vi_tri_id = ?
      WHERE id = ?
    `,
    [viTriId, id]
  );

  return ketQua.affectedRows;
}

async function capNhatBaoHanh(id, {
  ngayBatDauBaoHanh = null,
  ngayHetBaoHanh = null
}) {
  const [ketQua] = await pool.execute(
    `
      UPDATE thiet_bi
      SET
        ngay_bat_dau_bao_hanh = ?,
        ngay_het_bao_hanh = ?
      WHERE id = ?
    `,
    [ngayBatDauBaoHanh, ngayHetBaoHanh, id]
  );

  return ketQua.affectedRows;
}

async function capNhatTrangThai(id, trangThai, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [ketQua] = await boThucThi.execute(
    `
      UPDATE thiet_bi
      SET trang_thai = ?
      WHERE id = ?
    `,
    [trangThai, id]
  );

  return ketQua.affectedRows;
}

module.exports = {
  layDanhSachThietBi,
  demTongThietBi,
  timTheoId,
  timTheoIdDeCapNhat,
  timTheoMaQr,
  timTheoSerial,
  khoaSinhMaThietBi,
  moKhoaSinhMaThietBi,
  laySoThuTuMaLonNhatTheoTienTo,
  taoThietBi,
  capNhatMaQr,
  capNhatThietBi,
  capNhatViTriThietBi,
  capNhatBaoHanh,
  capNhatTrangThai
};
