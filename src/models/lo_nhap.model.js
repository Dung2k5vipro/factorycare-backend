const { pool } = require("../config/database");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectLoNhap() {
  return `
    SELECT
      ln.id,
      ln.ma_lo,
      ln.nha_cung_cap_id,
      ln.so_hoa_don,
      ln.file_hoa_don,
      ln.ngay_nhap,
      ln.tong_gia_tri,
      ln.ghi_chu,
      ln.ngay_tao,
      ln.ngay_cap_nhat,
      ncc.ten_nha_cung_cap,
      ncc.email AS email_nha_cung_cap,
      ncc.so_dien_thoai AS so_dien_thoai_nha_cung_cap
    FROM lo_nhap ln
    LEFT JOIN nha_cung_cap ncc ON ln.nha_cung_cap_id = ncc.id
  `;
}

function taoDieuKienLoc({ tuKhoa = "", nhaCungCapId = null }) {
  const dieuKien = [];
  const thamSo = [];

  if (tuKhoa) {
    dieuKien.push("(ln.ma_lo LIKE ? OR COALESCE(ln.so_hoa_don, '') LIKE ? OR COALESCE(ln.ghi_chu, '') LIKE ?)");
    const tuKhoaTimKiem = `%${tuKhoa}%`;
    thamSo.push(tuKhoaTimKiem, tuKhoaTimKiem, tuKhoaTimKiem);
  }

  if (nhaCungCapId) {
    dieuKien.push("ln.nha_cung_cap_id = ?");
    thamSo.push(nhaCungCapId);
  }

  return {
    where: dieuKien.length ? `WHERE ${dieuKien.join(" AND ")}` : "",
    thamSo
  };
}

async function layDanhSachLoNhap({
  tuKhoa = "",
  nhaCungCapId = null,
  gioiHan = 10,
  boQua = 0
}) {
  const { where, thamSo } = taoDieuKienLoc({ tuKhoa, nhaCungCapId });

  const [rows] = await pool.execute(
    `
      ${taoCauSelectLoNhap()}
      ${where}
      ORDER BY ln.ngay_nhap DESC, ln.id DESC
      LIMIT ?
      OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongLoNhap({ tuKhoa = "", nhaCungCapId = null }) {
  const { where, thamSo } = taoDieuKienLoc({ tuKhoa, nhaCungCapId });

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM lo_nhap ln
      ${where}
    `,
    thamSo
  );

  return rows[0].tong;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectLoNhap()}
      WHERE ln.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function timTheoMaLo(maLo, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectLoNhap()}
      WHERE ln.ma_lo = ?
      LIMIT 1
    `,
    [maLo]
  );

  return rows[0] || null;
}

async function taoLoNhap({
  maLo,
  nhaCungCapId = null,
  soHoaDon = null,
  fileHoaDon = null,
  ngayNhap,
  tongGiaTri = null,
  ghiChu = null
}) {
  const [ketQua] = await pool.execute(
    `
      INSERT INTO lo_nhap (
        ma_lo,
        nha_cung_cap_id,
        so_hoa_don,
        file_hoa_don,
        ngay_nhap,
        tong_gia_tri,
        ghi_chu
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [maLo, nhaCungCapId, soHoaDon, fileHoaDon, ngayNhap, tongGiaTri, ghiChu]
  );

  return timTheoId(ketQua.insertId);
}

async function capNhatLoNhap(id, {
  maLo,
  nhaCungCapId = null,
  soHoaDon = null,
  fileHoaDon = null,
  ngayNhap,
  tongGiaTri = null,
  ghiChu = null
}) {
  const [ketQua] = await pool.execute(
    `
      UPDATE lo_nhap
      SET
        ma_lo = ?,
        nha_cung_cap_id = ?,
        so_hoa_don = ?,
        file_hoa_don = ?,
        ngay_nhap = ?,
        tong_gia_tri = ?,
        ghi_chu = ?
      WHERE id = ?
    `,
    [maLo, nhaCungCapId, soHoaDon, fileHoaDon, ngayNhap, tongGiaTri, ghiChu, id]
  );

  if (ketQua.affectedRows === 0) {
    return null;
  }

  return timTheoId(id);
}

async function xoaLoNhap(id) {
  const [ketQua] = await pool.execute(
    `
      DELETE FROM lo_nhap
      WHERE id = ?
    `,
    [id]
  );

  return ketQua.affectedRows > 0;
}

async function demThietBiTheoLoNhap(id) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM thiet_bi
      WHERE lo_nhap_id = ?
    `,
    [id]
  );

  return rows[0].tong;
}

async function layDanhSachThietBiTheoLoNhap({ loNhapId, gioiHan = 10, boQua = 0 }) {
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
        tb.so_serial,
        tb.model,
        tb.hang_san_xuat,
        tb.trang_thai,
        tb.ngay_tao,
        tb.ngay_cap_nhat
      FROM thiet_bi tb
      INNER JOIN loai_thiet_bi ltb ON tb.loai_thiet_bi_id = ltb.id
      LEFT JOIN vi_tri vt ON tb.vi_tri_id = vt.id
      WHERE tb.lo_nhap_id = ?
      ORDER BY tb.ngay_tao DESC, tb.id DESC
      LIMIT ?
      OFFSET ?
    `,
    [loNhapId, gioiHan, boQua]
  );

  return rows;
}

module.exports = {
  layDanhSachLoNhap,
  demTongLoNhap,
  timTheoId,
  timTheoMaLo,
  taoLoNhap,
  capNhatLoNhap,
  xoaLoNhap,
  demThietBiTheoLoNhap,
  layDanhSachThietBiTheoLoNhap
};
