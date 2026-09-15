const express = require("express");

const xacThucController = require("../controllers/xac_thuc.controller");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.post("/dang-nhap", xacThucController.dangNhap);
router.post("/khoi-tao-admin-dau-tien", xacThucController.khoiTaoQuanTriVienDauTien);
router.get("/toi", xacThuc, xacThucController.layThongTinCaNhan);
router.post("/dang-xuat", xacThuc, xacThucController.dangXuat);

module.exports = router;
