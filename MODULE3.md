# MODULE 3 — SỰ CỐ & SỬA CHỮA

## 1. Mục đích file

File này cung cấp context bắt buộc cho AI Agent khi phát triển **Module 3 — Sự cố & Sửa chữa** của FactoryCare.

Agent phải đọc file này trước khi tạo/sửa code Module 3.

Mục tiêu:

- Không làm lệch nghiệp vụ.
- Không tự mở rộng phạm vi.
- Không tự thay đổi database.
- Không làm chức năng của Module 4 hoặc Module 5.
- Giữ đúng kiến trúc và quy chuẩn hiện có của project.
- Hoàn thiện từng phần, không để TODO hoặc code giả.

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
- Báo sự cố.
- Xem các sự cố mình đã báo.
- Theo dõi trạng thái xử lý.

Không được:

- Phân công kỹ thuật viên.
- Sửa hồ sơ sửa chữa.
- Tự đổi trạng thái xử lý tùy ý.
- Xem dữ liệu quản trị toàn hệ thống.

## KY_THUAT_VIEN

Được:

- Xem công việc được giao.
- Xem chi tiết sự cố.
- Bắt đầu xử lý.
- Ghi nguyên nhân.
- Ghi cách xử lý.
- Ghi linh kiện thay thế.
- Hoàn thành sửa chữa.

Không được:

- Quản lý người dùng.
- Tự phân công công việc cho người khác.
- Xóa sự cố.
- Thực hiện chức năng quản trị ngoài phạm vi.

## QUAN_TRI_VIEN

Được:

- Xem toàn bộ sự cố.
- Tiếp nhận sự cố.
- Phân công kỹ thuật viên.
- Theo dõi tiến độ.
- Hủy sự cố khi hợp lệ.
- Xem hồ sơ sửa chữa.
- Theo dõi sự cố khẩn cấp.

---

# 4. Phạm vi Module 3

Module 3 chịu trách nhiệm toàn bộ luồng:

```text
Nhân viên báo sự cố
        ↓
Tạo sự cố
        ↓
Admin tiếp nhận / kiểm tra
        ↓
Phân công kỹ thuật viên
        ↓
Kỹ thuật viên nhận công việc
        ↓
Bắt đầu xử lý
        ↓
Ghi nguyên nhân + cách xử lý
        ↓
Ghi linh kiện thay thế nếu có
        ↓
Hoàn thành sửa chữa
        ↓
Cập nhật sự cố
        ↓
Cập nhật trạng thái thiết bị phù hợp
        ↓
Thông báo cho các bên liên quan
```

Module 3 bao gồm:

1. Báo cáo sự cố.
2. Mức độ sự cố.
3. Ảnh sự cố.
4. Danh sách sự cố.
5. Chi tiết sự cố.
6. Phân công kỹ thuật viên.
7. Công việc của kỹ thuật viên.
8. Quá trình xử lý.
9. Hồ sơ sửa chữa.
10. Nguyên nhân.
11. Cách xử lý.
12. Linh kiện thay thế.
13. Hoàn thành sửa chữa.
14. Thông báo liên quan sự cố.

---

# 5. Không thuộc Module 3

Agent KHÔNG tự phát triển các phần sau khi đang làm Module 3:

```text
Kế hoạch bảo trì
Checklist bảo trì
Phiếu bảo trì
Dashboard
Báo cáo thống kê
Export PDF / Excel
Health Score
Quản lý người dùng
CRUD thiết bị đầy đủ
Quản lý lô nhập
Quản lý nhà cung cấp
```

Các phần trên thuộc module khác.

Có thể đọc dữ liệu thiết bị/người dùng nhưng không biến Module 3 thành nơi quản lý chúng.

---

# 6. Database hiện tại là nguồn sự thật

Không tự tạo bảng mới nếu chưa được yêu cầu.

Các bảng chính Module 3 hiện tại:

```text
su_co
ho_so_sua_chua
thong_bao
```

Module 3 còn liên kết với:

```text
nguoi_dung
thiet_bi
```

Không tự tạo bảng:

```text
assignments
incident_images
repair_parts
incident_history
```

nếu database hiện tại chưa có và người dùng chưa yêu cầu thay đổi schema.

---

# 7. Bảng su_co

Các dữ liệu quan trọng hiện có:

```text
id
ma_su_co
thiet_bi_id
nguoi_bao_id
ky_thuat_vien_id
tieu_de
mo_ta
hinh_anh
muc_do
trang_thai
thoi_gian_xay_ra
thoi_gian_bao
thoi_gian_phan_cong
thoi_gian_hoan_thanh
ngay_tao
ngay_cap_nhat
```

`hinh_anh` hiện được lưu dạng JSON.

Không tự tách bảng ảnh khi chưa có yêu cầu thay đổi database.

---

# 8. Mức độ sự cố

Database hiện tại sử dụng:

```text
THAP
TRUNG_BINH
CAO
NGHIEM_TRONG
```

Ý nghĩa nghiệp vụ:

```text
THAP         = ảnh hưởng nhỏ
TRUNG_BINH   = cần xử lý
CAO          = ảnh hưởng lớn
NGHIEM_TRONG = ưu tiên cao / luồng khẩn cấp
```

Không tự đổi ENUM thành tên khác nếu chưa sửa database.

Sự cố `NGHIEM_TRONG` phải được ưu tiên hiển thị và thông báo.

---

# 9. Trạng thái sự cố hiện tại

Database hiện tại:

```text
MOI
DA_PHAN_CONG
DANG_XU_LY
DA_XU_LY
DA_HUY
```

Luồng cơ bản:

```text
MOI
 ↓
DA_PHAN_CONG
 ↓
DANG_XU_LY
 ↓
DA_XU_LY
```

Nhánh ngoại lệ:

```text
MOI / DA_PHAN_CONG / DANG_XU_LY
                ↓
              DA_HUY
```

Không cho frontend gửi bất kỳ trạng thái tùy ý.

Backend phải kiểm tra transition.

---

# 10. Lưu ý về tài liệu nghiệp vụ và database

Tài liệu phân tích đầy đủ có đề cập thêm:

```text
Đã tiếp nhận
Chờ linh kiện
Không thể xử lý
```

Nhưng database hiện tại chưa có đầy đủ các trạng thái này.

Vì vậy:

**Khi code theo schema hiện tại, KHÔNG tự sửa ENUM hoặc database.**

Nếu cần triển khai các trạng thái mở rộng, phải dừng ở phạm vi thiết kế và chờ yêu cầu thay đổi database riêng.

---

# 11. Báo sự cố

Nguồn tạo sự cố chính:

```text
Mobile Employee
```

Người dùng có thể đi từ:

```text
Quét QR
   ↓
Chi tiết thiết bị
   ↓
Báo sự cố
```

Form không bắt Employee nhập lại:

- ID người báo.
- ID thiết bị nếu đã đi từ QR.
- Thời gian báo.

Backend lấy các thông tin này từ context đăng nhập và thiết bị.

Dữ liệu người dùng nhập chủ yếu:

```text
tieu_de
mo_ta
muc_do
thoi_gian_xay_ra
hinh_anh
```

---

# 12. Kiểm tra trước khi tạo sự cố

Backend phải kiểm tra:

- Người dùng hợp lệ.
- Thiết bị tồn tại.
- Thiết bị chưa thanh lý.
- Dữ liệu bắt buộc hợp lệ.
- Mức độ nằm trong ENUM.
- File/URL ảnh hợp lệ theo cơ chế project.

Nếu máy đã có sự cố mở:

- Có thể cảnh báo sự cố đang tồn tại.
- Không được tự động xóa hoặc ghi đè sự cố cũ.

---

# 13. Phân công kỹ thuật viên

Phân công thuộc quyền Admin.

Database hiện tại lưu trực tiếp:

```text
su_co.ky_thuat_vien_id
```

Khi phân công:

```text
ky_thuat_vien_id = technician được chọn
thoi_gian_phan_cong = thời gian hiện tại
trang_thai = DA_PHAN_CONG
```

Phải kiểm tra:

- User tồn tại.
- User đang hoạt động.
- User có vai trò `KY_THUAT_VIEN`.
- Sự cố chưa hoàn thành.
- Sự cố chưa bị hủy.

Sau khi phân công phải tạo thông báo phù hợp.

---

# 14. Kỹ thuật viên xử lý

Technician chỉ được xử lý:

- Sự cố được phân công cho mình.
- Hoặc trường hợp khẩn cấp đặc biệt nếu sau này có rule riêng.

Luồng:

```text
DA_PHAN_CONG
      ↓
Technician bắt đầu
      ↓
DANG_XU_LY
```

Không cho Technician sửa sự cố của Technician khác.

Backend phải kiểm tra ownership, không chỉ ẩn nút ở frontend.

---

# 15. Hồ sơ sửa chữa

Bảng:

```text
ho_so_sua_chua
```

Các trường chính:

```text
id
su_co_id
ky_thuat_vien_id
nguyen_nhan
cach_xu_ly
linh_kien_thay_the
ket_qua
thoi_gian_bat_dau
thoi_gian_hoan_thanh
ghi_chu
```

`linh_kien_thay_the` hiện là JSON.

Ví dụ:

```json
[
  {
    "ten": "Vong bi",
    "so_luong": 2
  }
]
```

Module 3 chỉ ghi nhận linh kiện đã sử dụng.

KHÔNG xây dựng tồn kho linh kiện.

---

# 16. Kết quả sửa chữa

Database hiện tại:

```text
DA_SUA_XONG
SUA_MOT_PHAN
KHONG_SUA_DUOC
```

Khi hoàn thành phải có tối thiểu dữ liệu kỹ thuật cần thiết.

Không được chỉ đổi:

```text
trang_thai = DA_XU_LY
```

mà không lưu kết quả sửa chữa.

---

# 17. Hoàn thành sự cố

Luồng:

```text
DANG_XU_LY
    ↓
Ghi nguyên nhân
    ↓
Ghi cách xử lý
    ↓
Ghi linh kiện nếu có
    ↓
Ghi kết quả
    ↓
Lưu ho_so_sua_chua
    ↓
su_co = DA_XU_LY
    ↓
thoi_gian_hoan_thanh = hiện tại
```

Các thay đổi liên quan phải nhất quán.

Nếu nhiều thao tác database phụ thuộc nhau, ưu tiên transaction.

---

# 18. Trạng thái thiết bị

Module 3 có thể cập nhật trạng thái thiết bị khi nghiệp vụ sự cố thay đổi.

Ví dụ:

```text
Có sự cố nghiêm trọng
→ thiết bị có thể chuyển trạng thái hỏng.

Đang sửa chữa
→ trạng thái thiết bị phản ánh không nên vận hành.

Sửa thành công
→ có thể đưa về hoạt động.

Không sửa được
→ KHÔNG tự đưa máy về DANG_HOAT_DONG.
```

Không hard-code việc hoàn thành sự cố = máy luôn hoạt động.

Kết quả kỹ thuật phải quyết định trạng thái phù hợp.

---

# 19. Notification

Dùng bảng:

```text
thong_bao
```

Các trigger Module 3 quan trọng:

- Sự cố mới.
- Sự cố nghiêm trọng.
- Phân công Technician.
- Thay đổi trạng thái quan trọng.
- Hoàn thành sửa chữa.
- Hủy sự cố.

Notification phải liên kết tới entity liên quan thông qua:

```text
doi_tuong_lien_quan_id
```

Không tạo module Notification riêng.

---

# 20. Phân quyền backend

Mọi API phải kiểm tra JWT và role.

Không được chỉ dựa vào việc frontend ẩn nút.

Ví dụ:

```text
NHAN_VIEN
→ tạo sự cố
→ xem sự cố của mình

KY_THUAT_VIEN
→ xem việc được giao
→ xử lý việc của mình
→ tạo/cập nhật hồ sơ sửa chữa

QUAN_TRI_VIEN
→ xem toàn bộ
→ phân công
→ quản lý trạng thái nghiệp vụ
```

API trái quyền phải trả `403`.

---

# 21. Quy tắc code

Trước khi code Agent phải đọc:

```text
MODULE3.md
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

---

# 22. Quy tắc hoàn thiện file

Khi tạo một file thì phải tạo hoàn chỉnh.

Ví dụ đã tạo:

```text
su_co.model.js
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

---

# 23. Kiến trúc xử lý

Tuân theo architecture hiện tại của backend.

Nếu project đang dùng:

```text
Route
 ↓
Middleware
 ↓
Controller
 ↓
Service
 ↓
Model / Database
```

thì tiếp tục đúng cấu trúc đó.

Không nhét SQL trực tiếp vào route nếu project không làm như vậy.

Không nhét toàn bộ business logic vào controller.

Business rule quan trọng đặt ở service/backend.

---

# 24. API response

Giữ thống nhất response convention hiện có của project.

Không tự tạo một chuẩn response khác chỉ cho Module 3.

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

Không trả `200` cho mọi trường hợp lỗi.

---

# 25. Transaction và concurrency

Đặc biệt cẩn thận ở:

- Phân công kỹ thuật viên.
- Technician bắt đầu công việc.
- Hoàn thành sửa chữa.
- Cập nhật trạng thái thiết bị.
- Tạo hồ sơ sửa chữa.

Phải tránh:

```text
2 Technician cùng nhận một sự cố.
Sự cố hoàn thành nhưng repair chưa lưu.
Repair đã lưu nhưng trạng thái sự cố chưa đổi.
Thiết bị bị cập nhật sai trạng thái.
```

Dùng transaction khi các thay đổi phải thành công hoặc rollback cùng nhau.

---

# 26. Kết quả Module 3 phải đạt

Luồng tối thiểu phải chạy end-to-end:

```text
Employee đăng nhập
→ quét/chọn thiết bị
→ báo sự cố
→ Admin thấy sự cố
→ Admin phân công Technician
→ Technician thấy công việc
→ Technician bắt đầu xử lý
→ nhập nguyên nhân
→ nhập cách xử lý
→ nhập linh kiện nếu có
→ hoàn thành
→ lưu hồ sơ sửa chữa
→ cập nhật sự cố
→ cập nhật thiết bị phù hợp
→ tạo thông báo
→ Employee/Admin xem được kết quả
```

Đây là flow ưu tiên cao nhất.

---

# 27. Không được tự mở rộng

Nếu yêu cầu hiện tại chỉ làm một phần Module 3:

**Chỉ làm đúng phần được giao.**

Không tự chuyển sang:

```text
Module 4
Module 5
Frontend khác
Refactor toàn backend
Đổi database
Microservice
Redis
Kafka
Docker
AI
Health Score
Kho linh kiện
```

trừ khi prompt yêu cầu trực tiếp.

---

# 28. Nguyên tắc cuối cùng cho Agent

Trước mọi thay đổi hãy tự kiểm tra:

```text
1. Chức năng này có thuộc Module 3 không?
2. Database hiện tại có hỗ trợ không?
3. Có làm sai role không?
4. Có làm thay chức năng Module 4/5 không?
5. Có thay đổi architecture không cần thiết không?
6. Có phá code Module 1/2 đã chạy không?
7. File đang tạo đã hoàn chỉnh chưa?
8. API đã kiểm tra JWT + quyền chưa?
9. Business rule đã được kiểm tra ở backend chưa?
10. Luồng Employee → Admin → Technician → hoàn thành còn hoạt động không?
```

Nếu một thay đổi nằm ngoài phạm vi hiện tại:

**Không tự triển khai.**

Ưu tiên:

**Đúng nghiệp vụ → đúng database → đúng quyền → chạy được → test được → sau đó mới mở rộng.**
