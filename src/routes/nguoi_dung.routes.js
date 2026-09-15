const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const nguoiDungController = require("../controllers/nguoi_dung.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

router.patch("/toi/mat-khau", nguoiDungController.doiMatKhau);

router.get(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  nguoiDungController.layDanhSachNguoiDung
);

router.post(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  nguoiDungController.taoNguoiDung
);

router.get(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  nguoiDungController.layChiTietNguoiDung
);

router.put(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  nguoiDungController.capNhatNguoiDung
);

router.patch(
  "/:id/trang-thai",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  nguoiDungController.capNhatTrangThai
);

module.exports = router;
