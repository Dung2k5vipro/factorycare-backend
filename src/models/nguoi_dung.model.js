const pool = require("../config/database").pool;

// timnguoidungquaemail
async function timTheoEmail(email) {
  const [rows] = await pool.execute;
  (`
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
    [email]);
  return rows[0] || null;
}

// timnguoidungquaid
async function timTheoId(id) {
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
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

// layds nguoi dung tim kiem, loc phan trang
async function layDanhSachNguoiDung({
  tuKhoa = "",
  vaiTro = null,
  trangThai = null,
  gioiHan = 20,
  boQua = 0,
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
    [...thamSo, gioiHan, boQua],
  );

  return rows;
}

// demnguoidungtheodiuekienloc
async function demTongNguoiDung({
  tuKhoa = "",
  vaiTro = null,
  trangThai = null,
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
    thamSo,
  );

  return rows[0].tong;
}
// Tao nguoi dung moi
async function taoNguoiDung({
  hoTen,
  email,
  matKhau,
  soDienThoai = null,
  anhDaiDien = null,
  vaiTro,
  trangThai = "HOAT_DONG",
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
    [hoTen, email, matKhau, soDienThoai, anhDaiDien, vaiTro, trangThai],
  );

  return ketQua.insertId;
}

// Cap nhat thong tin nguoi dung
async function capNhatNguoiDung(
  id,
  { hoTen, email, soDienThoai = null, anhDaiDien = null, vaiTro },
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
    [hoTen, email, soDienThoai, anhDaiDien, vaiTro, id],
  );

  return ketQua.affectedRows;
}

// Cap nhat trang thai tai khoan
async function capNhatTrangThai(id, trangThai) {
  const [ketQua] = await pool.execute(
    `
      UPDATE nguoi_dung
      SET trang_thai = ?
      WHERE id = ?
    `,
    [trangThai, id],
  );

  return ketQua.affectedRows;
}

// Cap nhat mat khau
async function capNhatMatKhau(id, matKhauDaBam) {
  const [ketQua] = await pool.execute(
    `
      UPDATE nguoi_dung
      SET mat_khau = ?
      WHERE id = ?
    `,
    [matKhauDaBam, id],
  );

  return ketQua.affectedRows;
}

// Dem so quan tri vien dang hoat dong
async function demQuanTriVienHoatDong() {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM nguoi_dung
      WHERE vai_tro = 'QUAN_TRI_VIEN'
        AND trang_thai = 'HOAT_DONG'
    `,
  );

  return rows[0].tong;
}

module.exports = {
  timTheoEmail,
  timTheoId,
  layDanhSachNguoiDung,
  demTongNguoiDung,
  taoNguoiDung,
  capNhatNguoiDung,
  capNhatTrangThai,
  capNhatMatKhau,
  demQuanTriVienHoatDong,
};
