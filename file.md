# FACTORYCARE — PHÂN TÍCH CHỨC NĂNG, CÁCH TRIỂN KHAI VÀ KỊCH BẢN TRÌNH BÀY

> Tài liệu này được lập dựa trên mã nguồn backend hiện có trong thư mục `D:\QLSCvaQLBTI_BE`.
> Mục đích: dùng để hiểu bài, viết báo cáo, chuẩn bị slide, demo và trả lời phản biện.

---

## 1. Tóm tắt đề tài

**Tên đề tài:** FactoryCare — Hệ thống quản lý sự cố và bảo trì thiết bị trong nhà máy.

FactoryCare giải quyết bài toán theo dõi thiết bị trong suốt quá trình sử dụng: thiết bị đang ở đâu, do ai quản lý, đã xảy ra sự cố gì, ai được phân công sửa chữa, kết quả sửa chữa ra sao, khi nào phải bảo trì và tình trạng tổng thể của nhà máy hiện tại như thế nào.

Hệ thống có ba nhóm người dùng:

| Vai trò | Mã trong hệ thống | Nền tảng chính | Trách nhiệm |
|---|---|---|---|
| Quản trị viên | `QUAN_TRI_VIEN` | Web Admin | Quản lý dữ liệu, phân công, giám sát, báo cáo |
| Kỹ thuật viên | `KY_THUAT_VIEN` | Mobile | Xử lý sự cố và thực hiện bảo trì |
| Nhân viên | `NHAN_VIEN` | Mobile | Tra cứu thiết bị, báo sự cố, theo dõi và xác nhận kết quả |

### Cách giới thiệu ngắn với thầy

> “FactoryCare là hệ thống hỗ trợ quản lý vòng đời vận hành của thiết bị trong nhà máy. Khi thiết bị hỏng, nhân viên có thể quét QR để báo sự cố; quản trị viên phân công kỹ thuật viên; kỹ thuật viên cập nhật quá trình sửa chữa; người báo xác nhận kết quả. Song song với sửa chữa đột xuất, hệ thống còn quản lý kế hoạch bảo trì định kỳ, checklist, cảnh báo quá hạn, dashboard và báo cáo. Backend được xây dựng bằng Node.js, Express, MySQL và JWT.”

---

## 2. Bài toán thực tế và lý do chọn đề tài

Nếu quản lý bằng giấy, Excel rời rạc hoặc nhóm chat, nhà máy thường gặp các vấn đề:

- Không biết chính xác thiết bị đang ở vị trí nào.
- Khi máy hỏng, thông tin báo lỗi thiếu hình ảnh, thiếu thời gian và khó truy vết người báo.
- Phân công sửa chữa qua tin nhắn nên dễ bỏ sót hoặc không rõ trách nhiệm.
- Kết quả sửa chữa, nguyên nhân và linh kiện đã thay không được lưu thành lịch sử.
- Bảo trì định kỳ dễ bị quên hoặc quá hạn.
- Quản lý khó biết thiết bị nào hỏng nhiều, sự cố nào nghiêm trọng và hiệu quả xử lý ra sao.

FactoryCare tập trung giải quyết đúng các vấn đề trên. Hệ thống **không phải ERP**, không làm kế toán, nhân sự, mua hàng hay quản lý kho đầy đủ. Nhà cung cấp, hóa đơn và linh kiện chỉ được lưu ở mức cần thiết để truy vết thiết bị và hoạt động sửa chữa/bảo trì.

---

## 3. Mục tiêu của hệ thống

### 3.1. Mục tiêu nghiệp vụ

1. Số hóa hồ sơ và vị trí của từng thiết bị.
2. Chuẩn hóa quy trình báo cáo, phân công và xử lý sự cố.
3. Lưu được lịch sử sửa chữa, điều chuyển và bảo trì.
4. Chủ động lập lịch và cảnh báo bảo trì định kỳ.
5. Phân quyền dữ liệu và hành động theo đúng vai trò.
6. Cung cấp số liệu tổng hợp để quản trị viên ra quyết định.

### 3.2. Mục tiêu kỹ thuật

- Cung cấp REST API dùng chung cho Web Admin và Mobile.
- Dùng JWT để xác thực người dùng.
- Dùng middleware để kiểm tra quyền ở backend.
- Dùng MySQL và câu lệnh có tham số để bảo vệ dữ liệu.
- Dùng transaction cho thao tác gồm nhiều bước phụ thuộc nhau.
- Giữ cấu trúc nhiều tầng để mã nguồn dễ học, kiểm thử và mở rộng.

---

## 4. Phạm vi bài làm

### 4.1. Phạm vi có trong backend hiện tại

Mã nguồn hiện khai báo **100 endpoint** trong 13 nhóm route, bao gồm health check. Các nhóm chính:

1. Xác thực.
2. Người dùng và phân quyền.
3. Loại thiết bị.
4. Vị trí.
5. Nhà cung cấp.
6. Lô nhập và hóa đơn.
7. Thiết bị, QR, import, bảo hành, điều chuyển, timeline và Health Score.
8. Sự cố và hồ sơ sửa chữa.
9. Thông báo.
10. Kế hoạch, phân công, checklist và phiếu bảo trì.
11. Dashboard.
12. Báo cáo và xuất Excel/PDF.

Chi tiết request/response của từng API nằm trong `api.md`.

### 4.2. Ngoài phạm vi

- Kế toán và thanh toán hóa đơn.
- Quản lý mua hàng.
- Quản lý kho linh kiện đầy đủ.
- Quản lý nhân sự, chấm công và tiền lương.
- ERP tổng thể.
- IoT tự động đọc cảm biến máy.

Khi trình bày, cần nói rõ ranh giới này để thể hiện đề tài có phạm vi hợp lý, không ôm đồm.

---

## 5. Phân quyền theo vai trò

| Nhóm chức năng | Nhân viên | Kỹ thuật viên | Quản trị viên |
|---|:---:|:---:|:---:|
| Đăng nhập, xem tài khoản, đổi mật khẩu | Có | Có | Có |
| Xem thông tin thiết bị cơ bản, quét QR | Có | Có | Có |
| Báo sự cố | Có | Không | Không |
| Xem sự cố do mình báo | Có | Không | Có toàn bộ |
| Xác nhận kết quả sửa chữa | Có, nếu là người báo | Không | Không |
| Xem công việc sửa chữa được giao | Không | Có | Có giám sát |
| Bắt đầu/cập nhật/hoàn thành sửa chữa | Không | Có, nếu được giao | Không |
| Quản lý tài khoản | Không | Không | Có |
| CRUD thiết bị và danh mục | Không | Không | Có |
| Điều chuyển thiết bị | Không | Không | Có |
| Phân công sự cố | Không | Không | Có |
| Lập kế hoạch và phân công bảo trì | Không | Không | Có |
| Thực hiện phiếu bảo trì | Không | Có, nếu được giao | Có giám sát |
| Dashboard, báo cáo, xuất file | Không | Không | Có |

Điểm cần nhấn mạnh: backend không tin `vaiTro` do frontend gửi lên. Middleware xác thực JWT, đọc lại người dùng trong cơ sở dữ liệu, kiểm tra trạng thái tài khoản rồi mới gắn thông tin vào `req.nguoiDung`. Middleware phân quyền dùng chính dữ liệu này để cho phép hoặc từ chối truy cập.

---

## 6. Kiến trúc kỹ thuật

### 6.1. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js, Express.js |
| Database | MySQL 8+, `mysql2/promise` |
| Xác thực | JWT, `jsonwebtoken` |
| Mật khẩu | `bcryptjs` |
| Upload | `multer` |
| QR | `qrcode` |
| Excel | `exceljs` |
| PDF | `pdfkit` |
| Bảo mật HTTP | `helmet`, `cors` |
| Log request | `morgan` |

### 6.2. Kiến trúc nhiều tầng

```text
Web Admin / Mobile
        |
        | HTTP Request + JWT
        v
Route
        v
Middleware xác thực và phân quyền
        v
Controller
        v
Service (nghiệp vụ, validation, transaction)
        v
Model (SQL có tham số)
        v
MySQL
        |
        v
JSON Response / File Excel / File PDF
```

Vai trò của từng tầng:

- **Route:** định nghĩa URL, HTTP method, middleware và controller được gọi.
- **Middleware:** xác thực token, kiểm tra vai trò, nhận file và xử lý lỗi chung.
- **Controller:** lấy dữ liệu từ request, gọi service, trả HTTP status và response.
- **Service:** chứa luật nghiệp vụ, validation, kiểm tra trạng thái và transaction.
- **Model:** chỉ thực hiện truy vấn MySQL bằng tham số `?`.
- **Database:** giữ dữ liệu và ràng buộc quan hệ.

### 6.3. Cấu trúc thư mục chính

```text
src/
├── config/       # cấu hình môi trường và MySQL pool
├── constants/    # vai trò, trạng thái, mức độ, đơn vị chu kỳ
├── controllers/  # nhận request và trả response
├── middlewares/  # JWT, phân quyền, upload, xử lý lỗi
├── models/       # truy vấn SQL
├── routes/       # endpoint REST
├── services/     # xử lý nghiệp vụ
├── utils/        # JWT, ngày giờ, response
├── app.js        # cấu hình Express và mount route
└── server.js     # kiểm tra database và mở cổng server
```

---

## 7. Thiết kế dữ liệu

Hệ thống xoay quanh 13 bảng nghiệp vụ:

| Bảng | Ý nghĩa |
|---|---|
| `nguoi_dung` | Tài khoản và vai trò |
| `loai_thiet_bi` | Danh mục loại thiết bị |
| `vi_tri` | Cây vị trí trong nhà máy |
| `nha_cung_cap` | Nguồn cung cấp thiết bị |
| `lo_nhap` | Lô nhập và thông tin hóa đơn |
| `thiet_bi` | Hồ sơ trung tâm của thiết bị |
| `dieu_chuyen_thiet_bi` | Lịch sử thay đổi vị trí |
| `su_co` | Phiếu báo sự cố |
| `ho_so_sua_chua` | Nhật ký và kết quả sửa chữa |
| `mau_checklist` | Mẫu danh mục kiểm tra bảo trì |
| `ke_hoach_bao_tri` | Lịch bảo trì định kỳ |
| `phieu_bao_tri` | Một lần thực hiện bảo trì thực tế |
| `thong_bao` | Thông báo cho từng người dùng |

Quan hệ chính:

```text
loai_thiet_bi ──< thiet_bi >── vi_tri
                       |
nha_cung_cap ──< lo_nhap
                       |
                       └──< thiet_bi

thiet_bi ──< dieu_chuyen_thiet_bi
thiet_bi ──< su_co ──< ho_so_sua_chua
thiet_bi ──< ke_hoach_bao_tri ──< phieu_bao_tri
mau_checklist ──< ke_hoach_bao_tri
nguoi_dung ──< su_co / ho_so_sua_chua / phieu_bao_tri / thong_bao
```

Thiết kế tách `ke_hoach_bao_tri` và `phieu_bao_tri` vì kế hoạch mô tả quy luật lặp lại, còn phiếu là bằng chứng của một lần thực hiện thực tế. Tương tự, `su_co` mô tả vấn đề, còn `ho_so_sua_chua` lưu công việc kỹ thuật đã làm.

---

## 8. Chức năng chi tiết và cách triển khai

### 8.1. Module 1 — Xác thực, người dùng và phân quyền

#### Chức năng

- Khởi tạo quản trị viên đầu tiên khi hệ thống chưa có tài khoản.
- Đăng nhập bằng email và mật khẩu.
- Lấy thông tin người đang đăng nhập.
- Đăng xuất phía client.
- Đổi mật khẩu.
- Admin xem danh sách, xem chi tiết, tạo và cập nhật người dùng.
- Admin khóa/mở tài khoản bằng trạng thái thay vì xóa lịch sử.

#### Cách triển khai

1. Client gửi email và mật khẩu tới `POST /api/xac-thuc/dang-nhap`.
2. Service tìm người dùng theo email.
3. Kiểm tra tài khoản có `HOAT_DONG` hay không.
4. So sánh mật khẩu bằng bcrypt.
5. Nếu hợp lệ, backend ký JWT và trả token.
6. Các API bảo vệ yêu cầu header `Authorization: Bearer <token>`.
7. Middleware xác thực token rồi đọc lại người dùng từ database.
8. Middleware phân quyền so sánh vai trò thực tế với danh sách vai trò được phép.

#### API tiêu biểu

| Method | API | Ý nghĩa |
|---|---|---|
| `POST` | `/api/xac-thuc/dang-nhap` | Đăng nhập |
| `GET` | `/api/xac-thuc/toi` | Xem tài khoản hiện tại |
| `PATCH` | `/api/nguoi-dung/toi/mat-khau` | Đổi mật khẩu |
| `POST` | `/api/nguoi-dung` | Admin tạo tài khoản |
| `PATCH` | `/api/nguoi-dung/:id/trang-thai` | Khóa/mở tài khoản |

#### Điểm bảo mật để trình bày

- Mật khẩu không trả về trong response.
- Mật khẩu lưu dạng băm, không lưu plain text.
- Tài khoản bị khóa không thể tiếp tục sử dụng API dù token cũ còn hạn.
- Người dùng đã đăng nhập nhưng sai quyền nhận HTTP `403`.

---

### 8.2. Module 2 — Quản lý thiết bị

Đây là module trung tâm. Mọi sự cố, sửa chữa, bảo trì và báo cáo đều quy về một thiết bị cụ thể.

#### 8.2.1. Loại thiết bị

- Thêm, sửa, xem danh sách và chi tiết loại thiết bị.
- `ten_loai` là duy nhất.
- Không tự tạo cột `prefix` vì schema hiện tại không có cột này.

Mã nguồn hiện tại sinh tiền tố từ `ten_loai`, bỏ dấu và chọn từ phù hợp, sau đó tạo mã dạng `TIEN_TO-0001`. Nếu doanh nghiệp muốn tiền tố cố định do Admin cấu hình, cần đề xuất migration thêm cột thay vì tự giả định trong code.

#### 8.2.2. Vị trí phân cấp

Cây vị trí dùng quan hệ tự tham chiếu `vi_tri_cha_id`:

```text
NHA_MAY
└── XUONG
    └── DAY_CHUYEN
        └── KHU_VUC
```

Admin quản lý vị trí; các vai trò có thể đọc dữ liệu phù hợp để tra cứu thiết bị. Khi xóa cần kiểm tra vị trí con, thiết bị đang dùng và lịch sử điều chuyển để bảo vệ toàn vẹn dữ liệu.

#### 8.2.3. Nhà cung cấp, lô nhập và hóa đơn

- Nhà cung cấp lưu thông tin liên hệ.
- Lô nhập gom các thiết bị nhập cùng nguồn.
- Có thể gắn số hóa đơn, ngày nhập, tổng giá trị và file hóa đơn.
- Thiết bị được phép không thuộc lô nhập.
- Đây là dữ liệu truy vết, không biến thành module mua hàng/kế toán.

#### 8.2.4. Hồ sơ thiết bị

Admin có thể:

- Tạo và cập nhật hồ sơ.
- Gắn loại thiết bị, vị trí và lô nhập.
- Lưu serial, model, hãng, giá, ảnh và bảo hành.
- Cập nhật trạng thái trong enum hiện hành.
- Tra cứu, lọc và phân trang.

Các trạng thái hiện có:

```text
DANG_HOAT_DONG
DANG_BAO_TRI
DANG_HONG
NGUNG_HOAT_DONG
THANH_LY
```

#### 8.2.5. Sinh mã và QR

Khi tạo thiết bị:

1. Kiểm tra loại, vị trí, lô nhập và serial.
2. Tạo tiền tố từ tên loại.
3. Dùng khóa theo tiền tố để tránh hai request sinh trùng số thứ tự.
4. Sinh mã thiết bị dạng `ABC-0001`.
5. Sinh nội dung QR dạng `FC-ABC-0001`.
6. Có thể trả ảnh QR dạng Data URL.

Tất cả vai trò có thể quét QR để lấy hồ sơ cần thiết, nhưng service định dạng dữ liệu theo vai trò. Dữ liệu giá mua và lô nhập chỉ nên dành cho Admin.

#### 8.2.6. Import hàng loạt

- Hỗ trợ `.xlsx` và `.csv`.
- File tối đa 5 MB, tối đa 500 dòng dữ liệu.
- Có API preview để phát hiện lỗi trước khi ghi.
- Kiểm tra loại thiết bị, vị trí, lô nhập, serial trùng trong file và trong database.
- Import dùng transaction; nếu một bước quan trọng thất bại có thể rollback để tránh dữ liệu dở dang.

#### 8.2.7. Điều chuyển thiết bị

Không cập nhật trực tiếp vị trí mà không lưu lịch sử. Service thực hiện transaction:

```text
BEGIN
  khóa và đọc thiết bị hiện tại
  kiểm tra vị trí mới
  INSERT dieu_chuyen_thiet_bi
  UPDATE thiet_bi.vi_tri_id
COMMIT
```

Nếu lỗi ở bất kỳ bước nào thì `ROLLBACK`. Nhờ vậy vị trí hiện tại và lịch sử luôn khớp nhau.

#### 8.2.8. Bảo hành, timeline và Health Score

- Bảo hành lưu ngày bắt đầu/kết thúc và suy ra trạng thái theo thời gian.
- Timeline gom sự kiện nhập thiết bị, điều chuyển, sự cố, sửa chữa và bảo trì thành một dòng thời gian.
- Health Score tổng hợp các yếu tố về sự cố, sửa chữa và bảo trì để hỗ trợ Admin nhận biết thiết bị cần chú ý.
- Health Score là chỉ số hỗ trợ, không thay thế đánh giá chuyên môn của kỹ thuật viên.

#### API tiêu biểu

| Method | API | Ý nghĩa |
|---|---|---|
| `GET` | `/api/thiet-bi` | Danh sách thiết bị |
| `POST` | `/api/thiet-bi` | Tạo thiết bị |
| `POST` | `/api/thiet-bi/quet-qr` | Tra cứu bằng QR |
| `POST` | `/api/thiet-bi/import/preview` | Kiểm tra file import |
| `POST` | `/api/thiet-bi/import` | Import thiết bị |
| `POST` | `/api/thiet-bi/:id/dieu-chuyen` | Điều chuyển có lịch sử |
| `GET` | `/api/thiet-bi/:id/timeline` | Xem dòng thời gian |
| `GET` | `/api/thiet-bi/:id/health-score` | Xem điểm sức khỏe |

---

### 8.3. Module 3 — Sự cố và sửa chữa

#### Vai trò trong quy trình

- Nhân viên: phát hiện, báo lỗi, theo dõi và xác nhận.
- Admin: xem toàn bộ sự cố và phân công kỹ thuật viên.
- Kỹ thuật viên: nhận việc, xử lý, ghi nguyên nhân, giải pháp, linh kiện và kết quả.

#### Luồng trạng thái đang được code hỗ trợ

```text
MOI
  └── Admin phân công → DA_PHAN_CONG
                         └── Kỹ thuật viên bắt đầu → DANG_XU_LY
                               ├── thiếu linh kiện → CHO_LINH_KIEN
                               │                      └── tiếp tục → DANG_XU_LY
                               └── hoàn thành kỹ thuật → CHO_XAC_NHAN
                                                        └── người báo xác nhận → DA_XU_LY

Một số nhánh hợp lệ có thể kết thúc bằng DA_HUY.
```

`CHO_LINH_KIEN` và `CHO_XAC_NHAN` là phần mở rộng đã có trong constants và migration của repo. Database phải chạy các migration tương ứng trước khi dùng luồng này.

#### Bước 1 — Nhân viên báo sự cố

1. Nhân viên quét QR hoặc chọn thiết bị.
2. Nhập tiêu đề, mô tả, mức độ, thời gian xảy ra và ảnh.
3. Backend không nhận `nguoiBaoId` tùy ý mà lấy từ JWT.
4. Kiểm tra thiết bị tồn tại.
5. Sinh `ma_su_co`, tạo bản ghi trạng thái `MOI`.
6. Có thể cập nhật trạng thái thiết bị sang `DANG_HONG` theo nghiệp vụ hiện hành.

Mức độ:

```text
THAP → TRUNG_BINH → CAO → NGHIEM_TRONG
```

#### Bước 2 — Admin phân công

- Chỉ Admin được chọn kỹ thuật viên.
- Kỹ thuật viên phải có đúng vai trò và đang hoạt động.
- Service khóa bản ghi sự cố để tránh hai Admin phân công đồng thời.
- Cập nhật người phụ trách, trạng thái và thời gian phân công.
- Tạo thông báo cho kỹ thuật viên trong cùng transaction.

#### Bước 3 — Kỹ thuật viên xử lý

- Chỉ kỹ thuật viên được giao mới được thao tác.
- Bắt đầu công việc chuyển sang `DANG_XU_LY`.
- Có thể cập nhật hồ sơ sửa chữa trong quá trình làm.
- Nếu thiếu linh kiện, chuyển `CHO_LINH_KIEN` kèm lý do/ghi chú.
- Khi có linh kiện, chuyển lại `DANG_XU_LY`.
- Lưu nguyên nhân, cách xử lý, linh kiện thay thế, ảnh, ghi chú và kết quả.

Kết quả sửa chữa:

```text
DA_SUA_XONG
SUA_MOT_PHAN
KHONG_SUA_DUOC
```

#### Bước 4 — Hoàn thành và xác nhận

Kỹ thuật viên hoàn thành phần chuyên môn, hệ thống chuyển sự cố sang `CHO_XAC_NHAN`. Người báo kiểm tra thực tế và xác nhận thì sự cố chuyển sang `DA_XU_LY`. Cách làm này thể hiện quy trình khép kín: người thực hiện không tự quyết định một mình rằng nhu cầu của người báo đã được giải quyết.

#### Transaction khi hoàn thành

Một transaction có thể bao gồm:

- khóa sự cố;
- hoàn thành hồ sơ sửa chữa;
- cập nhật sự cố;
- cập nhật trạng thái thiết bị tùy kết quả và các sự cố còn mở;
- tạo thông báo;
- commit hoặc rollback toàn bộ.

#### API tiêu biểu

| Người dùng | Method | API | Ý nghĩa |
|---|---|---|---|
| Nhân viên | `POST` | `/api/su-co` | Báo sự cố |
| Nhân viên | `GET` | `/api/su-co/cua-toi` | Theo dõi sự cố đã báo |
| Nhân viên | `PATCH` | `/api/su-co/cua-toi/:id/xac-nhan` | Xác nhận hoàn thành |
| Admin | `POST` | `/api/su-co/:id/phan-cong` | Phân công kỹ thuật viên |
| Kỹ thuật viên | `GET` | `/api/su-co/cong-viec-cua-toi` | Xem việc được giao |
| Kỹ thuật viên | `PATCH` | `/api/su-co/:id/bat-dau-xu-ly` | Bắt đầu sửa |
| Kỹ thuật viên | `PATCH` | `/api/su-co/:id/cho-linh-kien` | Tạm chờ linh kiện |
| Kỹ thuật viên | `POST` | `/api/su-co/:id/hoan-thanh` | Hoàn thành kỹ thuật |

---

### 8.4. Module 4 — Quản lý bảo trì

#### Phân biệt ba khái niệm

| Khái niệm | Câu hỏi trả lời | Ví dụ |
|---|---|---|
| Mẫu checklist | Cần kiểm tra những gì? | Dầu máy, độ rung, dây điện |
| Kế hoạch bảo trì | Bao lâu bảo trì một lần? | Mỗi 3 tháng |
| Phiếu bảo trì | Lần này ai làm, khi nào, kết quả gì? | Phiếu ngày 06/10/2026 |

#### 8.4.1. Mẫu checklist

- Admin tạo mẫu theo loại thiết bị.
- Danh sách hạng mục được lưu JSON.
- Khi sinh phiếu, checklist thực tế cần được chụp thành snapshot.
- Sửa mẫu về sau không làm thay đổi kết quả lịch sử đã thực hiện.
- Không xóa cứng mẫu đã dùng; chuyển `NGUNG_HOAT_DONG`.

#### 8.4.2. Kế hoạch bảo trì

Admin chọn:

- thiết bị;
- mẫu checklist;
- kỹ thuật viên nếu có;
- giá trị chu kỳ;
- đơn vị `NGAY`, `TUAN`, `THANG`, `NAM`;
- ngày bắt đầu và ngày bảo trì tiếp theo.

Kế hoạch có trạng thái `HOAT_DONG` hoặc `NGUNG_HOAT_DONG`.

#### 8.4.3. Phân công bảo trì

- Admin phân công kỹ thuật viên đang hoạt động.
- Hệ thống lưu dấu vết phân công.
- Kỹ thuật viên chỉ xem và thao tác công việc của mình.
- Việc phân công và thông báo được bảo vệ bằng transaction.

#### 8.4.4. Thực hiện phiếu bảo trì

Luồng chính:

```text
CHO_THUC_HIEN hoặc QUA_HAN
        |
        | Kỹ thuật viên bắt đầu
        v
DANG_THUC_HIEN
        |
        | cập nhật checklist + linh kiện + kết quả
        v
HOAN_THANH
```

Ngoài ra phiếu có thể ở `DA_HUY` nếu nghiệp vụ cho phép.

Khi bắt đầu, backend kiểm tra quyền sở hữu phiếu và chuyển thiết bị sang trạng thái bảo trì phù hợp. Khi hoàn thành, backend kiểm tra checklist/kết quả, cập nhật phiếu, thiết bị, kế hoạch và ngày bảo trì tiếp theo trong transaction.

#### 8.4.5. Cảnh báo sắp hạn và quá hạn

- Lấy danh sách công việc sắp đến hạn theo số ngày cảnh báo.
- Tìm phiếu quá hạn.
- Chuyển trạng thái phù hợp và tạo thông báo nếu chưa có.
- API xử lý cảnh báo có thể được scheduler/cron gọi định kỳ khi triển khai thật.

#### API tiêu biểu

| Method | API | Ý nghĩa |
|---|---|---|
| `POST` | `/api/bao-tri/checklist` | Tạo mẫu checklist |
| `POST` | `/api/bao-tri/ke-hoach` | Tạo kế hoạch |
| `POST` | `/api/bao-tri/ke-hoach/:id/phan-cong` | Phân công |
| `GET` | `/api/bao-tri/phieu/cua-toi` | Phiếu của kỹ thuật viên |
| `POST` | `/api/bao-tri/phieu/:id/bat-dau` | Bắt đầu bảo trì |
| `PUT` | `/api/bao-tri/phieu/:id/checklist` | Ghi checklist |
| `POST` | `/api/bao-tri/phieu/:id/hoan-thanh` | Hoàn thành |
| `GET` | `/api/bao-tri/qua-han` | Danh sách quá hạn |

---

### 8.5. Thông báo

Thông báo kết nối các quy trình nhưng không thay thế dữ liệu nghiệp vụ gốc.

Các loại:

```text
SU_CO
PHAN_CONG
BAO_TRI
HE_THONG
```

Người dùng có thể xem danh sách, đánh dấu một thông báo đã đọc, đánh dấu tất cả đã đọc và xóa thông báo đã đọc. `doi_tuong_lien_quan_id` giúp client mở đúng sự cố hoặc phiếu liên quan.

Ví dụ thời điểm tạo thông báo:

- Admin phân công sự cố cho kỹ thuật viên.
- Kỹ thuật viên hoàn thành phần sửa chữa.
- Phiếu bảo trì sắp đến hạn hoặc quá hạn.

---

### 8.6. Module 5 — Dashboard và báo cáo

#### Dashboard

Chỉ Admin truy cập `GET /api/dashboard/tong-quan`. Service lấy nhiều nhóm số liệu song song bằng `Promise.all`:

- tổng hồ sơ thiết bị và thiết bị đang quản lý;
- số sự cố đang mở;
- số sự cố nghiêm trọng đang mở;
- bảo trì sắp đến hạn và quá hạn;
- thời gian xử lý sự cố trung bình theo phút;
- thiết bị theo trạng thái;
- sự cố theo mức độ và theo thời gian;
- bảo trì theo trạng thái;
- top thiết bị nhiều sự cố;
- danh sách sự cố và bảo trì cần chú ý;
- đường dẫn drill-down tới danh sách chi tiết.

Dashboard là dữ liệu đọc, không sửa nghiệp vụ.

#### Báo cáo

Bốn nhóm báo cáo:

1. Báo cáo sự cố.
2. Báo cáo sửa chữa.
3. Báo cáo bảo trì.
4. Báo cáo thiết bị.

Báo cáo hỗ trợ bộ lọc, phân trang và sắp xếp. API export dùng cùng service báo cáo để tránh số liệu trên màn hình khác số liệu trong file.

#### Xuất file

- Excel `.xlsx`: có sheet tổng quan, sheet chi tiết, tiêu đề và bộ lọc.
- PDF: khổ A4 ngang, bảng dữ liệu và font Unicode nếu máy chủ có font phù hợp.
- Nội dung xuất tôn trọng cùng bộ lọc và quyền Admin.

API:

```text
GET /api/bao-cao/su-co
GET /api/bao-cao/sua-chua
GET /api/bao-cao/bao-tri
GET /api/bao-cao/thiet-bi
GET /api/bao-cao/:loai/export?dinhDang=excel|pdf
```

---

## 9. Hai luồng end-to-end quan trọng nhất để hiểu bài

### 9.1. Luồng sự cố khép kín

```text
Nhân viên quét QR
→ xem thiết bị
→ báo sự cố kèm ảnh
→ Admin thấy sự cố mới
→ Admin phân công kỹ thuật viên
→ kỹ thuật viên nhận thông báo
→ bắt đầu xử lý
→ ghi nguyên nhân, cách xử lý, linh kiện
→ hoàn thành kỹ thuật
→ nhân viên nhận thông báo
→ nhân viên xác nhận
→ sự cố hoàn tất
→ dashboard/timeline/report phản ánh dữ liệu mới
```

Điểm mạnh của luồng này là truy vết được đầy đủ người báo, người phân công, người sửa, thời gian và kết quả.

### 9.2. Luồng bảo trì định kỳ

```text
Admin tạo checklist
→ tạo kế hoạch theo chu kỳ
→ phân công kỹ thuật viên
→ hệ thống có phiếu thực hiện
→ cảnh báo khi gần hạn/quá hạn
→ kỹ thuật viên bắt đầu
→ thực hiện checklist
→ ghi linh kiện và kết quả
→ hoàn thành
→ cập nhật thiết bị
→ tính lần bảo trì kế tiếp
```

Điểm khác biệt cần nói rõ: sự cố là phản ứng khi hỏng, còn bảo trì là chủ động phòng ngừa hỏng hóc.

---

## 10. Cách triển khai chức năng trong mã nguồn

Khi thêm một chức năng mới, nên làm theo thứ tự:

1. Xác nhận bảng, cột, khóa ngoại và enum trong MySQL.
2. Tạo hoặc cập nhật constant nếu giá trị đã tồn tại trong schema.
3. Viết model với SQL có tham số.
4. Viết service để validation và xử lý nghiệp vụ.
5. Bọc transaction nếu có nhiều thay đổi phụ thuộc nhau.
6. Viết controller nhận request và trả response chuẩn.
7. Khai báo route, xác thực và phân quyền.
8. Cập nhật tài liệu API.
9. Test trường hợp đúng, sai dữ liệu, sai quyền và xung đột trạng thái.

Ví dụ “phân công sự cố” đi qua các tầng:

```text
POST /api/su-co/:id/phan-cong
→ xacThuc
→ phanQuyen(QUAN_TRI_VIEN)
→ su_co.controller
→ su_co.service
→ su_co.model + nguoi_dung.model + thong_bao.model
→ MySQL transaction
→ response cho Admin
```

### Tại sao business logic đặt ở service?

Vì controller chỉ nên xử lý HTTP. Các luật như “chỉ được bắt đầu khi đã phân công”, “chỉ kỹ thuật viên sở hữu phiếu được sửa”, hoặc “phải rollback khi tạo thông báo thất bại” là luật nghiệp vụ, nên đặt ở service để dễ tái sử dụng và kiểm thử.

---

## 11. Cách chạy dự án ở máy cá nhân

### 11.1. Điều kiện

- Node.js và npm.
- MySQL 8+.
- Database `QLSCvaBaoTri` đã có schema 13 bảng.
- Chạy migration mở rộng sự cố nếu sử dụng `CHO_LINH_KIEN`, `CHO_XAC_NHAN` và ảnh sửa chữa.

### 11.2. Cấu hình `.env`

Sao chép `.env.example` thành `.env` và cấu hình:

```env
PORT=3005
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mat_khau_mysql
DB_NAME=QLSCvaBaoTri
JWT_SECRET=chuoi_bi_mat_dai_va_kho_doan
JWT_EXPIRES_IN=1d
```

Không đưa `.env` thật lên Git.

### 11.3. Cài và chạy

```bash
npm install
npm run dev
```

Kiểm tra:

```http
GET http://localhost:3005/api/health
```

Sau đó dùng Postman/Thunder Client gọi API đăng nhập và gắn token vào header.

Lưu ý: tài liệu `api.md` đang có chỗ ghi base URL cũ là cổng `3000`, trong khi `.env.example` và cấu hình mặc định hiện dùng cổng `3005`. Khi demo hãy dùng đúng cổng của `.env` đang chạy.

---

## 12. Hướng triển khai lên môi trường thật

Đây là hướng triển khai đề xuất, không nên tuyên bố đã production nếu chưa thực hiện:

1. Chuẩn bị MySQL server và chạy schema/migration có kiểm soát.
2. Tạo tài khoản database riêng, chỉ cấp quyền cần thiết.
3. Đưa backend lên máy chủ Node.js, VPS hoặc container.
4. Khai báo biến môi trường thật; dùng JWT secret mạnh.
5. Chạy bằng process manager như PM2 hoặc container restart policy.
6. Đặt Nginx/reverse proxy phía trước và bật HTTPS.
7. Giới hạn CORS theo domain Web Admin/Mobile API hợp lệ.
8. Tách nơi lưu upload bền vững; không phụ thuộc ổ đĩa tạm của container.
9. Thiết lập backup database và file.
10. Dùng cron/scheduler gọi nghiệp vụ cảnh báo bảo trì định kỳ.
11. Ghi log, giám sát health check và cảnh báo lỗi.
12. Chạy kiểm thử trước khi migration hoặc phát hành phiên bản mới.

---

## 13. Kế hoạch kiểm thử

### 13.1. Kiểm thử xác thực/phân quyền

- Không có token → `401`.
- Token sai/hết hạn → `401`.
- Tài khoản bị khóa → `403`.
- Nhân viên gọi API Admin → `403`.
- Mật khẩu sai → `401`.

### 13.2. Kiểm thử thiết bị

- Tạo thiết bị hợp lệ → `201`.
- Trùng serial → `409`.
- Loại/vị trí không tồn tại → `400` hoặc `404` tùy API.
- Quét QR hợp lệ → trả đúng thiết bị.
- Điều chuyển về chính vị trí cũ → `409`.
- Điều chuyển hợp lệ → vừa có lịch sử, vừa đổi vị trí hiện tại.
- Import có dòng sai → preview chỉ rõ dòng/cột lỗi.

### 13.3. Kiểm thử sự cố

- Nhân viên tạo sự cố đúng thiết bị.
- Admin phân công người không phải kỹ thuật viên → bị từ chối.
- Kỹ thuật viên khác mở công việc không thuộc mình → `403`.
- Hoàn thành khi chưa bắt đầu → `409`.
- Chờ linh kiện rồi tiếp tục → đúng chuỗi trạng thái.
- Người không phải người báo xác nhận → `403`.

### 13.4. Kiểm thử bảo trì

- Tạo kế hoạch với chu kỳ không hợp lệ → `400`.
- Kỹ thuật viên chỉ xem phiếu của mình.
- Cập nhật checklist khi phiếu chưa bắt đầu → `409`.
- Hoàn thành thiếu dữ liệu bắt buộc → bị từ chối.
- Hoàn thành hợp lệ → cập nhật phiếu, thiết bị và ngày kế tiếp.
- Phiếu quá ngày dự kiến → chuyển quá hạn và sinh thông báo.

### 13.5. Kiểm thử dashboard/báo cáo

- Database rỗng vẫn trả số 0, không crash.
- Bộ lọc ngày không hợp lệ → `400`.
- Chỉ Admin được xem.
- Tổng số trên report khớp danh sách chi tiết.
- File Excel/PDF tải được và đúng bộ lọc.

---

## 14. Kịch bản demo trước thầy

Nên chuẩn bị ba tài khoản và dữ liệu mẫu trước. Không nhập quá nhiều dữ liệu trực tiếp trong lúc bảo vệ.

### 14.1. Dữ liệu demo

- 1 Admin.
- 1 nhân viên.
- 1 kỹ thuật viên.
- 2 loại thiết bị.
- 1 cây vị trí nhà máy → xưởng → dây chuyền → khu vực.
- 2 thiết bị, trong đó 1 thiết bị có QR.
- 1 mẫu checklist và 1 kế hoạch bảo trì.
- Một vài bản ghi lịch sử để dashboard có biểu đồ.

### 14.2. Demo luồng sự cố trong 5–7 phút

1. Đăng nhập nhân viên.
2. Quét QR thiết bị.
3. Tạo sự cố kèm mô tả/mức độ/ảnh.
4. Chuyển sang Admin, mở danh sách sự cố mới.
5. Phân công kỹ thuật viên.
6. Chuyển sang kỹ thuật viên, xem “công việc của tôi”.
7. Bắt đầu, cập nhật nguyên nhân và cách xử lý.
8. Hoàn thành kỹ thuật.
9. Quay lại nhân viên, xác nhận.
10. Mở timeline thiết bị hoặc dashboard để chứng minh dữ liệu liên thông.

### Lời nói trong lúc demo

> “Em đang đăng nhập với vai trò nhân viên nên chỉ có thể xem thông tin thiết bị phù hợp và báo sự cố, không thấy chức năng quản trị. Người báo được lấy từ JWT chứ không cho frontend tự truyền. Sau khi Admin phân công, chỉ đúng kỹ thuật viên đó mới thao tác được. Khi kỹ thuật viên hoàn thành, sự cố chưa đóng ngay mà chờ người báo xác nhận. Cuối cùng toàn bộ quá trình xuất hiện trong lịch sử thiết bị và báo cáo.”

### 14.3. Demo bảo trì trong 3–4 phút

1. Admin mở kế hoạch có sẵn và phân công.
2. Kỹ thuật viên mở phiếu của mình.
3. Bắt đầu phiếu.
4. Đánh dấu checklist, ghi kết quả.
5. Hoàn thành.
6. Chứng minh ngày bảo trì kế tiếp hoặc trạng thái liên quan được cập nhật.

### 14.4. Demo dashboard/báo cáo trong 2 phút

1. Mở KPI tổng quan.
2. Chỉ ra sự cố mở, sự cố nghiêm trọng, bảo trì quá hạn.
3. Drill-down từ số liệu tổng hợp xuống danh sách.
4. Lọc báo cáo theo thời gian.
5. Xuất một file Excel hoặc PDF đã chuẩn bị kiểm tra trước.

### 14.5. Phương án dự phòng

Nếu mạng, mobile hoặc UI lỗi:

- Chuẩn bị Postman collection.
- Chuẩn bị sẵn token của ba vai trò ngay trước buổi bảo vệ.
- Chuẩn bị ảnh chụp các màn hình chính.
- Có file Excel/PDF đã xuất mẫu.
- Có dữ liệu seed hoặc bản backup database.
- Không sửa code trực tiếp trong lúc demo trừ khi thầy yêu cầu.

---

## 15. Cách làm slide và trình bày với thầy

Nên trình bày 12–15 phút, khoảng 10–12 slide. Không đọc nguyên văn slide; slide chỉ chứa từ khóa, sơ đồ và ảnh.

### Slide 1 — Tên đề tài và thành viên (30 giây)

Nội dung:

- FactoryCare.
- Hệ thống quản lý sự cố và bảo trì thiết bị.
- Thành viên, giảng viên hướng dẫn.

Lời nói mẫu:

> “Nhóm em xin trình bày đề tài FactoryCare, hệ thống hỗ trợ quản lý sự cố và bảo trì thiết bị trong nhà máy. Trọng tâm của đề tài là số hóa quy trình từ lúc quản lý hồ sơ thiết bị đến báo hỏng, sửa chữa, bảo trì và báo cáo.”

### Slide 2 — Vấn đề thực tế (1 phút)

Nội dung:

- Quản lý rời rạc.
- Khó truy vết.
- Bỏ sót bảo trì.
- Thiếu số liệu tổng hợp.

Lời nói mẫu:

> “Nếu dùng giấy hoặc Excel rời rạc, thông tin nằm ở nhiều nơi. Khi máy hỏng rất khó biết ai báo, ai sửa và đã thay gì. Bảo trì định kỳ cũng dễ bị quên. Vì vậy hệ thống cần một luồng dữ liệu thống nhất quanh từng thiết bị.”

### Slide 3 — Mục tiêu và phạm vi (1 phút)

Trình bày sáu mục tiêu ở phần 3 và nhấn mạnh ngoài phạm vi.

> “Nhóm em giới hạn đề tài ở quản lý vận hành thiết bị. Thông tin nhà cung cấp, hóa đơn và linh kiện chỉ phục vụ truy vết, không mở rộng thành kế toán hay kho.”

### Slide 4 — Ba vai trò (1 phút)

Dùng bảng ba cột Admin – Kỹ thuật viên – Nhân viên.

> “Hệ thống phân vai theo đúng công việc thực tế. Nhân viên là người phát hiện và báo lỗi; Admin điều phối; kỹ thuật viên xử lý. Quyền được kiểm tra ở backend chứ không chỉ ẩn nút trên giao diện.”

### Slide 5 — Kiến trúc hệ thống (1 phút)

Dùng sơ đồ Client → Route → Middleware → Controller → Service → Model → MySQL.

> “Nhóm em chọn kiến trúc nhiều tầng. Controller tập trung HTTP, service giữ luật nghiệp vụ, model truy vấn database. Cách tách này giúp dễ bảo trì và tránh đặt SQL trực tiếp trong route.”

### Slide 6 — Thiết kế dữ liệu (1 phút)

Chỉ hiển thị các cụm bảng, không nhồi toàn bộ cột:

- người dùng;
- thiết bị/danh mục/vị trí;
- sự cố/sửa chữa;
- kế hoạch/checklist/phiếu;
- thông báo.

> “Thiết bị là thực thể trung tâm. Sự cố, điều chuyển, sửa chữa và bảo trì đều liên kết về thiết bị để tạo được lịch sử đầy đủ.”

### Slide 7 — Luồng sự cố (2 phút)

Hiển thị state flow từ `MOI` đến `DA_XU_LY`.

> “Luồng không cho đổi trạng thái tùy ý. Ví dụ chỉ sự cố đã phân công mới được bắt đầu, chỉ kỹ thuật viên được giao mới xử lý, và sau khi kỹ thuật viên hoàn thành còn phải chờ người báo xác nhận.”

### Slide 8 — Luồng bảo trì (1,5 phút)

Phân biệt mẫu, kế hoạch và phiếu; sau đó trình bày luồng thực hiện.

> “Checklist mẫu là hướng dẫn, kế hoạch là quy luật lặp, phiếu là một lần thực hiện. Tách ba phần giúp giữ nguyên lịch sử ngay cả khi mẫu checklist về sau thay đổi.”

### Slide 9 — An toàn và toàn vẹn dữ liệu (1 phút)

Nội dung:

- JWT và bcrypt.
- RBAC ở backend.
- SQL có tham số.
- Transaction.
- Kiểm tra trạng thái/ownership.

> “Ví dụ điều chuyển thiết bị phải vừa ghi lịch sử vừa đổi vị trí. Hai thao tác nằm trong một transaction; nếu một bước lỗi thì rollback để dữ liệu không bị lệch.”

### Slide 10 — Dashboard và báo cáo (1 phút)

Dùng ảnh dashboard, KPI và file export.

> “Dashboard trả lời tình hình hiện tại, còn báo cáo cho phép lọc và xem chi tiết lịch sử. Excel/PDF dùng cùng nguồn dữ liệu với báo cáo để tránh chênh lệch số liệu.”

### Slide 11 — Demo (5–10 phút tùy yêu cầu)

Demo luồng sự cố trước vì đây là luồng thể hiện đủ ba vai trò và nhiều module liên thông nhất. Sau đó mới demo bảo trì và dashboard.

### Slide 12 — Kết quả, hạn chế và hướng phát triển (1 phút)

Kết quả:

- Backend đã có các nhóm API cốt lõi.
- Quy trình có phân quyền và trạng thái.
- Dữ liệu có lịch sử và báo cáo.

Hướng phát triển:

- Push notification/realtime.
- Scheduler tự động hoàn chỉnh.
- Lưu file trên object storage có kiểm soát quyền.
- Automated test và CI/CD.
- Tích hợp IoT khi có yêu cầu thực tế.

---

## 16. Câu hỏi phản biện thường gặp và cách trả lời

### 1. Tại sao không dùng một bảng cho sự cố và sửa chữa?

`su_co` lưu vấn đề do người dùng báo; `ho_so_sua_chua` lưu công việc kỹ thuật. Một sự cố có thể cần nhiều lần can thiệp, nên tách bảng giúp lưu lịch sử đúng và không làm bản ghi sự cố quá tải.

### 2. Tại sao kế hoạch bảo trì và phiếu bảo trì phải tách?

Kế hoạch là quy tắc định kỳ; phiếu là một lần thực hiện có người làm, checklist và kết quả. Một kế hoạch có thể sinh nhiều phiếu theo thời gian.

### 3. Tại sao không cho kỹ thuật viên tự đóng sự cố?

Kỹ thuật viên xác nhận đã hoàn thành chuyên môn, nhưng người báo là người kiểm tra nhu cầu thực tế. Trạng thái `CHO_XAC_NHAN` tạo cơ chế đối soát trước khi chuyển `DA_XU_LY`.

### 4. Backend bảo vệ phân quyền như thế nào?

Token chỉ cung cấp danh tính ban đầu. Middleware đọc lại người dùng từ database, kiểm tra tài khoản còn hoạt động và lấy vai trò thật. Route khai báo vai trò được phép, service còn kiểm tra ownership của bản ghi.

### 5. Nếu hai Admin cùng phân công thì sao?

Service dùng transaction, khóa bản ghi cần cập nhật và kiểm tra trạng thái hiện tại. Request đến sau sẽ thấy trạng thái đã thay đổi và nhận lỗi xung đột `409` thay vì ghi đè âm thầm.

### 6. Nếu đang điều chuyển mà cập nhật vị trí thất bại?

Cả ghi lịch sử và cập nhật vị trí nằm trong một transaction. Khi lỗi, hệ thống rollback nên không tồn tại lịch sử giả hoặc vị trí sai.

### 7. QR lưu gì?

QR chứa mã nhận diện như `FC-<ma_thiet_bi>`, không nhúng toàn bộ dữ liệu nhạy cảm. Client gửi mã về API; backend xác thực người dùng rồi mới trả thông tin theo vai trò.

### 8. Tại sao linh kiện thay thế lưu JSON thay vì làm kho?

Phạm vi đề tài chỉ cần nhật ký linh kiện đã sử dụng khi sửa chữa/bảo trì. Nếu làm nhập-xuất-tồn sẽ biến đề tài thành quản lý kho, vượt phạm vi. Có thể chuẩn hóa thành module riêng ở phiên bản sau.

### 9. Health Score có đáng tin tuyệt đối không?

Không. Đây là chỉ số hỗ trợ ưu tiên dựa trên dữ liệu sự cố, sửa chữa và bảo trì. Quyết định kỹ thuật cuối cùng vẫn thuộc về người có chuyên môn.

### 10. Vì sao dùng REST thay vì GraphQL?

Nghiệp vụ được tổ chức theo tài nguyên rõ ràng, đội phát triển còn nhỏ và REST dễ học, dễ test bằng Postman, phù hợp phạm vi sinh viên. GraphQL chưa đem lại lợi ích đủ lớn so với độ phức tạp tăng thêm.

### 11. Vì sao dùng MySQL?

Dữ liệu có nhiều quan hệ, cần khóa ngoại, transaction và truy vấn báo cáo. MySQL phù hợp kiểu dữ liệu này và là công nghệ nhóm đã chọn trong yêu cầu dự án.

### 12. Hệ thống mở rộng thế nào?

Có thể tách lưu file sang object storage, thêm hàng đợi thông báo, scheduler, cache dashboard và scale nhiều instance backend. Trước mắt kiến trúc nhiều tầng giúp mở rộng từng phần mà không phải viết lại toàn bộ.

---

## 17. Hiện trạng và các điểm cần nói trung thực

Tài liệu này xác nhận **cấu trúc mã nguồn và route**, không thay cho biên bản kiểm thử tích hợp với database/UI. Khi bảo vệ, nên dùng cách nói “backend hiện đã triển khai route/controller/service/model cho...” nếu chưa có kết quả test end-to-end đầy đủ.

Các điểm nên hoàn thiện trước khi nộp/bảo vệ:

1. `api.md` đang ghi 92 endpoint nhưng mã nguồn hiện có 100 endpoint; cần cập nhật tài liệu API.
2. `api.md` có chỗ ghi cổng 3000, trong khi cấu hình mặc định là 3005.
3. Một số chuỗi tiếng Việt trong file nguồn đang hiển thị lỗi encoding; cần thống nhất UTF-8.
4. `src/utils/apiResponse.js` dùng `success/message/data`, trong khi phần lớn dự án dùng `thanhCong/thongBao/duLieu`; nên thống nhất hoặc bỏ utility không dùng.
5. `app.js` đang public toàn bộ `/uploads`. File hóa đơn là dữ liệu nhạy cảm, nên tách route tải file có xác thực thay vì public trực tiếp.
6. Cần chắc chắn môi trường database đã chạy cả hai migration sự cố theo đúng thứ tự.
7. Chưa có script test tự động trong `package.json`; nên bổ sung test cho các luồng quan trọng.
8. API xử lý cảnh báo bảo trì cần scheduler gọi định kỳ ở môi trường thật.
9. Xuất PDF phụ thuộc font Unicode trên máy chủ; cần kiểm tra trước khi demo/deploy.
10. Repo hiện là backend; không nên nói Web Admin/Mobile đã hoàn chỉnh nếu hai ứng dụng đó chưa được kiểm thử cùng backend.

Những điểm này không làm mất giá trị đề tài. Trình bày được hạn chế và hướng khắc phục thường cho thấy người làm hiểu hệ thống thực tế.

---

## 18. Checklist trước ngày bảo vệ

### Dữ liệu và server

- [ ] MySQL chạy và đúng database.
- [ ] Migration đã chạy.
- [ ] Backend khởi động ở đúng cổng.
- [ ] `/api/health` trả thành công.
- [ ] Có ba tài khoản đúng vai trò.
- [ ] Có dữ liệu thiết bị, QR, sự cố và bảo trì mẫu.
- [ ] Backup database trước buổi demo.

### Chức năng

- [ ] Đăng nhập cả ba vai trò.
- [ ] Kiểm tra một trường hợp `403` để chứng minh phân quyền.
- [ ] Chạy trọn luồng sự cố.
- [ ] Chạy trọn luồng bảo trì.
- [ ] Kiểm tra điều chuyển có lịch sử.
- [ ] Dashboard có số liệu.
- [ ] Excel và PDF xuất được.
- [ ] Upload ảnh/file hoạt động.

### Trình bày

- [ ] Slide ít chữ, font đủ lớn.
- [ ] Có sơ đồ kiến trúc và trạng thái.
- [ ] Tập nói trong thời gian quy định.
- [ ] Phân công người nói và người demo.
- [ ] Chuẩn bị Postman và ảnh/video dự phòng.
- [ ] Không để lộ `.env`, password, JWT secret hoặc token trên màn hình.
- [ ] Đóng ứng dụng/thông báo cá nhân trước khi chia sẻ màn hình.

---

## 19. Bài nói kết thúc 30 giây

> “Kết quả của đề tài là một backend quản lý thiết bị theo luồng xuyên suốt, từ hồ sơ, QR và vị trí đến sự cố, sửa chữa, bảo trì và báo cáo. Điểm nhóm em tập trung không chỉ là CRUD mà là bảo vệ quy trình bằng trạng thái, phân quyền, ownership và transaction. Trong hướng phát triển tiếp theo, nhóm sẽ hoàn thiện kiểm thử tự động, scheduler, bảo vệ file upload và tích hợp đầy đủ với Web Admin/Mobile.”

---

## 20. Câu ghi nhớ quan trọng khi trả lời thầy

1. **Thiết bị là trung tâm; lịch sử không phải module rời.**
2. **Sự cố là sửa chữa phản ứng; bảo trì là phòng ngừa chủ động.**
3. **Frontend chỉ hỗ trợ trải nghiệm; backend mới là nơi bắt buộc phân quyền.**
4. **Transaction bảo vệ các thay đổi nhiều bước.**
5. **Checklist mẫu không được sửa ngược lịch sử phiếu đã làm.**
6. **Không mở rộng đề tài thành ERP, kế toán hoặc kho.**
7. **Chỉ nói chức năng đã kiểm thử là “hoàn thành”; phần còn lại nói đúng là hướng triển khai.**

