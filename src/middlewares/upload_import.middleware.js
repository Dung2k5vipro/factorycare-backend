const path = require("path");

const multer = require("multer");

const KICH_THUOC_TEP_TOI_DA = 5 * 1024 * 1024;
const DANH_SACH_DUOI_TEP_HOP_LE = [".xlsx", ".csv"];
const DANH_SACH_MIME_HOP_LE = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "text/plain",
  "application/octet-stream"
];

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: KICH_THUOC_TEP_TOI_DA,
    files: 1
  },
  fileFilter(req, file, callback) {
    const duoiTep = path.extname(file.originalname || "").toLowerCase();
    const coDuoiTepHopLe = DANH_SACH_DUOI_TEP_HOP_LE.includes(duoiTep);
    const coMimeHopLe = DANH_SACH_MIME_HOP_LE.includes(file.mimetype);

    if (!coDuoiTepHopLe || !coMimeHopLe) {
      return callback(taoLoi("File import chỉ hỗ trợ Excel hoặc CSV", 400));
    }

    return callback(null, true);
  }
});

function uploadTepImport(req, res, next) {
  upload.single("tep")(req, res, (loi) => {
    if (loi) {
      if (loi.code === "LIMIT_FILE_SIZE") {
        return next(taoLoi("File import không được vượt quá 5MB", 400));
      }

      if (loi.code === "LIMIT_FILE_COUNT") {
        return next(taoLoi("Chỉ được tải lên một file import", 400));
      }

      return next(loi);
    }

    return next();
  });
}

module.exports = {
  uploadTepImport
};
