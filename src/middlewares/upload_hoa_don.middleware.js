const fs = require("fs");
const path = require("path");

const multer = require("multer");

const KICH_THUOC_TEP_TOI_DA = 5 * 1024 * 1024;
const THU_MUC_UPLOAD_HOA_DON = path.join(process.cwd(), "uploads", "hoa_don");
const DANH_SACH_DUOI_TEP_HOP_LE = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const DANH_SACH_MIME_HOP_LE = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/octet-stream"
];

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;

  return loi;
}

fs.mkdirSync(THU_MUC_UPLOAD_HOA_DON, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, THU_MUC_UPLOAD_HOA_DON);
    },
    filename(req, file, callback) {
      const duoiTep = path.extname(file.originalname || "").toLowerCase();
      const tenTep = `hoa_don_${Date.now()}_${Math.round(Math.random() * 1e9)}${duoiTep}`;

      callback(null, tenTep);
    }
  }),
  limits: {
    fileSize: KICH_THUOC_TEP_TOI_DA,
    files: 1
  },
  fileFilter(req, file, callback) {
    const duoiTep = path.extname(file.originalname || "").toLowerCase();
    const coDuoiTepHopLe = DANH_SACH_DUOI_TEP_HOP_LE.includes(duoiTep);
    const coMimeHopLe = DANH_SACH_MIME_HOP_LE.includes(file.mimetype);

    if (!coDuoiTepHopLe || !coMimeHopLe) {
      return callback(taoLoi("File hoa don chi ho tro PDF hoac hinh anh", 400));
    }

    return callback(null, true);
  }
});

function uploadTepHoaDon(req, res, next) {
  upload.fields([
    { name: "fileHoaDon", maxCount: 1 },
    { name: "tepHoaDon", maxCount: 1 }
  ])(req, res, (loi) => {
    if (loi) {
      if (loi.code === "LIMIT_FILE_SIZE") {
        return next(taoLoi("File hoa don khong duoc vuot qua 5MB", 400));
      }

      if (loi.code === "LIMIT_FILE_COUNT") {
        return next(taoLoi("Chi duoc upload mot file hoa don", 400));
      }

      return next(loi);
    }

    const fileHoaDon = (req.files && req.files.fileHoaDon && req.files.fileHoaDon[0]) || null;
    const tepHoaDon = (req.files && req.files.tepHoaDon && req.files.tepHoaDon[0]) || null;

    req.fileHoaDon = fileHoaDon || tepHoaDon;

    return next();
  });
}

module.exports = {
  uploadTepHoaDon
};
