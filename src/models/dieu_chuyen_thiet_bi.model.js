const { pool } = require("../config/database");

function taoCauSelectDieuChuyen() {
  return `
    SELECT
      dc.id,
      dc.thiet_bi_id,
      dc.vi_tri_cu_id,
      dc.vi_tri_moi_id,
      dc.nguoi_thuc_hien_id,
      dc.ly_do,
      dc.ghi_chu,
      dc.ngay_dieu_chuyen,
      dc.ngay_tao,
      vtc.ten_vi_tri AS ten_vi_tri_cu,
      vtc.loai_vi_tri AS loai_vi_tri_cu,
      vtm.ten_vi_tri AS ten_vi_tri_moi,
      vtm.loai_vi_tri AS loai_vi_tri_moi,
      nd.ho_ten AS ten_nguoi_thuc_hien,
      nd.email AS email_nguoi_thuc_hien
    FROM dieu_chuyen_thiet_bi dc
    LEFT JOIN vi_tri vtc ON dc.vi_tri_cu_id = vtc.id
    INNER JOIN vi_tri vtm ON dc.vi_tri_moi_id = vtm.id
    INNER JOIN nguoi_dung nd ON dc.nguoi_thuc_hien_id = nd.id
  `;
}

async function taoDieuChuyenThietBi(connection, {
  thietBiId,
  viTriCuId = null,
  viTriMoiId,
  nguoiThucHienId,
  lyDo = null,
  ghiChu = null
}) {
  const [ketQua] = await connection.execute(
    `
      INSERT INTO dieu_chuyen_thiet_bi (
        thiet_bi_id,
        vi_tri_cu_id,
        vi_tri_moi_id,
        nguoi_thuc_hien_id,
        ly_do,
        ghi_chu,
        ngay_dieu_chuyen
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
    [thietBiId, viTriCuId, viTriMoiId, nguoiThucHienId, lyDo, ghiChu]
  );

  return ketQua.insertId;
}

async function layLichSuDieuChuyenTheoThietBi({ thietBiId, gioiHan = 10, boQua = 0 }) {
  const [rows] = await pool.execute(
    `
      ${taoCauSelectDieuChuyen()}
      WHERE dc.thiet_bi_id = ?
      ORDER BY dc.ngay_dieu_chuyen DESC, dc.id DESC
      LIMIT ?
      OFFSET ?
    `,
    [thietBiId, gioiHan, boQua]
  );

  return rows;
}

async function timTheoId(id) {
  const [rows] = await pool.execute(
    `
      ${taoCauSelectDieuChuyen()}
      WHERE dc.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function demLichSuDieuChuyenTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM dieu_chuyen_thiet_bi
      WHERE thiet_bi_id = ?
    `,
    [thietBiId]
  );

  return rows[0].tong;
}

async function layTatCaLichSuDieuChuyenTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      ${taoCauSelectDieuChuyen()}
      WHERE dc.thiet_bi_id = ?
      ORDER BY dc.ngay_dieu_chuyen DESC, dc.id DESC
    `,
    [thietBiId]
  );

  return rows;
}

module.exports = {
  taoDieuChuyenThietBi,
  layLichSuDieuChuyenTheoThietBi,
  demLichSuDieuChuyenTheoThietBi,
  layTatCaLichSuDieuChuyenTheoThietBi,
  timTheoId
};
