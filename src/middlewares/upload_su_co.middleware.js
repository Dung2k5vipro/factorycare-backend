const fs = require("fs");
const path = require("path");

const multer = require("multer");

const SO_ANH_TOI_DA = 3;
const KICH_THUOC_ANH_TOI_DA = 5 * 1024 * 1024;
const THU_MUC_UPLOAD = path.join(process.cwd(), "uploads", "su_co");
const MIME_HOP_LE = new Set(["image/jpeg", "image/png", "image/webp"]);
const DUOI_TEP_THEO_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

function taoLoi(thongBao, maTrangThai = 400) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;
  return loi;
}

fs.mkdirSync(THU_MUC_UPLOAD, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, THU_MUC_UPLOAD);
    },
    filename(req, file, callback) {
      const duoiTep = DUOI_TEP_THEO_MIME[file.mimetype];
      const tenTep = `su_co_${Date.now()}_${Math.round(Math.random() * 1e9)}${duoiTep}`;
      callback(null, tenTep);
    }
  }),
  limits: { fileSize: KICH_THUOC_ANH_TOI_DA, files: SO_ANH_TOI_DA },
  fileFilter(req, file, callback) {
    if (!MIME_HOP_LE.has(file.mimetype)) {
      return callback(taoLoi("Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP"));
    }
    return callback(null, true);
  }
});

function layLoiUploadAnToan(loi) {
  if (loi.code === "LIMIT_FILE_SIZE") {
    return taoLoi("Mỗi ảnh không được vượt quá 5MB");
  }
  if (loi.code === "LIMIT_FILE_COUNT" || loi.code === "LIMIT_UNEXPECTED_FILE") {
    return taoLoi(`Chỉ được tải tối đa ${SO_ANH_TOI_DA} ảnh`);
  }
  return loi;
}

function xuLyLoiUpload(loi, req, next) {
  if (!loi) return next();

  const loiAnToan = layLoiUploadAnToan(loi);
  return xoaAnhDaTai(req.files).finally(() => next(loiAnToan));
}

function uploadAnhSuCo(req, res, next) {
  upload.array("hinhAnh", SO_ANH_TOI_DA)(req, res, (loi) =>
    xuLyLoiUpload(loi, req, next)
  );
}

function uploadAnhSuaChua(req, res, next) {
  upload.array("hinhAnhSuaChua", SO_ANH_TOI_DA)(req, res, (loi) =>
    xuLyLoiUpload(loi, req, next)
  );
}

function layDanhSachDuongDanAnh(files = []) {
  return files.map((file) => `/uploads/su_co/${file.filename}`);
}

async function xoaAnhDaTai(files = []) {
  await Promise.all(
    files.map((file) => fs.promises.unlink(file.path).catch(() => undefined))
  );
}

module.exports = {
  layDanhSachDuongDanAnh,
  uploadAnhSuCo,
  uploadAnhSuaChua,
  xoaAnhDaTai
};
