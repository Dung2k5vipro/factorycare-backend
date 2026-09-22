const { pool } = require("../config/database");

function taoDieuKienThoiGian(cotThoiGian, { tuNgay, denNgay }) {
  const danhSachDieuKien = [];
  const thamSo = [];

  if (tuNgay) {
    danhSachDieuKien.push(`${cotThoiGian} >= ?`);
    thamSo.push(`${tuNgay} 00:00:00`);
  }

  if (denNgay) {
    danhSachDieuKien.push(`${cotThoiGian} < DATE_ADD(?, INTERVAL 1 DAY)`);
    thamSo.push(`${denNgay} 00:00:00`);
  }

  return { danhSachDieuKien, thamSo };
}

async function layTongQuanThietBi() {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS tong_ho_so_thiet_bi,
      SUM(trang_thai <> 'THANH_LY') AS tong_thiet_bi_dang_quan_ly,
      SUM(trang_thai = 'DANG_HOAT_DONG') AS so_dang_hoat_dong,
      SUM(trang_thai = 'DANG_BAO_TRI') AS so_dang_bao_tri,
      SUM(trang_thai = 'DANG_HONG') AS so_dang_hong,
      SUM(trang_thai = 'NGUNG_HOAT_DONG') AS so_ngung_hoat_dong,
      SUM(trang_thai = 'THANH_LY') AS so_thanh_ly
    FROM thiet_bi
  `);

  return rows[0];
}

async function layTongQuanSuCoHienTai() {
  const [rows] = await pool.execute(`
    SELECT
      SUM(trang_thai IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')) AS so_su_co_mo,
      SUM(
        muc_do = 'NGHIEM_TRONG'
        AND trang_thai IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')
      ) AS so_su_co_nghiem_trong_mo
    FROM su_co
  `);

  return rows[0];
}

async function layThoiGianXuLySuCoTrungBinh({ tuNgay, denNgay }) {
  const { danhSachDieuKien, thamSo } = taoDieuKienThoiGian(
    "thoi_gian_bao",
    { tuNgay, denNgay }
  );
  const dieuKienThoiGian = danhSachDieuKien.length > 0
    ? `AND ${danhSachDieuKien.join(" AND ")}`
    : "";
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS so_su_co_duoc_tinh,
        AVG(TIMESTAMPDIFF(MINUTE, thoi_gian_bao, thoi_gian_hoan_thanh))
          AS thoi_gian_xu_ly_trung_binh_phut
      FROM su_co
      WHERE trang_thai = 'DA_XU_LY'
        AND thoi_gian_bao IS NOT NULL
        AND thoi_gian_hoan_thanh IS NOT NULL
        ${dieuKienThoiGian}
    `,
    thamSo
  );

  return rows[0];
}

async function layTongQuanBaoTri(soNgayCanhBao) {
  const [rows] = await pool.execute(
    `
      SELECT
        (
          SELECT COUNT(*)
          FROM ke_hoach_bao_tri khbt
          INNER JOIN thiet_bi tb ON tb.id = khbt.thiet_bi_id
          WHERE khbt.trang_thai = 'HOAT_DONG'
            AND khbt.ngay_bao_tri_tiep_theo >= CURRENT_DATE
            AND khbt.ngay_bao_tri_tiep_theo
              <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
            AND tb.trang_thai <> 'THANH_LY'
        ) AS so_bao_tri_sap_den_han,
        (
          SELECT COUNT(*)
          FROM phieu_bao_tri pbt
          WHERE pbt.ngay_du_kien < CURRENT_TIMESTAMP
            AND pbt.trang_thai IN ('CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN')
        ) AS so_bao_tri_qua_han
    `,
    [soNgayCanhBao]
  );

  return rows[0];
}

async function layThietBiTheoTrangThai() {
  const [rows] = await pool.execute(`
    SELECT trang_thai, COUNT(*) AS so_luong
    FROM thiet_bi
    GROUP BY trang_thai
    ORDER BY FIELD(
      trang_thai,
      'DANG_HOAT_DONG',
      'DANG_BAO_TRI',
      'DANG_HONG',
      'NGUNG_HOAT_DONG',
      'THANH_LY'
    )
  `);

  return rows;
}

async function laySuCoTheoMucDo({ tuNgay, denNgay }) {
  const { danhSachDieuKien, thamSo } = taoDieuKienThoiGian(
    "thoi_gian_bao",
    { tuNgay, denNgay }
  );
  const dieuKien = danhSachDieuKien.length > 0
    ? `WHERE ${danhSachDieuKien.join(" AND ")}`
    : "";
  const [rows] = await pool.execute(
    `
      SELECT muc_do, COUNT(*) AS so_luong
      FROM su_co
      ${dieuKien}
      GROUP BY muc_do
      ORDER BY FIELD(muc_do, 'NGHIEM_TRONG', 'CAO', 'TRUNG_BINH', 'THAP')
    `,
    thamSo
  );

  return rows;
}

async function laySuCoTheoThoiGian({ tuNgay, denNgay }) {
  const { danhSachDieuKien, thamSo } = taoDieuKienThoiGian(
    "thoi_gian_bao",
    { tuNgay, denNgay }
  );
  const dieuKien = danhSachDieuKien.length > 0
    ? `WHERE ${danhSachDieuKien.join(" AND ")}`
    : "";
  const [rows] = await pool.execute(
    `
      SELECT DATE(thoi_gian_bao) AS ngay, COUNT(*) AS so_luong
      FROM su_co
      ${dieuKien}
      GROUP BY DATE(thoi_gian_bao)
      ORDER BY ngay ASC
    `,
    thamSo
  );

  return rows;
}

async function layBaoTriTheoTrangThai() {
  const [rows] = await pool.execute(`
    SELECT trang_thai, COUNT(*) AS so_luong
    FROM phieu_bao_tri
    GROUP BY trang_thai
    ORDER BY FIELD(
      trang_thai,
      'CHO_THUC_HIEN',
      'DANG_THUC_HIEN',
      'QUA_HAN',
      'HOAN_THANH',
      'DA_HUY'
    )
  `);

  return rows;
}

async function layTopThietBiNhieuSuCo({ tuNgay, denNgay, gioiHan }) {
  const { danhSachDieuKien, thamSo } = taoDieuKienThoiGian(
    "sc.thoi_gian_bao",
    { tuNgay, denNgay }
  );
  const dieuKien = danhSachDieuKien.length > 0
    ? `WHERE ${danhSachDieuKien.join(" AND ")}`
    : "";
  const [rows] = await pool.execute(
    `
      SELECT
        tb.id,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        tb.trang_thai,
        COUNT(sc.id) AS so_su_co
      FROM su_co sc
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      ${dieuKien}
      GROUP BY tb.id, tb.ma_thiet_bi, tb.ten_thiet_bi, tb.trang_thai
      ORDER BY so_su_co DESC, tb.id ASC
      LIMIT ?
    `,
    [...thamSo, gioiHan]
  );

  return rows;
}

async function laySuCoCanChuY(gioiHan) {
  const [rows] = await pool.execute(
    `
      SELECT
        sc.id,
        sc.ma_su_co,
        sc.tieu_de,
        sc.muc_do,
        sc.trang_thai,
        sc.thoi_gian_bao,
        tb.id AS thiet_bi_id,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi
      FROM su_co sc
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      WHERE sc.muc_do = 'NGHIEM_TRONG'
        AND sc.trang_thai IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')
      ORDER BY sc.thoi_gian_bao ASC, sc.id ASC
      LIMIT ?
    `,
    [gioiHan]
  );

  return rows;
}

async function layBaoTriQuaHanCanChuY(gioiHan) {
  const [rows] = await pool.execute(
    `
      SELECT
        pbt.id,
        pbt.ke_hoach_bao_tri_id,
        pbt.ngay_du_kien,
        pbt.trang_thai,
        DATEDIFF(CURRENT_DATE, DATE(pbt.ngay_du_kien)) AS so_ngay_qua_han,
        tb.id AS thiet_bi_id,
        tb.ma_thiet_bi,
        tb.ten_thiet_bi,
        ktv.id AS ky_thuat_vien_id,
        ktv.ho_ten AS ky_thuat_vien_ho_ten
      FROM phieu_bao_tri pbt
      INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id
      LEFT JOIN nguoi_dung ktv ON ktv.id = pbt.ky_thuat_vien_id
      WHERE pbt.ngay_du_kien < CURRENT_TIMESTAMP
        AND pbt.trang_thai IN ('CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN')
      ORDER BY pbt.ngay_du_kien ASC, pbt.id ASC
      LIMIT ?
    `,
    [gioiHan]
  );

  return rows;
}

module.exports = {
  layTongQuanThietBi,
  layTongQuanSuCoHienTai,
  layThoiGianXuLySuCoTrungBinh,
  layTongQuanBaoTri,
  layThietBiTheoTrangThai,
  laySuCoTheoMucDo,
  laySuCoTheoThoiGian,
  layBaoTriTheoTrangThai,
  layTopThietBiNhieuSuCo,
  laySuCoCanChuY,
  layBaoTriQuaHanCanChuY
};
