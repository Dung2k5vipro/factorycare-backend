const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const nhaCungCapController = require("../controllers/nha_cung_cap.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);
router.use(phanQuyen(VAI_TRO.QUAN_TRI_VIEN));

router.get("/", nhaCungCapController.layDanhSachNhaCungCap);
router.post("/", nhaCungCapController.taoNhaCungCap);
router.get("/:id/lo-nhap", nhaCungCapController.layLoNhapTheoNhaCungCap);
router.get("/:id/thiet-bi", nhaCungCapController.layThietBiTheoNhaCungCap);
router.get("/:id", nhaCungCapController.layChiTietNhaCungCap);
router.put("/:id", nhaCungCapController.capNhatNhaCungCap);
router.delete("/:id", nhaCungCapController.xoaNhaCungCap);

module.exports = router;
