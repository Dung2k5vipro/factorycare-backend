const { pool } = require("../config/database");

function layBoThucThi(connection) {
  return connection || pool;
}

async function taoThongBao({
  nguoiDungId,
  tieuDe,
  noiDung,
  loaiThongBao,
  doiTuongLienQuanId = null
}, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [ketQua] = await boThucThi.execute(
    `
      INSERT INTO thong_bao (
        nguoi_dung_id,
        tieu_de,
        noi_dung,
        loai_thong_bao,
        doi_tuong_lien_quan_id
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [nguoiDungId, tieuDe, noiDung, loaiThongBao, doiTuongLienQuanId]
  );

  return ketQua.insertId;
}

async function daTonTaiThongBaoTrongNgay({
  nguoiDungId,
  tieuDe,
  loaiThongBao,
  doiTuongLienQuanId
}, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT id
      FROM thong_bao
      WHERE nguoi_dung_id = ?
        AND tieu_de = ?
        AND loai_thong_bao = ?
        AND doi_tuong_lien_quan_id = ?
        AND ngay_tao >= CURRENT_DATE
        AND ngay_tao < DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)
      LIMIT 1
    `,
    [nguoiDungId, tieuDe, loaiThongBao, doiTuongLienQuanId]
  );

  return Boolean(rows[0]);
}

module.exports = {
  taoThongBao,
  daTonTaiThongBaoTrongNgay
};
