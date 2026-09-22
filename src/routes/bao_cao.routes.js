const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const baoCaoController = require("../controllers/bao_cao.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);
router.use(phanQuyen(VAI_TRO.QUAN_TRI_VIEN));

router.get("/:loai/export", baoCaoController.xuatBaoCao);
router.get("/su-co", baoCaoController.layBaoCaoSuCo);
router.get("/sua-chua", baoCaoController.layBaoCaoSuaChua);
router.get("/bao-tri", baoCaoController.layBaoCaoBaoTri);
router.get("/thiet-bi", baoCaoController.layBaoCaoThietBi);

module.exports = router;
