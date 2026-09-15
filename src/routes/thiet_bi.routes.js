const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const thietBiController = require("../controllers/thiet_bi.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { uploadTepImport } = require("../middlewares/upload_import.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

router.post(
  "/import/preview",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  uploadTepImport,
  thietBiController.previewImportThietBi
);

router.post(
  "/import",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  uploadTepImport,
  thietBiController.importThietBi
);

router.post(
  "/quet-qr",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  thietBiController.quetQrThietBi
);

router.get(
  "/qr/:maQr",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  thietBiController.layThietBiTheoQr
);

router.get(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  thietBiController.layDanhSachThietBi
);

router.post(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.taoThietBi
);

router.get(
  "/:id/qr",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  thietBiController.layQrThietBi
);

router.post(
  "/:id/dieu-chuyen",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.dieuChuyenThietBi
);

router.get(
  "/:id/lich-su-dieu-chuyen",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.layLichSuDieuChuyen
);

router.patch(
  "/:id/bao-hanh",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.capNhatBaoHanh
);

router.get(
  "/:id/bao-hanh",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.layBaoHanh
);

router.get(
  "/:id/health-score",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.layHealthScore
);

router.get(
  "/:id/timeline",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.layTimelineThietBi
);

router.get(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  thietBiController.layChiTietThietBi
);

router.put(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.capNhatThietBi
);

router.patch(
  "/:id/trang-thai",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  thietBiController.capNhatTrangThai
);

module.exports = router;
