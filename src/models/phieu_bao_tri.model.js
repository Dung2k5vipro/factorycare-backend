const { pool } = require("../config/database");
const TRANG_THAI_PHIEU_BAO_TRI = require("../constants/trang_thai_phieu_bao_tri");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const VAI_TRO = require("../constants/vai_tro");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectPhieuBaoTri() {
  return `
    SELECT
      pbt.id,
      pbt.ke_hoach_bao_tri_id,
      pbt.thiet_bi_id,
      pbt.ky_thuat_vien_id,
      pbt.ngay_du_kien,
      pbt.thoi_gian_bat_dau,
      pbt.thoi_gian_hoan_thanh,
      pbt.trang_thai,
      pbt.ket_qua_checklist,
      pbt.linh_kien_thay_the,
      pbt.ket_qua_bao_tri,
      pbt.ghi_chu,
      pbt.ngay_tao,
      pbt.ngay_cap_nhat,
      khbt.gia_tri_chu_ky,
      khbt.don_vi_chu_ky,
      khbt.ngay_bao_tri_tiep_theo,
      khbt.trang_thai AS ke_hoach_trang_thai,
      mc.ten_mau AS mau_checklist_ten,
      tb.ma_thiet_bi,
      tb.ten_thiet_bi,
      tb.trang_thai AS thiet_bi_trang_thai,
      ktv.ho_ten AS ky_thuat_vien_ho_ten,
      ktv.email AS ky_thuat_vien_email
    FROM phieu_bao_tri pbt
    INNER JOIN ke_hoach_bao_tri khbt ON khbt.id = pbt.ke_hoach_bao_tri_id
    INNER JOIN mau_checklist mc ON mc.id = khbt.mau_checklist_id
    INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id
    LEFT JOIN nguoi_dung ktv ON ktv.id = pbt.ky_thuat_vien_id
  `;
}

function taoDieuKienLoc({
  trangThai = null,
  thietBiId = null,
  kyThuatVienId = null,
  tuNgay = null,
  denNgay = null
}) {
  const danhSachDieuKien = [];
  const thamSo = [];

  if (trangThai) {
    danhSachDieuKien.push("pbt.trang_thai = ?");
    thamSo.push(trangThai);
  }

  if (thietBiId) {
    danhSachDieuKien.push("pbt.thiet_bi_id = ?");
    thamSo.push(thietBiId);
  }

  if (kyThuatVienId) {
    danhSachDieuKien.push("pbt.ky_thuat_vien_id = ?");
    thamSo.push(kyThuatVienId);
  }

  if (tuNgay) {
    danhSachDieuKien.push("pbt.ngay_du_kien >= ?");
    thamSo.push(`${tuNgay} 00:00:00`);
  }

  if (denNgay) {
    danhSachDieuKien.push("pbt.ngay_du_kien < DATE_ADD(?, INTERVAL 1 DAY)");
    thamSo.push(`${denNgay} 00:00:00`);
  }

  return {
    dieuKien: danhSachDieuKien.length > 0
      ? `WHERE ${danhSachDieuKien.join(" AND ")}`
      : "",
    thamSo
  };
}

async function layDanhSachPhieu({
  trangThai = null,
  thietBiId = null,
  kyThuatVienId = null,
  tuNgay = null,
  denNgay = null,
  gioiHan,
  boQua
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    trangThai,
    thietBiId,
    kyThuatVienId,
    tuNgay,
    denNgay
  });
  const [rows] = await pool.execute(
    `
      ${taoCauSelectPhieuBaoTri()}
      ${dieuKien}
      ORDER BY pbt.ngay_du_kien DESC, pbt.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongPhieu({
  trangThai = null,
  thietBiId = null,
  kyThuatVienId = null,
  tuNgay = null,
  denNgay = null
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    trangThai,
    thietBiId,
    kyThuatVienId,
    tuNgay,
    denNgay
  });
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM phieu_bao_tri pbt
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
      ${taoCauSelectPhieuBaoTri()}
      WHERE pbt.id = ?
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
        pbt.id,
        pbt.ke_hoach_bao_tri_id,
        pbt.thiet_bi_id,
        pbt.ky_thuat_vien_id,
        pbt.ngay_du_kien,
        pbt.thoi_gian_bat_dau,
        pbt.thoi_gian_hoan_thanh,
        pbt.trang_thai,
        pbt.ket_qua_checklist,
        pbt.linh_kien_thay_the,
        pbt.ket_qua_bao_tri,
        pbt.ghi_chu,
        mc.danh_sach_hang_muc
      FROM phieu_bao_tri pbt
      INNER JOIN ke_hoach_bao_tri khbt ON khbt.id = pbt.ke_hoach_bao_tri_id
      INNER JOIN mau_checklist mc ON mc.id = khbt.mau_checklist_id
      WHERE pbt.id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function timPhieuChuaKetThucTheoKeHoachDeCapNhat(
  keHoachBaoTriId,
  connection
) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        ke_hoach_bao_tri_id,
        thiet_bi_id,
        ky_thuat_vien_id,
        ngay_du_kien,
        thoi_gian_bat_dau,
        trang_thai,
        ket_qua_checklist
      FROM phieu_bao_tri
      WHERE ke_hoach_bao_tri_id = ?
        AND trang_thai IN (?, ?, ?)
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
    `,
    [
      keHoachBaoTriId,
      TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN,
      TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN,
      TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN
    ]
  );

  return rows[0] || null;
}

async function taoPhieuBaoTri(connection, {
  keHoachBaoTriId,
  thietBiId,
  kyThuatVienId,
  ngayDuKien,
  ketQuaChecklist
}) {
  const [ketQua] = await connection.execute(
    `
      INSERT INTO phieu_bao_tri (
        ke_hoach_bao_tri_id,
        thiet_bi_id,
        ky_thuat_vien_id,
        ngay_du_kien,
        ket_qua_checklist
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      keHoachBaoTriId,
      thietBiId,
      kyThuatVienId,
      ngayDuKien,
      JSON.stringify(ketQuaChecklist)
    ]
  );

  return ketQua.insertId;
}

async function capNhatPhanCongPhieu(connection, id, kyThuatVienId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET ky_thuat_vien_id = ?
      WHERE id = ?
        AND trang_thai IN (?, ?)
    `,
    [
      kyThuatVienId,
      id,
      TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN,
      TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN
    ]
  );

  return ketQua.affectedRows;
}

async function capNhatNgayDuKienTheoKeHoach(
  connection,
  keHoachBaoTriId,
  ngayDuKien
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET ngay_du_kien = ?
      WHERE ke_hoach_bao_tri_id = ?
        AND trang_thai IN (?, ?)
    `,
    [
      ngayDuKien,
      keHoachBaoTriId,
      TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN,
      TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN
    ]
  );

  return ketQua.affectedRows;
}

async function layLichSuPhanCongTheoKeHoach(keHoachBaoTriId) {
  const [rows] = await pool.execute(
    `
      SELECT
        pbt.id,
        pbt.ke_hoach_bao_tri_id,
        pbt.ky_thuat_vien_id,
        pbt.ngay_du_kien,
        pbt.trang_thai,
        pbt.thoi_gian_bat_dau,
        pbt.thoi_gian_hoan_thanh,
        pbt.ngay_tao,
        pbt.ngay_cap_nhat,
        ktv.ho_ten AS ky_thuat_vien_ho_ten,
        ktv.email AS ky_thuat_vien_email
      FROM phieu_bao_tri pbt
      LEFT JOIN nguoi_dung ktv ON ktv.id = pbt.ky_thuat_vien_id
      WHERE pbt.ke_hoach_bao_tri_id = ?
      ORDER BY pbt.ngay_tao DESC, pbt.id DESC
    `,
    [keHoachBaoTriId]
  );

  return rows;
}

async function batDauBaoTri(connection, phieuBaoTriId, kyThuatVienId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET
        trang_thai = ?,
        thoi_gian_bat_dau = CURRENT_TIMESTAMP
      WHERE id = ?
        AND ky_thuat_vien_id = ?
        AND trang_thai IN (?, ?)
        AND thoi_gian_bat_dau IS NULL
    `,
    [
      TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN,
      phieuBaoTriId,
      kyThuatVienId,
      TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN,
      TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN
    ]
  );

  return ketQua.affectedRows;
}

async function khoiTaoChecklist(
  connection,
  phieuBaoTriId,
  danhSachHangMuc
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET ket_qua_checklist = ?
      WHERE id = ?
        AND ket_qua_checklist IS NULL
    `,
    [JSON.stringify(danhSachHangMuc), phieuBaoTriId]
  );

  return ketQua.affectedRows;
}

async function capNhatChecklist(
  connection,
  phieuBaoTriId,
  kyThuatVienId,
  ketQuaChecklist
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET ket_qua_checklist = ?
      WHERE id = ?
        AND ky_thuat_vien_id = ?
        AND trang_thai = ?
    `,
    [
      JSON.stringify(ketQuaChecklist),
      phieuBaoTriId,
      kyThuatVienId,
      TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN
    ]
  );

  return ketQua.affectedRows;
}

async function capNhatKetQua(
  connection,
  phieuBaoTriId,
  kyThuatVienId,
  { linhKienThayThe, ketQuaBaoTri, ghiChu }
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET
        linh_kien_thay_the = ?,
        ket_qua_bao_tri = ?,
        ghi_chu = ?
      WHERE id = ?
        AND ky_thuat_vien_id = ?
        AND trang_thai = ?
    `,
    [
      linhKienThayThe === null ? null : JSON.stringify(linhKienThayThe),
      ketQuaBaoTri,
      ghiChu,
      phieuBaoTriId,
      kyThuatVienId,
      TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN
    ]
  );

  return ketQua.affectedRows;
}

async function hoanThanhBaoTri(
  connection,
  phieuBaoTriId,
  kyThuatVienId,
  {
    ketQuaChecklist,
    linhKienThayThe,
    ketQuaBaoTri,
    ghiChu,
    thoiGianHoanThanh
  }
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET
        ket_qua_checklist = ?,
        linh_kien_thay_the = ?,
        ket_qua_bao_tri = ?,
        ghi_chu = ?,
        trang_thai = ?,
        thoi_gian_hoan_thanh = ?
      WHERE id = ?
        AND ky_thuat_vien_id = ?
        AND trang_thai = ?
        AND thoi_gian_hoan_thanh IS NULL
    `,
    [
      JSON.stringify(ketQuaChecklist),
      linhKienThayThe === null ? null : JSON.stringify(linhKienThayThe),
      ketQuaBaoTri,
      ghiChu,
      TRANG_THAI_PHIEU_BAO_TRI.HOAN_THANH,
      thoiGianHoanThanh,
      phieuBaoTriId,
      kyThuatVienId,
      TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN
    ]
  );

  return ketQua.affectedRows;
}

async function layThoiGianHienTai(connection) {
  const [rows] = await connection.execute(
    "SELECT CURRENT_TIMESTAMP AS thoi_gian_hien_tai"
  );

  return rows[0].thoi_gian_hien_tai;
}

async function layDanhSachQuaHan(kyThuatVienId = null) {
  const dieuKienKyThuatVien = kyThuatVienId
    ? "AND pbt.ky_thuat_vien_id = ?"
    : "";
  const thamSo = [
    TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN,
    TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN,
    TRANG_THAI_PHIEU_BAO_TRI.DANG_THUC_HIEN
  ];

  if (kyThuatVienId) {
    thamSo.push(kyThuatVienId);
  }

  const [rows] = await pool.execute(
    `
      SELECT
        pbt.id,
        pbt.ke_hoach_bao_tri_id,
        pbt.thiet_bi_id,
        pbt.ky_thuat_vien_id,
        pbt.ngay_du_kien,
        pbt.trang_thai,
        DATEDIFF(CURRENT_DATE, DATE(pbt.ngay_du_kien)) AS so_ngay_qua_han,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        ktv.ho_ten AS ky_thuat_vien_ho_ten,
        ktv.email AS ky_thuat_vien_email
      FROM phieu_bao_tri pbt
      INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id
      LEFT JOIN nguoi_dung ktv ON ktv.id = pbt.ky_thuat_vien_id
      WHERE pbt.ngay_du_kien < CURRENT_TIMESTAMP
        AND pbt.trang_thai IN (?, ?, ?)
        ${dieuKienKyThuatVien}
      ORDER BY pbt.ngay_du_kien ASC, pbt.id ASC
    `,
    thamSo
  );

  return rows;
}

async function layDanhSachChoQuaHanDeCapNhat(connection) {
  const [rows] = await connection.execute(
    `
      SELECT
        pbt.id,
        pbt.ky_thuat_vien_id,
        pbt.ngay_du_kien,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        ktv.ho_ten AS ky_thuat_vien_ho_ten,
        ktv.vai_tro AS ky_thuat_vien_vai_tro,
        ktv.trang_thai AS ky_thuat_vien_trang_thai
      FROM phieu_bao_tri pbt
      INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id
      LEFT JOIN nguoi_dung ktv ON ktv.id = pbt.ky_thuat_vien_id
      WHERE pbt.ngay_du_kien < CURRENT_TIMESTAMP
        AND pbt.trang_thai = ?
      ORDER BY pbt.id ASC
      FOR UPDATE
    `,
    [TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN]
  );

  return rows;
}

async function capNhatQuaHan(connection, phieuBaoTriId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE phieu_bao_tri
      SET trang_thai = ?
      WHERE id = ?
        AND trang_thai = ?
        AND ngay_du_kien < CURRENT_TIMESTAMP
    `,
    [
      TRANG_THAI_PHIEU_BAO_TRI.QUA_HAN,
      phieuBaoTriId,
      TRANG_THAI_PHIEU_BAO_TRI.CHO_THUC_HIEN
    ]
  );

  return ketQua.affectedRows;
}

function laKyThuatVienHoatDong(phieuBaoTri) {
  return Boolean(
    phieuBaoTri.ky_thuat_vien_id &&
    phieuBaoTri.ky_thuat_vien_vai_tro === VAI_TRO.KY_THUAT_VIEN &&
    phieuBaoTri.ky_thuat_vien_trang_thai === TRANG_THAI_NGUOI_DUNG.HOAT_DONG
  );
}

module.exports = {
  layDanhSachPhieu,
  demTongPhieu,
  timTheoId,
  timTheoIdDeCapNhat,
  timPhieuChuaKetThucTheoKeHoachDeCapNhat,
  taoPhieuBaoTri,
  capNhatPhanCongPhieu,
  capNhatNgayDuKienTheoKeHoach,
  layLichSuPhanCongTheoKeHoach,
  batDauBaoTri,
  khoiTaoChecklist,
  capNhatChecklist,
  capNhatKetQua,
  hoanThanhBaoTri,
  layThoiGianHienTai,
  layDanhSachQuaHan,
  layDanhSachChoQuaHanDeCapNhat,
  capNhatQuaHan,
  laKyThuatVienHoatDong
};
