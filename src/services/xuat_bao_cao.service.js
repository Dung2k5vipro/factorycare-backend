const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const baoCaoService = require("./bao_cao.service");

const DINH_DANG_XUAT = {
  EXCEL: "excel",
  PDF: "pdf"
};

const TEN_BAO_CAO = {
  [baoCaoService.LOAI_BAO_CAO.SU_CO]: "Báo cáo sự cố",
  [baoCaoService.LOAI_BAO_CAO.SUA_CHUA]: "Báo cáo sửa chữa",
  [baoCaoService.LOAI_BAO_CAO.BAO_TRI]: "Báo cáo bảo trì",
  [baoCaoService.LOAI_BAO_CAO.THIET_BI]: "Báo cáo thiết bị"
};

const CAU_HINH_COT = {
  [baoCaoService.LOAI_BAO_CAO.SU_CO]: [
    { tieuDe: "Mã sự cố", layGiaTri: (dong) => dong.maSuCo, doRong: 18 },
    { tieuDe: "Tiêu đề", layGiaTri: (dong) => dong.tieuDe, doRong: 30 },
    { tieuDe: "Thiết bị", layGiaTri: (dong) => dinhDangThietBi(dong.thietBi), doRong: 28 },
    { tieuDe: "Loại thiết bị", layGiaTri: (dong) => dong.loaiThietBi?.tenLoai, doRong: 22 },
    { tieuDe: "Vị trí hiện tại", layGiaTri: (dong) => dong.viTriHienTai?.tenViTri, doRong: 22 },
    { tieuDe: "Mức độ", layGiaTri: (dong) => dong.mucDo, doRong: 16 },
    { tieuDe: "Trạng thái", layGiaTri: (dong) => dong.trangThai, doRong: 18 },
    { tieuDe: "Kỹ thuật viên", layGiaTri: (dong) => dong.kyThuatVien?.hoTen, doRong: 24 },
    { tieuDe: "Thời gian báo", layGiaTri: (dong) => dong.thoiGianBao, doRong: 22 },
    { tieuDe: "Hoàn thành", layGiaTri: (dong) => dong.thoiGianHoanThanh, doRong: 22 }
  ],
  [baoCaoService.LOAI_BAO_CAO.SUA_CHUA]: [
    { tieuDe: "Mã sự cố", layGiaTri: (dong) => dong.maSuCo, doRong: 18 },
    { tieuDe: "Thiết bị", layGiaTri: (dong) => dinhDangThietBi(dong.thietBi), doRong: 28 },
    { tieuDe: "Loại thiết bị", layGiaTri: (dong) => dong.loaiThietBi?.tenLoai, doRong: 22 },
    { tieuDe: "Vị trí hiện tại", layGiaTri: (dong) => dong.viTriHienTai?.tenViTri, doRong: 22 },
    { tieuDe: "Kỹ thuật viên", layGiaTri: (dong) => dong.kyThuatVien?.hoTen, doRong: 24 },
    { tieuDe: "Nguyên nhân", layGiaTri: (dong) => dong.nguyenNhan, doRong: 32 },
    { tieuDe: "Cách xử lý", layGiaTri: (dong) => dong.cachXuLy, doRong: 32 },
    { tieuDe: "Kết quả", layGiaTri: (dong) => dong.ketQua, doRong: 18 },
    { tieuDe: "Bắt đầu", layGiaTri: (dong) => dong.thoiGianBatDau, doRong: 22 },
    { tieuDe: "Hoàn thành", layGiaTri: (dong) => dong.thoiGianHoanThanh, doRong: 22 }
  ],
  [baoCaoService.LOAI_BAO_CAO.BAO_TRI]: [
    { tieuDe: "Mã thiết bị", layGiaTri: (dong) => dong.thietBi?.maThietBi, doRong: 18 },
    { tieuDe: "Tên thiết bị", layGiaTri: (dong) => dong.thietBi?.tenThietBi, doRong: 28 },
    { tieuDe: "Loại thiết bị", layGiaTri: (dong) => dong.loaiThietBi?.tenLoai, doRong: 22 },
    { tieuDe: "Vị trí hiện tại", layGiaTri: (dong) => dong.viTriHienTai?.tenViTri, doRong: 22 },
    { tieuDe: "Kỹ thuật viên", layGiaTri: (dong) => dong.kyThuatVien?.hoTen, doRong: 24 },
    { tieuDe: "Ngày dự kiến", layGiaTri: (dong) => dong.ngayDuKien, doRong: 22 },
    { tieuDe: "Trạng thái", layGiaTri: (dong) => dong.trangThai, doRong: 20 },
    { tieuDe: "Đã quá hạn", layGiaTri: (dong) => dong.daQuaHan ? "Có" : "Không", doRong: 14 },
    { tieuDe: "Hoàn thành", layGiaTri: (dong) => dong.thoiGianHoanThanh, doRong: 22 },
    { tieuDe: "Kết quả bảo trì", layGiaTri: (dong) => dong.ketQuaBaoTri, doRong: 32 }
  ],
  [baoCaoService.LOAI_BAO_CAO.THIET_BI]: [
    { tieuDe: "Mã thiết bị", layGiaTri: (dong) => dong.maThietBi, doRong: 18 },
    { tieuDe: "Tên thiết bị", layGiaTri: (dong) => dong.tenThietBi, doRong: 30 },
    { tieuDe: "Loại thiết bị", layGiaTri: (dong) => dong.loaiThietBi?.tenLoai, doRong: 22 },
    { tieuDe: "Vị trí hiện tại", layGiaTri: (dong) => dong.viTriHienTai?.tenViTri, doRong: 22 },
    { tieuDe: "Trạng thái", layGiaTri: (dong) => dong.trangThai, doRong: 20 },
    { tieuDe: "Model", layGiaTri: (dong) => dong.model, doRong: 20 },
    { tieuDe: "Hãng sản xuất", layGiaTri: (dong) => dong.hangSanXuat, doRong: 22 },
    { tieuDe: "Số sự cố", layGiaTri: (dong) => dong.soSuCo, doRong: 14 },
    { tieuDe: "Bảo trì quá hạn", layGiaTri: (dong) => dong.soBaoTriQuaHan, doRong: 18 },
    { tieuDe: "Ngày tạo", layGiaTri: (dong) => dong.ngayTao, doRong: 22 }
  ]
};

function taoLoi(thongBao, maTrangThai) {
  const loi = new Error(thongBao);
  loi.statusCode = maTrangThai;
  return loi;
}

function dinhDangThietBi(thietBi) {
  if (!thietBi) return "";
  return `${thietBi.maThietBi || ""} - ${thietBi.tenThietBi || ""}`.trim();
}

function dinhDangGiaTri(giaTri) {
  if (giaTri === undefined || giaTri === null || giaTri === "") return "";
  if (giaTri instanceof Date) {
    return giaTri.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }
  if (typeof giaTri === "object") {
    if (Object.prototype.hasOwnProperty.call(giaTri, "giaTri")) {
      return `${giaTri.giaTri} ${giaTri.donVi || ""}`.trim();
    }
    return JSON.stringify(giaTri);
  }
  return String(giaTri);
}

function chuyenTenTruong(tenTruong) {
  return tenTruong
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (kyTu) => kyTu.toUpperCase());
}

function layDanhSachCap(doiTuong, tienTo = "") {
  return Object.entries(doiTuong || {}).flatMap(([ten, giaTri]) => {
    const nhan = tienTo ? `${tienTo} - ${chuyenTenTruong(ten)}` : chuyenTenTruong(ten);
    if (
      giaTri &&
      typeof giaTri === "object" &&
      !Array.isArray(giaTri) &&
      !(giaTri instanceof Date) &&
      !Object.prototype.hasOwnProperty.call(giaTri, "giaTri")
    ) {
      return layDanhSachCap(giaTri, nhan);
    }
    return [{ nhan, giaTri: dinhDangGiaTri(giaTri) }];
  });
}

function layDinhDang(query = {}) {
  const giaTri = query.dinhDang ?? query.dinh_dang ?? DINH_DANG_XUAT.EXCEL;
  const dinhDang = String(giaTri).trim().toLowerCase();
  if (dinhDang === "xlsx") return DINH_DANG_XUAT.EXCEL;
  if (!Object.values(DINH_DANG_XUAT).includes(dinhDang)) {
    throw taoLoi("Định dạng xuất chỉ nhận excel hoặc pdf", 400);
  }
  return dinhDang;
}

function taoTenFile(loaiBaoCao, duoiFile) {
  const thoiDiem = new Date().toISOString().replace(/T/, "_").replace(/:/g, "-").slice(0, 16);
  return `${loaiBaoCao}_${thoiDiem}.${duoiFile}`;
}

function themThongTinChungExcel(worksheet, baoCao, tenBaoCao) {
  worksheet.mergeCells("A1:B1");
  worksheet.getCell("A1").value = "FACTORYCARE";
  worksheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
  worksheet.getCell("A2").value = "Tên báo cáo";
  worksheet.getCell("B2").value = tenBaoCao;
  worksheet.getCell("A3").value = "Thời điểm xuất";
  worksheet.getCell("B3").value = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  let dong = 5;
  worksheet.getCell(`A${dong}`).value = "BỘ LỌC";
  worksheet.getCell(`A${dong}`).font = { bold: true };
  dong += 1;
  for (const muc of layDanhSachCap(baoCao.boLoc)) {
    worksheet.getCell(`A${dong}`).value = muc.nhan;
    worksheet.getCell(`B${dong}`).value = muc.giaTri || "Không áp dụng";
    dong += 1;
  }

  dong += 1;
  worksheet.getCell(`A${dong}`).value = "CHỈ SỐ TỔNG QUAN";
  worksheet.getCell(`A${dong}`).font = { bold: true };
  dong += 1;
  for (const muc of layDanhSachCap(baoCao.tongQuan)) {
    worksheet.getCell(`A${dong}`).value = muc.nhan;
    worksheet.getCell(`B${dong}`).value = muc.giaTri;
    dong += 1;
  }
  worksheet.columns = [{ width: 38 }, { width: 45 }];
}

async function taoExcel(baoCao) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FactoryCare";
  workbook.created = new Date();
  const tenBaoCao = TEN_BAO_CAO[baoCao.loaiBaoCao];
  const tongQuanSheet = workbook.addWorksheet("Tổng quan");
  themThongTinChungExcel(tongQuanSheet, baoCao, tenBaoCao);

  const chiTietSheet = workbook.addWorksheet("Chi tiết", {
    views: [{ state: "frozen", ySplit: 1 }]
  });
  const cauHinhCot = CAU_HINH_COT[baoCao.loaiBaoCao];
  chiTietSheet.columns = cauHinhCot.map((cot, viTri) => ({
    header: cot.tieuDe,
    key: `cot_${viTri}`,
    width: cot.doRong
  }));
  chiTietSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  chiTietSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" }
  };
  chiTietSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: cauHinhCot.length }
  };

  for (const banGhi of baoCao.danhSach) {
    chiTietSheet.addRow(
      Object.fromEntries(
        cauHinhCot.map((cot, viTri) => [
          `cot_${viTri}`,
          dinhDangGiaTri(cot.layGiaTri(banGhi))
        ])
      )
    );
  }
  chiTietSheet.eachRow((row) => {
    row.alignment = { vertical: "top", wrapText: true };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(buffer),
    tenFile: taoTenFile(baoCao.loaiBaoCao, "xlsx"),
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  };
}

function timFontPdf() {
  const danhSach = [
    {
      thuong: "C:\\Windows\\Fonts\\arial.ttf",
      dam: "C:\\Windows\\Fonts\\arialbd.ttf"
    },
    {
      thuong: "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
      dam: "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    }
  ];
  return danhSach.find((font) => fs.existsSync(font.thuong) && fs.existsSync(font.dam)) || null;
}

function taoPdfDocument() {
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });
  const font = timFontPdf();
  if (!font) {
    throw taoLoi("Máy chủ chưa có font Unicode để xuất PDF tiếng Việt", 500);
  }
  doc.registerFont("FactoryCare", font.thuong);
  doc.registerFont("FactoryCare-Bold", font.dam);
  doc.font("FactoryCare");
  return doc;
}

function vietDongPdf(doc, nhan, giaTri) {
  doc.font("FactoryCare-Bold").text(`${nhan}: `, { continued: true });
  doc.font("FactoryCare").text(dinhDangGiaTri(giaTri) || "Không áp dụng");
}

function vietBangPdf(doc, baoCao) {
  const tatCaCot = CAU_HINH_COT[baoCao.loaiBaoCao];
  const cot = tatCaCot.slice(0, Math.min(tatCaCot.length, 7));
  const chieuRongBang = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const chieuRongCot = chieuRongBang / cot.length;
  const chieuCaoDong = 32;

  function vietTieuDeBang() {
    const y = doc.y;
    doc.rect(doc.page.margins.left, y, chieuRongBang, chieuCaoDong).fill("#1F4E78");
    cot.forEach((cauHinh, viTri) => {
      doc.fillColor("#FFFFFF")
        .font("FactoryCare-Bold")
        .fontSize(7)
        .text(
          cauHinh.tieuDe,
          doc.page.margins.left + viTri * chieuRongCot + 3,
          y + 5,
          { width: chieuRongCot - 6, height: chieuCaoDong - 8 }
        );
    });
    doc.fillColor("#000000");
    doc.y = y + chieuCaoDong;
  }

  vietTieuDeBang();
  for (const banGhi of baoCao.danhSach) {
    if (doc.y + chieuCaoDong > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      vietTieuDeBang();
    }
    const y = doc.y;
    doc.rect(doc.page.margins.left, y, chieuRongBang, chieuCaoDong).strokeColor("#B7C9D6").stroke();
    cot.forEach((cauHinh, viTri) => {
      doc.font("FactoryCare")
        .fontSize(6.5)
        .fillColor("#000000")
        .text(
          dinhDangGiaTri(cauHinh.layGiaTri(banGhi)),
          doc.page.margins.left + viTri * chieuRongCot + 3,
          y + 4,
          { width: chieuRongCot - 6, height: chieuCaoDong - 7, ellipsis: true }
        );
    });
    doc.y = y + chieuCaoDong;
  }
  if (baoCao.danhSach.length === 0) {
    doc.font("FactoryCare").fontSize(9).text("Không có dữ liệu phù hợp với bộ lọc.");
  }
}

async function taoPdf(baoCao) {
  const doc = taoPdfDocument();
  const danhSachBuffer = [];
  const hoanThanh = new Promise((resolve, reject) => {
    doc.on("data", (duLieu) => danhSachBuffer.push(duLieu));
    doc.on("end", () => resolve(Buffer.concat(danhSachBuffer)));
    doc.on("error", reject);
  });

  doc.font("FactoryCare-Bold").fontSize(18).fillColor("#1F4E78").text("FACTORYCARE");
  doc.font("FactoryCare-Bold").fontSize(15).fillColor("#000000")
    .text(TEN_BAO_CAO[baoCao.loaiBaoCao]);
  doc.moveDown(0.5);
  vietDongPdf(doc, "Thời điểm xuất", new Date());
  vietDongPdf(doc, "Tổng số bản ghi", baoCao.phanTrang.tongBanGhi);
  if (baoCao.boLoc.tuNgay || baoCao.boLoc.denNgay) {
    vietDongPdf(
      doc,
      "Khoảng thời gian",
      `${baoCao.boLoc.tuNgay || "đầu kỳ"} đến ${baoCao.boLoc.denNgay || "hiện tại"}`
    );
  }
  doc.moveDown(0.5);
  doc.font("FactoryCare-Bold").fontSize(11).text("Chỉ số tổng quan");
  for (const muc of layDanhSachCap(baoCao.tongQuan)) {
    vietDongPdf(doc, muc.nhan, muc.giaTri);
  }
  doc.moveDown(0.7);
  doc.font("FactoryCare-Bold").fontSize(11).text("Dữ liệu chi tiết");
  doc.moveDown(0.3);
  vietBangPdf(doc, baoCao);
  doc.end();

  return {
    buffer: await hoanThanh,
    tenFile: taoTenFile(baoCao.loaiBaoCao, "pdf"),
    contentType: "application/pdf"
  };
}

async function xuatBaoCao(loaiBaoCao, query = {}) {
  const dinhDang = layDinhDang(query);
  const baoCao = await baoCaoService.layBaoCao(loaiBaoCao, query, { xuatFile: true });
  return dinhDang === DINH_DANG_XUAT.PDF ? taoPdf(baoCao) : taoExcel(baoCao);
}

module.exports = {
  DINH_DANG_XUAT,
  xuatBaoCao
};
