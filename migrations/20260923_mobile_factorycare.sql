-- Chạy một lần trước khi triển khai Backend/Mobile của luồng sửa chữa mới.
-- Sao lưu cơ sở dữ liệu trước khi chạy migration.

ALTER TABLE su_co
  MODIFY COLUMN trang_thai ENUM(
    'MOI',
    'DA_PHAN_CONG',
    'DANG_XU_LY',
    'CHO_LINH_KIEN',
    'DA_XU_LY',
    'DA_HUY'
  ) NOT NULL DEFAULT 'MOI',
  ADD COLUMN ly_do_cho_linh_kien VARCHAR(500) NULL AFTER thoi_gian_hoan_thanh,
  ADD COLUMN ghi_chu_cho_linh_kien TEXT NULL AFTER ly_do_cho_linh_kien;

ALTER TABLE ho_so_sua_chua
  ADD COLUMN hinh_anh JSON NULL AFTER ghi_chu,
  MODIFY COLUMN ket_qua ENUM(
    'DA_SUA_XONG',
    'SUA_MOT_PHAN',
    'KHONG_SUA_DUOC'
  ) NULL DEFAULT NULL;
