const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const viTriController = require("../controllers/vi_tri.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

router.get(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  viTriController.layDanhSachViTri
);

router.get(
  "/cay",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  viTriController.layCayViTri
);

router.post(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  viTriController.taoViTri
);

router.get(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN),
  viTriController.layChiTietViTri
);

router.put(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  viTriController.capNhatViTri
);

router.delete(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  viTriController.xoaViTri
);

module.exports = router;
