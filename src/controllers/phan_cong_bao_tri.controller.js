const phanCongBaoTriService = require("../services/phan_cong_bao_tri.service");

async function phanCongKeHoach(req, res, next) {
  try {
    const ketQua = await phanCongBaoTriService.phanCongKeHoach(
      req.params.id,
      req.body
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Phân công kỹ thuật viên bảo trì thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layKeHoachCuaToi(req, res, next) {
  try {
    const ketQua = await phanCongBaoTriService.layKeHoachCuaToi(
      req.query,
      req.nguoiDung
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy kế hoạch bảo trì của tôi thành công",
      duLieu: ketQua
    });
  } catch (loi) {
    return next(loi);
  }
}

async function layLichSuPhanCong(req, res, next) {
  try {
    const danhSach = await phanCongBaoTriService.layLichSuPhanCong(
      req.params.id
    );
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy lịch sử phiếu phân công bảo trì thành công",
      duLieu: { danhSach }
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  phanCongKeHoach,
  layKeHoachCuaToi,
  layLichSuPhanCong
};
