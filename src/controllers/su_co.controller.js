const suCoService = require("../services/su_co.service");
const {
  layDanhSachDuongDanAnh,
  xoaAnhDaTai
} = require("../middlewares/upload_su_co.middleware");

function chuanHoaBodyMultipart(req, tenTruongAnh) {
  const body = { ...req.body };
  for (const tenTruong of [
    "linhKienThayThe",
    "hinhAnh",
    "hinhAnhSuaChua"
  ]) {
    if (typeof body[tenTruong] === "string") {
      try {
        body[tenTruong] = JSON.parse(body[tenTruong]);
      } catch {
        // Service sáº½ tráº£ lá»—i validation nháº¥t quÃ¡n cho dá»¯ liá»‡u khÃ´ng há»£p lá»‡.
      }
    }
  }
  if (req.files?.length) {
    body[tenTruongAnh] = layDanhSachDuongDanAnh(req.files);
  }
  return body;
}

async function taoSuCo(req, res, next) {
  try {
    const suCo = await suCoService.taoSuCo(
      chuanHoaBodyMultipart(req, "hinhAnh"),
      req.nguoiDung
    );

    return res.status(201).json({
      thanhCong: true,
      thongBao: "Táº¡o sá»± cá»‘ thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    await xoaAnhDaTai(req.files);
    return next(loi);
  }
}

async function nhanCongViecKhanCap(req, res, next) {
  try {
    const suCo = await suCoService.nhanCongViecKhanCap(
      req.params.id,
      req.nguoiDung
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Nháº­n cÃ´ng viá»‡c kháº©n cáº¥p thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachSuCoCuaToi(req, res, next) {
  try {
    const ketQua = await suCoService.layDanhSachSuCoCuaToi(
      req.query,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y danh sÃ¡ch sá»± cá»‘ cá»§a tÃ´i thÃ nh cÃ´ng",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietSuCoCuaToi(req, res, next) {
  try {
    const suCo = await suCoService.layChiTietSuCoCuaToi(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y chi tiáº¿t sá»± cá»‘ cá»§a tÃ´i thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachSuCo(req, res, next) {
  try {
    const ketQua = await suCoService.layDanhSachSuCo(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y danh sÃ¡ch sá»± cá»‘ thÃ nh cÃ´ng",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietSuCo(req, res, next) {
  try {
    const suCo = await suCoService.layChiTietSuCo(req.params.id);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y chi tiáº¿t sá»± cá»‘ thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachKyThuatVien(req, res, next) {
  try {
    const ketQua = await suCoService.layDanhSachKyThuatVien(req.query);

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y danh sÃ¡ch ká»¹ thuáº­t viÃªn Ä‘ang hoáº¡t Ä‘á»™ng thÃ nh cÃ´ng",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function phanCongKyThuatVien(req, res, next) {
  try {
    const suCo = await suCoService.phanCongKyThuatVien(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "PhÃ¢n cÃ´ng ká»¹ thuáº­t viÃªn thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layCongViecCuaToi(req, res, next) {
  try {
    const ketQua = await suCoService.layCongViecCuaToi(
      req.query,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y danh sÃ¡ch cÃ´ng viá»‡c cá»§a tÃ´i thÃ nh cÃ´ng",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietCongViecCuaToi(req, res, next) {
  try {
    const suCo = await suCoService.layChiTietCongViecCuaToi(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y chi tiáº¿t cÃ´ng viá»‡c cá»§a tÃ´i thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function batDauXuLySuCo(req, res, next) {
  try {
    const suCo = await suCoService.batDauXuLySuCo(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: suCo.daBatDauTruocDo
        ? "Sá»± cá»‘ Ä‘Ã£ á»Ÿ tráº¡ng thÃ¡i Ä‘ang xá»­ lÃ½"
        : "Báº¯t Ä‘áº§u xá»­ lÃ½ sá»± cá»‘ thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatHoSoSuaChua(req, res, next) {
  try {
    const hoSoSuaChua = await suCoService.capNhatHoSoSuaChua(
      req.params.id,
      chuanHoaBodyMultipart(req, "hinhAnhSuaChua"),
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "LÆ°u há»“ sÆ¡ sá»­a chá»¯a thÃ nh cÃ´ng",
      duLieu: hoSoSuaChua
    });
  } catch (loi) {
    await xoaAnhDaTai(req.files);
    return next(loi);
  }
}

async function choLinhKien(req, res, next) {
  try {
    const suCo = await suCoService.choLinhKien(
      req.params.id,
      req.body,
      req.nguoiDung
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "ÄÃ£ chuyá»ƒn cÃ´ng viá»‡c sang chá» linh kiá»‡n",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function tiepTucXuLy(req, res, next) {
  try {
    const suCo = await suCoService.tiepTucXuLy(
      req.params.id,
      req.nguoiDung
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Tiáº¿p tá»¥c xá»­ lÃ½ cÃ´ng viá»‡c thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layHoSoSuaChuaCuaToi(req, res, next) {
  try {
    const ketQua = await suCoService.layHoSoSuaChuaCuaToi(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Láº¥y há»“ sÆ¡ sá»­a chá»¯a thÃ nh cÃ´ng",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function hoanThanhSuaChua(req, res, next) {
  try {
    const suCo = await suCoService.hoanThanhSuaChua(
      req.params.id,
      chuanHoaBodyMultipart(req, "hinhAnhSuaChua"),
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "HoÃ n thÃ nh sá»­a chá»¯a thÃ nh cÃ´ng",
      duLieu: suCo
    });
  } catch (loi) {
    await xoaAnhDaTai(req.files);
    return next(loi);
  }
}

async function xacNhanHoanThanhSuCo(req, res, next) {
  try {
    const suCo = await suCoService.xacNhanHoanThanhSuCo(
      req.params.id,
      req.nguoiDung
    );

    return res.status(200).json({
      thanhCong: true,
      thongBao: "Xác nhận thiết bị hoạt động thành công",
      duLieu: suCo
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  taoSuCo,
  layDanhSachSuCoCuaToi,
  layChiTietSuCoCuaToi,
  layDanhSachSuCo,
  layChiTietSuCo,
  layDanhSachKyThuatVien,
  phanCongKyThuatVien,
  layCongViecCuaToi,
  layChiTietCongViecCuaToi,
  nhanCongViecKhanCap,
  batDauXuLySuCo,
  capNhatHoSoSuaChua,
  choLinhKien,
  tiepTucXuLy,
  layHoSoSuaChuaCuaToi,
  hoanThanhSuaChua,
  xacNhanHoanThanhSuCo
};
