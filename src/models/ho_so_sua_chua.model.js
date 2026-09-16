const { pool } = require("../config/database");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectHoSoSuaChua() {
  return `
    SELECT
      hssc.id,
      hssc.su_co_id,
      hssc.ky_thuat_vien_id,
      hssc.nguyen_nhan,
      hssc.cach_xu_ly,
      hssc.linh_kien_thay_the,
      hssc.ket_qua,
      hssc.thoi_gian_bat_dau,
      hssc.thoi_gian_hoan_thanh,
      hssc.ghi_chu,
      hssc.ngay_tao,
      hssc.ngay_cap_nhat,
      ktv.ho_ten AS ky_thuat_vien_ho_ten,
      ktv.email AS ky_thuat_vien_email
    FROM ho_so_sua_chua hssc
    INNER JOIN nguoi_dung ktv ON ktv.id = hssc.ky_thuat_vien_id
  `;
}

async function layDanhSachTheoSuCoId(suCoId, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectHoSoSuaChua()}
      WHERE hssc.su_co_id = ?
      ORDER BY hssc.thoi_gian_bat_dau DESC, hssc.id DESC
    `,
    [suCoId]
  );

  return rows;
}

async function layDanhSachTheoSuCoVaKyThuatVien(
  suCoId,
  kyThuatVienId,
  connection = null
) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectHoSoSuaChua()}
      WHERE hssc.su_co_id = ?
        AND hssc.ky_thuat_vien_id = ?
      ORDER BY hssc.thoi_gian_bat_dau DESC, hssc.id DESC
    `,
    [suCoId, kyThuatVienId]
  );

  return rows;
}

async function timHoSoDangXuLyTheoSuCoId(suCoId, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectHoSoSuaChua()}
      WHERE hssc.su_co_id = ?
        AND hssc.thoi_gian_hoan_thanh IS NULL
      ORDER BY hssc.id DESC
      LIMIT 1
    `,
    [suCoId]
  );

  return rows[0] || null;
}

async function timHoSoDangXuLyDeCapNhat(suCoId, connection) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        su_co_id,
        ky_thuat_vien_id,
        nguyen_nhan,
        cach_xu_ly,
        linh_kien_thay_the,
        ket_qua,
        thoi_gian_bat_dau,
        thoi_gian_hoan_thanh,
        ghi_chu,
        ngay_tao,
        ngay_cap_nhat
      FROM ho_so_sua_chua
      WHERE su_co_id = ?
        AND thoi_gian_hoan_thanh IS NULL
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `,
    [suCoId]
  );

  return rows[0] || null;
}

async function taoHoSoSuaChua(connection, {
  suCoId,
  kyThuatVienId,
  nguyenNhan,
  cachXuLy,
  linhKienThayThe = null,
  ketQua,
  thoiGianBatDau,
  thoiGianHoanThanh = null,
  ghiChu = null
}) {
  const [ketQuaChen] = await connection.execute(
    `
      INSERT INTO ho_so_sua_chua (
        su_co_id,
        ky_thuat_vien_id,
        nguyen_nhan,
        cach_xu_ly,
        linh_kien_thay_the,
        ket_qua,
        thoi_gian_bat_dau,
        thoi_gian_hoan_thanh,
        ghi_chu
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      suCoId,
      kyThuatVienId,
      nguyenNhan,
      cachXuLy,
      linhKienThayThe,
      ketQua,
      thoiGianBatDau,
      thoiGianHoanThanh,
      ghiChu
    ]
  );

  return ketQuaChen.insertId;
}

async function capNhatHoSoSuaChua(connection, id, {
  nguyenNhan,
  cachXuLy,
  linhKienThayThe = null,
  ketQua,
  ghiChu = null
}) {
  const [ketQuaCapNhat] = await connection.execute(
    `
      UPDATE ho_so_sua_chua
      SET
        nguyen_nhan = ?,
        cach_xu_ly = ?,
        linh_kien_thay_the = ?,
        ket_qua = ?,
        ghi_chu = ?
      WHERE id = ?
        AND thoi_gian_hoan_thanh IS NULL
    `,
    [nguyenNhan, cachXuLy, linhKienThayThe, ketQua, ghiChu, id]
  );

  return ketQuaCapNhat.affectedRows;
}

async function hoanThanhHoSoSuaChua(connection, id, {
  nguyenNhan,
  cachXuLy,
  linhKienThayThe = null,
  ketQua,
  ghiChu = null,
  thoiGianHoanThanh
}) {
  const [ketQuaCapNhat] = await connection.execute(
    `
      UPDATE ho_so_sua_chua
      SET
        nguyen_nhan = ?,
        cach_xu_ly = ?,
        linh_kien_thay_the = ?,
        ket_qua = ?,
        ghi_chu = ?,
        thoi_gian_hoan_thanh = ?
      WHERE id = ?
        AND thoi_gian_hoan_thanh IS NULL
    `,
    [
      nguyenNhan,
      cachXuLy,
      linhKienThayThe,
      ketQua,
      ghiChu,
      thoiGianHoanThanh,
      id
    ]
  );

  return ketQuaCapNhat.affectedRows;
}

module.exports = {
  layDanhSachTheoSuCoId,
  layDanhSachTheoSuCoVaKyThuatVien,
  timHoSoDangXuLyTheoSuCoId,
  timHoSoDangXuLyDeCapNhat,
  taoHoSoSuaChua,
  capNhatHoSoSuaChua,
  hoanThanhHoSoSuaChua
};
