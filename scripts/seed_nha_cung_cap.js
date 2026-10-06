require("dotenv").config();

const { pool } = require("../src/config/database");

const danhSachNhaCungCap = [
  ["Công ty TNHH Thiết bị Công nghiệp Minh Phát", "Nguyễn Văn Minh", "0901234501", "lienhe@minhphat-industrial.vn", "125 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh", "Cung cấp máy móc và thiết bị công nghiệp"],
  ["Công ty Cổ phần Tự động hóa An Khang", "Trần Quốc Huy", "0901234502", "kinhdoanh@ankhang-automation.vn", "48 Khuất Duy Tiến, Thanh Xuân, Hà Nội", "Chuyên thiết bị tự động hóa và cảm biến"],
  ["Công ty TNHH Kỹ thuật Cơ điện Đại Nam", "Lê Thị Thanh", "0901234503", "sales@dainam-mep.vn", "210 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh", "Thiết bị cơ điện và dịch vụ kỹ thuật"],
  ["Công ty Cổ phần Máy công nghiệp Hòa Bình", "Phạm Đức Long", "0901234504", "contact@hoabinh-machinery.vn", "36 Trần Phú, Hà Đông, Hà Nội", "Cung cấp máy gia công và phụ kiện"],
  ["Công ty TNHH Giải pháp Nhà máy Thông minh", "Võ Hoàng Nam", "0901234505", "info@smartfactory-solutions.vn", "72 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh", "Giải pháp giám sát và số hóa nhà máy"],
  ["Công ty TNHH Thiết bị Điện Thành Công", "Đặng Thu Hà", "0901234506", "kinhdoanh@thanhcong-electric.vn", "95 Lê Lợi, Hải Châu, Đà Nẵng", "Thiết bị điện công nghiệp và tủ điều khiển"],
  ["Công ty Cổ phần Công nghệ Cơ khí Việt", "Bùi Anh Tuấn", "0901234507", "sales@cokhiviet.vn", "18 Quốc lộ 1A, Dĩ An, Bình Dương", "Máy cơ khí chính xác và dụng cụ đo"],
  ["Công ty TNHH Tự động hóa Phương Nam", "Ngô Minh Châu", "0901234508", "lienhe@phuongnam-auto.vn", "230 Nguyễn Ảnh Thủ, Quận 12, TP. Hồ Chí Minh", "PLC, biến tần và thiết bị điều khiển"],
  ["Công ty Cổ phần Thiết bị Nhiệt Đông Dương", "Hoàng Gia Bảo", "0901234509", "contact@dongduong-thermal.vn", "51 Nguyễn Trãi, Ninh Kiều, Cần Thơ", "Thiết bị nhiệt, lò công nghiệp và phụ kiện"],
  ["Công ty TNHH Kỹ thuật Chính xác Tân Tiến", "Đỗ Khánh Linh", "0901234510", "sales@tantien-precision.vn", "102 Đại lộ Bình Dương, Thủ Dầu Một, Bình Dương", "Thiết bị đo lường và gia công chính xác"],
  ["Công ty TNHH Thiết bị Khí nén Á Châu", "Dương Quốc Việt", "0901234511", "kinhdoanh@achau-pneumatic.vn", "66 Phan Văn Trị, Gò Vấp, TP. Hồ Chí Minh", "Máy nén khí và linh kiện khí nén"],
  ["Công ty Cổ phần Robot Công nghiệp Việt Nam", "Mai Ngọc Anh", "0901234512", "info@robotviet.vn", "88 Duy Tân, Cầu Giấy, Hà Nội", "Robot công nghiệp và giải pháp tích hợp"],
  ["Công ty TNHH Giải pháp Năng lượng Hưng Thịnh", "Trịnh Minh Khoa", "0901234513", "contact@hungthinh-energy.vn", "145 Hùng Vương, Hồng Bàng, Hải Phòng", "Thiết bị tiết kiệm năng lượng cho nhà máy"],
  ["Công ty Cổ phần Bơm và Van Tiến Phát", "Lý Thanh Tâm", "0901234514", "sales@tienphat-pump.vn", "39 Đồng Khởi, Biên Hòa, Đồng Nai", "Bơm, van và thiết bị đường ống công nghiệp"],
  ["Công ty TNHH Thiết bị Đo lường Sao Việt", "Nguyễn Hải Yến", "0901234515", "lienhe@saoviet-instrument.vn", "27 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội", "Cảm biến và thiết bị đo lường công nghiệp"]
];

async function themDuLieuNhaCungCap() {
  const ketNoi = await pool.getConnection();

  try {
    await ketNoi.beginTransaction();

    const email = danhSachNhaCungCap.map((nhaCungCap) => nhaCungCap[3]);
    const dauHoi = email.map(() => "?").join(", ");
    const [duLieuTrung] = await ketNoi.execute(
      `SELECT email FROM nha_cung_cap WHERE email IN (${dauHoi})`,
      email
    );

    const emailDaTonTai = new Set(duLieuTrung.map((dong) => dong.email));
    const danhSachCanThem = danhSachNhaCungCap.filter(
      (nhaCungCap) => !emailDaTonTai.has(nhaCungCap[3])
    );

    if (danhSachCanThem.length === 0) {
      await ketNoi.commit();
      console.log("Không có dữ liệu mới. 15 nhà cung cấp đã tồn tại.");
      return;
    }

    const cumGiaTri = danhSachCanThem.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");
    const thamSo = danhSachCanThem.flat();
    const [ketQua] = await ketNoi.execute(
      `
        INSERT INTO nha_cung_cap (
          ten_nha_cung_cap,
          nguoi_lien_he,
          so_dien_thoai,
          email,
          dia_chi,
          ghi_chu
        )
        VALUES ${cumGiaTri}
      `,
      thamSo
    );

    await ketNoi.commit();
    console.log(
      `Đã thêm ${ketQua.affectedRows} nhà cung cấp, bỏ qua ${emailDaTonTai.size} bản ghi đã tồn tại.`
    );
  } catch (loi) {
    await ketNoi.rollback();
    throw loi;
  } finally {
    ketNoi.release();
    await pool.end();
  }
}

themDuLieuNhaCungCap().catch((loi) => {
  console.error(loi.message);
  process.exitCode = 1;
});
