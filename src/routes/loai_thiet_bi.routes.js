const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const loaiThietBiController = require("../controllers/loai_thiet_bi.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

router.get(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  loaiThietBiController.layDanhSachLoaiThietBi
);

router.post(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  loaiThietBiController.taoLoaiThietBi
);

router.get(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  loaiThietBiController.layChiTietLoaiThietBi
);

router.put(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  loaiThietBiController.capNhatLoaiThietBi
);

module.exports = router;
