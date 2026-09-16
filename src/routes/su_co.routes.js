const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const suCoController = require("../controllers/su_co.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

router.post(
  "/",
  phanQuyen(VAI_TRO.NHAN_VIEN),
  suCoController.taoSuCo
);

router.get(
  "/cua-toi",
  phanQuyen(VAI_TRO.NHAN_VIEN),
  suCoController.layDanhSachSuCoCuaToi
);

router.get(
  "/cua-toi/:id",
  phanQuyen(VAI_TRO.NHAN_VIEN),
  suCoController.layChiTietSuCoCuaToi
);

router.get(
  "/ky-thuat-vien",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  suCoController.layDanhSachKyThuatVien
);

router.get(
  "/cong-viec-cua-toi",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.layCongViecCuaToi
);

router.get(
  "/cong-viec-cua-toi/:id",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.layChiTietCongViecCuaToi
);

router.get(
  "/",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  suCoController.layDanhSachSuCo
);

router.post(
  "/:id/phan-cong",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  suCoController.phanCongKyThuatVien
);

router.patch(
  "/:id/bat-dau-xu-ly",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.batDauXuLySuCo
);

router.patch(
  "/:id/sua-chua",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.capNhatHoSoSuaChua
);

router.get(
  "/:id/ho-so-sua-chua",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.layHoSoSuaChuaCuaToi
);

router.post(
  "/:id/hoan-thanh",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.hoanThanhSuaChua
);

router.get(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  suCoController.layChiTietSuCo
);

module.exports = router;
