# MODULE 2 CONTEXT — QUẢN LÝ THIẾT BỊ

> Project: **FactoryCare — Hệ thống quản lý sự cố & bảo trì thiết bị trong nhà máy**
> Module đang phát triển: **Module 2 — Quản lý thiết bị**

## 1. MỤC ĐÍCH

AI phải đọc file này trước khi sinh hoặc sửa code Module 2.

Mục tiêu:

- Hiểu đúng nghiệp vụ.
- Không tự mở rộng chức năng.
- Không thay đổi kiến trúc dự án.
- Không sửa database tùy ý.
- Không làm lệch sang Module 3, 4, 5.
- Không tạo code dang dở hoặc TODO.

---

## 2. KIẾN TRÚC HIỆN TẠI

```text
Backend: Node.js
Database: MySQL
Web Admin: Next.js
Mobile: React Native
```

Project hiện được tách thành 3 phần/repo độc lập:

```text
Backend
Web Admin
Mobile
```

Không tự chuyển sang framework, database hoặc kiến trúc khác.

Backend là nơi xử lý nghiệp vụ chính.

---

## 3. 5 MODULE CỦA FACTORYCARE

```text
1. Người dùng & Phân quyền
2. Quản lý thiết bị
3. Sự cố & Sửa chữa
4. Quản lý bảo trì
5. Dashboard & Báo cáo
```

Đang làm:

> **Module 2 — Quản lý thiết bị**

Không tự tạo thêm module cấp cao.

---

## 4. PHẠM VI MODULE 2

Module 2 quản lý hồ sơ và vòng đời thiết bị:

```text
Loại thiết bị
Thiết bị
Sinh mã thiết bị
Import Excel/CSV
QR Code
Vị trí thiết bị
Điều chuyển
Lịch sử điều chuyển
Nhà cung cấp
Lô nhập
Bảo hành
Trạng thái thiết bị
Timeline thiết bị
```

Các chức năng trên thuộc Module 2, không tách thành module riêng.

---

## 5. VAI TRÒ

Role hiện tại:

```text
QUAN_TRI_VIEN
KY_THUAT_VIEN
NHAN_VIEN
```

### Admin

Có quyền quản lý:

- Loại thiết bị.
- Thiết bị.
- Import.
- QR.
- Vị trí.
- Điều chuyển.
- Nhà cung cấp.
- Lô nhập.
- Bảo hành.
- Timeline.

### Technician

Chủ yếu:

- Xem thiết bị.
- Tìm thiết bị.
- Quét QR.
- Xem thông tin kỹ thuật.
- Xem vị trí và lịch sử cần thiết.

### Employee

Chủ yếu:

- Quét QR.
- Xem thông tin thiết bị rút gọn.
- Xem trạng thái/vị trí.
- Báo sự cố.

Employee không xem dữ liệu nhạy cảm như giá mua, hóa đơn hoặc thông tin thương mại NCC.

---

## 6. DATABASE MODULE 2 HIỆN TẠI

Các bảng chính:

```text
loai_thiet_bi
vi_tri
nha_cung_cap
lo_nhap
thiet_bi
dieu_chuyen_thiet_bi
```

Bảng trung tâm:

```text
thiet_bi
```

Các trường chính hiện tại:

```text
id
ma_thiet_bi
ten_thiet_bi
loai_thiet_bi_id
vi_tri_id
lo_nhap_id
so_serial
model
hang_san_xuat
ma_qr
anh_thiet_bi
gia_mua
ngay_bat_dau_bao_hanh
ngay_het_bao_hanh
trang_thai
mo_ta
ngay_tao
ngay_cap_nhat
```

Không tự đổi tên bảng hoặc tên cột.

---

## 7. LOẠI THIẾT BỊ VÀ SINH MÃ

Thiết bị được sinh mã theo loại.

Ví dụ:

```text
Máy CNC → CNC → CNC-0001
Máy ép  → EP  → EP-0001
```

Quy tắc:

- Mã thiết bị phải unique.
- Backend chịu trách nhiệm sinh mã.
- Frontend không tự sinh mã chính thức.
- Phải xử lý trường hợp nhiều request sinh mã cùng lúc.

Không cho người dùng tùy ý sửa `ma_thiet_bi` sau khi đã tạo.

---

## 8. THÊM VÀ IMPORT THIẾT BỊ

Flow thêm thiết bị:

```text
Chọn loại
→ Validate
→ Sinh mã
→ Tạo thiết bị
→ Sinh QR
→ Gán vị trí
→ Lưu
```

Flow Import:

```text
Upload Excel/CSV
→ Parse
→ Validate từng dòng
→ Preview
→ Admin xác nhận
→ Sinh mã
→ Tạo thiết bị
→ Sinh QR
```

Không sinh mã chính thức khi mới Preview.

Phải kiểm tra:

- Loại thiết bị tồn tại.
- Serial không trùng.
- Vị trí tồn tại.
- Lô nhập tồn tại nếu có.
- Dữ liệu bắt buộc hợp lệ.

---

## 9. QR CODE

Mỗi thiết bị có QR để nhận diện tại hiện trường.

Flow:

```text
Quét QR
→ Tìm thiết bị
→ Kiểm tra quyền
→ Mở chi tiết thiết bị
```

QR chỉ nên chứa identifier/deep link, không chứa dữ liệu nhạy cảm.

Sau khi Employee quét QR, CTA chính là:

```text
BÁO SỰ CỐ
```

---

## 10. VỊ TRÍ

Nghiệp vụ mong muốn:

```text
XƯỞNG
→ DÂY CHUYỀN
→ Ô MÁY
```

Database hiện tại dùng bảng `vi_tri` dạng cây cha-con.

Enum hiện tại:

```text
NHA_MAY
XUONG
DAY_CHUYEN
KHU_VUC
```

Tài liệu nghiệp vụ dùng `Ô máy` nhưng database đang dùng `KHU_VUC`.

AI KHÔNG được tự sửa enum/database.

Nếu task liên quan, phải chỉ ra sự khác biệt trước khi migration.

---

## 11. ĐIỀU CHUYỂN THIẾT BỊ

Không được chỉ sửa trực tiếp:

```text
thiet_bi.vi_tri_id
```

khi thiết bị thực sự được chuyển vị trí.

Phải thực hiện nghiệp vụ:

```text
Lấy vị trí cũ
→ Chọn vị trí mới
→ Validate
→ Ghi dieu_chuyen_thiet_bi
→ Cập nhật vi_tri_id
```

Ưu tiên transaction.

Không được mất lịch sử vị trí cũ.

---

## 12. LÔ NHẬP VÀ NHÀ CUNG CẤP

`lo_nhap` dùng để truy xuất nguồn gốc thiết bị.

Thiết bị liên kết:

```text
thiet_bi.lo_nhap_id
```

Lô nhập liên kết:

```text
nha_cung_cap
hoa don
ngay nhap
```

Mục đích:

- Truy vết thiết bị.
- Biết thiết bị thuộc lô nào.
- Xác định nhà cung cấp.
- Hỗ trợ phân tích tỷ lệ lỗi theo lô.

Không phát triển thành:

```text
ERP
Kế toán
Công nợ
Thanh toán
Purchase Order
Kho thương mại
```

---

## 13. BẢO HÀNH

Hiện tại dùng:

```text
ngay_bat_dau_bao_hanh
ngay_het_bao_hanh
```

Trạng thái bảo hành nên được tính từ ngày:

```text
Còn bảo hành
Hết bảo hành
Chưa xác định
```

Không tự tạo thêm bảng hoặc trạng thái nếu chưa có yêu cầu.

---

## 14. TRẠNG THÁI THIẾT BỊ HIỆN TẠI

Database hiện có:

```text
DANG_HOAT_DONG
DANG_BAO_TRI
DANG_HONG
NGUNG_HOAT_DONG
THANH_LY
```

Không tự thêm/xóa enum nếu chưa được yêu cầu migration.

Thiết bị ngừng hoạt động hoặc thanh lý không được xóa khỏi database.

Phải giữ để truy vết lịch sử.

---

## 15. TIMELINE

Timeline nằm trong hồ sơ thiết bị.

Có thể tổng hợp:

```text
Tạo thiết bị
Điều chuyển
Đổi trạng thái
Sự cố
Sửa chữa
Bảo trì
Thay linh kiện
Thanh lý
```

Timeline không phải module riêng và không thay thế dữ liệu gốc.

---

## 16. BACKEND STRUCTURE

Tuân thủ kiến trúc hiện tại:

```text
Route
→ Controller
→ Service
→ Model
→ MySQL
```

### Controller

Chỉ:

- Nhận request.
- Gọi service.
- Trả response.

### Service

Xử lý nghiệp vụ:

- Validation nghiệp vụ.
- Sinh mã.
- Import.
- Điều chuyển.
- Transaction.

### Model

Xử lý truy vấn database.

Không viết toàn bộ nghiệp vụ hoặc SQL trực tiếp trong Controller.

---

## 17. QUY TẮC ĐẶT TÊN

Ưu tiên tiếng Việt không dấu:

```javascript
layDanhSachThietBi();
layChiTietThietBi();
taoThietBi();
capNhatThietBi();
dieuChuyenThietBi();
kiemTraSerialTonTai();
```

Trước khi code phải đọc nếu tồn tại:

```text
AGENT.md
QUY_CHUAN_DAT_TEN_BIEN.md
```

Quy chuẩn project có ưu tiên cao hơn ví dụ trong file này.

---

## 18. SECURITY

API phải kiểm tra:

```text
JWT
+
Role / Permission
```

Không chỉ ẩn nút trên frontend.

Employee gọi trực tiếp API quản trị phải bị backend từ chối.

---

## 19. TRANSACTION

Ưu tiên transaction cho:

```text
Sinh mã + tạo thiết bị
Import hàng loạt
Điều chuyển thiết bị
Update thiết bị + ghi lịch sử
```

Không để dữ liệu rơi vào trạng thái nửa hoàn thành.

---

## 20. NGUYÊN TẮC CHO AI

Khi nhận task Module 2:

1. Đọc file này.
2. Đọc `AGENT.md`.
3. Đọc `QUY_CHUAN_DAT_TEN_BIEN.md`.
4. Kiểm tra code hiện tại.
5. Kiểm tra database hiện tại.
6. Chỉ sửa đúng phạm vi task.
7. Không tự thay kiến trúc.
8. Không tự thêm bảng.
9. Không tự đổi tên bảng/cột.
10. Không làm sang module khác nếu không cần.
11. File được yêu cầu phải hoàn chỉnh.
12. Không để TODO hoặc placeholder.

---

## 21. KHI DOCUMENT, DATABASE VÀ CODE KHÁC NHAU

Không tự đoán và tự sửa.

Phải:

```text
Phát hiện khác biệt
→ Xác định code/database hiện tại
→ Không phá hệ thống
→ Chỉ migration khi được yêu cầu
```

Ví dụ:

```text
Nghiệp vụ: Ô máy
Database: KHU_VUC
```

Không được tự đổi database.

---

## 22. SOURCE OF TRUTH

Ưu tiên theo thứ tự:

```text
1. Yêu cầu mới nhất của user
2. AGENT.md / quy chuẩn project
3. MODULE_2_CONTEXT.md
4. Database hiện tại
5. Code hiện tại
6. Tài liệu nghiệp vụ
```

Không phá code/database hiện tại chỉ để ép khớp tài liệu nếu chưa được yêu cầu.

---

## 23. TUYỆT ĐỐI KHÔNG TỰ Ý

```text
❌ Thêm module mới
❌ Đổi framework
❌ Đổi database
❌ Đổi kiến trúc project
❌ Đổi tên bảng/cột
❌ Thêm ERP/kế toán
❌ Sinh mã thiết bị ở frontend
❌ Sửa vị trí mà không lưu history
❌ Xóa thiết bị đã ngừng sử dụng
❌ Bỏ JWT/role validation
❌ Tạo code TODO/placeholder
❌ Làm chức năng ngoài task
```

---

## 24. MỤC TIÊU MODULE 2

Flow cuối cùng:

```text
Admin tạo loại thiết bị
→ Tạo/Import thiết bị
→ Backend sinh mã
→ Sinh QR
→ Gán vị trí
→ Đưa vào vận hành
→ Mobile quét QR
→ Xem thiết bị
→ Điều chuyển khi cần
→ Sự cố/Bảo trì cập nhật lịch sử
→ Giữ Timeline toàn bộ vòng đời
```

> **Module 2 phải là nguồn dữ liệu trung tâm về hồ sơ và vòng đời của thiết bị trong FactoryCare.**
