const { pool } = require("../config/database");

function layBoThucThi(connection) {
  return connection || pool;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ten_loai,
        mo_ta,
        ngay_tao,
        ngay_cap_nhat
      FROM loai_thiet_bi
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function timTheoTen(tenLoai, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ten_loai,
        mo_ta,
        ngay_tao,
        ngay_cap_nhat
      FROM loai_thiet_bi
      WHERE ten_loai = ?
      LIMIT 1
    `,
    [tenLoai]
  );

  return rows[0] || null;
}

async function layDanhSachLoaiThietBi({
  tuKhoa = "",
  gioiHan = 10,
  boQua = 0
}) {
  const tuKhoaTimKiem = `%${tuKhoa}%`;
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        ten_loai,
        mo_ta,
        ngay_tao,
        ngay_cap_nhat
      FROM loai_thiet_bi
      WHERE ten_loai LIKE ?
        OR COALESCE(mo_ta, '') LIKE ?
      ORDER BY ngay_tao DESC
      LIMIT ?
      OFFSET ?
    `,
    [tuKhoaTimKiem, tuKhoaTimKiem, gioiHan, boQua]
  );

  return rows;
}

async function demTongLoaiThietBi({ tuKhoa = "" }) {
  const tuKhoaTimKiem = `%${tuKhoa}%`;
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM loai_thiet_bi
      WHERE ten_loai LIKE ?
        OR COALESCE(mo_ta, '') LIKE ?
    `,
    [tuKhoaTimKiem, tuKhoaTimKiem]
  );

  return rows[0].tong;
}

async function taoLoaiThietBi({ tenLoai, moTa = null }) {
  const [ketQua] = await pool.execute(
    `
      INSERT INTO loai_thiet_bi (
        ten_loai,
        mo_ta
      )
      VALUES (?, ?)
    `,
    [tenLoai, moTa]
  );

  return ketQua.insertId;
}

async function capNhatLoaiThietBi(id, { tenLoai, moTa = null }) {
  const [ketQua] = await pool.execute(
    `
      UPDATE loai_thiet_bi
      SET
        ten_loai = ?,
        mo_ta = ?
      WHERE id = ?
    `,
    [tenLoai, moTa, id]
  );

  return ketQua.affectedRows;
}

module.exports = {
  timTheoId,
  timTheoTen,
  layDanhSachLoaiThietBi,
  demTongLoaiThietBi,
  taoLoaiThietBi,
  capNhatLoaiThietBi
};
