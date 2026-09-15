const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const loNhapController = require("../controllers/lo_nhap.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { uploadTepHoaDon } = require("../middlewares/upload_hoa_don.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);
router.use(phanQuyen(VAI_TRO.QUAN_TRI_VIEN));

router.get("/", loNhapController.layDanhSachLoNhap);
router.post("/", uploadTepHoaDon, loNhapController.taoLoNhap);
router.get("/:id/thiet-bi", loNhapController.layThietBiTheoLoNhap);
router.get("/:id", loNhapController.layChiTietLoNhap);
router.put("/:id", uploadTepHoaDon, loNhapController.capNhatLoNhap);
router.delete("/:id", loNhapController.xoaLoNhap);

module.exports = router;
