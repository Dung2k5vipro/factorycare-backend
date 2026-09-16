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

module.exports = {
  taoThongBao
};
