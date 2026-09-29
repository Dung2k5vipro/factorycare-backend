const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const dashboardController = require("../controllers/dashboard.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);
router.use(phanQuyen(VAI_TRO.QUAN_TRI_VIEN));

router.get("/tong-quan", dashboardController.layTongQuanDashboard);

module.exports = router;
