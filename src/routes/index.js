const express = require("express");

const baoCaoRoutes = require("./bao_cao.routes");
const baoTriRoutes = require("./bao_tri.routes");
const dashboardRoutes = require("./dashboard.routes");
const healthRoutes = require("./health.routes");
const loNhapRoutes = require("./lo_nhap.routes");
const loaiThietBiRoutes = require("./loai_thiet_bi.routes");
const nguoiDungRoutes = require("./nguoi_dung.routes");
const nhaCungCapRoutes = require("./nha_cung_cap.routes");
const suCoRoutes = require("./su_co.routes");
const thietBiRoutes = require("./thiet_bi.routes");
const viTriRoutes = require("./vi_tri.routes");
const xacThucRoutes = require("./xac_thuc.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/xac-thuc", xacThucRoutes);
router.use("/nguoi-dung", nguoiDungRoutes);
router.use("/loai-thiet-bi", loaiThietBiRoutes);
router.use("/vi-tri", viTriRoutes);
router.use("/nha-cung-cap", nhaCungCapRoutes);
router.use("/lo-nhap", loNhapRoutes);
router.use("/thiet-bi", thietBiRoutes);
router.use("/su-co", suCoRoutes);
router.use("/bao-tri", baoTriRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/bao-cao", baoCaoRoutes);

module.exports = router;
