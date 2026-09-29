const { pool } = require("../config/database");
const TRANG_THAI_MAU_CHECKLIST = require("../constants/trang_thai_mau_checklist");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectMauChecklist() {
  return `
    SELECT
      mc.id,
      mc.ten_mau,
      mc.loai_thiet_bi_id,
      mc.danh_sach_hang_muc,
      mc.mo_ta,
      mc.trang_thai,
      mc.nguoi_tao_id,
      mc.ngay_tao,
      mc.ngay_cap_nhat,
      ltb.ten_loai AS loai_thiet_bi_ten,
      nd.ho_ten AS nguoi_tao_ho_ten
    FROM mau_checklist mc
    LEFT JOIN loai_thiet_bi ltb ON ltb.id = mc.loai_thiet_bi_id
    LEFT JOIN nguoi_dung nd ON nd.id = mc.nguoi_tao_id
  `;
}

function taoDieuKienLoc({ trangThai = null, loaiThietBiId = null }) {
  const danhSachDieuKien = [];
  const thamSo = [];

  if (trangThai) {
    danhSachDieuKien.push("mc.trang_thai = ?");
    thamSo.push(trangThai);
  }

  if (loaiThietBiId) {
    danhSachDieuKien.push("mc.loai_thiet_bi_id = ?");
    thamSo.push(loaiThietBiId);
  }

  return {
    dieuKien: danhSachDieuKien.length > 0
      ? `WHERE ${danhSachDieuKien.join(" AND ")}`
      : "",
    thamSo
  };
}

async function layDanhSachMauChecklist({
  trangThai = null,
  loaiThietBiId = null,
  gioiHan,
  boQua
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    trangThai,
    loaiThietBiId
  });
  const [rows] = await pool.execute(
    `
      ${taoCauSelectMauChecklist()}
      ${dieuKien}
      ORDER BY mc.ngay_tao DESC, mc.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongMauChecklist({
  trangThai = null,
  loaiThietBiId = null
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    trangThai,
    loaiThietBiId
  });
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM mau_checklist mc
      ${dieuKien}
    `,
    thamSo
  );

  return Number(rows[0].tong) || 0;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectMauChecklist()}
      WHERE mc.id = ?
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
        ten_mau,
        loai_thiet_bi_id,
        danh_sach_hang_muc,
        mo_ta,
        trang_thai,
        nguoi_tao_id,
        ngay_tao,
        ngay_cap_nhat
      FROM mau_checklist
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function taoMauChecklist(connection, {
  tenMau,
  loaiThietBiId = null,
  danhSachHangMuc,
  moTa = null,
  nguoiTaoId
}) {
  const [ketQua] = await connection.execute(
    `
      INSERT INTO mau_checklist (
        ten_mau,
        loai_thiet_bi_id,
        danh_sach_hang_muc,
        mo_ta,
        nguoi_tao_id
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      tenMau,
      loaiThietBiId,
      JSON.stringify(danhSachHangMuc),
      moTa,
      nguoiTaoId
    ]
  );

  return ketQua.insertId;
}

async function capNhatMauChecklist(connection, id, {
  tenMau,
  loaiThietBiId,
  danhSachHangMuc,
  moTa
}) {
  const [ketQua] = await connection.execute(
    `
      UPDATE mau_checklist
      SET
        ten_mau = ?,
        loai_thiet_bi_id = ?,
        danh_sach_hang_muc = ?,
        mo_ta = ?
      WHERE id = ?
    `,
    [
      tenMau,
      loaiThietBiId,
      JSON.stringify(danhSachHangMuc),
      moTa,
      id
    ]
  );

  return ketQua.affectedRows;
}

async function ngungHoatDongMauChecklist(connection, id) {
  const [ketQua] = await connection.execute(
    `
      UPDATE mau_checklist
      SET trang_thai = ?
      WHERE id = ?
        AND trang_thai = ?
    `,
    [
      TRANG_THAI_MAU_CHECKLIST.NGUNG_HOAT_DONG,
      id,
      TRANG_THAI_MAU_CHECKLIST.HOAT_DONG
    ]
  );

  return ketQua.affectedRows;
}

module.exports = {
  layDanhSachMauChecklist,
  demTongMauChecklist,
  timTheoId,
  timTheoIdDeCapNhat,
  taoMauChecklist,
  capNhatMauChecklist,
  ngungHoatDongMauChecklist
};
