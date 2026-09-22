const { pool } = require("../config/database");

function themDieuKienNgay(danhSachDieuKien, thamSo, cot, tuNgay, denNgay) {
  if (tuNgay) {
    danhSachDieuKien.push(`${cot} >= ?`);
    thamSo.push(`${tuNgay} 00:00:00`);
  }
  if (denNgay) {
    danhSachDieuKien.push(`${cot} < DATE_ADD(?, INTERVAL 1 DAY)`);
    thamSo.push(`${denNgay} 00:00:00`);
  }
}

function taoKetQuaDieuKien(danhSachDieuKien, thamSo) {
  return {
    dieuKien: danhSachDieuKien.length > 0
      ? `WHERE ${danhSachDieuKien.join(" AND ")}`
      : "",
    thamSo
  };
}

function taoDieuKienSuCo(boLoc) {
  const danhSachDieuKien = [];
  const thamSo = [];
  themDieuKienNgay(
    danhSachDieuKien,
    thamSo,
    "sc.thoi_gian_bao",
    boLoc.tuNgay,
    boLoc.denNgay
  );
  if (boLoc.thietBiId) {
    danhSachDieuKien.push("sc.thiet_bi_id = ?");
    thamSo.push(boLoc.thietBiId);
  }
  if (boLoc.loaiThietBiId) {
    danhSachDieuKien.push("tb.loai_thiet_bi_id = ?");
    thamSo.push(boLoc.loaiThietBiId);
  }
  if (boLoc.viTriId) {
    danhSachDieuKien.push("tb.vi_tri_id = ?");
    thamSo.push(boLoc.viTriId);
  }
  if (boLoc.mucDo) {
    danhSachDieuKien.push("sc.muc_do = ?");
    thamSo.push(boLoc.mucDo);
  }
  if (boLoc.trangThai) {
    danhSachDieuKien.push("sc.trang_thai = ?");
    thamSo.push(boLoc.trangThai);
  }
  if (boLoc.kyThuatVienId) {
    danhSachDieuKien.push("sc.ky_thuat_vien_id = ?");
    thamSo.push(boLoc.kyThuatVienId);
  }
  return taoKetQuaDieuKien(danhSachDieuKien, thamSo);
}

function taoDieuKienSuaChua(boLoc) {
  const danhSachDieuKien = [];
  const thamSo = [];
  themDieuKienNgay(
    danhSachDieuKien,
    thamSo,
    "hs.ngay_tao",
    boLoc.tuNgay,
    boLoc.denNgay
  );
  if (boLoc.thietBiId) {
    danhSachDieuKien.push("sc.thiet_bi_id = ?");
    thamSo.push(boLoc.thietBiId);
  }
  if (boLoc.loaiThietBiId) {
    danhSachDieuKien.push("tb.loai_thiet_bi_id = ?");
    thamSo.push(boLoc.loaiThietBiId);
  }
  if (boLoc.viTriId) {
    danhSachDieuKien.push("tb.vi_tri_id = ?");
    thamSo.push(boLoc.viTriId);
  }
  if (boLoc.ketQua) {
    danhSachDieuKien.push("hs.ket_qua = ?");
    thamSo.push(boLoc.ketQua);
  }
  if (boLoc.kyThuatVienId) {
    danhSachDieuKien.push("hs.ky_thuat_vien_id = ?");
    thamSo.push(boLoc.kyThuatVienId);
  }
  return taoKetQuaDieuKien(danhSachDieuKien, thamSo);
}

function taoDieuKienBaoTri(boLoc) {
  const danhSachDieuKien = [];
  const thamSo = [];
  themDieuKienNgay(
    danhSachDieuKien,
    thamSo,
    "pbt.ngay_du_kien",
    boLoc.tuNgay,
    boLoc.denNgay
  );
  if (boLoc.thietBiId) {
    danhSachDieuKien.push("pbt.thiet_bi_id = ?");
    thamSo.push(boLoc.thietBiId);
  }
  if (boLoc.loaiThietBiId) {
    danhSachDieuKien.push("tb.loai_thiet_bi_id = ?");
    thamSo.push(boLoc.loaiThietBiId);
  }
  if (boLoc.viTriId) {
    danhSachDieuKien.push("tb.vi_tri_id = ?");
    thamSo.push(boLoc.viTriId);
  }
  if (boLoc.trangThai) {
    danhSachDieuKien.push("pbt.trang_thai = ?");
    thamSo.push(boLoc.trangThai);
  }
  if (boLoc.kyThuatVienId) {
    danhSachDieuKien.push("pbt.ky_thuat_vien_id = ?");
    thamSo.push(boLoc.kyThuatVienId);
  }
  return taoKetQuaDieuKien(danhSachDieuKien, thamSo);
}

function taoDieuKienThietBi(boLoc) {
  const danhSachDieuKien = [];
  const thamSo = [];
  if (boLoc.thietBiId) {
    danhSachDieuKien.push("tb.id = ?");
    thamSo.push(boLoc.thietBiId);
  }
  if (boLoc.loaiThietBiId) {
    danhSachDieuKien.push("tb.loai_thiet_bi_id = ?");
    thamSo.push(boLoc.loaiThietBiId);
  }
  if (boLoc.viTriId) {
    danhSachDieuKien.push("tb.vi_tri_id = ?");
    thamSo.push(boLoc.viTriId);
  }
  if (boLoc.trangThai) {
    danhSachDieuKien.push("tb.trang_thai = ?");
    thamSo.push(boLoc.trangThai);
  }
  return taoKetQuaDieuKien(danhSachDieuKien, thamSo);
}

async function layTongQuanSuCo(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienSuCo(boLoc);
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_su_co,
        SUM(sc.trang_thai IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')) AS so_dang_mo,
        SUM(sc.trang_thai = 'DA_XU_LY') AS so_da_xu_ly,
        SUM(sc.trang_thai = 'DA_HUY') AS so_da_huy,
        SUM(
          sc.muc_do = 'NGHIEM_TRONG'
          AND sc.trang_thai IN ('MOI', 'DA_PHAN_CONG', 'DANG_XU_LY')
        ) AS so_nghiem_trong_dang_mo,
        AVG(
          CASE
            WHEN sc.trang_thai = 'DA_XU_LY'
              AND sc.thoi_gian_hoan_thanh IS NOT NULL
            THEN TIMESTAMPDIFF(MINUTE, sc.thoi_gian_bao, sc.thoi_gian_hoan_thanh)
            ELSE NULL
          END
        ) AS thoi_gian_xu_ly_trung_binh_phut
      FROM su_co sc
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      ${dieuKien}
    `,
    thamSo
  );
  return rows[0];
}

async function layThongKeSuCo(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienSuCo(boLoc);
  const cauNoi = "FROM su_co sc INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id";
  const [theoTrangThai, theoMucDo, theoThoiGian] = await Promise.all([
    pool.execute(
      `SELECT sc.trang_thai, COUNT(*) AS so_luong ${cauNoi} ${dieuKien}
       GROUP BY sc.trang_thai ORDER BY so_luong DESC`,
      thamSo
    ),
    pool.execute(
      `SELECT sc.muc_do, COUNT(*) AS so_luong ${cauNoi} ${dieuKien}
       GROUP BY sc.muc_do ORDER BY FIELD(sc.muc_do, 'NGHIEM_TRONG','CAO','TRUNG_BINH','THAP')`,
      thamSo
    ),
    pool.execute(
      `SELECT DATE(sc.thoi_gian_bao) AS ngay, COUNT(*) AS so_luong ${cauNoi} ${dieuKien}
       GROUP BY DATE(sc.thoi_gian_bao) ORDER BY ngay ASC`,
      thamSo
    )
  ]);
  return {
    theoTrangThai: theoTrangThai[0],
    theoMucDo: theoMucDo[0],
    theoThoiGian: theoThoiGian[0]
  };
}

const SAP_XEP_SU_CO = {
  thoiGianBao: "sc.thoi_gian_bao",
  maSuCo: "sc.ma_su_co",
  mucDo: "sc.muc_do",
  trangThai: "sc.trang_thai"
};

async function layDanhSachSuCo(boLoc, { gioiHan, boQua, sapXepTheo, thuTu }) {
  const { dieuKien, thamSo } = taoDieuKienSuCo(boLoc);
  const cotSapXep = SAP_XEP_SU_CO[sapXepTheo] || SAP_XEP_SU_CO.thoiGianBao;
  const [rows] = await pool.execute(
    `
      SELECT
        sc.id, sc.ma_su_co, sc.tieu_de, sc.muc_do, sc.trang_thai,
        sc.thoi_gian_bao, sc.thoi_gian_hoan_thanh,
        tb.id AS thiet_bi_id, tb.ma_thiet_bi, tb.ten_thiet_bi,
        ltb.id AS loai_thiet_bi_id, ltb.ten_loai,
        vt.id AS vi_tri_id, vt.ten_vi_tri,
        ktv.id AS ky_thuat_vien_id, ktv.ho_ten AS ky_thuat_vien_ho_ten
      FROM su_co sc
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
      LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
      LEFT JOIN nguoi_dung ktv ON ktv.id = sc.ky_thuat_vien_id
      ${dieuKien}
      ORDER BY ${cotSapXep} ${thuTu}, sc.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );
  return rows;
}

async function demTongSuCo(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienSuCo(boLoc);
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS tong FROM su_co sc INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id ${dieuKien}`,
    thamSo
  );
  return Number(rows[0].tong) || 0;
}

async function layTongQuanSuaChua(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienSuaChua(boLoc);
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_ho_so,
        SUM(hs.ket_qua = 'DA_SUA_XONG') AS so_da_sua_xong,
        SUM(hs.ket_qua = 'SUA_MOT_PHAN') AS so_sua_mot_phan,
        SUM(hs.ket_qua = 'KHONG_SUA_DUOC') AS so_khong_sua_duoc,
        AVG(
          CASE WHEN hs.thoi_gian_bat_dau IS NOT NULL AND hs.thoi_gian_hoan_thanh IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, hs.thoi_gian_bat_dau, hs.thoi_gian_hoan_thanh)
          ELSE NULL END
        ) AS thoi_gian_sua_chua_trung_binh_phut
      FROM ho_so_sua_chua hs
      INNER JOIN su_co sc ON sc.id = hs.su_co_id
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      ${dieuKien}
    `,
    thamSo
  );
  return rows[0];
}

async function layThongKeSuaChua(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienSuaChua(boLoc);
  const cauNoi = `FROM ho_so_sua_chua hs
    INNER JOIN su_co sc ON sc.id = hs.su_co_id
    INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id`;
  const [theoKetQua, theoKyThuatVien] = await Promise.all([
    pool.execute(
      `SELECT hs.ket_qua, COUNT(*) AS so_luong ${cauNoi} ${dieuKien}
       GROUP BY hs.ket_qua ORDER BY so_luong DESC`,
      thamSo
    ),
    pool.execute(
      `SELECT hs.ky_thuat_vien_id, nd.ho_ten, COUNT(*) AS so_luong
       ${cauNoi} INNER JOIN nguoi_dung nd ON nd.id = hs.ky_thuat_vien_id
       ${dieuKien} GROUP BY hs.ky_thuat_vien_id, nd.ho_ten ORDER BY so_luong DESC`,
      thamSo
    )
  ]);
  return { theoKetQua: theoKetQua[0], theoKyThuatVien: theoKyThuatVien[0] };
}

const SAP_XEP_SUA_CHUA = {
  ngayTao: "hs.ngay_tao",
  thoiGianHoanThanh: "hs.thoi_gian_hoan_thanh",
  ketQua: "hs.ket_qua"
};

async function layDanhSachSuaChua(boLoc, { gioiHan, boQua, sapXepTheo, thuTu }) {
  const { dieuKien, thamSo } = taoDieuKienSuaChua(boLoc);
  const cotSapXep = SAP_XEP_SUA_CHUA[sapXepTheo] || SAP_XEP_SUA_CHUA.ngayTao;
  const [rows] = await pool.execute(
    `
      SELECT
        hs.id, hs.su_co_id, hs.nguyen_nhan, hs.cach_xu_ly, hs.ket_qua,
        hs.thoi_gian_bat_dau, hs.thoi_gian_hoan_thanh, hs.ghi_chu, hs.ngay_tao,
        sc.ma_su_co,
        tb.id AS thiet_bi_id, tb.ma_thiet_bi, tb.ten_thiet_bi,
        ltb.id AS loai_thiet_bi_id, ltb.ten_loai,
        vt.id AS vi_tri_id, vt.ten_vi_tri,
        nd.id AS ky_thuat_vien_id, nd.ho_ten AS ky_thuat_vien_ho_ten
      FROM ho_so_sua_chua hs
      INNER JOIN su_co sc ON sc.id = hs.su_co_id
      INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id
      INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
      LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
      INNER JOIN nguoi_dung nd ON nd.id = hs.ky_thuat_vien_id
      ${dieuKien}
      ORDER BY ${cotSapXep} ${thuTu}, hs.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );
  return rows;
}

async function demTongSuaChua(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienSuaChua(boLoc);
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS tong FROM ho_so_sua_chua hs
     INNER JOIN su_co sc ON sc.id = hs.su_co_id
     INNER JOIN thiet_bi tb ON tb.id = sc.thiet_bi_id ${dieuKien}`,
    thamSo
  );
  return Number(rows[0].tong) || 0;
}

async function layTongQuanBaoTri(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienBaoTri(boLoc);
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_phieu,
        SUM(pbt.trang_thai = 'HOAN_THANH') AS so_hoan_thanh,
        SUM(pbt.trang_thai = 'DA_HUY') AS so_da_huy,
        SUM(pbt.trang_thai = 'DANG_THUC_HIEN') AS so_dang_thuc_hien,
        SUM(
          pbt.ngay_du_kien < CURRENT_TIMESTAMP
          AND pbt.trang_thai IN ('CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN')
        ) AS so_qua_han
      FROM phieu_bao_tri pbt
      INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id
      ${dieuKien}
    `,
    thamSo
  );
  return rows[0];
}

async function layThongKeBaoTri(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienBaoTri(boLoc);
  const cauNoi = "FROM phieu_bao_tri pbt INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id";
  const [theoTrangThai, theoKyThuatVien] = await Promise.all([
    pool.execute(
      `SELECT pbt.trang_thai, COUNT(*) AS so_luong ${cauNoi} ${dieuKien}
       GROUP BY pbt.trang_thai ORDER BY so_luong DESC`,
      thamSo
    ),
    pool.execute(
      `SELECT pbt.ky_thuat_vien_id, nd.ho_ten, COUNT(*) AS so_luong
       ${cauNoi} LEFT JOIN nguoi_dung nd ON nd.id = pbt.ky_thuat_vien_id
       ${dieuKien} GROUP BY pbt.ky_thuat_vien_id, nd.ho_ten ORDER BY so_luong DESC`,
      thamSo
    )
  ]);
  return { theoTrangThai: theoTrangThai[0], theoKyThuatVien: theoKyThuatVien[0] };
}

const SAP_XEP_BAO_TRI = {
  ngayDuKien: "pbt.ngay_du_kien",
  thoiGianHoanThanh: "pbt.thoi_gian_hoan_thanh",
  trangThai: "pbt.trang_thai"
};

async function layDanhSachBaoTri(boLoc, { gioiHan, boQua, sapXepTheo, thuTu }) {
  const { dieuKien, thamSo } = taoDieuKienBaoTri(boLoc);
  const cotSapXep = SAP_XEP_BAO_TRI[sapXepTheo] || SAP_XEP_BAO_TRI.ngayDuKien;
  const [rows] = await pool.execute(
    `
      SELECT
        pbt.id, pbt.ke_hoach_bao_tri_id, pbt.ngay_du_kien,
        pbt.thoi_gian_bat_dau, pbt.thoi_gian_hoan_thanh,
        pbt.trang_thai, pbt.ket_qua_bao_tri,
        (
          pbt.ngay_du_kien < CURRENT_TIMESTAMP
          AND pbt.trang_thai IN ('CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN')
        ) AS da_qua_han,
        tb.id AS thiet_bi_id, tb.ma_thiet_bi, tb.ten_thiet_bi,
        ltb.id AS loai_thiet_bi_id, ltb.ten_loai,
        vt.id AS vi_tri_id, vt.ten_vi_tri,
        nd.id AS ky_thuat_vien_id, nd.ho_ten AS ky_thuat_vien_ho_ten
      FROM phieu_bao_tri pbt
      INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id
      INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
      LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
      LEFT JOIN nguoi_dung nd ON nd.id = pbt.ky_thuat_vien_id
      ${dieuKien}
      ORDER BY ${cotSapXep} ${thuTu}, pbt.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );
  return rows;
}

async function demTongBaoTri(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienBaoTri(boLoc);
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS tong FROM phieu_bao_tri pbt
     INNER JOIN thiet_bi tb ON tb.id = pbt.thiet_bi_id ${dieuKien}`,
    thamSo
  );
  return Number(rows[0].tong) || 0;
}

async function layTongQuanThietBi(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienThietBi(boLoc);
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS tong_ho_so,
        SUM(tb.trang_thai <> 'THANH_LY') AS tong_dang_quan_ly,
        SUM(tb.trang_thai = 'DANG_HOAT_DONG') AS so_dang_hoat_dong,
        SUM(tb.trang_thai = 'DANG_BAO_TRI') AS so_dang_bao_tri,
        SUM(tb.trang_thai = 'DANG_HONG') AS so_dang_hong,
        SUM(tb.trang_thai = 'NGUNG_HOAT_DONG') AS so_ngung_hoat_dong,
        SUM(tb.trang_thai = 'THANH_LY') AS so_thanh_ly
      FROM thiet_bi tb
      ${dieuKien}
    `,
    thamSo
  );
  return rows[0];
}

async function layThongKeThietBi(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienThietBi(boLoc);
  const [theoTrangThai, theoLoai, theoViTri] = await Promise.all([
    pool.execute(
      `SELECT tb.trang_thai, COUNT(*) AS so_luong FROM thiet_bi tb ${dieuKien}
       GROUP BY tb.trang_thai ORDER BY so_luong DESC`,
      thamSo
    ),
    pool.execute(
      `SELECT tb.loai_thiet_bi_id, ltb.ten_loai, COUNT(*) AS so_luong
       FROM thiet_bi tb INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
       ${dieuKien} GROUP BY tb.loai_thiet_bi_id, ltb.ten_loai ORDER BY so_luong DESC`,
      thamSo
    ),
    pool.execute(
      `SELECT tb.vi_tri_id, vt.ten_vi_tri, COUNT(*) AS so_luong
       FROM thiet_bi tb LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
       ${dieuKien} GROUP BY tb.vi_tri_id, vt.ten_vi_tri ORDER BY so_luong DESC`,
      thamSo
    )
  ]);
  return {
    theoTrangThai: theoTrangThai[0],
    theoLoai: theoLoai[0],
    theoViTri: theoViTri[0]
  };
}

const SAP_XEP_THIET_BI = {
  maThietBi: "tb.ma_thiet_bi",
  tenThietBi: "tb.ten_thiet_bi",
  trangThai: "tb.trang_thai",
  ngayTao: "tb.ngay_tao"
};

async function layDanhSachThietBi(boLoc, { gioiHan, boQua, sapXepTheo, thuTu }) {
  const { dieuKien, thamSo } = taoDieuKienThietBi(boLoc);
  const cotSapXep = SAP_XEP_THIET_BI[sapXepTheo] || SAP_XEP_THIET_BI.maThietBi;
  const [rows] = await pool.execute(
    `
      SELECT
        tb.id, tb.ma_thiet_bi, tb.ten_thiet_bi, tb.trang_thai,
        tb.model, tb.hang_san_xuat, tb.ngay_tao,
        ltb.id AS loai_thiet_bi_id, ltb.ten_loai,
        vt.id AS vi_tri_id, vt.ten_vi_tri,
        COALESCE(sc.so_su_co, 0) AS so_su_co,
        COALESCE(pbt.so_bao_tri_qua_han, 0) AS so_bao_tri_qua_han
      FROM thiet_bi tb
      INNER JOIN loai_thiet_bi ltb ON ltb.id = tb.loai_thiet_bi_id
      LEFT JOIN vi_tri vt ON vt.id = tb.vi_tri_id
      LEFT JOIN (
        SELECT thiet_bi_id, COUNT(*) AS so_su_co
        FROM su_co GROUP BY thiet_bi_id
      ) sc ON sc.thiet_bi_id = tb.id
      LEFT JOIN (
        SELECT thiet_bi_id, COUNT(*) AS so_bao_tri_qua_han
        FROM phieu_bao_tri
        WHERE ngay_du_kien < CURRENT_TIMESTAMP
          AND trang_thai IN ('CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN')
        GROUP BY thiet_bi_id
      ) pbt ON pbt.thiet_bi_id = tb.id
      ${dieuKien}
      ORDER BY ${cotSapXep} ${thuTu}, tb.id DESC
      LIMIT ? OFFSET ?
    `,
    [...thamSo, gioiHan, boQua]
  );
  return rows;
}

async function demTongThietBi(boLoc) {
  const { dieuKien, thamSo } = taoDieuKienThietBi(boLoc);
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS tong FROM thiet_bi tb ${dieuKien}`,
    thamSo
  );
  return Number(rows[0].tong) || 0;
}

module.exports = {
  layTongQuanSuCo,
  layThongKeSuCo,
  layDanhSachSuCo,
  demTongSuCo,
  layTongQuanSuaChua,
  layThongKeSuaChua,
  layDanhSachSuaChua,
  demTongSuaChua,
  layTongQuanBaoTri,
  layThongKeBaoTri,
  layDanhSachBaoTri,
  demTongBaoTri,
  layTongQuanThietBi,
  layThongKeThietBi,
  layDanhSachThietBi,
  demTongThietBi
};
