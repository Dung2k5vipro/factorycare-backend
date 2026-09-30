const express = require("express");

const VAI_TRO = require("../constants/vai_tro");
const suCoController = require("../controllers/su_co.controller");
const { phanQuyen } = require("../middlewares/phan_quyen.middleware");
const {
  uploadAnhSuCo,
  uploadAnhSuaChua
} = require("../middlewares/upload_su_co.middleware");
const { xacThuc } = require("../middlewares/xac_thuc.middleware");

const router = express.Router();

router.use(xacThuc);

router.post(
  "/",
  phanQuyen(VAI_TRO.NHAN_VIEN),
  uploadAnhSuCo,
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

router.patch(
  "/cua-toi/:id/xac-nhan",
  phanQuyen(VAI_TRO.NHAN_VIEN),
  suCoController.xacNhanHoanThanhSuCo
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
  "/:id/nhan-cong-viec",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.nhanCongViecKhanCap
);

router.patch(
  "/:id/bat-dau-xu-ly",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.batDauXuLySuCo
);

router.patch(
  "/:id/sua-chua",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  uploadAnhSuaChua,
  suCoController.capNhatHoSoSuaChua
);

router.patch(
  "/:id/cho-linh-kien",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.choLinhKien
);

router.patch(
  "/:id/tiep-tuc-xu-ly",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.tiepTucXuLy
);

router.get(
  "/:id/ho-so-sua-chua",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  suCoController.layHoSoSuaChuaCuaToi
);

router.post(
  "/:id/hoan-thanh",
  phanQuyen(VAI_TRO.KY_THUAT_VIEN),
  uploadAnhSuaChua,
  suCoController.hoanThanhSuaChua
);

router.get(
  "/:id",
  phanQuyen(VAI_TRO.QUAN_TRI_VIEN),
  suCoController.layChiTietSuCo
);

module.exports = router;
