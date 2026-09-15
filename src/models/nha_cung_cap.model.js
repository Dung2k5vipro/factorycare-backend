const { pool } = require("../config/database");

function taoCauSelectNhaCungCap() {
  return `
    SELECT
      ncc.id,
      ncc.ten_nha_cung_cap,
      ncc.nguoi_lien_he,
      ncc.so_dien_thoai,
      ncc.email,
      ncc.dia_chi,
      ncc.ghi_chu,
      ncc.ngay_tao,
      ncc.ngay_cap_nhat
    FROM nha_cung_cap ncc
  `;
}

function taoDieuKienLoc({ tuKhoa = "" }) {
  const dieuKien = [];
  const thamSo = [];

  if (tuKhoa) {
    dieuKien.push(`
      (
        ncc.ten_nha_cung_cap LIKE ?
        OR COALESCE(ncc.nguoi_lien_he, '') LIKE ?
        OR COALESCE(ncc.so_dien_thoai, '') LIKE ?
        OR COALESCE(ncc.email, '') LIKE ?
      )
    `);
    const tuKhoaTimKiem = `%${tuKhoa}%`;
    thamSo.push(tuKhoaTimKiem, tuKhoaTimKiem, tuKhoaTimKiem, tuKhoaTimKiem);
  }

  return {
    where: dieuKien.length ? `WHERE ${dieuKien.join(" AND ")}` : "",
    thamSo
  };
}

async function layDanhSachNhaCungCap({ tuKhoa = "", gioiHan = 10, boQua = 0 }) {
  const { where, thamSo } = taoDieuKienLoc({ tuKhoa });

  const [rows] = await pool.execute(
    `
      ${taoCauSelectNhaCungCap()}
      ${where}
      ORDER BY ncc.ngay_tao DESC, ncc.id DESC
      LIMIT ?
      OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongNhaCungCap({ tuKhoa = "" }) {
  const { where, thamSo } = taoDieuKienLoc({ tuKhoa });

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM nha_cung_cap ncc
      ${where}
    `,
    thamSo
  );

  return rows[0].tong;
}

async function timTheoId(id) {
  const [rows] = await pool.execute(
    `
      ${taoCauSelectNhaCungCap()}
      WHERE ncc.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function taoNhaCungCap({
  tenNhaCungCap,
  nguoiLienHe = null,
  soDienThoai = null,
  email = null,
  diaChi = null,
  ghiChu = null
}) {
  const [ketQua] = await pool.execute(
    `
      INSERT INTO nha_cung_cap (
        ten_nha_cung_cap,
        nguoi_lien_he,
        so_dien_thoai,
        email,
        dia_chi,
        ghi_chu
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi, ghiChu]
  );

  return timTheoId(ketQua.insertId);
}

async function capNhatNhaCungCap(id, {
  tenNhaCungCap,
  nguoiLienHe = null,
  soDienThoai = null,
  email = null,
  diaChi = null,
  ghiChu = null
}) {
  const [ketQua] = await pool.execute(
    `
      UPDATE nha_cung_cap
      SET
        ten_nha_cung_cap = ?,
        nguoi_lien_he = ?,
        so_dien_thoai = ?,
        email = ?,
        dia_chi = ?,
        ghi_chu = ?
      WHERE id = ?
    `,
    [tenNhaCungCap, nguoiLienHe, soDienThoai, email, diaChi, ghiChu, id]
  );

  if (ketQua.affectedRows === 0) {
    return null;
  }

  return timTheoId(id);
}

async function xoaNhaCungCap(id) {
  const [ketQua] = await pool.execute(
    `
      DELETE FROM nha_cung_cap
      WHERE id = ?
    `,
    [id]
  );

  return ketQua.affectedRows > 0;
}

async function demLoNhapTheoNhaCungCap(id) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM lo_nhap
      WHERE nha_cung_cap_id = ?
    `,
    [id]
  );

  return rows[0].tong;
}

async function layDanhSachLoNhapTheoNhaCungCap({
  nhaCungCapId,
  gioiHan = 10,
  boQua = 0
}) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        ma_lo,
        nha_cung_cap_id,
        so_hoa_don,
        file_hoa_don,
        ngay_nhap,
        tong_gia_tri,
        ghi_chu,
        ngay_tao,
        ngay_cap_nhat
      FROM lo_nhap
      WHERE nha_cung_cap_id = ?
      ORDER BY ngay_nhap DESC, id DESC
      LIMIT ?
      OFFSET ?
    `,
    [nhaCungCapId, gioiHan, boQua]
  );

  return rows;
}

async function demThietBiTheoNhaCungCap(id) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM thiet_bi tb
      INNER JOIN lo_nhap ln ON tb.lo_nhap_id = ln.id
      WHERE ln.nha_cung_cap_id = ?
    `,
    [id]
  );

  return rows[0].tong;
}

async function layDanhSachThietBiTheoNhaCungCap({
  nhaCungCapId,
  gioiHan = 10,
  boQua = 0
}) {
  const [rows] = await pool.execute(
    `
      SELECT
        tb.id,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        tb.loai_thiet_bi_id,
        ltb.ten_loai,
        tb.vi_tri_id,
        vt.ten_vi_tri,
        tb.lo_nhap_id,
        tb.so_serial,
        tb.model,
        tb.hang_san_xuat,
        tb.trang_thai,
        tb.ngay_tao,
        tb.ngay_cap_nhat
      FROM thiet_bi tb
      INNER JOIN lo_nhap ln ON tb.lo_nhap_id = ln.id
      INNER JOIN loai_thiet_bi ltb ON tb.loai_thiet_bi_id = ltb.id
      LEFT JOIN vi_tri vt ON tb.vi_tri_id = vt.id
      WHERE ln.nha_cung_cap_id = ?
      ORDER BY tb.ngay_tao DESC, tb.id DESC
      LIMIT ?
      OFFSET ?
    `,
    [nhaCungCapId, gioiHan, boQua]
  );

  return rows;
}

module.exports = {
  layDanhSachNhaCungCap,
  demTongNhaCungCap,
  timTheoId,
  taoNhaCungCap,
  capNhatNhaCungCap,
  xoaNhaCungCap,
  demLoNhapTheoNhaCungCap,
  layDanhSachLoNhapTheoNhaCungCap,
  demThietBiTheoNhaCungCap,
  layDanhSachThietBiTheoNhaCungCap
};
