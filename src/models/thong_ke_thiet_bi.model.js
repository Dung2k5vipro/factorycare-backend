const { pool } = require("../config/database");

async function layThongKeSuCoTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_su_co,
        SUM(muc_do = 'THAP') AS so_su_co_thap,
        SUM(muc_do = 'TRUNG_BINH') AS so_su_co_trung_binh,
        SUM(muc_do = 'CAO') AS so_su_co_cao,
        SUM(muc_do = 'NGHIEM_TRONG') AS so_su_co_nghiem_trong,
        SUM(trang_thai IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')) AS so_su_co_dang_mo
      FROM su_co
      WHERE thiet_bi_id = ?
        AND trang_thai <> 'DA_HUY'
    `,
    [thietBiId]
  );

  return rows[0];
}

async function layThongKeSuaChuaTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(hs.id) AS tong_ho_so_sua_chua,
        SUM(hs.ket_qua = 'DA_SUA_XONG') AS so_da_sua_xong,
        SUM(hs.ket_qua = 'SUA_MOT_PHAN') AS so_sua_mot_phan,
        SUM(hs.ket_qua = 'KHONG_SUA_DUOC') AS so_khong_sua_duoc
      FROM ho_so_sua_chua hs
      INNER JOIN su_co sc ON hs.su_co_id = sc.id
      WHERE sc.thiet_bi_id = ?
    `,
    [thietBiId]
  );

  return rows[0];
}

async function layThongKeBaoTriTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_phieu_bao_tri,
        SUM(trang_thai = 'HOAN_THANH') AS so_hoan_thanh,
        SUM(trang_thai = 'QUA_HAN') AS so_qua_han,
        SUM(trang_thai IN ('CHO_THUC_HIEN', 'DANG_THUC_HIEN')) AS so_bao_tri_dang_mo
      FROM phieu_bao_tri
      WHERE thiet_bi_id = ?
        AND trang_thai <> 'DA_HUY'
    `,
    [thietBiId]
  );

  return rows[0];
}

async function laySuKienSuCoTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        ma_su_co,
        tieu_de,
        muc_do,
        trang_thai,
        thoi_gian_bao,
        thoi_gian_hoan_thanh,
        ngay_tao
      FROM su_co
      WHERE thiet_bi_id = ?
      ORDER BY COALESCE(thoi_gian_bao, ngay_tao) DESC, id DESC
    `,
    [thietBiId]
  );

  return rows;
}

async function laySuKienSuaChuaTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        hs.id,
        hs.su_co_id,
        sc.ma_su_co,
        hs.ky_thuat_vien_id,
        nd.ho_ten AS ten_ky_thuat_vien,
        hs.ket_qua,
        hs.thoi_gian_bat_dau,
        hs.thoi_gian_hoan_thanh,
        hs.ngay_tao
      FROM ho_so_sua_chua hs
      INNER JOIN su_co sc ON hs.su_co_id = sc.id
      LEFT JOIN nguoi_dung nd ON hs.ky_thuat_vien_id = nd.id
      WHERE sc.thiet_bi_id = ?
      ORDER BY COALESCE(hs.thoi_gian_hoan_thanh, hs.thoi_gian_bat_dau, hs.ngay_tao) DESC,
               hs.id DESC
    `,
    [thietBiId]
  );

  return rows;
}

async function laySuKienBaoTriTheoThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        pbt.id,
        pbt.ke_hoach_bao_tri_id,
        pbt.ky_thuat_vien_id,
        nd.ho_ten AS ten_ky_thuat_vien,
        pbt.ngay_du_kien,
        pbt.thoi_gian_bat_dau,
        pbt.thoi_gian_hoan_thanh,
        pbt.trang_thai,
        pbt.ket_qua_bao_tri,
        pbt.ngay_tao
      FROM phieu_bao_tri pbt
      LEFT JOIN nguoi_dung nd ON pbt.ky_thuat_vien_id = nd.id
      WHERE pbt.thiet_bi_id = ?
      ORDER BY COALESCE(pbt.thoi_gian_hoan_thanh, pbt.thoi_gian_bat_dau, pbt.ngay_du_kien, pbt.ngay_tao) DESC,
               pbt.id DESC
    `,
    [thietBiId]
  );

  return rows;
}

async function layThongTinLoNhapCuaThietBi(thietBiId) {
  const [rows] = await pool.execute(
    `
      SELECT
        ln.id,
        ln.ma_lo,
        ln.so_hoa_don,
        ln.ngay_nhap,
        ln.tong_gia_tri,
        ncc.id AS nha_cung_cap_id,
        ncc.ten_nha_cung_cap
      FROM thiet_bi tb
      INNER JOIN lo_nhap ln ON tb.lo_nhap_id = ln.id
      LEFT JOIN nha_cung_cap ncc ON ln.nha_cung_cap_id = ncc.id
      WHERE tb.id = ?
      LIMIT 1
    `,
    [thietBiId]
  );

  return rows[0] || null;
}

module.exports = {
  layThongKeSuCoTheoThietBi,
  layThongKeSuaChuaTheoThietBi,
  layThongKeBaoTriTheoThietBi,
  laySuKienSuCoTheoThietBi,
  laySuKienSuaChuaTheoThietBi,
  laySuKienBaoTriTheoThietBi,
  layThongTinLoNhapCuaThietBi
};
