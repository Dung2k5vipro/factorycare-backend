const { pool } = require("../config/database");
const TRANG_THAI_SU_CO = require("../constants/trang_thai_su_co");

function layBoThucThi(connection) {
  return connection || pool;
}

function taoCauSelectSuCo() {
  return `
    SELECT
      sc.id,
      sc.ma_su_co,
      sc.thiet_bi_id,
      sc.nguoi_bao_id,
      sc.ky_thuat_vien_id,
      sc.tieu_de,
      sc.mo_ta,
      sc.hinh_anh,
      sc.muc_do,
      sc.trang_thai,
      sc.thoi_gian_xay_ra,
      sc.thoi_gian_bao,
      sc.thoi_gian_phan_cong,
      sc.thoi_gian_hoan_thanh,
      sc.ngay_tao,
      sc.ngay_cap_nhat,
      tb.ma_thiet_bi,
      tb.ten_thiet_bi,
      tb.trang_thai AS thiet_bi_trang_thai,
      tb.vi_tri_id,
      vt.ten_vi_tri,
      vt.loai_vi_tri,
      nb.ho_ten AS nguoi_bao_ho_ten,
      nb.email AS nguoi_bao_email,
      nb.so_dien_thoai AS nguoi_bao_so_dien_thoai,
      ktv.ho_ten AS ky_thuat_vien_ho_ten,
      ktv.email AS ky_thuat_vien_email,
      ktv.so_dien_thoai AS ky_thuat_vien_so_dien_thoai,
      ktv.trang_thai AS ky_thuat_vien_trang_thai
    FROM su_co sc
    INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
    LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
    INNER JOIN nguoi_dung nb ON nb.id = sc.nguoi_bao_id
    LEFT JOIN nguoi_dung ktv ON ktv.id = sc.ky_thuat_vien_id
  `;
}

function taoDieuKienLoc({
  tuKhoa = "",
  mucDo = null,
  trangThai = null,
  thietBiId = null,
  nguoiBaoId = null,
  kyThuatVienId = null,
  tuNgay = null,
  denNgay = null
}) {
  let dieuKien = "WHERE 1 = 1";
  const thamSo = [];

  if (tuKhoa) {
    const tuKhoaTimKiem = `%${tuKhoa}%`;
    dieuKien += `
      AND (
        sc.ma_su_co LIKE ?
        OR sc.tieu_de LIKE ?
        OR tb.ma_thiet_bi LIKE ?
        OR tb.ten_thiet_bi LIKE ?
      )
    `;
    thamSo.push(
      tuKhoaTimKiem,
      tuKhoaTimKiem,
      tuKhoaTimKiem,
      tuKhoaTimKiem
    );
  }

  if (mucDo) {
    dieuKien += " AND sc.muc_do = ?";
    thamSo.push(mucDo);
  }

  if (trangThai) {
    dieuKien += " AND sc.trang_thai = ?";
    thamSo.push(trangThai);
  }

  if (thietBiId) {
    dieuKien += " AND sc.thiet_bi_id = ?";
    thamSo.push(thietBiId);
  }

  if (nguoiBaoId) {
    dieuKien += " AND sc.nguoi_bao_id = ?";
    thamSo.push(nguoiBaoId);
  }

  if (kyThuatVienId) {
    dieuKien += " AND sc.ky_thuat_vien_id = ?";
    thamSo.push(kyThuatVienId);
  }

  if (tuNgay) {
    dieuKien += " AND sc.thoi_gian_bao >= ?";
    thamSo.push(tuNgay);
  }

  if (denNgay) {
    dieuKien += " AND sc.thoi_gian_bao < DATE_ADD(?, INTERVAL 1 DAY)";
    thamSo.push(denNgay);
  }

  return { dieuKien, thamSo };
}

function taoCauSapXep() {
  return `
    ORDER BY
      CASE sc.muc_do
        WHEN 'NGHIEM_TRONG' THEN 1
        WHEN 'CAO' THEN 2
        WHEN 'TRUNG_BINH' THEN 3
        WHEN 'THAP' THEN 4
        ELSE 5
      END,
      sc.thoi_gian_bao DESC,
      sc.id DESC
  `;
}

async function layDanhSachSuCo({
  tuKhoa = "",
  mucDo = null,
  trangThai = null,
  thietBiId = null,
  nguoiBaoId = null,
  kyThuatVienId = null,
  tuNgay = null,
  denNgay = null,
  gioiHan = 10,
  boQua = 0
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    tuKhoa,
    mucDo,
    trangThai,
    thietBiId,
    nguoiBaoId,
    kyThuatVienId,
    tuNgay,
    denNgay
  });
  const [rows] = await pool.execute(
    `
      ${taoCauSelectSuCo()}
      ${dieuKien}
      ${taoCauSapXep()}
      LIMIT ?
      OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );

  return rows;
}

async function demTongSuCo({
  tuKhoa = "",
  mucDo = null,
  trangThai = null,
  thietBiId = null,
  nguoiBaoId = null,
  kyThuatVienId = null,
  tuNgay = null,
  denNgay = null
}) {
  const { dieuKien, thamSo } = taoDieuKienLoc({
    tuKhoa,
    mucDo,
    trangThai,
    thietBiId,
    nguoiBaoId,
    kyThuatVienId,
    tuNgay,
    denNgay
  });
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS tong
      FROM su_co sc
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      ${dieuKien}
    `,
    thamSo
  );

  return rows[0].tong;
}

async function timTheoId(id, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectSuCo()}
      WHERE sc.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function timTheoMa(maSuCo, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      ${taoCauSelectSuCo()}
      WHERE sc.ma_su_co = ?
      LIMIT 1
    `,
    [maSuCo]
  );

  return rows[0] || null;
}

async function timTheoIdDeCapNhat(id, connection) {
  const [rows] = await connection.execute(
    `
      SELECT
        id,
        ma_su_co,
        thiet_bi_id,
        nguoi_bao_id,
        ky_thuat_vien_id,
        tieu_de,
        muc_do,
        trang_thai,
        thoi_gian_hoan_thanh,
        ngay_cap_nhat
      FROM su_co
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
    `,
    [id]
  );

  return rows[0] || null;
}

async function laySuCoDangMoTheoThietBi(thietBiId, connection = null) {
  const boThucThi = layBoThucThi(connection);
  const [rows] = await boThucThi.execute(
    `
      SELECT
        id,
        ma_su_co,
        tieu_de,
        muc_do,
        trang_thai,
        thoi_gian_bao
      FROM su_co
      WHERE thiet_bi_id = ?
        AND trang_thai IN (?, ?, ?)
      ORDER BY thoi_gian_bao DESC, id DESC
      LIMIT 10
    `,
    [
      thietBiId,
      TRANG_THAI_SU_CO.MOI,
      TRANG_THAI_SU_CO.DA_PHAN_CONG,
      TRANG_THAI_SU_CO.DANG_XU_LY
    ]
  );

  return rows;
}

async function khoaSinhMaSuCo(connection, tenKhoa) {
  const [rows] = await connection.execute(
    "SELECT GET_LOCK(?, 10) AS da_khoa",
    [tenKhoa]
  );

  return Number(rows[0].da_khoa) === 1;
}

async function moKhoaSinhMaSuCo(connection, tenKhoa) {
  const [rows] = await connection.execute(
    "SELECT RELEASE_LOCK(?) AS da_mo_khoa",
    [tenKhoa]
  );

  return Number(rows[0].da_mo_khoa) === 1;
}

async function laySoThuTuMaLonNhatTheoTienTo(connection, tienTo) {
  const [rows] = await connection.execute(
    `
      SELECT COALESCE(
        MAX(CAST(SUBSTRING_INDEX(ma_su_co, '-', -1) AS UNSIGNED)),
        0
      ) AS so_thu_tu
      FROM su_co
      WHERE ma_su_co LIKE CONCAT(?, '-%')
    `,
    [tienTo]
  );

  return Number(rows[0].so_thu_tu) || 0;
}

async function taoSuCo(connection, {
  maSuCo,
  thietBiId,
  nguoiBaoId,
  tieuDe,
  moTa,
  hinhAnh = null,
  mucDo,
  trangThai = TRANG_THAI_SU_CO.MOI,
  thoiGianXayRa = null
}) {
  const [ketQua] = await connection.execute(
    `
      INSERT INTO su_co (
        ma_su_co,
        thiet_bi_id,
        nguoi_bao_id,
        tieu_de,
        mo_ta,
        hinh_anh,
        muc_do,
        trang_thai,
        thoi_gian_xay_ra
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      maSuCo,
      thietBiId,
      nguoiBaoId,
      tieuDe,
      moTa,
      hinhAnh,
      mucDo,
      trangThai,
      thoiGianXayRa
    ]
  );

  return ketQua.insertId;
}

async function capNhatPhanCong(connection, suCoId, kyThuatVienId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE su_co
      SET
        ky_thuat_vien_id = ?,
        thoi_gian_phan_cong = CURRENT_TIMESTAMP,
        trang_thai = ?
      WHERE id = ?
        AND trang_thai IN (?, ?)
    `,
    [
      kyThuatVienId,
      TRANG_THAI_SU_CO.DA_PHAN_CONG,
      suCoId,
      TRANG_THAI_SU_CO.MOI,
      TRANG_THAI_SU_CO.DA_PHAN_CONG
    ]
  );

  return ketQua.affectedRows;
}

async function batDauXuLy(connection, suCoId, kyThuatVienId) {
  const [ketQua] = await connection.execute(
    `
      UPDATE su_co
      SET trang_thai = ?
      WHERE id = ?
        AND ky_thuat_vien_id = ?
        AND trang_thai = ?
    `,
    [
      TRANG_THAI_SU_CO.DANG_XU_LY,
      suCoId,
      kyThuatVienId,
      TRANG_THAI_SU_CO.DA_PHAN_CONG
    ]
  );

  return ketQua.affectedRows;
}

async function hoanThanhXuLy(
  connection,
  suCoId,
  kyThuatVienId,
  thoiGianHoanThanh
) {
  const [ketQua] = await connection.execute(
    `
      UPDATE su_co
      SET
        trang_thai = ?,
        thoi_gian_hoan_thanh = ?
      WHERE id = ?
        AND ky_thuat_vien_id = ?
        AND trang_thai = ?
    `,
    [
      TRANG_THAI_SU_CO.DA_XU_LY,
      thoiGianHoanThanh,
      suCoId,
      kyThuatVienId,
      TRANG_THAI_SU_CO.DANG_XU_LY
    ]
  );

  return ketQua.affectedRows;
}

async function demSuCoDangMoKhac(
  connection,
  thietBiId,
  suCoBoQuaId
) {
  const [rows] = await connection.execute(
    `
      SELECT COUNT(*) AS tong
      FROM su_co
      WHERE thiet_bi_id = ?
        AND id <> ?
        AND trang_thai IN (?, ?, ?)
    `,
    [
      thietBiId,
      suCoBoQuaId,
      TRANG_THAI_SU_CO.MOI,
      TRANG_THAI_SU_CO.DA_PHAN_CONG,
      TRANG_THAI_SU_CO.DANG_XU_LY
    ]
  );

  return Number(rows[0].tong) || 0;
}

async function layThoiGianHienTai(connection) {
  const [rows] = await connection.execute(
    "SELECT CURRENT_TIMESTAMP AS thoi_gian_hien_tai"
  );

  return rows[0].thoi_gian_hien_tai;
}

module.exports = {
  layDanhSachSuCo,
  demTongSuCo,
  timTheoId,
  timTheoMa,
  timTheoIdDeCapNhat,
  laySuCoDangMoTheoThietBi,
  khoaSinhMaSuCo,
  moKhoaSinhMaSuCo,
  laySoThuTuMaLonNhatTheoTienTo,
  taoSuCo,
  capNhatPhanCong,
  batDauXuLy,
  hoanThanhXuLy,
  demSuCoDangMoKhac,
  layThoiGianHienTai
};
