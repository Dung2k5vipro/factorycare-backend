const DON_VI_CHU_KY = require("../constants/don_vi_chu_ky");

function chuyenNgayThanhChuoi(giaTri) {
  if (typeof giaTri === "string") {
    return giaTri.slice(0, 10);
  }

  if (giaTri instanceof Date && !Number.isNaN(giaTri.getTime())) {
    const nam = giaTri.getFullYear();
    const thang = String(giaTri.getMonth() + 1).padStart(2, "0");
    const ngay = String(giaTri.getDate()).padStart(2, "0");

    return `${nam}-${thang}-${ngay}`;
  }

  return giaTri;
}

function taoChuoiNgayUtc(nam, thang, ngay) {
  return new Date(Date.UTC(nam, thang, ngay)).toISOString().slice(0, 10);
}

function tinhNgayTheoChuKy(ngayMoc, giaTriChuKy, donViChuKy) {
  const [nam, thang, ngay] = ngayMoc.split("-").map(Number);

  if (donViChuKy === DON_VI_CHU_KY.NGAY) {
    return taoChuoiNgayUtc(nam, thang - 1, ngay + giaTriChuKy);
  }

  if (donViChuKy === DON_VI_CHU_KY.TUAN) {
    return taoChuoiNgayUtc(nam, thang - 1, ngay + giaTriChuKy * 7);
  }

  if (donViChuKy === DON_VI_CHU_KY.THANG) {
    const tongThang = nam * 12 + thang - 1 + giaTriChuKy;
    const namMoi = Math.floor(tongThang / 12);
    const thangMoi = tongThang % 12;
    const ngayCuoiThang = new Date(Date.UTC(namMoi, thangMoi + 1, 0)).getUTCDate();

    return taoChuoiNgayUtc(namMoi, thangMoi, Math.min(ngay, ngayCuoiThang));
  }

  if (donViChuKy === DON_VI_CHU_KY.NAM) {
    const namMoi = nam + giaTriChuKy;
    const ngayCuoiThang = new Date(Date.UTC(namMoi, thang, 0)).getUTCDate();

    return taoChuoiNgayUtc(namMoi, thang - 1, Math.min(ngay, ngayCuoiThang));
  }

  throw new Error("Đơn vị chu kỳ không hợp lệ");
}

module.exports = {
  chuyenNgayThanhChuoi,
  tinhNgayTheoChuKy
};
