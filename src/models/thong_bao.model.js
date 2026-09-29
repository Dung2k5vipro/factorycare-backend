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

async function layDanhSachThongBao({ nguoiDungId, gioiHan, boQua }) {
  const [danhSach] = await pool.query(
    `
      SELECT
        id,
        tieu_de,
        noi_dung,
        loai_thong_bao,
        doi_tuong_lien_quan_id,
        da_doc,
        ngay_tao,
        ngay_doc
      FROM thong_bao
      WHERE nguoi_dung_id = ?
      ORDER BY ngay_tao DESC, id DESC
      LIMIT ? OFFSET ?
    `,
    [nguoiDungId, gioiHan, boQua]
  );

  return danhSach;
}

async function demThongBao(nguoiDungId) {
  const [[ketQua]] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_ban_ghi,
        SUM(CASE WHEN da_doc = 0 THEN 1 ELSE 0 END) AS tong_chua_doc
      FROM thong_bao
      WHERE nguoi_dung_id = ?
    `,
    [nguoiDungId]
  );

  return {
    tongBanGhi: Number(ketQua.tong_ban_ghi || 0),
    tongChuaDoc: Number(ketQua.tong_chua_doc || 0)
  };
}

async function timTheoIdCuaNguoiDung(id, nguoiDungId) {
  const [[thongBao]] = await pool.execute(
    `
      SELECT id
      FROM thong_bao
      WHERE id = ?
        AND nguoi_dung_id = ?
      LIMIT 1
    `,
    [id, nguoiDungId]
  );

  return thongBao || null;
}

async function danhDauDaDoc(id, nguoiDungId) {
  const [ketQua] = await pool.execute(
    `
      UPDATE thong_bao
      SET da_doc = 1,
          ngay_doc = COALESCE(ngay_doc, NOW())
      WHERE id = ?
        AND nguoi_dung_id = ?
    `,
    [id, nguoiDungId]
  );

  return ketQua.affectedRows > 0;
}

async function danhDauTatCaDaDoc(nguoiDungId) {
  const [ketQua] = await pool.execute(
    `
      UPDATE thong_bao
      SET da_doc = 1,
          ngay_doc = COALESCE(ngay_doc, NOW())
      WHERE nguoi_dung_id = ?
        AND da_doc = 0
    `,
    [nguoiDungId]
  );

  return ketQua.affectedRows;
}

module.exports = {
  taoThongBao,
  layDanhSachThongBao,
  demThongBao,
  timTheoIdCuaNguoiDung,
  danhDauDaDoc,
  danhDauTatCaDaDoc
};
