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
        // Service sẽ trả lỗi validation nhất quán cho dữ liệu không hợp lệ.
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
      thongBao: "Tạo sự cố thành công",
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
      thongBao: "Nhận công việc khẩn cấp thành công",
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
      thongBao: "Lấy danh sách sự cố của tôi thành công",
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
      thongBao: "Lấy chi tiết sự cố của tôi thành công",
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
      thongBao: "Lấy danh sách sự cố thành công",
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
      thongBao: "Lấy chi tiết sự cố thành công",
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
      thongBao: "Lấy danh sách kỹ thuật viên đang hoạt động thành công",
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
      thongBao: "Phân công kỹ thuật viên thành công",
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
      thongBao: "Lấy danh sách công việc của tôi thành công",
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
      thongBao: "Lấy chi tiết công việc của tôi thành công",
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
        ? "Sự cố đã ở trạng thái đang xử lý"
        : "Bắt đầu xử lý sự cố thành công",
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
      thongBao: "Lưu hồ sơ sửa chữa thành công",
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
      thongBao: "Đã chuyển công việc sang chờ linh kiện",
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
      thongBao: "Tiếp tục xử lý công việc thành công",
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
      thongBao: "Lấy hồ sơ sửa chữa thành công",
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
      thongBao: "Hoàn thành sửa chữa thành công",
      duLieu: suCo
    });
  } catch (loi) {
    await xoaAnhDaTai(req.files);
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
  hoanThanhSuaChua
};
