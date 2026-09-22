# MODULE 5 — DASHBOARD & BÁO CÁO

## 1. Mục đích file

File này cung cấp context bắt buộc cho AI Agent khi phát triển **Module 5 — Dashboard & Báo cáo** của FactoryCare.

Agent phải đọc file này trước khi tạo/sửa code Module 5.

Mục tiêu:

- Không làm lệch nghiệp vụ.
- Không tự mở rộng phạm vi.
- Không tự thay đổi database.
- Không tự tạo bảng KPI/report nếu chưa được yêu cầu.
- Không làm lại chức năng của Module 2, Module 3 hoặc Module 4.
- Không tự sửa dữ liệu nguồn chỉ để Dashboard hiển thị đẹp.
- Giữ đúng kiến trúc và quy chuẩn hiện có của project.
- Mọi KPI phải có công thức và phạm vi thời gian rõ ràng.
- Dashboard chỉ đọc/tổng hợp dữ liệu; thao tác nghiệp vụ phải quay về module nguồn.
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

Backend là nguồn xử lý nghiệp vụ và dữ liệu thống kê chính.

Frontend chỉ hiển thị KPI/chart/table từ API.

Frontend không được tự tính các KPI quan trọng theo công thức riêng khác backend.

---

# 3. Vai trò

Database hiện tại có 3 vai trò:

```text
QUAN_TRI_VIEN
KY_THUAT_VIEN
NHAN_VIEN
```

Tên nghiệp vụ:

```text
QUAN_TRI_VIEN  = Admin
KY_THUAT_VIEN = Technician
NHAN_VIEN      = Employee
```

Tài liệu nghiệp vụ dùng cụm:

```text
Admin / Manager
```

Nhưng database hiện tại KHÔNG có role:

```text
MANAGER
```

Vì vậy khi code:

```text
Admin / Manager trong Module 5
→ map về QUAN_TRI_VIEN
```

Không tự thêm role mới.

## NHAN_VIEN

Không được:

- Xem Dashboard quản trị toàn hệ thống.
- Xem báo cáo quản trị.
- Xem thống kê toàn nhà máy.
- Export báo cáo quản trị.

## KY_THUAT_VIEN

Không được truy cập Dashboard quản trị toàn nhà máy.

Nếu sau này có thống kê cá nhân rất ngắn thì phải có yêu cầu riêng.

Không tự biến Module 5 thành trang đánh giá hiệu suất Technician.

## QUAN_TRI_VIEN

Được:

- Xem Dashboard tổng quan.
- Xem KPI.
- Xem biểu đồ.
- Lọc theo khoảng thời gian.
- Drill-down về dữ liệu nguồn.
- Xem báo cáo thống kê.
- Export PDF/Excel nếu M5.3 được triển khai.

---

# 4. Phạm vi Module 5

Luồng tổng:

```text
Dữ liệu Module 2 / 3 / 4
        ↓
Backend aggregate
        ↓
KPI tổng quan
        ↓
Biểu đồ / bảng
        ↓
Filter
        ↓
Drill-down
        ↓
Module nguồn
```

Luồng báo cáo:

```text
Admin chọn loại báo cáo
        ↓
Chọn bộ lọc
        ↓
Backend validate
        ↓
Aggregate dữ liệu
        ↓
Bảng / biểu đồ
        ↓
Drill-down
        ↓
Export PDF / Excel nếu cần
```

Module 5 gồm:

1. M5.1 — Dashboard tổng quan.
2. M5.2 — Báo cáo & thống kê.
3. M5.3 — Export PDF / Excel.

---

# 5. Không thuộc Module 5

Agent KHÔNG tự phát triển:

```text
CRUD thiết bị
Quét QR
Điều chuyển thiết bị
Báo sự cố
Phân công sửa chữa
Bắt đầu/hoàn thành sửa chữa
Tạo kế hoạch bảo trì
Phân công bảo trì
Checklist bảo trì
Hoàn thành bảo trì
Quản lý người dùng
Notification
Kho linh kiện
Health Score nếu schema chưa hỗ trợ
```

Module 5 chỉ:

```text
ĐỌC
LỌC
TỔNG HỢP
THỐNG KÊ
DRILL-DOWN
EXPORT
```

Không nhét business action vào Dashboard.

---

# 6. Database hiện tại là nguồn sự thật

Module 5 hiện KHÔNG có bảng riêng bắt buộc.

Các bảng nguồn quan trọng:

```text
thiet_bi
loai_thiet_bi
vi_tri
su_co
ho_so_sua_chua
ke_hoach_bao_tri
phieu_bao_tri
nguoi_dung
thong_bao
```

Không tự tạo:

```text
dashboard
dashboard_kpi
report
reports
report_cache
report_history
kpi_snapshot
analytics
statistics
materialized_view
```

nếu chưa được người dùng yêu cầu thay đổi database.

---

# 7. Nguyên tắc dữ liệu Module 5

Module 5 không được tạo một nguồn sự thật thứ hai.

Nguồn sự thật phải là dữ liệu nghiệp vụ gốc.

Dashboard chỉ aggregate.

Báo cáo chỉ aggregate/filter.

Nếu dữ liệu nguồn sai hoặc thiếu:

- Không tự sửa record nguồn từ Dashboard.
- Không tự đoán giá trị còn thiếu.
- Không giả lập KPI.
- Có thể trả metadata cảnh báo nếu metric thiếu dữ liệu.

---

# 8. M5.1 — Dashboard tổng quan

Mục tiêu:

Cho `QUAN_TRI_VIEN` thấy nhanh tình trạng vận hành toàn hệ thống.

KPI ưu tiên:

```text
Tổng thiết bị
Thiết bị theo trạng thái
Sự cố mở
Sự cố nghiêm trọng
Bảo trì sắp đến hạn
Bảo trì quá hạn
Thời gian xử lý sự cố trung bình
Top thiết bị phát sinh nhiều sự cố
Health Score nếu thực sự có dữ liệu hỗ trợ
```

Dashboard là:

```text
READ-ONLY
```

Không tạo/update/delete nghiệp vụ từ Dashboard.

---

# 9. Dashboard không phải bản sao toàn hệ thống

Ưu tiên:

```text
5–7 KPI card
2–4 biểu đồ chính
Danh sách việc cần chú ý
```

Chi tiết phải drill-down về module nguồn.

Ví dụ:

```text
Sự cố mở
→ Module 3 với filter trạng thái mở

Bảo trì quá hạn
→ Module 4 với filter quá hạn

Thiết bị DANG_HONG
→ Module 2 với filter trạng thái
```

---

# 10. KPI — Tổng thiết bị

Phải định nghĩa rõ có tính thiết bị `THANH_LY` hay không.

Theo nghiệp vụ:

```text
THANH_LY
→ không được tính như thiết bị đang vận hành
```

Khuyến nghị:

```text
tong_thiet_bi_dang_quan_ly
= COUNT(thiet_bi)
WHERE trang_thai <> 'THANH_LY'
```

Nếu cần tổng hồ sơ lịch sử:

```text
tong_ho_so_thiet_bi
= COUNT(*) kể cả THANH_LY
```

Hai chỉ số phải đặt tên khác nhau.

---

# 11. KPI — Thiết bị theo trạng thái

ENUM hiện tại:

```text
DANG_HOAT_DONG
DANG_BAO_TRI
DANG_HONG
NGUNG_HOAT_DONG
THANH_LY
```

Có thể:

```text
GROUP BY thiet_bi.trang_thai
```

Không invent trạng thái chưa tồn tại trong schema.

Nếu tài liệu UI nói “Đang sửa chữa”, “Chờ thanh lý” nhưng DB chưa có:

**Không tự thêm ENUM.**

---

# 12. KPI — Sự cố mở

`su_co.trang_thai`:

```text
MOI
DA_PHAN_CONG
DANG_XU_LY
DA_XU_LY
DA_HUY
```

Mặc định:

```text
SỰ CỐ MỞ =
MOI
+ DA_PHAN_CONG
+ DANG_XU_LY
```

Không tính:

```text
DA_XU_LY
DA_HUY
```

Nếu Module 3/code hiện tại định nghĩa khác:

**Ưu tiên Module 3/code thực tế.**

---

# 13. KPI — Sự cố nghiêm trọng

Mức độ:

```text
THAP
TRUNG_BINH
CAO
NGHIEM_TRONG
```

KPI sự cố nghiêm trọng hiện tại:

```text
muc_do = NGHIEM_TRONG
AND trang_thai IN (
  MOI,
  DA_PHAN_CONG,
  DANG_XU_LY
)
```

Nếu báo cáo lịch sử:

```text
filter theo thoi_gian_bao
```

và có thể gồm sự cố đã xử lý nếu report yêu cầu.

Phải phân biệt KPI hiện tại và KPI lịch sử.

---

# 14. KPI — Bảo trì sắp đến hạn

Nguồn:

```text
ke_hoach_bao_tri.ngay_bao_tri_tiep_theo
ke_hoach_bao_tri.trang_thai
```

Chỉ kế hoạch:

```text
HOAT_DONG
```

“Sắp đến hạn” là trạng thái tính toán.

Không tự thêm ENUM/cột:

```text
SAP_DEN_HAN
```

Ngưỡng N ngày phải lấy từ Module 4/config hiện có hoặc query param đã được thiết kế.

Không hard-code nhiều nơi.

---

# 15. KPI — Bảo trì quá hạn

Nguồn:

```text
phieu_bao_tri
```

Trạng thái:

```text
CHO_THUC_HIEN
DANG_THUC_HIEN
HOAN_THANH
QUA_HAN
DA_HUY
```

Nếu Module 4 đã cập nhật:

```text
QUA_HAN
```

thì dùng dữ liệu đó.

Nếu Module 4 dùng rule tính động:

```text
ngay_du_kien < hiện tại
AND chưa hoàn thành/hủy
```

thì Dashboard phải tái sử dụng cùng rule.

Không viết định nghĩa quá hạn khác Module 4.

---

# 16. KPI — Thời gian xử lý sự cố trung bình

Nguồn:

```text
su_co.thoi_gian_bao
su_co.thoi_gian_hoan_thanh
su_co.trang_thai
```

Định hướng:

```text
AVG(thoi_gian_hoan_thanh - thoi_gian_bao)
```

chỉ với:

```text
trang_thai = DA_XU_LY
thoi_gian_bao IS NOT NULL
thoi_gian_hoan_thanh IS NOT NULL
```

Không tính:

```text
DA_HUY
```

Không dùng `ngay_tao` thay `thoi_gian_bao` nếu nghiệp vụ đã có mốc báo.

---

# 17. Đơn vị thời gian xử lý

API phải rõ đơn vị.

Có thể dùng:

```text
thoi_gian_xu_ly_trung_binh_phut
```

hoặc response:

```text
gia_tri
don_vi
```

Không trả một con số không có đơn vị.

---

# 18. KPI — Top thiết bị nhiều sự cố

Nguồn:

```text
su_co.thiet_bi_id
thiet_bi
```

Tính:

```text
COUNT(su_co.id)
GROUP BY thiet_bi_id
ORDER BY COUNT DESC
LIMIT N
```

Áp dụng khoảng thời gian nếu Dashboard đang filter lịch sử.

Phải xác định rõ có loại `DA_HUY` hay không.

Khuyến nghị metric vận hành mặc định:

```text
không tính DA_HUY
```

---

# 19. Health Score

Tài liệu có nhắc:

```text
Health Score nếu bật
```

Nhưng schema hiện tại không có bảng/cột Health Score rõ ràng.

Do đó:

**KHÔNG tự triển khai Health Score chỉ để hoàn thành Dashboard.**

Nếu Module 2 đã có API/công thức Health Score:

- Chỉ đọc/hiển thị.
- Không viết công thức mới trong Module 5.

Nếu chưa có:

```text
bỏ khỏi MVP
```

và ghi rõ giới hạn.

---

# 20. Khoảng thời gian Dashboard

Có thể hỗ trợ:

```text
7 ngày
30 ngày
tháng này
custom range
```

Backend validate:

```text
tu_ngay
den_ngay
tu_ngay <= den_ngay
```

Không áp filter thời gian lên KPI snapshot hiện tại một cách vô nghĩa.

Ví dụ:

```text
Thiết bị theo trạng thái hiện tại
```

là snapshot.

```text
Số sự cố phát sinh
```

là metric lịch sử có filter thời gian.

---

# 21. Timezone

Phải thống nhất timezone với backend/database và Module 3/4.

Đặc biệt:

```text
hôm nay
tháng này
7 ngày gần nhất
quá hạn
thời gian xử lý
```

Không tự đổi timezone riêng cho Dashboard.

---

# 22. Biểu đồ Dashboard

Backend nên trả dữ liệu thô phù hợp:

```text
Thiết bị theo trạng thái
Sự cố theo mức độ
Sự cố theo thời gian
Bảo trì theo trạng thái
```

Backend không cần trả config chart library nếu project không dùng pattern đó.

Frontend chọn:

```text
bar
line
pie
donut
```

nhưng không tự đổi công thức KPI.

---

# 23. Drill-down

Ví dụ:

```text
Sự cố mở
→ Module 3
→ filter trạng thái mở

Sự cố NGHIEM_TRONG
→ Module 3
→ filter muc_do

Bảo trì QUA_HAN
→ Module 4
→ filter trạng thái

Thiết bị DANG_HONG
→ Module 2
→ filter trạng thái
```

Module 5 không copy toàn bộ CRUD/list logic từ module nguồn.

---

# 24. M5.2 — Báo cáo & thống kê

Mục tiêu:

Phân tích:

```text
sự cố
sửa chữa
bảo trì
thiết bị
```

theo:

```text
thời gian
thiết bị
loại thiết bị
vị trí
mức độ
trạng thái
Technician
```

Chỉ dùng filter schema hiện tại hỗ trợ.

---

# 25. Báo cáo sự cố

Nguồn:

```text
su_co
thiet_bi
loai_thiet_bi
vi_tri
nguoi_dung
```

Có thể thống kê:

```text
Sự cố theo thời gian
Sự cố theo mức độ
Sự cố theo trạng thái
Sự cố theo thiết bị
Sự cố theo loại thiết bị
Sự cố theo vị trí
Sự cố theo Technician
Top thiết bị nhiều sự cố
```

Không tự tạo “loại lỗi” nếu schema chưa có field category riêng.

`tieu_de` không được tự coi là category chuẩn.

---

# 26. Báo cáo sửa chữa

Nguồn:

```text
su_co
ho_so_sua_chua
nguoi_dung
thiet_bi
```

Có thể thống kê:

```text
Số hồ sơ sửa chữa
Kết quả sửa chữa
Thời gian xử lý
Technician thực hiện
Thiết bị sửa nhiều
```

Kết quả hiện tại:

```text
DA_SUA_XONG
SUA_MOT_PHAN
KHONG_SUA_DUOC
```

Không invent giá trị khác.

---

# 27. Báo cáo bảo trì

Nguồn:

```text
ke_hoach_bao_tri
phieu_bao_tri
thiet_bi
nguoi_dung
```

Có thể thống kê:

```text
Phiếu theo trạng thái
Phiếu hoàn thành
Phiếu quá hạn
Bảo trì theo Technician
Bảo trì theo thiết bị
Bảo trì theo thời gian
```

Tái sử dụng đúng rule Module 4.

---

# 28. Báo cáo thiết bị

Nguồn:

```text
thiet_bi
loai_thiet_bi
vi_tri
su_co
phieu_bao_tri
```

Có thể thống kê:

```text
Thiết bị theo trạng thái
Thiết bị theo loại
Thiết bị theo vị trí
Thiết bị nhiều sự cố
Thiết bị có bảo trì quá hạn
```

Không tự xây Health Score nếu Module 2 chưa có.

---

# 29. Filter báo cáo

Có thể hỗ trợ nếu schema có:

```text
tu_ngay
den_ngay
thiet_bi_id
loai_thiet_bi_id
vi_tri_id
muc_do
trang_thai
ky_thuat_vien_id
```

Backend phải validate:

- ID hợp lệ.
- ENUM hợp lệ.
- Date hợp lệ.
- `tu_ngay <= den_ngay`.

---

# 30. Filter vị trí

Database dùng:

```text
vi_tri
```

phân cấp:

```text
NHA_MAY
XUONG
DAY_CHUYEN
KHU_VUC
```

Không tự giả định có:

```text
xuong_id
day_chuyen_id
o_may_id
```

trong `thiet_bi`.

Nếu filter vị trí cha cần hierarchy query:

- Đọc Module 2/code hiện tại.
- Không sửa schema.

---

# 31. Pagination

Bảng detail phải hỗ trợ:

```text
page
limit
```

theo convention project.

Không trả hàng chục nghìn record mặc định.

Aggregate chart không cần pagination.

---

# 32. Sorting

Nếu cho phép sort:

- Chỉ whitelist column.
- Không chèn raw `req.query.sort` vào SQL.
- Không để SQL injection qua ORDER BY.

---

# 33. M5.3 — Export PDF / Excel

Export nằm trong Module 5.

Không tạo module/menu Export riêng.

Flow:

```text
Admin chọn báo cáo
→ chọn filter
→ xem dữ liệu
→ chọn PDF/Excel
→ backend chạy lại cùng query/filter
→ generate file
→ trả download
```

Không export trực tiếp dữ liệu frontend gửi lên rồi coi đó là nguồn sự thật.

---

# 34. Export phải dùng cùng công thức với report

Không để:

```text
API báo cáo = SQL A
Export = SQL B
```

nếu số liệu có thể lệch.

Ưu tiên tái sử dụng cùng query/service/helper.

Mục tiêu:

```text
UI
PDF
Excel
```

phải khớp nhau.

---

# 35. Excel

Excel ưu tiên dữ liệu bảng chi tiết.

Có thể gồm:

```text
Tên báo cáo
Khoảng thời gian
Thời điểm xuất
Bộ lọc
Các cột dữ liệu
```

Không export dữ liệu nhạy cảm không cần thiết.

---

# 36. PDF

PDF ưu tiên báo cáo trình bày:

```text
Tên hệ thống
Tên báo cáo
Khoảng thời gian
Thời điểm xuất
KPI chính
Bảng tổng hợp
```

Biểu đồ chỉ thêm nếu cơ chế hiện tại hỗ trợ đáng tin cậy.

---

# 37. Không tạo export history nếu chưa được yêu cầu

Database hiện tại không có:

```text
bao_cao
lich_su_xuat_bao_cao
export_jobs
```

Không tự tạo.

MVP generate file trực tiếp.

Nếu export quá lớn:

- Giới hạn số dòng.
- Trả lỗi rõ.
- Không tự xây queue/background job.

---

# 38. Dependency PDF / Excel

Trước khi thêm package:

```text
đọc package.json
đọc package-lock.json
```

Nếu đã có thư viện:

```text
tái sử dụng
```

Nếu chưa có và đang thực hiện M5.3:

- Chọn dependency tối thiểu.
- Không thêm nhiều package cùng chức năng.
- Không đổi framework.

Không thêm dependency export nếu chỉ đang làm M5.1.

---

# 39. Tên file export

Tên rõ:

```text
loai-bao-cao_YYYY-MM-DD_HH-mm.xlsx
loai-bao-cao_YYYY-MM-DD_HH-mm.pdf
```

hoặc theo quy chuẩn project.

Phải hỗ trợ nội dung tiếng Việt.

Không dùng input chưa sanitize làm tên file.

---

# 40. Dataset export lớn

Phải giới hạn hợp lý nếu chưa có async export.

Không để một request kéo toàn bộ database không giới hạn.

Nếu vượt giới hạn:

```text
trả validation/error phù hợp
```

theo convention project.

---

# 41. Database rỗng

Dashboard không được lỗi.

KPI:

```text
0
```

Chart/list:

```text
[]
```

Báo cáo rỗng vẫn là request thành công nếu filter hợp lệ.

---

# 42. Timestamp thiếu

Record thiếu:

```text
thoi_gian_hoan_thanh
```

không được dùng để tính duration hoàn thành.

Không tự thay bằng:

```text
ngay_cap_nhat
```

nếu nghiệp vụ không quy định.

Có thể trả số record thiếu dữ liệu nếu hữu ích.

---

# 43. Sự cố DA_HUY

Không trộn:

```text
DA_HUY
```

vào metric hoàn thành.

Ví dụ:

```text
thoi_gian_xu_ly_trung_binh
```

không tính `DA_HUY`.

Nếu report “tổng số báo cáo sự cố” có tính hủy thì tên metric phải rõ.

---

# 44. Thiết bị THANH_LY

Không tính `THANH_LY` vào:

```text
thiết bị đang vận hành
thiết bị đang quản lý active
```

Nếu báo cáo lịch sử cần thiết bị thanh lý:

- report/filter riêng.
- không xóa lịch sử.

---

# 45. Dashboard là read-only

API Module 5 chủ yếu:

```text
GET
```

Export có thể dùng GET/POST theo convention.

Không tạo API sửa nghiệp vụ từ Dashboard.

---

# 46. Phân quyền backend

Tất cả API Module 5 phải kiểm tra JWT + role.

Mặc định:

```text
QUAN_TRI_VIEN
```

API trái quyền:

```text
403
```

Không chỉ ẩn menu frontend.

---

# 47. Không invent MANAGER

Tài liệu nói:

```text
Admin/Manager
```

DB chỉ có:

```text
QUAN_TRI_VIEN
KY_THUAT_VIEN
NHAN_VIEN
```

Không dùng `MANAGER` trong SQL/middleware.

---

# 48. Quy tắc code

Trước khi code Agent phải đọc:

```text
MODULE5.md
QUY_CHUAN_DAT_BIEN.md
```

Nếu có:

```text
AGENT.md
```

thì đọc thêm.

Khi cần công thức module nguồn, đọc:

```text
MODULE2.md
MODULE3.md
MODULE4.md
```

nhưng không tự sửa các module đó.

---

# 49. Kiến trúc xử lý

Tuân theo architecture hiện tại.

Nếu dùng:

```text
Route
→ Middleware
→ Controller
→ Service
→ Model / Database
```

thì giữ nguyên.

Nếu project không có service:

- Không tự tạo tầng mới chỉ riêng Module 5.

Business rule KPI không được rải trong route.

---

# 50. Không duplicate công thức

Các metric như:

```text
Sự cố mở
Bảo trì quá hạn
Thời gian xử lý trung bình
```

nên có một implementation chính được tái sử dụng.

Không để Dashboard/Report/Export mỗi nơi một công thức khác.

---

# 51. API response

Giữ convention project.

Nếu hiện tại dùng:

```json
{
  "thanhCong": true,
  "thongBao": "...",
  "duLieu": {}
}
```

thì tiếp tục.

Không tự đổi sang convention khác.

Dashboard không có data:

```text
200
```

không phải 404.

---

# 52. SQL an toàn

Mọi filter value phải parameterized.

Không nối:

```text
tu_ngay
den_ngay
id
status
```

trực tiếp vào SQL.

Sort/group động phải whitelist.

Không nhận raw SQL từ frontend.

---

# 53. Query hiệu năng

Ưu tiên SQL aggregate:

```text
COUNT
SUM
AVG
GROUP BY
JOIN
```

Không tải toàn bộ record vào Node.js rồi mới đếm nếu SQL làm được.

Không N+1 query theo từng thiết bị.

---

# 54. Không tự tạo cache phức tạp

MVP ưu tiên query trực tiếp tối ưu.

Không tự thêm:

```text
Redis
materialized view
cache table
cron pre-aggregation
Kafka
queue
```

Nếu query chậm:

- đo trước,
- tối ưu query/index hiện có,
- đề xuất riêng nếu thật sự cần.

---

# 55. Index

Nếu task không cho sửa DB:

**Không tự CREATE INDEX.**

Có thể tận dụng index hiện có.

Nếu cần thêm index:

```text
ghi khuyến nghị
```

không ALTER TABLE.

---

# 56. API M5.1 định hướng

Nếu project chưa có route, có thể cân nhắc:

```text
GET /api/dashboard/tong-quan
GET /api/dashboard/thiet-bi-theo-trang-thai
GET /api/dashboard/su-co
GET /api/dashboard/bao-tri
GET /api/dashboard/top-thiet-bi-su-co
```

Hoặc:

```text
GET /api/dashboard
```

trả nhóm dữ liệu.

Phải kiểm tra route convention trước.

---

# 57. API M5.2 định hướng

Có thể:

```text
GET /api/bao-cao/su-co
GET /api/bao-cao/sua-chua
GET /api/bao-cao/bao-tri
GET /api/bao-cao/thiet-bi
```

Filter qua query params.

Không cố định nếu project đã có route khác.

---

# 58. API M5.3 định hướng

Có thể:

```text
GET /api/bao-cao/su-co/export?dinh_dang=excel
```

hoặc:

```text
POST /api/bao-cao/export
```

Phải ưu tiên convention hiện tại.

Không tạo endpoint trùng.

---

# 59. Validation thời gian

Backend phải validate:

```text
tu_ngay
den_ngay
```

Không chấp nhận:

```text
Invalid Date
tu_ngay > den_ngay
```

Boundary phải thống nhất để không bỏ record cuối ngày.

---

# 60. Group theo thời gian

Nếu group:

```text
ngày
tuần
tháng
```

phải có format label rõ.

Ưu tiên aggregate trong SQL.

Timezone phải nhất quán.

---

# 61. Công thức KPI phải được tài liệu hóa

Ví dụ:

```text
Sự cố mở =
MOI + DA_PHAN_CONG + DANG_XU_LY
```

```text
Thời gian xử lý trung bình =
AVG(thoi_gian_hoan_thanh - thoi_gian_bao)
của DA_XU_LY có đủ timestamp
```

Không có KPI mơ hồ.

---

# 62. Không tự gọi mọi duration là MTTR

Nếu chỉ tính:

```text
thoi_gian_bao → thoi_gian_hoan_thanh
```

ưu tiên tên:

```text
thời gian xử lý sự cố trung bình
```

Không khẳng định MTTR chuẩn công nghiệp nếu chưa định nghĩa downtime/repair duration.

---

# 63. Báo cáo theo Technician

Nguồn:

```text
su_co.ky_thuat_vien_id
ho_so_sua_chua.ky_thuat_vien_id
phieu_bao_tri.ky_thuat_vien_id
```

Phải phân biệt:

```text
người được phân công
```

và:

```text
người thực hiện
```

Không tự suy ra hiệu suất/chất lượng nhân viên chỉ từ số lượng task.

---

# 64. Báo cáo theo vị trí

`thiet_bi.vi_tri_id` là vị trí hiện tại.

Schema `su_co` hiện không có location snapshot riêng.

Do đó:

- Không gọi join hiện tại là “vị trí lúc xảy ra” nếu DB không lưu.
- Ghi rõ là vị trí hiện tại của thiết bị nếu dùng join này.
- Không tự thêm snapshot column.

---

# 65. Snapshot hiện tại và lịch sử

Phải phân biệt:

```text
snapshot hiện tại
historical metric
```

`thiet_bi.trang_thai` chỉ phản ánh hiện tại.

Không dựng biểu đồ trạng thái thiết bị 6 tháng trước nếu không có history.

---

# 66. Không suy diễn lịch sử

Không dùng:

```text
ngay_cap_nhat
```

như status history.

Nếu schema chưa hỗ trợ historical trend:

```text
nói rõ giới hạn
```

Không fake dữ liệu.

---

# 67. Export phải tôn trọng quyền

Không xuất dữ liệu vượt quyền.

Role lấy từ JWT/context.

Không nhận:

```text
role=admin
```

từ query/body để bypass.

---

# 68. File tạm export

Nếu generate file tạm:

- Dùng temp dir/cơ chế project.
- Không commit file export vào source.
- Không lưu public vĩnh viễn nếu chưa có yêu cầu.
- Dọn file tạm khi phù hợp.

---

# 69. Content-Type export

Excel:

```text
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

PDF:

```text
application/pdf
```

Header download phải đúng.

---

# 70. Export không được crash server

Phải xử lý:

```text
query lỗi
generate lỗi
stream lỗi
client ngắt
dataset rỗng
Unicode
```

Không để unhandled rejection.

---

# 71. Test M5.1 — Database rỗng

Kỳ vọng:

```text
KPI = 0
chart = []
list = []
không 500
```

Không seed DB nếu chưa được yêu cầu.

---

# 72. Test M5.1 — Sự cố mở

Test đủ:

```text
MOI
DA_PHAN_CONG
DANG_XU_LY
DA_XU_LY
DA_HUY
```

Kỳ vọng:

```text
open = MOI + DA_PHAN_CONG + DANG_XU_LY
```

---

# 73. Test M5.1 — NGHIEM_TRONG

```text
NGHIEM_TRONG + MOI
→ tính vào nghiêm trọng mở

NGHIEM_TRONG + DA_XU_LY
→ không tính vào nghiêm trọng đang mở

CAO + MOI
→ không tính vào NGHIEM_TRONG
```

---

# 74. Test M5.1 — Thiết bị

Test:

```text
DANG_HOAT_DONG
DANG_BAO_TRI
DANG_HONG
NGUNG_HOAT_DONG
THANH_LY
```

Không trộn `THANH_LY` vào KPI đang quản lý/vận hành.

---

# 75. Test thời gian xử lý

```text
DA_XU_LY đủ timestamp
→ tính

DA_XU_LY thiếu hoàn thành
→ loại khỏi AVG

DA_HUY
→ không tính

MOI
→ không tính
```

---

# 76. Test bảo trì

Test:

```text
HOAN_THANH
QUA_HAN
CHO_THUC_HIEN
DANG_THUC_HIEN
DA_HUY
```

Dashboard phải dùng cùng rule Module 4.

---

# 77. Test M5.2 — Filter

Phải test:

```text
không filter
7 ngày
30 ngày
tháng hiện tại
custom range
tu_ngay > den_ngay
date invalid
thiet_bi_id không tồn tại
status sai ENUM
Technician sai ID
```

---

# 78. Test report rỗng

Filter hợp lệ nhưng không có record:

```text
200
tong = 0
duLieu = []
```

Không trả 404.

---

# 79. Test Excel

Test:

```text
Có dữ liệu
Không có dữ liệu
Unicode tiếng Việt
Khoảng thời gian
Tên file
Content-Type
Dataset vượt giới hạn
```

---

# 80. Test PDF

Test:

```text
Có dữ liệu
Không có dữ liệu
Unicode tiếng Việt
Bảng nhiều dòng
Page break
Tên báo cáo
Khoảng thời gian
Content-Type
```

---

# 81. Không sửa Module 2/3/4 để phục vụ report

Nếu metric không tính được vì dữ liệu nguồn chưa có:

**Không tự sửa Module 2/3/4 hoặc database trong task Module 5.**

Ví dụ:

```text
location snapshot không có
Health Score không có
status history không có
```

thì ghi rõ giới hạn.

---

# 82. Quy tắc hoàn thiện file

Không để:

```text
TODO
FIXME
coming soon
throw new Error("Not implemented")
```

Không tạo controller rỗng.

Không tạo route gọi function chưa tồn tại.

---

# 83. Không đổi response toàn project

Nếu Module 1–4 dùng:

```text
thanhCong
thongBao
duLieu
```

Module 5 tiếp tục đúng convention.

Không đổi toàn project sang tiếng Anh.

---

# 84. Quy chuẩn đặt tên

Trước khi code đọc:

```text
QUY_CHUAN_DAT_BIEN.md
```

hoặc file tương ứng.

Tên file/function/variable phải theo project.

---

# 85. File định hướng Module 5

Chỉ là gợi ý nếu project chưa có:

```text
src/routes/dashboard.routes.js
src/routes/bao_cao.routes.js
src/controllers/dashboard.controller.js
src/controllers/bao_cao.controller.js
```

Nếu architecture dùng service:

```text
src/services/dashboard.service.js
src/services/bao_cao.service.js
```

Không tự tạo service nếu project không dùng.

---

# 86. Mount route

Nếu tạo route mới phải kiểm tra:

```text
src/routes/index.js
src/app.js
```

Không mount sai thành:

```text
/api/api/dashboard
```

Không tạo hai base path cùng chức năng.

---

# 87. Route order

Route cụ thể như:

```text
/export
/tong-quan
```

không được bị route động:

```text
/:id
```

nuốt mất.

Kiểm tra thứ tự Express.

---

# 88. Error handling

Dùng error handler hiện tại.

Không gửi raw:

```text
SQL syntax
stack trace
filesystem path
```

cho client.

---

# 89. Khi user chỉ yêu cầu M5.1

Chỉ làm:

```text
M5.1
```

Không tự làm:

```text
M5.2
M5.3
```

Nếu yêu cầu M5.1 + M5.2:

Không tự làm Export nếu chưa giao.

---

# 90. Khi user yêu cầu “ưu tiên triển khai”

Thứ tự:

```text
1. KPI cốt lõi đúng
2. Filter thời gian đúng
3. Drill-down đúng
4. Báo cáo aggregate đúng
5. Export sau
```

Không ưu tiên chart đẹp hơn số liệu đúng.

---

# 91. Kết quả M5.1 phải đạt

```text
Admin đăng nhập
→ mở Dashboard
→ backend kiểm tra quyền
→ query aggregate
→ trả KPI
→ trả dữ liệu chart
→ DB rỗng vẫn 0/[]
→ click KPI
→ drill-down module nguồn
```

---

# 92. Kết quả M5.2 phải đạt

```text
Admin chọn báo cáo
→ chọn filter
→ backend validate
→ query aggregate
→ summary
→ chart/table
→ detail pagination
→ drill-down
```

---

# 93. Kết quả M5.3 phải đạt

```text
Admin mở báo cáo
→ chọn filter
→ xem báo cáo
→ chọn PDF/Excel
→ backend chạy lại cùng query/filter
→ generate
→ download
→ dữ liệu khớp UI
```

Không cần export history nếu DB chưa hỗ trợ.

---

# 94. Checklist trước khi sửa code

```text
1. Có thuộc Module 5 không?
2. Metric có dữ liệu nguồn thật không?
3. Công thức đã rõ chưa?
4. Có invent table/column không?
5. Có sửa Module 2/3/4 không?
6. Có dùng đúng QUAN_TRI_VIEN không?
7. ENUM có đúng DB không?
8. Date/timezone đúng chưa?
9. Filter an toàn chưa?
10. Có SQL injection không?
11. Detail có pagination chưa?
12. KPI tính ở backend chưa?
13. Dashboard còn read-only không?
14. Công thức Dashboard/Report/Export có đồng nhất không?
15. Export có dùng cùng filter không?
```

---

# 95. Checklist trước khi trả code

```text
[ ] Đã đọc MODULE5.md.
[ ] Đã đọc QUY_CHUAN_DAT_BIEN.md.
[ ] Đã kiểm tra database.
[ ] Không CREATE/ALTER TABLE.
[ ] Không thêm MANAGER.
[ ] Không invent Health Score.
[ ] Không invent history.
[ ] KPI có định nghĩa.
[ ] Sự cố mở đúng status.
[ ] DA_HUY xử lý đúng.
[ ] THANH_LY xử lý đúng.
[ ] Quá hạn dùng cùng rule Module 4.
[ ] Date filter hợp lệ.
[ ] Query parameterized.
[ ] Detail pagination.
[ ] Response đúng convention.
[ ] Không TODO/code giả.
```

---

# 96. Kết quả Module 5 phải đạt

```text
Dữ liệu thiết bị / sự cố / sửa chữa / bảo trì
        ↓
Backend aggregate
        ↓
Dashboard
        ↓
KPI + chart
        ↓
Drill-down
        ↓
Báo cáo
        ↓
Filter
        ↓
Bảng + thống kê
        ↓
Export PDF / Excel
```

---

# 97. Không được tự mở rộng

Không tự chuyển sang:

```text
Module 1
Module 2
Module 3
Module 4
Mobile
Refactor toàn backend
Đổi database
Microservice
Redis
Kafka
AI
Health Score mới
Data warehouse
BI platform
ETL
```

trừ khi prompt yêu cầu trực tiếp.

---

# 98. Nguyên tắc cuối cùng cho Agent

```text
1. Đây có phải dữ liệu Dashboard/Báo cáo không?
2. Database có hỗ trợ không?
3. Metric có công thức rõ không?
4. Có suy diễn lịch sử không tồn tại không?
5. Có tự thêm role/table/column không?
6. Có làm thay Module 2/3/4 không?
7. Dashboard có read-only không?
8. QUAN_TRI_VIEN đã được kiểm tra chưa?
9. Report và Export có cùng công thức không?
10. DB rỗng có chạy không?
```

Nếu ngoài phạm vi:

**Không tự triển khai.**

Ưu tiên:

**Đúng dữ liệu → đúng công thức → đúng quyền → đúng database → chạy được → test được → sau đó mới tối ưu.**

---

# 99. Chỉ thị ngắn cho AI Agent

```text
MODULE 5 ONLY.

READ MODULE5.md BEFORE WRITING CODE.

READ QUY_CHUAN_DAT_BIEN.md BEFORE WRITING CODE.

USE CURRENT DATABASE AS SOURCE OF TRUTH.

DO NOT MODIFY DATABASE UNLESS EXPLICITLY REQUESTED.

DO NOT CREATE DASHBOARD/REPORT TABLES.

DO NOT INVENT MANAGER ROLE.

DO NOT INVENT HEALTH SCORE.

DO NOT INVENT HISTORICAL DATA.

DASHBOARD MUST BE READ-ONLY.

REUSE MODULE 3 RULES FOR INCIDENT METRICS.

REUSE MODULE 4 RULES FOR MAINTENANCE DUE/OVERDUE.

DEFINE EVERY KPI CLEARLY.

KEEP REPORT AND EXPORT FORMULAS CONSISTENT.

VALIDATE DATE RANGE AND FILTERS.

USE PARAMETERIZED SQL.

PAGINATE DETAIL DATA.

DO NOT LOAD THE ENTIRE DATABASE INTO NODE.JS TO COUNT.

NO TODO.

NO PLACEHOLDER CODE.

NO FAKE DATA.

DO NOT MOVE OUTSIDE MODULE 5.
```

---

# 100. Tóm tắt ngữ cảnh hiện tại

Project:

```text
FactoryCare
Backend: Node.js + Express + MySQL
Web Admin: Next.js
Mobile: React Native
```

Module 5:

```text
M5.1 Dashboard tổng quan
M5.2 Báo cáo & thống kê
M5.3 Export PDF / Excel
```

Role quản trị thực tế:

```text
QUAN_TRI_VIEN
```

Nguồn chính:

```text
thiet_bi
su_co
ho_so_sua_chua
ke_hoach_bao_tri
phieu_bao_tri
loai_thiet_bi
vi_tri
nguoi_dung
```

Nguyên tắc:

```text
Không sửa database.
Không tạo bảng Dashboard.
Không tạo role MANAGER.
Không invent dữ liệu lịch sử.
Không invent Health Score.
Dashboard read-only.
Drill-down về module nguồn.
Report và Export dùng cùng công thức.
```

Ưu tiên:

```text
M5.1
→ KPI cốt lõi
→ chart cơ bản
→ drill-down

M5.2
→ báo cáo sự cố
→ báo cáo sửa chữa
→ báo cáo bảo trì
→ báo cáo thiết bị
→ filter/pagination

M5.3
→ Excel
→ PDF
→ cùng filter/công thức với M5.2
```

---

# 101. Nguyên tắc kết thúc

Module 5 không phải nơi tạo ra dữ liệu nghiệp vụ mới.

Nó là lớp:

```text
ĐỌC DỮ LIỆU NGUỒN
→ TỔNG HỢP
→ PHÂN TÍCH
→ HIỂN THỊ
→ DRILL-DOWN
→ EXPORT
```

Mọi implementation phải ưu tiên:

**Đúng nghiệp vụ → đúng công thức KPI → đúng database → đúng quyền → không phá Module 1–4 → chạy được → test được → sau đó mới tối ưu.**
