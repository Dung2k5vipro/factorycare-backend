const { pool } = require("../config/database");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectViTri() {
  return `
    SELECT
      vt.id,
      vt.ten_vi_tri,
      vt.loai_vi_tri,
      vt.vi_tri_cha_id,
      vt.mo_ta,
      vt.ngay_tao,
      vt.ngay_cap_nhat,
      vtc.ten_vi_tri AS ten_vi_tri_cha,
      vtc.loai_vi_tri AS loai_vi_tri_cha
    FROM vi_tri vt
    LEFT JOIN vi_tri vtc ON vt.vi_tri_cha_id = vtc.id
  `;
}

function taoDieuKienLoc({ tuKhoa = "", loaiViTri = null, viTriChaId = undefined }) {
  const dieuKien = [];
  const thamSo = [];

  if (tuKhoa) {
    dieuKien.push("(vt.ten_vi_tri LIKE ? OR COALESCE(vt.mo_ta, '') LIKE ?)");
    const tuKhoaTimKiem = `%${tuKhoa}%`;
    thamSo.push(tuKhoaTimKiem, tuKhoaTimKiem);
  }

  if (loaiViTri) {
    dieuKien.push("vt.loai_vi_tri = ?");
    thamSo.push(loaiViTri);
  }

  if (viTriChaId !== undefined) {
    if (viTriChaId === null) {
      dieuKien.push("vt.vi_tri_cha_id IS NULL");
    } else {
      dieuKien.push("vt.vi_tri_cha_id = ?");
      thamSo.push(viTriChaId);
    }
  }

  return {
    where: dieuKien.length ? `WHERE ${dieuKien.join(" AND ")}` : "",
    thamSo
  };
}

async function layDanhSachViTri({
  tuKhoa = "",
  loaiViTri = null,
  viTriChaId = undefined,
  gioiHan = 10,
  boQua = 0
}) {
  const { where, thamSo } = taoDieuKienLoc({ tuKhoa, loaiViTri, viTriChaId });

  const [rows] = await pool.execute(
    `
      ${taoCauSelectViTri()}
      ${where}
      ORDER BY FIELD(vt.loai_vi_tri, 'NHA_MAY', 'XUONG', 'DAY_CHUYEN', 'KHU_VUC'),
               vt.ten_vi_tri ASC,
               vt.id DESC
      LIMIT ?
      OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongViTri({ tuKhoa = "", loaiViTri = null, viTriChaId = undefined }) {
  const { where, thamSo } = taoDieuKienLoc({ tuKhoa, loaiViTri, viTriChaId });

  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM vi_tri vt
      ${where}
    `,
    thamSo
  );

  return rows[0].tong;
}

async function layTatCaViTri() {
  const [rows] = await pool.execute(
    `
      ${taoCauSelectViTri()}
      ORDER BY FIELD(vt.loai_vi_tri, 'NHA_MAY', 'XUONG', 'DAY_CHUYEN', 'KHU_VUC'),
               vt.ten_vi_tri ASC,
               vt.id ASC
    `
  );

  return rows;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectViTri()}
      WHERE vt.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function timDanhSachTheoTen(tenViTri, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectViTri()}
      WHERE vt.ten_vi_tri = ?
      ORDER BY vt.id ASC
    `,
    [tenViTri]
  );

  return rows;
}

async function taoViTri({ tenViTri, loaiViTri, viTriChaId = null, moTa = null }) {
  const [ketQua] = await pool.execute(
    `
      INSERT INTO vi_tri (
        ten_vi_tri,
        loai_vi_tri,
        vi_tri_cha_id,
        mo_ta
      )
      VALUES (?, ?, ?, ?)
    `,
    [tenViTri, loaiViTri, viTriChaId, moTa]
  );

  return timTheoId(ketQua.insertId);
}

async function capNhatViTri(id, { tenViTri, loaiViTri, viTriChaId = null, moTa = null }) {
  const [ketQua] = await pool.execute(
    `
      UPDATE vi_tri
      SET
        ten_vi_tri = ?,
        loai_vi_tri = ?,
        vi_tri_cha_id = ?,
        mo_ta = ?
      WHERE id = ?
    `,
    [tenViTri, loaiViTri, viTriChaId, moTa, id]
  );

  if (ketQua.affectedRows === 0) {
    return null;
  }

  return timTheoId(id);
}

async function xoaViTri(id) {
  const [ketQua] = await pool.execute(
    `
      DELETE FROM vi_tri
      WHERE id = ?
    `,
    [id]
  );

  return ketQua.affectedRows > 0;
}

async function demViTriCon(id) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM vi_tri
      WHERE vi_tri_cha_id = ?
    `,
    [id]
  );

  return rows[0].tong;
}

async function demThietBiTheoViTri(id) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM thiet_bi
      WHERE vi_tri_id = ?
    `,
    [id]
  );

  return rows[0].tong;
}

async function demDieuChuyenTheoViTri(id) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM dieu_chuyen_thiet_bi
      WHERE vi_tri_cu_id = ? OR vi_tri_moi_id = ?
    `,
    [id, id]
  );

  return rows[0].tong;
}

module.exports = {
  layDanhSachViTri,
  demTongViTri,
  layTatCaViTri,
  timTheoId,
  timDanhSachTheoTen,
  taoViTri,
  capNhatViTri,
  xoaViTri,
  demViTriCon,
  demThietBiTheoViTri,
  demDieuChuyenTheoViTri
};
