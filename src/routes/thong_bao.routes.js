const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const thongBaoController = require("../controllers/thong_bao.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);
router.use(
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN, VAI_TRO.KY_THUAT_VIEN, VAI_TRO.NHAN_VIEN)
);

router.get("/", thongBaoController.layDanhSachThongBao);
router.patch("/da-doc-tat-ca", thongBaoController.danhDauTatCaDaDoc);
router.patch("/:id/da-doc", thongBaoController.danhDauDaDoc);
router.delete("/:id", thongBaoController.xoaThongBaoDaDoc);

module.exports = router;
