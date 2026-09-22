const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const keHoachBaoTriController = require("../controllers/ke_hoach_bao_tri.controller");
const mauChecklistController = require("../controllers/mau_checklist.controller");
const phanCongBaoTriController = require("../controllers/phan_cong_bao_tri.controller");
const phieuBaoTriController = require("../controllers/phieu_bao_tri.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

// M4.1 - Quản lý kế hoạch bảo trì
router.get(
  "/ke-hoach",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  keHoachBaoTriController.layDanhSachKeHoach
);

router.post(
  "/ke-hoach",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  keHoachBaoTriController.taoKeHoach
);

// M4.2 - Phân công kỹ thuật viên bảo trì
router.get(
  "/ke-hoach/cua-toi",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  phanCongBaoTriController.layKeHoachCuaToi
);

router.get(
  "/ke-hoach/:id/lich-su-phan-cong",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  phanCongBaoTriController.layLichSuPhanCong
);

router.post(
  "/ke-hoach/:id/phan-cong",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  phanCongBaoTriController.phanCongKeHoach
);

router.get(
  "/ke-hoach/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  keHoachBaoTriController.layChiTietKeHoach
);

router.put(
  "/ke-hoach/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  keHoachBaoTriController.capNhatKeHoach
);

router.delete(
  "/ke-hoach/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  keHoachBaoTriController.ngungHoatDongKeHoach
);

// M4.3 - Quản lý mẫu checklist bảo trì
router.get(
  "/checklist",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  mauChecklistController.layDanhSachMauChecklist
);

router.post(
  "/checklist",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  mauChecklistController.taoMauChecklist
);

router.get(
  "/checklist/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  mauChecklistController.layChiTietMauChecklist
);

router.put(
  "/checklist/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  mauChecklistController.capNhatMauChecklist
);

router.delete(
  "/checklist/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  mauChecklistController.ngungHoatDongMauChecklist
);

// M4.4 - Thực hiện và ghi kết quả bảo trì
router.get(
  "/phieu/cua-toi",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.layPhieuCuaToi
);

router.get(
  "/phieu",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  phieuBaoTriController.layDanhSachPhieu
);

router.get(
  "/phieu/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.layChiTietPhieu
);

router.post(
  "/phieu/:id/bat-dau",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.batDauBaoTri
);

router.put(
  "/phieu/:id/checklist",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.capNhatChecklist
);

router.put(
  "/phieu/:id/ket-qua",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.capNhatKetQuaBaoTri
);

router.post(
  "/phieu/:id/hoan-thanh",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.hoanThanhBaoTri
);

// M4.5 - Cảnh báo sắp đến hạn và quá hạn
router.get(
  "/sap-den-han",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.layDanhSachSapDenHan
);

router.get(
  "/qua-han",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN),
  phieuBaoTriController.layDanhSachQuaHan
);

router.post(
  "/canh-bao/xu-ly",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  phieuBaoTriController.xuLyCanhBaoBaoTri
);

module.exports = router;
