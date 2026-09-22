# MODULE 4 — QUẢN LÝ BẢO TRÌ

## 1. Mục đích file

File này cung cấp context bắt buộc cho AI Agent khi phát triển **Module 4 — Quản lý bảo trì** của FactoryCare.

Agent phải đọc file này trước khi tạo/sửa code Module 4.

Mục tiêu:

- Không làm lệch nghiệp vụ.

- Không tự mở rộng phạm vi.

- Không tự thay đổi database.

- Không làm chức năng của Module 3 hoặc Module 5.

- Giữ đúng kiến trúc và quy chuẩn hiện có của project.

- Hoàn thiện từng phần, không để TODO hoặc code giả.

- Tận dụng đúng các bảng bảo trì đã tồn tại trong database.

---

# 2. Tổng quan project

Tên hệ thống:

**FactoryCare — Hệ thống quản lý sự cố & bảo trì thiết bị trong nhà máy**

Tech stack:

- Backend: Node.js

- Database: MySQL 8+

- Web Admin: Next.js

- Mobile: React Native

- Authentication: JWT

Project được chia thành 3 repo độc lập:

- Backend

- Web Admin

- Mobile

Backend phải là nguồn xử lý nghiệp vụ chính.

Frontend không được tự quyết định các rule nghiệp vụ quan trọng.

---

# 3. Các vai trò

Hệ thống hiện có 3 vai trò:

```text
QUAN_TRI_VIEN

KY_THUAT_VIEN

NHAN_VIEN
```

Tên nghiệp vụ tương ứng:

```text
QUAN_TRI_VIEN  = Admin

KY_THUAT_VIEN = Technician

NHAN_VIEN      = Employee
```

## NHAN_VIEN

Được:

- Xem thiết bị theo quyền.

- Quét QR thiết bị.

- Xem tình trạng thiết bị.

- Xem thông tin bảo trì cơ bản nếu giao diện cho phép.

- Xem ngày bảo trì tiếp theo của thiết bị nếu cần.

Không được:

- Tạo kế hoạch bảo trì.

- Phân công kỹ thuật viên.

- Tạo/sửa mẫu checklist.

- Bắt đầu hoặc hoàn thành phiếu bảo trì.

- Sửa kết quả bảo trì.

- Xem dữ liệu quản trị toàn hệ thống.

## KY_THUAT_VIEN

Được:

- Xem công việc bảo trì được giao.

- Xem chi tiết phiếu bảo trì của mình.

- Bắt đầu bảo trì.

- Thực hiện checklist.

- Ghi kết quả checklist.

- Ghi nội dung bảo trì.

- Ghi linh kiện thay thế.

- Ghi kết quả bảo trì.

- Hoàn thành công việc bảo trì được giao.

Không được:

- Quản lý người dùng.

- Tự tạo kế hoạch bảo trì nếu không có quyền Admin.

- Tự phân công công việc cho người khác.

- Tự sửa chu kỳ bảo trì.

- Sửa mẫu checklist quản trị nếu không được cấp quyền.

- Hoàn thành phiếu của Technician khác.

## QUAN_TRI_VIEN

Được:

- Xem toàn bộ kế hoạch bảo trì.

- Tạo kế hoạch bảo trì.

- Cập nhật kế hoạch bảo trì.

- Ngừng hoạt động kế hoạch.

- Phân công kỹ thuật viên.

- Tạo mẫu checklist.

- Cập nhật mẫu checklist.

- Theo dõi tiến độ bảo trì.

- Xem phiếu bảo trì.

- Xem kết quả bảo trì.

- Theo dõi công việc sắp đến hạn.

- Theo dõi công việc quá hạn.

- Xem các cảnh báo bảo trì.

---

# 4. Phạm vi Module 4

Module 4 chịu trách nhiệm toàn bộ luồng:

```text
Admin tạo mẫu checklist

        ↓

Admin tạo kế hoạch bảo trì

        ↓

Thiết lập chu kỳ bảo trì

        ↓

Xác định ngày bảo trì tiếp theo

        ↓

Phân công kỹ thuật viên

        ↓

Tạo / sử dụng phiếu bảo trì

        ↓

Technician xem công việc

        ↓

Technician bắt đầu bảo trì

        ↓

Thực hiện checklist

        ↓

Ghi kết quả + linh kiện thay thế

        ↓

Hoàn thành bảo trì

        ↓

Cập nhật phiếu bảo trì

        ↓

Tính ngày bảo trì tiếp theo

        ↓

Theo dõi sắp đến hạn / quá hạn

        ↓

Thông báo cho các bên liên quan
```

Module 4 bao gồm:

1. Lập kế hoạch bảo trì định kỳ.

2. Danh sách kế hoạch bảo trì.

3. Chi tiết kế hoạch bảo trì.

4. Cập nhật kế hoạch bảo trì.

5. Ngừng hoạt động kế hoạch bảo trì.

6. Phân công kỹ thuật viên bảo trì.

7. Công việc bảo trì của kỹ thuật viên.

8. Quản lý mẫu checklist.

9. Checklist bảo trì.

10. Phiếu bảo trì.

11. Bắt đầu bảo trì.

12. Thực hiện checklist.

13. Ghi kết quả bảo trì.

14. Ghi linh kiện thay thế.

15. Hoàn thành bảo trì.

16. Tính kỳ bảo trì tiếp theo.

17. Theo dõi sắp đến hạn.

18. Theo dõi quá hạn.

19. Thông báo liên quan bảo trì.

---

# 5. Cấu trúc nghiệp vụ Module 4

Module 4 được chia thành:

```text
M4.1 — Lập lịch bảo trì định kỳ

M4.2 — Phân công bảo trì

M4.3 — Checklist bảo trì

M4.4 — Thực hiện & ghi kết quả bảo trì

M4.5 — Cảnh báo sắp đến hạn & quá hạn
```

Thứ tự ưu tiên:

```text
M4.1

 ↓

M4.2

 ↓

M4.3

 ↓

M4.4

 ↓

M4.5
```

Không tự bỏ qua M4.4 để chuyển sang Module 5 khi chưa có yêu cầu.

---

# 6. Không thuộc Module 4

Agent KHÔNG tự phát triển các phần sau khi đang làm Module 4:

```text
Báo sự cố

Phân công xử lý sự cố

Hồ sơ sửa chữa sự cố

Dashboard tổng quan

Báo cáo thống kê

Export PDF / Excel

Health Score

Quản lý người dùng đầy đủ

CRUD thiết bị đầy đủ

Quản lý lô nhập

Quản lý nhà cung cấp

Quản lý hóa đơn

Quản lý kho linh kiện

Nhập kho

Xuất kho

Tồn kho

AI Predictive Maintenance
```

Các phần trên thuộc module khác hoặc nằm ngoài phạm vi MVP.

Module 4 có thể đọc dữ liệu:

```text
nguoi_dung

thiet_bi

loai_thiet_bi
```

nhưng không biến Module 4 thành nơi quản lý các entity này.

---

# 7. Database hiện tại là nguồn sự thật

Không tự tạo bảng mới nếu chưa được yêu cầu.

**Đặc biệt trong quá trình triển khai Module 4 hiện tại: KHÔNG sửa hoặc thêm database.**

Các bảng chính Module 4 hiện tại:

```text
mau_checklist

ke_hoach_bao_tri

phieu_bao_tri

thong_bao
```

Module 4 còn liên kết với:

```text
nguoi_dung

thiet_bi

loai_thiet_bi
```

Không tự tạo bảng:

```text
maintenance_tasks

maintenance_assignments

maintenance_history

maintenance_checklist_items

maintenance_results

maintenance_parts

lich_su_phan_cong_bao_tri

chi_tiet_checklist
```

nếu database hiện tại chưa có và người dùng chưa yêu cầu thay đổi schema.

KHÔNG:

```text
CREATE TABLE

ALTER TABLE

DROP TABLE

ADD COLUMN

MODIFY COLUMN

CHANGE ENUM
```

trong quá trình triển khai Module 4 nếu chưa được phép.

---

# 8. Bảng mau_checklist

Các dữ liệu quan trọng hiện có:

```text
id

ten_mau

loai_thiet_bi_id

danh_sach_hang_muc

mo_ta

trang_thai

nguoi_tao_id

ngay_tao

ngay_cap_nhat
```

`danh_sach_hang_muc` hiện được lưu dạng:

```text
JSON
```

Ví dụ:

```json
[
  {
    "id": 1,
    "noi_dung": "Kiểm tra dầu bôi trơn"
  },
  {
    "id": 2,
    "noi_dung": "Kiểm tra dây điện"
  }
]
```

Không tự tách thành bảng checklist item khi chưa có yêu cầu thay đổi database.

---

# 9. Trạng thái mẫu checklist

Database hiện tại sử dụng:

```text
HOAT_DONG

NGUNG_HOAT_DONG
```

Luồng cơ bản:

```text
HOAT_DONG

    ↓

NGUNG_HOAT_DONG
```

Không xóa cứng mẫu checklist đã được sử dụng trong lịch sử bảo trì.

Nếu không còn sử dụng:

```text
trang_thai = NGUNG_HOAT_DONG
```

Không tự thêm ENUM mới.

---

# 10. Bảng ke_hoach_bao_tri

Các dữ liệu quan trọng hiện có:

```text
id

thiet_bi_id

mau_checklist_id

ky_thuat_vien_id

gia_tri_chu_ky

don_vi_chu_ky

ngay_bat_dau

ngay_bao_tri_tiep_theo

trang_thai

mo_ta

ngay_tao

ngay_cap_nhat
```

Quan hệ chính:

```text
thiet_bi_id
→ thiet_bi.id

mau_checklist_id
→ mau_checklist.id

ky_thuat_vien_id
→ nguoi_dung.id
```

`ky_thuat_vien_id` có thể:

```text
NULL
```

Điều này có nghĩa kế hoạch có thể tồn tại trước khi được phân công Technician.

---

# 11. Chu kỳ bảo trì

Database hiện tại sử dụng:

```text
NGAY

TUAN

THANG

NAM
```

Trường:

```text
gia_tri_chu_ky
```

phải:

```text
> 0
```

Ví dụ:

```text
gia_tri_chu_ky = 7

don_vi_chu_ky = NGAY
```

nghĩa là:

```text
7 ngày bảo trì một lần
```

Ví dụ:

```text
gia_tri_chu_ky = 2

don_vi_chu_ky = THANG
```

nghĩa là:

```text
2 tháng bảo trì một lần
```

Backend phải chịu trách nhiệm tính:

```text
ngay_bao_tri_tiep_theo
```

Không để frontend tự quyết định ngày tiếp theo.

---

# 12. Trạng thái kế hoạch bảo trì

Database hiện tại:

```text
HOAT_DONG

NGUNG_HOAT_DONG
```

Không xóa kế hoạch chỉ vì không còn sử dụng.

Luồng cơ bản:

```text
HOAT_DONG

    ↓

NGUNG_HOAT_DONG
```

Kế hoạch:

```text
NGUNG_HOAT_DONG
```

không được tiếp tục sinh công việc bảo trì mới nếu logic hệ thống có bước sinh phiếu.

---

# 13. M4.1 — Lập lịch bảo trì định kỳ

Nguồn tạo kế hoạch chính:

```text
Web Admin
```

Luồng:

```text
Admin chọn thiết bị

        ↓

Chọn mẫu checklist

        ↓

Chọn chu kỳ

        ↓

Chọn ngày bắt đầu

        ↓

Backend validate

        ↓

Tính ngày bảo trì tiếp theo

        ↓

Tạo kế hoạch

        ↓

Kế hoạch = HOAT_DONG
```

Dữ liệu chính:

```text
thiet_bi_id

mau_checklist_id

ky_thuat_vien_id

gia_tri_chu_ky

don_vi_chu_ky

ngay_bat_dau

ngay_bao_tri_tiep_theo

mo_ta
```

Backend không được tin hoàn toàn giá trị ngày tiếp theo do frontend gửi nếu hệ thống đang có logic tự tính.

---

# 14. Kiểm tra trước khi tạo kế hoạch

Backend phải kiểm tra:

- Thiết bị tồn tại.

- Thiết bị chưa thanh lý.

- Mẫu checklist tồn tại.

- Mẫu checklist đang hoạt động nếu rule yêu cầu.

- Chu kỳ > 0.

- Đơn vị chu kỳ hợp lệ.

- Ngày bắt đầu hợp lệ.

Nếu có:

```text
ky_thuat_vien_id
```

phải kiểm tra:

- User tồn tại.

- User có role `KY_THUAT_VIEN`.

- User đang hoạt động.

Không được tạo kế hoạch cho thiết bị:

```text
THANH_LY
```

---

# 15. Controller M4.1 hiện tại

Controller hiện có:

```text
ke_hoach_bao_tri.controller.js
```

Các function đã sử dụng:

```text
layDanhSachKeHoach

layChiTietKeHoach

taoKeHoach

capNhatKeHoach

ngungHoatDongKeHoach
```

Không tự đổi tên các function này nếu không cần thiết.

Không tạo controller mới trùng chức năng.

---

# 16. API M4.1 hiện tại

Base route Module 4:

```text
/api/bao-tri
```

Các endpoint kế hoạch:

```text
GET /ke-hoach
```

```text
GET /ke-hoach/:id
```

```text
POST /ke-hoach
```

```text
PUT /ke-hoach/:id
```

```text
DELETE /ke-hoach/:id
```

`DELETE` trong nghiệp vụ hiện tại nên hiểu theo hướng:

```text
ngung hoạt động kế hoạch
```

không phải:

```text
DELETE vật lý record
```

nếu controller hiện tại đang dùng:

```text
ngungHoatDongKeHoach
```

---

# 17. M4.2 — Phân công bảo trì

Phân công thuộc quyền Admin.

Database hiện tại lưu Technician trực tiếp tại:

```text
ke_hoach_bao_tri.ky_thuat_vien_id
```

và:

```text
phieu_bao_tri.ky_thuat_vien_id
```

tùy giai đoạn nghiệp vụ.

Luồng cơ bản:

```text
Admin chọn kế hoạch / công việc

        ↓

Chọn Technician

        ↓

Backend kiểm tra Technician

        ↓

Gán Technician

        ↓

Tạo thông báo

        ↓

Technician thấy công việc
```

Phải kiểm tra:

- User tồn tại.

- User đang hoạt động.

- User có vai trò `KY_THUAT_VIEN`.

- Kế hoạch tồn tại.

- Kế hoạch đang hoạt động.

- Thiết bị chưa thanh lý.

---

# 18. Controller M4.2 hiện tại

Controller hiện có:

```text
phan_cong_bao_tri.controller.js
```

Các function:

```text
phanCongKeHoach

layKeHoachCuaToi

layLichSuPhanCong
```

Không tự đổi tên nếu chưa cần thiết.

Các route phân công nằm trong:

```text
bao_tri.routes.js
```

---

# 19. Lưu ý về lịch sử phân công

Database hiện tại chưa có bảng:

```text
lich_su_phan_cong_bao_tri
```

Không tự tạo bảng này.

Nếu function:

```text
layLichSuPhanCong
```

không thể cung cấp lịch sử đầy đủ với schema hiện tại:

- Chỉ sử dụng dữ liệu hiện có.

- Không giả lập dữ liệu.

- Không tự sửa database.

- Không tạo lịch sử không tồn tại.

Nếu nghiệp vụ yêu cầu lịch sử phân công đầy đủ hơn thì phải chờ yêu cầu thay đổi database riêng.

---

# 20. M4.3 — Checklist bảo trì

M4.3 chịu trách nhiệm quản lý:

```text
mau_checklist
```

Admin được:

- Xem danh sách mẫu.

- Xem chi tiết.

- Tạo mẫu checklist.

- Cập nhật mẫu checklist.

- Ngừng hoạt động mẫu.

Technician:

- Không sửa template.

- Chỉ sử dụng checklist trong quá trình thực hiện bảo trì.

Controller hiện tại:

```text
mau_checklist.controller.js
```

Không tự tạo thêm bảng item.

---

# 21. Checklist template và checklist thực tế

Phải phân biệt rõ:

```text
mau_checklist.danh_sach_hang_muc
```

là:

```text
TEMPLATE
```

Trong khi:

```text
phieu_bao_tri.ket_qua_checklist
```

là:

```text
KẾT QUẢ THỰC TẾ CỦA MỘT LẦN BẢO TRÌ
```

Không lưu kết quả bảo trì thực tế ngược vào:

```text
mau_checklist
```

Không sửa template chỉ vì Technician hoàn thành checklist.

---

# 22. Snapshot checklist

Nghiệp vụ mong muốn:

```text
Template checklist

        ↓

Phiếu bảo trì

        ↓

Snapshot checklist

        ↓

Technician thực hiện

        ↓

Lưu kết quả
```

Mục tiêu:

Nếu Admin sửa template trong tương lai:

```text
Lịch sử phiếu bảo trì cũ KHÔNG bị thay đổi.
```

Với database hiện tại, ưu tiên sử dụng:

```text
phieu_bao_tri.ket_qua_checklist
```

để lưu kết quả/snapshot thực tế.

Không tạo thêm bảng snapshot khi chưa được phép sửa database.

---

# 23. Bảng phieu_bao_tri

Đây là bảng chính của M4.4.

Các trường hiện có:

```text
id

ke_hoach_bao_tri_id

thiet_bi_id

ky_thuat_vien_id

ngay_du_kien

thoi_gian_bat_dau

thoi_gian_hoan_thanh

trang_thai

ket_qua_checklist

linh_kien_thay_the

ket_qua_bao_tri

ghi_chu

ngay_tao

ngay_cap_nhat
```

Quan hệ:

```text
ke_hoach_bao_tri_id
→ ke_hoach_bao_tri.id

thiet_bi_id
→ thiet_bi.id

ky_thuat_vien_id
→ nguoi_dung.id
```

Không tự tạo bảng:

```text
maintenance_task
```

vì:

```text
phieu_bao_tri
```

đã đóng vai trò công việc bảo trì thực tế.

---

# 24. Trạng thái phiếu bảo trì

Database hiện tại:

```text
CHO_THUC_HIEN

DANG_THUC_HIEN

HOAN_THANH

QUA_HAN

DA_HUY
```

Luồng cơ bản:

```text
CHO_THUC_HIEN

      ↓

DANG_THUC_HIEN

      ↓

HOAN_THANH
```

Nhánh quá hạn:

```text
CHO_THUC_HIEN

      ↓

QUA_HAN
```

Phiếu quá hạn vẫn có thể được thực hiện nếu nghiệp vụ cho phép:

```text
QUA_HAN

   ↓

DANG_THUC_HIEN

   ↓

HOAN_THANH
```

Nhánh hủy:

```text
CHO_THUC_HIEN / QUA_HAN

          ↓

        DA_HUY
```

Không cho frontend gửi trạng thái tùy ý.

Backend phải kiểm tra transition.

---

# 25. M4.4 — Thực hiện & ghi kết quả bảo trì

M4.4 là luồng Technician thực hiện công việc thực tế.

Luồng:

```text
Technician xem công việc

        ↓

Mở phiếu bảo trì

        ↓

Bắt đầu

        ↓

CHO_THUC_HIEN → DANG_THUC_HIEN

        ↓

Ghi thoi_gian_bat_dau

        ↓

Thực hiện checklist

        ↓

Ghi kết quả checklist

        ↓

Ghi nội dung bảo trì

        ↓

Ghi linh kiện thay thế nếu có

        ↓

Ghi kết quả bảo trì

        ↓

Hoàn thành

        ↓

HOAN_THANH

        ↓

Ghi thoi_gian_hoan_thanh

        ↓

Tính ngày bảo trì tiếp theo
```

Technician chỉ được thực hiện phiếu:

```text
được phân công cho chính mình
```

Backend phải kiểm tra ownership.

---

# 26. Bắt đầu bảo trì

Khi Technician bắt đầu:

```text
CHO_THUC_HIEN
```

hoặc trường hợp quá hạn hợp lệ:

```text
QUA_HAN
```

chuyển sang:

```text
DANG_THUC_HIEN
```

Cần cập nhật:

```text
trang_thai = DANG_THUC_HIEN
```

và:

```text
thoi_gian_bat_dau = thời gian hiện tại
```

Có thể cập nhật thiết bị:

```text
thiet_bi.trang_thai = DANG_BAO_TRI
```

nếu workflow hiện tại của backend đang đồng bộ trạng thái thiết bị.

Không cho:

```text
HOAN_THANH
```

bắt đầu lại.

Không cho:

```text
DA_HUY
```

bắt đầu lại.

---

# 27. Kết quả checklist

Kết quả thực tế lưu vào:

```text
phieu_bao_tri.ket_qua_checklist
```

Kiểu:

```text
JSON
```

Ví dụ:

```json
[
  {
    "noi_dung": "Kiểm tra dầu bôi trơn",
    "loai": "CHECKLIST",
    "trang_thai": "TOT",
    "ghi_chu": ""
  },
  {
    "noi_dung": "Kiểm tra dây điện",
    "loai": "CHECKLIST",
    "trang_thai": "CO_LOI",
    "ghi_chu": "Dây điện có dấu hiệu lão hóa"
  }
]
```

Có thể ghi thêm phát hiện:

```json
{
  "noi_dung": "Trục chính phát tiếng kêu bất thường",
  "loai": "PHAT_HIEN_THEM",
  "trang_thai": "CO_LOI",
  "ghi_chu": "Phát hiện khi chạy thử"
}
```

Không tự tạo bảng checklist result mới.

---

# 28. Linh kiện thay thế

Database hiện tại lưu:

```text
phieu_bao_tri.linh_kien_thay_the
```

dạng:

```text
JSON
```

Ví dụ:

```json
[
  {
    "ten": "Vòng bi SKF 6204",
    "so_luong": 2
  },
  {
    "ten": "Dây curoa B52",
    "so_luong": 1
  }
]
```

Module 4 chỉ ghi nhận:

```text
linh kiện đã sử dụng
```

KHÔNG xây dựng:

```text
tồn kho

nhập kho

xuất kho

giá vốn

phiếu xuất

phiếu nhập
```

Nếu số lượng được nhập:

```text
so_luong > 0
```

---

# 29. Hoàn thành bảo trì

Luồng:

```text
DANG_THUC_HIEN

        ↓

Validate checklist

        ↓

Validate kết quả

        ↓

Lưu ket_qua_checklist

        ↓

Lưu linh_kien_thay_the

        ↓

Lưu ket_qua_bao_tri

        ↓

Lưu ghi_chu

        ↓

trang_thai = HOAN_THANH

        ↓

thoi_gian_hoan_thanh = hiện tại

        ↓

Tính ngày bảo trì tiếp theo

        ↓

Cập nhật kế hoạch

        ↓

Cập nhật thiết bị phù hợp
```

Không được chỉ đổi:

```text
trang_thai = HOAN_THANH
```

mà không lưu kết quả cần thiết.

---

# 30. Validation khi hoàn thành

Backend phải kiểm tra:

- Phiếu tồn tại.

- Technician là người được giao.

- Phiếu đang ở trạng thái hợp lệ.

- Phiếu chưa `HOAN_THANH`.

- Phiếu chưa `DA_HUY`.

- Checklist bắt buộc đã hoàn thành nếu nghiệp vụ yêu cầu.

- Kết quả bảo trì hợp lệ.

Nếu phát hiện lỗi nhưng checklist chưa hoàn chỉnh:

```text
không được tự động đánh dấu HOAN_THANH
```

nếu rule yêu cầu hoàn thành checklist trước.

---

# 31. Kết quả bảo trì và trạng thái thiết bị

Khi bắt đầu bảo trì:

```text
thiet_bi.trang_thai
→ có thể chuyển DANG_BAO_TRI
```

Khi hoàn thành và thiết bị bình thường:

```text
DANG_BAO_TRI

    ↓

DANG_HOAT_DONG
```

Nếu phát hiện thiết bị hỏng:

```text
DANG_HONG
```

Không hard-code:

```text
Hoàn thành bảo trì = thiết bị luôn DANG_HOAT_DONG
```

Kết quả kỹ thuật phải quyết định trạng thái phù hợp.

Database trạng thái thiết bị hiện tại:

```text
DANG_HOAT_DONG

DANG_BAO_TRI

DANG_HONG

NGUNG_HOAT_DONG

THANH_LY
```

Không tự tạo trạng thái mới.

---

# 32. Tính ngày bảo trì tiếp theo

Sau khi hoàn thành bảo trì, hệ thống phải tính:

```text
ke_hoach_bao_tri.ngay_bao_tri_tiep_theo
```

dựa vào:

```text
gia_tri_chu_ky

don_vi_chu_ky
```

Ví dụ:

```text
gia_tri_chu_ky = 7

don_vi_chu_ky = NGAY
```

thì:

```text
ngày tiếp theo = ngày mốc + 7 ngày
```

Ví dụ:

```text
gia_tri_chu_ky = 1

don_vi_chu_ky = THANG
```

thì:

```text
ngày tiếp theo = ngày mốc + 1 tháng
```

Phải hỗ trợ:

```text
NGAY

TUAN

THANG

NAM
```

Không hard-code chỉ cho `THANG`.

Backend chịu trách nhiệm tính.

---

# 33. Mốc tính kỳ tiếp theo

Khi triển khai phải thống nhất theo logic hiện tại của project.

Có thể tính từ:

```text
ngày hoàn thành bảo trì
```

hoặc:

```text
ngày dự kiến của chu kỳ trước
```

Không được mỗi API dùng một cách khác nhau.

Nếu project hiện tại đã có quy tắc:

```text
giữ nguyên quy tắc đó.
```

Không tự thay đổi cách tính khi chưa có yêu cầu nghiệp vụ mới.

---

# 34. Phát hiện lỗi trong lúc bảo trì

Luồng nghiệp vụ có thể xảy ra:

```text
Technician bảo trì

        ↓

Phát hiện lỗi thiết bị

        ↓

Ghi vào checklist / kết quả

        ↓

Có thể tạo sự cố nếu hệ thống hỗ trợ
```

Nhưng database hiện tại không có quan hệ trực tiếp bắt buộc:

```text
phieu_bao_tri → su_co
```

Vì vậy:

**KHÔNG tự ALTER database để thêm foreign key.**

Nếu người dùng yêu cầu tạo sự cố từ phiếu bảo trì:

- Dùng các API/bảng hiện có nếu có thể.

- Không tự sửa schema.

---

# 35. M4.5 — Cảnh báo sắp đến hạn

Nguồn dữ liệu chính:

```text
ke_hoach_bao_tri.ngay_bao_tri_tiep_theo
```

Logic:

```text
Ngày hiện tại

      ↓

So sánh ngay_bao_tri_tiep_theo

      ↓

Nếu còn N ngày

      ↓

SẮP ĐẾN HẠN

      ↓

Hiển thị badge / filter / notification
```

Không cần tạo bảng cảnh báo riêng nếu dữ liệu có thể được tính từ ngày hiện tại.

---

# 36. M4.5 — Quá hạn bảo trì

Phiếu bảo trì hỗ trợ trạng thái:

```text
QUA_HAN
```

Có thể xem một công việc là quá hạn khi:

```text
ngay_du_kien < thời điểm hiện tại
```

và:

```text
trang_thai != HOAN_THANH
```

và:

```text
trang_thai != DA_HUY
```

Khi đủ điều kiện:

```text
CHO_THUC_HIEN

      ↓

QUA_HAN
```

Không tự thêm column:

```text
is_overdue
```

nếu trạng thái/ngày hiện có đã đủ.

---

# 37. Notification

Dùng bảng:

```text
thong_bao
```

Các trigger Module 4 quan trọng:

- Technician được phân công bảo trì.

- Công việc bảo trì sắp đến hạn.

- Công việc bảo trì quá hạn.

- Kế hoạch bảo trì đến kỳ.

- Phiếu bảo trì hoàn thành.

- Phiếu bảo trì bị hủy nếu nghiệp vụ yêu cầu.

Các loại notification hiện tại có thể sử dụng:

```text
PHAN_CONG

BAO_TRI

HE_THONG
```

Notification liên kết entity thông qua:

```text
doi_tuong_lien_quan_id
```

Không tạo module Notification riêng.

---

# 38. Phân quyền backend

Mọi API phải kiểm tra JWT và role.

Không được chỉ dựa vào việc frontend ẩn nút.

Ví dụ:

```text
NHAN_VIEN

→ xem thông tin bảo trì được phép

→ không tạo kế hoạch

→ không sửa phiếu
```

```text
KY_THUAT_VIEN

→ xem việc bảo trì của mình

→ bắt đầu công việc của mình

→ cập nhật checklist của mình

→ hoàn thành công việc của mình
```

```text
QUAN_TRI_VIEN

→ xem toàn bộ kế hoạch

→ tạo/sửa/ngừng kế hoạch

→ tạo/sửa checklist

→ phân công Technician

→ giám sát phiếu bảo trì
```

API trái quyền phải trả:

```text
403 Forbidden
```

---

# 39. Ownership của Technician

Technician chỉ được cập nhật phiếu nếu:

```text
phieu_bao_tri.ky_thuat_vien_id
=
user đăng nhập
```

Không được chỉ kiểm tra role:

```text
KY_THUAT_VIEN
```

mà bỏ qua ownership.

Ví dụ:

```text
Technician A
```

không được hoàn thành phiếu của:

```text
Technician B
```

Backend phải kiểm tra.

---

# 40. Quy tắc code

Trước khi code Agent phải đọc:

```text
MODULE4.md

AGENT.md

QUY_TAC_DAT_BIEN.md
```

hoặc file quy chuẩn đặt tên tương ứng đang tồn tại trong repo.

Phải tuân thủ cấu trúc project hiện có.

Không tự đổi architecture.

Không tự đổi naming convention.

Không tự đổi database.

Không viết lại JWT nếu hệ thống đã có JWT.

Tái sử dụng middleware authentication/authorization hiện có.

Không tự tạo hệ thống phân quyền mới.

---

# 41. Các file Module 4 hiện tại

Các file đã có hoặc đã được triển khai:

```text
src/controllers/ke_hoach_bao_tri.controller.js

src/controllers/phan_cong_bao_tri.controller.js

src/controllers/mau_checklist.controller.js

src/routes/bao_tri.routes.js
```

Trước khi tạo file:

```text
phieu_bao_tri.controller.js
```

hoặc file khác:

**Phải kiểm tra project hiện tại trước.**

Không tạo file duplicate.

Không tạo controller mới chỉ vì Agent muốn đổi kiến trúc.

---

# 42. Quy tắc hoàn thiện file

Khi tạo một file thì phải tạo hoàn chỉnh.

Ví dụ đã tạo:

```text
phieu_bao_tri.controller.js
```

thì phải viết đầy đủ code cần thiết của file đó trong phạm vi chức năng đang triển khai.

Không để:

```text
TODO

FIXME

coming soon

throw new Error("Not implemented")
```

Không tạo file rỗng để dành cho bước sau.

Không trả pseudocode khi người dùng đang yêu cầu code chạy được.

---

# 43. Kiến trúc xử lý

Tuân theo architecture hiện tại của backend.

Nếu project hiện tại đang dùng:

```text
Route

  ↓

Middleware

  ↓

Controller

  ↓

Database
```

thì tiếp tục đúng cấu trúc đó.

Nếu project đã có:

```text
Service

Model
```

thì tái sử dụng đúng layer hiện tại.

Không tự thêm Service/Repository chỉ cho riêng Module 4 nếu toàn project không dùng.

Không nhét SQL trực tiếp vào route.

Không thay đổi cấu trúc toàn backend chỉ để triển khai Module 4.

---

# 44. Router Module 4

File route chính:

```text
src/routes/bao_tri.routes.js
```

Base route:

```text
/api/bao-tri
```

Nên nhóm code theo:

```text
// =====================================================
// M4.1 - QUẢN LÝ KẾ HOẠCH BẢO TRÌ
// =====================================================
```

```text
// =====================================================
// M4.2 - PHÂN CÔNG BẢO TRÌ
// =====================================================
```

```text
// =====================================================
// M4.3 - MẪU CHECKLIST
// =====================================================
```

```text
// =====================================================
// M4.4 - THỰC HIỆN BẢO TRÌ
// =====================================================
```

```text
// =====================================================
// M4.5 - CẢNH BÁO BẢO TRÌ
// =====================================================
```

Không tự tạo:

```text
maintenance.routes.js
```

nếu project đang gom Module 4 trong:

```text
bao_tri.routes.js
```

---

# 45. API response

Giữ thống nhất response convention hiện có của project.

Không tự tạo chuẩn response khác chỉ cho Module 4.

Ví dụ nếu project đang dùng:

```json
{
  "thanhCong": true,
  "thongBao": "Thao tác thành công",
  "duLieu": {}
}
```

thì tiếp tục dùng convention đó.

HTTP status phải hợp lý:

```text
200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

500 Internal Server Error
```

Không trả:

```text
200
```

cho mọi trường hợp lỗi.

---

# 46. Transaction và concurrency

Đặc biệt cẩn thận ở:

- Phân công Technician.

- Bắt đầu bảo trì.

- Hoàn thành bảo trì.

- Cập nhật trạng thái thiết bị.

- Cập nhật ngày bảo trì tiếp theo.

- Tạo/cập nhật phiếu bảo trì.

Phải tránh:

```text
2 Technician cùng xử lý một phiếu.

Phiếu HOAN_THANH nhưng ngày tiếp theo chưa được cập nhật.

Ngày tiếp theo đã cập nhật nhưng phiếu chưa hoàn thành.

Thiết bị vẫn DANG_BAO_TRI sau khi hoàn thành thành công.

Phiếu hoàn thành nhưng kết quả checklist chưa được lưu.

Technician A cập nhật phiếu của Technician B.
```

Dùng transaction khi các thay đổi phải thành công hoặc rollback cùng nhau.

---

# 47. Transaction khi hoàn thành bảo trì

Một flow hoàn thành có thể cần:

```text
BEGIN TRANSACTION

        ↓

UPDATE phieu_bao_tri

        ↓

UPDATE ke_hoach_bao_tri

        ↓

UPDATE thiet_bi

        ↓

INSERT thong_bao nếu cần

        ↓

COMMIT
```

Nếu có lỗi:

```text
ROLLBACK
```

Không để hệ thống ở trạng thái:

```text
phiếu hoàn thành
```

nhưng:

```text
kế hoạch chưa cập nhật.
```

---

# 48. Database connection

Backend hiện tại sử dụng:

```text
mysql2/promise
```

Tái sử dụng database pool hiện có của project.

Không tự tạo connection mới ở mỗi controller nếu project đã có pool dùng chung.

Không hard-code:

```text
host

user

password

database
```

trong controller.

Sử dụng cấu hình environment hiện tại.

---

# 49. Dữ liệu database có thể đang rỗng

Hiện tại database có thể chưa có dữ liệu trong các bảng.

Nếu API:

```text
GET /api/bao-tri/ke-hoach
```

trả:

```json
[]
```

hoặc:

```json
{
  "thanhCong": true,
  "duLieu": []
}
```

thì không có nghĩa backend lỗi.

Không sửa database chỉ vì chưa có dữ liệu test.

Nếu POST bị lỗi foreign key:

```text
Kiểm tra ID được gửi có tồn tại không.
```

Không tự bỏ foreign key.

---

# 50. Kiểm thử M4.1

Luồng cần test:

```text
Tạo thiết bị hợp lệ

        ↓

Có checklist hợp lệ

        ↓

POST kế hoạch

        ↓

Backend validate

        ↓

Tạo kế hoạch

        ↓

GET danh sách

        ↓

GET chi tiết

        ↓

PUT cập nhật

        ↓

DELETE/ngừng hoạt động
```

Các case lỗi:

```text
thiet_bi_id không tồn tại

mau_checklist_id không tồn tại

gia_tri_chu_ky = 0

don_vi_chu_ky sai ENUM

Technician không tồn tại

Thiết bị THANH_LY
```

---

# 51. Kiểm thử M4.2

Luồng:

```text
Có kế hoạch

        ↓

Admin chọn Technician

        ↓

Phân công

        ↓

Technician xem kế hoạch của mình
```

Case lỗi:

```text
Technician không tồn tại

User không phải KY_THUAT_VIEN

User NGUNG_HOAT_DONG

Kế hoạch không tồn tại

Kế hoạch NGUNG_HOAT_DONG

Thiết bị THANH_LY
```

---

# 52. Kiểm thử M4.3

Luồng:

```text
Admin tạo checklist

        ↓

GET danh sách

        ↓

GET chi tiết

        ↓

UPDATE

        ↓

NGUNG_HOAT_DONG
```

Case lỗi:

```text
ten_mau trống

danh_sach_hang_muc không hợp lệ

loai_thiet_bi_id không tồn tại

nguoi_tao_id không tồn tại
```

Không tạo thêm bảng chỉ để test checklist.

---

# 53. Kiểm thử M4.4

Flow ưu tiên:

```text
Có kế hoạch

        ↓

Có phiếu bảo trì

        ↓

Có Technician được phân công

        ↓

Technician xem phiếu

        ↓

Bắt đầu

        ↓

DANG_THUC_HIEN

        ↓

Gửi kết quả checklist

        ↓

Gửi linh kiện

        ↓

Gửi kết quả

        ↓

Hoàn thành

        ↓

HOAN_THANH

        ↓

Tính kỳ tiếp theo
```

Case lỗi cần test:

```text
Phiếu không tồn tại

Technician sai ownership

Phiếu DA_HUY

Phiếu đã HOAN_THANH

Checklist bắt buộc chưa xong

Kết quả thiếu

Linh kiện có so_luong <= 0
```

---

# 54. Kiểm thử M4.5

Các case:

```text
Ngày bảo trì còn xa
→ bình thường
```

```text
Ngày bảo trì sắp tới
→ upcoming
```

```text
ngay_du_kien < hiện tại

và chưa hoàn thành

→ QUA_HAN
```

```text
Phiếu đã HOAN_THANH
→ không được đánh dấu QUA_HAN
```

```text
Phiếu DA_HUY
→ không đánh dấu QUA_HAN
```

---

# 55. Kết quả Module 4 phải đạt

Luồng tối thiểu phải chạy end-to-end:

```text
Admin đăng nhập

→ tạo checklist

→ tạo kế hoạch bảo trì

→ chọn chu kỳ

→ phân công Technician

→ Technician đăng nhập

→ xem công việc bảo trì của mình

→ mở phiếu bảo trì

→ bắt đầu bảo trì

→ thực hiện checklist

→ ghi tình trạng

→ ghi linh kiện nếu có

→ ghi kết quả

→ hoàn thành bảo trì

→ phiếu chuyển HOAN_THANH

→ ngày bảo trì tiếp theo được tính

→ thiết bị cập nhật trạng thái phù hợp

→ Admin xem được kết quả

→ hệ thống nhận biết task sắp đến hạn/quá hạn
```

Đây là flow ưu tiên cao nhất.

---

# 56. Trạng thái triển khai Module 4 hiện tại

Tiến độ đã biết:

```text
M4.1 — Kế hoạch bảo trì
Đã triển khai controller và routes cơ bản.
```

Các function:

```text
layDanhSachKeHoach

layChiTietKeHoach

taoKeHoach

capNhatKeHoach

ngungHoatDongKeHoach
```

---

```text
M4.2 — Phân công bảo trì
Đã có controller.
```

Các function:

```text
phanCongKeHoach

layKeHoachCuaToi

layLichSuPhanCong
```

Lưu ý:

```text
Chưa có bảng lịch sử phân công riêng.
```

Không tự thêm database.

---

```text
M4.3 — Mẫu checklist
Đã tạo controller mau_checklist.controller.js.
```

Tiếp tục hoàn thiện API/routes theo code hiện tại nếu còn thiếu.

---

```text
M4.4 — Thực hiện & ghi kết quả bảo trì
Đang là phần ưu tiên tiếp tục triển khai.
```

Điều kiện bắt buộc:

```text
KHÔNG sửa database.

KHÔNG thêm bảng.

KHÔNG thêm column.
```

Phải tận dụng:

```text
phieu_bao_tri
```

---

```text
M4.5 — Cảnh báo
Triển khai sau khi M4.4 hoạt động ổn định.
```

---

# 57. Khi Agent nhận lệnh "tiếp tục"

Nếu prompt chỉ nói:

```text
tiếp tục
```

Agent phải xác định tiến độ hiện tại.

Nếu M4.4 chưa hoàn thiện:

```text
TIẾP TỤC M4.4
```

Không tự chuyển sang:

```text
M5.1 Dashboard
```

Không tự sửa lại M4.1–M4.3 nếu chúng đang chạy ổn định trừ khi có lỗi liên quan.

---

# 58. Khi sửa bao_tri.routes.js

Phải:

- Giữ các route M4.1 đang chạy.

- Giữ các route M4.2 đang chạy.

- Giữ các route M4.3 đang chạy.

- Bổ sung M4.4/M4.5 đúng vị trí.

Không xóa route cũ chỉ để viết route mới.

Không đổi endpoint đã được frontend/Postman sử dụng nếu chưa được yêu cầu.

Khi người dùng yêu cầu:

```text
"tổng hợp lại bao_tri routes"
```

phải trả lại:

```text
TOÀN BỘ FILE bao_tri.routes.js
```

không chỉ đoạn code mới thêm.

---

# 59. Không được tự mở rộng

Nếu yêu cầu hiện tại chỉ làm một phần Module 4:

**Chỉ làm đúng phần được giao.**

Không tự chuyển sang:

```text
Module 3

Module 5

Frontend khác

Refactor toàn backend

Đổi database

Microservice

Redis

Kafka

Docker

AI

Predictive Maintenance

Health Score

Kho linh kiện

ERP

Quản lý mua hàng
```

trừ khi prompt yêu cầu trực tiếp.

---

# 60. Không được tự sửa database

Đây là ràng buộc đặc biệt quan trọng của giai đoạn hiện tại.

Agent KHÔNG được đề xuất như giải pháp mặc định:

```sql
CREATE TABLE ...
```

hoặc:

```sql
ALTER TABLE ...
```

Chỉ vì code khó triển khai.

Trước tiên phải tìm cách sử dụng các bảng:

```text
mau_checklist

ke_hoach_bao_tri

phieu_bao_tri

thong_bao
```

và các field JSON hiện có.

Nếu một nghiệp vụ thực sự không thể triển khai chính xác với schema hiện tại:

```text
Nêu rõ giới hạn.
```

Không tự thay đổi schema.

---

# 61. Không được sửa Module khác để "cho tiện"

Module 4 có thể đọc:

```text
nguoi_dung

thiet_bi

loai_thiet_bi
```

nhưng không tự sửa lớn:

```text
Module 1

Module 2

Module 3
```

chỉ để Module 4 dễ code hơn.

Nếu cần thay đổi liên module:

```text
chỉ sửa phần tối thiểu thực sự cần thiết
```

và phải giữ tương thích với code hiện tại.

---

# 62. Nguyên tắc cuối cùng cho Agent

Trước mọi thay đổi hãy tự kiểm tra:

```text
1. Chức năng này có thuộc Module 4 không?

2. Đây là M4.1, M4.2, M4.3, M4.4 hay M4.5?

3. Database hiện tại có hỗ trợ không?

4. Có đang tự tạo bảng/column mới không?

5. Có làm sai role không?

6. Technician có đúng ownership không?

7. Có làm thay chức năng Module 3/5 không?

8. Có thay đổi architecture không cần thiết không?

9. Có phá API Module 4 đã chạy không?

10. File đang tạo đã hoàn chỉnh chưa?

11. API đã kiểm tra JWT + quyền chưa?

12. Business rule đã được kiểm tra ở backend chưa?

13. Có cần transaction không?

14. Có sử dụng đúng ENUM database không?

15. Có lưu checklist result đúng vào phieu_bao_tri không?

16. Có cập nhật ngày bảo trì tiếp theo đúng chu kỳ không?

17. Có tránh hoàn thành phiếu DA_HUY/HOAN_THANH không?

18. Có tránh cho Technician sửa phiếu của người khác không?

19. Có giữ đúng ràng buộc KHÔNG SỬA DATABASE không?

20. Luồng Admin → Technician → hoàn thành → kỳ tiếp theo còn hoạt động không?
```

Nếu một thay đổi nằm ngoài phạm vi hiện tại:

**Không tự triển khai.**

Ưu tiên:

**Đúng nghiệp vụ → đúng database → đúng quyền → đúng trạng thái → chạy được → test được → sau đó mới mở rộng.**
