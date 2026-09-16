const { pool } = require("../config/database");
const VAI_TRO = require("../constants/vai_tro");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");

function layBoThucThi(connection) {
  return connection || pool;
}

async function timTheoEmail(email, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ho_ten,
        email,
        mat_khau,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
      FROM nguoi_dung
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ho_ten,
        email,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
      FROM nguoi_dung
      WHERE id = ?
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
        ho_ten,
        email,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
      FROM nguoi_dung
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function timTheoIdCoMatKhau(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        ho_ten,
        email,
        mat_khau,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
      FROM nguoi_dung
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function layDanhSachNguoiDung({
  tuKhoa = "",
  vaiTro = null,
  trangThai = null,
  gioiHan = 10,
  boQua = 0
}) {
  let dieuKien = `
    WHERE (
      ho_ten LIKE ?
      OR email LIKE ?
      OR so_dien_thoai LIKE ?
    )
  `;

  const tuKhoaTimKiem = `%${tuKhoa}%`;

  const thamSo = [tuKhoaTimKiem, tuKhoaTimKiem, tuKhoaTimKiem];
  if (vaiTro) {
    dieuKien += " AND vai_tro = ?";
    thamSo.push(vaiTro);
  }
  if (trangThai) {
    dieuKien += " AND trang_thai = ?";
    thamSo.push(trangThai);
  }
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        ho_ten,
        email,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
      FROM nguoi_dung
      ${dieuKien}
      ORDER BY ngay_tao DESC
      LIMIT ?
      OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongNguoiDung({
  tuKhoa = "",
  vaiTro = null,
  trangThai = null
}) {
  let dieuKien = `
    WHERE (
      ho_ten LIKE ?
      OR email LIKE ?
      OR so_dien_thoai LIKE ?
    )
  `;

  const tuKhoaTimKiem = `%${tuKhoa}%`;

  const thamSo = [tuKhoaTimKiem, tuKhoaTimKiem, tuKhoaTimKiem];

  if (vaiTro) {
    dieuKien += ` AND vai_tro = ?`;
    thamSo.push(vaiTro);
  }

  if (trangThai) {
    dieuKien += ` AND trang_thai = ?`;
    thamSo.push(trangThai);
  }

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM nguoi_dung
      ${dieuKien}
    `,
    thamSo
  );

  return rows[0].tong;
}

async function demTongTatCaNguoiDung(connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT COUNT(*) AS tong
      FROM nguoi_dung
    `
  );

  return rows[0].tong;
}

async function khoaKhoiTaoAdminDauTien(connection, tenKhoa) {
  const [rows] = await connection.execute(
    "SELECT GET_LOCK(?, 10) AS da_khoa",
    [tenKhoa]
  );

  return Number(rows[0].da_khoa) === 1;
}

async function moKhoaKhoiTaoAdminDauTien(connection, tenKhoa) {
  const [rows] = await connection.execute(
    "SELECT RELEASE_LOCK(?) AS da_mo_khoa",
    [tenKhoa]
  );

  return Number(rows[0].da_mo_khoa) === 1;
}

async function taoNguoiDung({
  hoTen,
  email,
  matKhau,
  soDienThoai = null,
  anhDaiDien = null,
  vaiTro,
  trangThai = TRANG_THAI_NGUOI_DUNG.HOAT_DONG
}) {
  const [ketQua] = await pool.execute(
    `
      INSERT INTO nguoi_dung (
        ho_ten,
        email,
        mat_khau,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [hoTen, email, matKhau, soDienThoai, anhDaiDien, vaiTro, trangThai]
  );

  return ketQua.insertId;
}

async function capNhatNguoiDung(
  id,
  { hoTen, email, soDienThoai = null, anhDaiDien = null, vaiTro }
) {
  const [ketQua] = await pool.execute(
    `
      UPDATE nguoi_dung
      SET
        ho_ten = ?,
        email = ?,
        so_dien_thoai = ?,
        anh_dai_dien = ?,
        vai_tro = ?
      WHERE id = ?
    `,
    [hoTen, email, soDienThoai, anhDaiDien, vaiTro, id]
  );

  return ketQua.affectedRows;
}

async function capNhatTrangThai(id, trangThai) {
  const [ketQua] = await pool.execute(
    `
      UPDATE nguoi_dung
      SET trang_thai = ?
      WHERE id = ?
    `,
    [trangThai, id]
  );

  return ketQua.affectedRows;
}

async function capNhatMatKhau(id, matKhauDaBam) {
  const [ketQua] = await pool.execute(
    `
      UPDATE nguoi_dung
      SET mat_khau = ?
      WHERE id = ?
    `,
    [matKhauDaBam, id]
  );

  return ketQua.affectedRows;
}

async function demQuanTriVienHoatDong() {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM nguoi_dung
      WHERE vai_tro = ?
        AND trang_thai = ?
    `,
    [VAI_TRO.QUAN_TRI_VIEN, TRANG_THAI_NGUOI_DUNG.HOAT_DONG]
  );

  return rows[0].tong;
}

async function layDanhSachTheoVaiTroVaTrangThai(
  vaiTro,
  trangThai,
  connection = null
) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ho_ten,
        email,
        so_dien_thoai,
        anh_dai_dien,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
      FROM nguoi_dung
      WHERE vai_tro = ?
        AND trang_thai = ?
      ORDER BY ho_ten ASC, id ASC
    `,
    [vaiTro, trangThai]
  );

  return rows;
}

module.exports = {
  timTheoEmail,
  timTheoId,
  timTheoIdDeCapNhat,
  timTheoIdCoMatKhau,
  layDanhSachNguoiDung,
  demTongNguoiDung,
  demTongTatCaNguoiDung,
  khoaKhoiTaoAdminDauTien,
  moKhoaKhoiTaoAdminDauTien,
  taoNguoiDung,
  capNhatNguoiDung,
  capNhatTrangThai,
  capNhatMatKhau,
  demQuanTriVienHoatDong,
  layDanhSachTheoVaiTroVaTrangThai
};
