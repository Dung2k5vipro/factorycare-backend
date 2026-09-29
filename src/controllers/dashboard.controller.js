const dashboardService = require("../services/dashboard.service");

async function layTongQuanDashboard(req, res, next) {
  try {
    const tongQuan = await dashboardService.layTongQuanDashboard(req.query);
    return res.status(200).json({
      thanhCong: true,
      thongBao: "Lấy Dashboard tổng quan thành công",
      duLieu: tongQuan
    });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  layTongQuanDashboard
};
