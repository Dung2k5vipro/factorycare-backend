const { pool } = require("../config/database");
const TRANG_THAI_KE_HOACH_BAO_TRI = require("../constants/trang_thai_ke_hoach_bao_tri");
const TRANG_THAI_NGUOI_DUNG = require("../constants/trang_thai_nguoi_dung");
const TRANG_THAI_THIET_BI = require("../constants/trang_thai_thiet_bi");
const VAI_TRO = require("../constants/vai_tro");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectKeHoachBaoTri() {
  return `
    SELECT
      khbt.id,
      khbt.thiet_bi_id,
      khbt.mau_checklist_id,
      khbt.ky_thuat_vien_id,
      khbt.gia_tri_chu_ky,
      khbt.don_vi_chu_ky,
      khbt.ngay_bat_dau,
      khbt.ngay_bao_tri_tiep_theo,
      khbt.trang_thai,
      khbt.mo_ta,
      khbt.ngay_tao,
      khbt.ngay_cap_nhat,
      tb.ma_thiet_bi,
      tb.ten_thiet_bi,
      tb.trang_thai AS thiet_bi_trang_thai,
      mc.ten_mau AS mau_checklist_ten,
      mc.trang_thai AS mau_checklist_trang_thai,
      ktv.ho_ten AS ky_thuat_vien_ho_ten,
      ktv.email AS ky_thuat_vien_email,
      ktv.trang_thai AS ky_thuat_vien_trang_thai
    FROM ke_hoach_bao_tri khbt
    INNER JOIN thiet_bi tb ON tb.id = khbt.thiet_bi_id
    INNER JOIN mau_checklist mc ON mc.id = khbt.mau_checklist_id
    LEFT JOIN nguoi_dung ktv ON ktv.id = khbt.ky_thuat_vien_id
  `;
}

function taoDieuKienLoc({
  trangThai = null,
  thietBiId = null,
  kyThuatVienId = null
}) {
  const danhSachDieuKien = [];
  const thamSo = [];

  if (trangThai) {
    danhSachDieuKien.push("khbt.trang_thai = ?");
    thamSo.push(trangThai);
  }

  if (thietBiId) {
    danhSachDieuKien.push("khbt.thiet_bi_id = ?");
    thamSo.push(thietBiId);
  }

  if (kyThuatVienId) {
    danhSachDieuKien.push("khbt.ky_thuat_vien_id = ?");
    thamSo.push(kyThuatVienId);
  }

  return {
    dieuKien: danhSachDieuKien.length > 0
      ? `WHERE ${danhSachDieuKien.join(" AND ")}`
      : "",
    thamSo
  };
}

async function layDanhSachKeHoach({
  trangThai = null,
  thietBiId = null,
  kyThuatVienId = null,
  gioiHan,
  boQua
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    trangThai,
    thietBiId,
    kyThuatVienId
  });
  const [rows] = await pool.execute(
    `
      ${taoCauSelectKeHoachBaoTri()}
      ${dieuKien}
      ORDER BY khbt.ngay_bao_tri_tiep_theo ASC, khbt.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongKeHoach({
  trangThai = null,
  thietBiId = null,
  kyThuatVienId = null
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    trangThai,
    thietBiId,
    kyThuatVienId
  });
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM ke_hoach_bao_tri khbt
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
      ${taoCauSelectKeHoachBaoTri()}
      WHERE khbt.id = ?
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
        thiet_bi_id,
        mau_checklist_id,
        ky_thuat_vien_id,
        gia_tri_chu_ky,
        don_vi_chu_ky,
        ngay_bat_dau,
        ngay_bao_tri_tiep_theo,
        trang_thai,
        mo_ta,
        ngay_tao,
        ngay_cap_nhat
      FROM ke_hoach_bao_tri
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function taoKeHoach(connection, {
  thietBiId,
  mauChecklistId,
  kyThuatVienId = null,
  giaTriChuKy,
  donViChuKy,
  ngayBatDau,
  ngayBaoTriTiepTheo,
  moTa = null
}) {
  const [ketQua] = await connection.execute(
    `
      INSERT INTO ke_hoach_bao_tri (
        thiet_bi_id,
        mau_checklist_id,
        ky_thuat_vien_id,
        gia_tri_chu_ky,
        don_vi_chu_ky,
        ngay_bat_dau,
        ngay_bao_tri_tiep_theo,
        mo_ta
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      thietBiId,
      mauChecklistId,
      kyThuatVienId,
      giaTriChuKy,
      donViChuKy,
      ngayBatDau,
      ngayBaoTriTiepTheo,
      moTa
    ]
  );

  return ketQua.insertId;
}

async function capNhatKeHoach(connection, id, {
  mauChecklistId,
  giaTriChuKy,
  donViChuKy,
  ngayBatDau,
  ngayBaoTriTiepTheo,
  moTa
}) {
  const [ketQua] = await connection.execute(
    `
      UPDATE ke_hoach_bao_tri
      SET
        mau_checklist_id = ?,
        gia_tri_chu_ky = ?,
        don_vi_chu_ky = ?,
        ngay_bat_dau = ?,
        ngay_bao_tri_tiep_theo = ?,
        mo_ta = ?
      WHERE id = ?
    `,
    [
      mauChecklistId,
      giaTriChuKy,
      donViChuKy,
      ngayBatDau,
      ngayBaoTriTiepTheo,
      moTa,
      id
    ]
  );

  return ketQua.affectedRows;
}

async function ngungHoatDongKeHoach(connection, id) {
  const [ketQua] = await connection.execute(
    `
      UPDATE ke_hoach_bao_tri
      SET trang_thai = ?
      WHERE id = ?
        AND trang_thai = ?
    `,
    [
      TRANG_THAI_KE_HOACH_BAO_TRI.NGUNG_HOAT_DONG,
      id,
      TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG
    ]
  );

  return ketQua.affectedRows;
}

async function phanCongKyThuatVien(connection, id, kyThuatVienId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE ke_hoach_bao_tri
      SET ky_thuat_vien_id = ?
      WHERE id = ?
        AND trang_thai = ?
    `,
    [kyThuatVienId, id, TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG]
  );

  return ketQua.affectedRows;
}

async function capNhatNgayBaoTriTiepTheo(
  connection,
  keHoachBaoTriId,
  thoiGianHoanThanh
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE ke_hoach_bao_tri
      SET ngay_bao_tri_tiep_theo = CASE don_vi_chu_ky
        WHEN 'NGAY' THEN DATE_ADD(DATE(?), INTERVAL gia_tri_chu_ky DAY)
        WHEN 'TUAN' THEN DATE_ADD(DATE(?), INTERVAL gia_tri_chu_ky WEEK)
        WHEN 'THANG' THEN DATE_ADD(DATE(?), INTERVAL gia_tri_chu_ky MONTH)
        WHEN 'NAM' THEN DATE_ADD(DATE(?), INTERVAL gia_tri_chu_ky YEAR)
        ELSE ngay_bao_tri_tiep_theo
      END
      WHERE id = ?
    `,
    [
      thoiGianHoanThanh,
      thoiGianHoanThanh,
      thoiGianHoanThanh,
      thoiGianHoanThanh,
      keHoachBaoTriId
    ]
  );

  return ketQua.affectedRows;
}

async function layDanhSachSapDenHan({
  soNgay,
  kyThuatVienId = null,
  khoaDeCapNhat = false
}, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const dieuKienKyThuatVien = kyThuatVienId ? "AND khbt.ky_thuat_vien_id = ?" : "";
  const thamSo = [
    TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG,
    soNgay,
    TRANG_THAI_THIET_BI.THANH_LY
  ];

  if (kyThuatVienId) {
    thamSo.push(kyThuatVienId);
  }

  const khoaCapNhat = khoaDeCapNhat ? "FOR UPDATE" : "";
  const [rows] = await boThucThi.execute(
    `
      SELECT
        khbt.id,
        khbt.thiet_bi_id,
        khbt.ky_thuat_vien_id,
        khbt.gia_tri_chu_ky,
        khbt.don_vi_chu_ky,
        khbt.ngay_bao_tri_tiep_theo,
        khbt.trang_thai,
        DATEDIFF(khbt.ngay_bao_tri_tiep_theo, CURRENT_DATE) AS so_ngay_con_lai,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        tb.trang_thai AS thiet_bi_trang_thai,
        ktv.ho_ten AS ky_thuat_vien_ho_ten,
        ktv.email AS ky_thuat_vien_email
      FROM ke_hoach_bao_tri khbt
      INNER JOIN thiet_bi tb ON tb.id = khbt.thiet_bi_id
      LEFT JOIN nguoi_dung ktv ON ktv.id = khbt.ky_thuat_vien_id
      WHERE khbt.trang_thai = ?
        AND khbt.ngay_bao_tri_tiep_theo >= CURRENT_DATE
        AND khbt.ngay_bao_tri_tiep_theo <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
        AND tb.trang_thai <> ?
        ${dieuKienKyThuatVien}
      ORDER BY khbt.ngay_bao_tri_tiep_theo ASC, khbt.id ASC
      ${khoaCapNhat}
    `,
    thamSo
  );

  return rows;
}

async function layDanhSachSapDenHanDeThongBao(soNgay, connection) {
  const [rows] = await connection.execute(
    `
      SELECT
        khbt.id,
        khbt.ky_thuat_vien_id,
        khbt.ngay_bao_tri_tiep_theo,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        ktv.ho_ten AS ky_thuat_vien_ho_ten
      FROM ke_hoach_bao_tri khbt
      INNER JOIN thiet_bi tb ON tb.id = khbt.thiet_bi_id
      INNER JOIN nguoi_dung ktv ON ktv.id = khbt.ky_thuat_vien_id
      WHERE khbt.trang_thai = ?
        AND khbt.ngay_bao_tri_tiep_theo >= CURRENT_DATE
        AND khbt.ngay_bao_tri_tiep_theo <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
        AND tb.trang_thai <> ?
        AND ktv.vai_tro = ?
        AND ktv.trang_thai = ?
      ORDER BY khbt.id ASC
      FOR UPDATE
    `,
    [
      TRANG_THAI_KE_HOACH_BAO_TRI.HOAT_DONG,
      soNgay,
      TRANG_THAI_THIET_BI.THANH_LY,
      VAI_TRO.KY_THUAT_VIEN,
      TRANG_THAI_NGUOI_DUNG.HOAT_DONG
    ]
  );

  return rows;
}

module.exports = {
  layDanhSachKeHoach,
  demTongKeHoach,
  timTheoId,
  timTheoIdDeCapNhat,
  taoKeHoach,
  capNhatKeHoach,
  ngungHoatDongKeHoach,
  phanCongKyThuatVien,
  capNhatNgayBaoTriTiepTheo,
  layDanhSachSapDenHan,
  layDanhSachSapDenHanDeThongBao
};
