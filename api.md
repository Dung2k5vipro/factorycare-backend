# Tài liệu API FactoryCare

Tài liệu này tổng hợp các API **đang được khai báo trong mã nguồn hiện tại** tại `src/routes/`.

- Base URL mặc định: `http://localhost:3000/api`
- Web Admin và ứng dụng Mobile sử dụng chung backend này.
- Tổng số endpoint hiện tại: **92**.
- Dữ liệu JSON dùng tên thuộc tính dạng camelCase như các ví dụ bên dưới.

## 1. Quy ước chung

### 1.1. Vai trò

| Ký hiệu | Giá trị trong hệ thống | Ứng dụng chính |
|---|---|---|
| Admin | `QUAN_TRI_VIEN` | Web Admin |
| Kỹ thuật viên | `KY_THUAT_VIEN` | Mobile |
| Nhân viên | `NHAN_VIEN` | Mobile |
| Tất cả | Cả ba vai trò trên | Web Admin và Mobile |

### 1.2. Xác thực

Ngoại trừ các API được ghi là **Công khai**, client phải gửi JWT trong header:

```http
Authorization: Bearer <token>
```

Backend tự lấy người dùng và vai trò từ token/cơ sở dữ liệu. Client không được tự gửi vai trò để vượt quyền.

### 1.3. Phản hồi chuẩn

Thành công:

```json
{
  "thanhCong": true,
  "thongBao": "...",
  "duLieu": {}
}
```

Thất bại:

```json
{
  "thanhCong": false,
  "thongBao": "..."
}
```

API health hiện dùng định dạng riêng gồm `success`, `message`, `data`.

### 1.4. Phân trang

Các API danh sách thường nhận:

| Query | Mặc định | Ý nghĩa |
|---|---:|---|
| `trang` | `1` | Trang hiện tại |
| `gioiHan` | `10` | Số bản ghi mỗi trang |

Một số service cũng chấp nhận bí danh `page` và `limit`. Nên thống nhất dùng `trang`, `gioiHan` ở client.

Kết quả phân trang có dạng:

```json
{
  "danhSach": [],
  "phanTrang": {
    "trang": 1,
    "gioiHan": 10,
    "tongBanGhi": 0,
    "tongTrang": 0
  }
}
```

## 2. Tổng quan endpoint theo nhóm

| STT | Nhóm | Prefix | Số API |
|---:|---|---|---:|
| 1 | Hệ thống | `/health` | 1 |
| 2 | Xác thực | `/xac-thuc` | 4 |
| 3 | Người dùng | `/nguoi-dung` | 6 |
| 4 | Loại thiết bị | `/loai-thiet-bi` | 4 |
| 5 | Vị trí | `/vi-tri` | 6 |
| 6 | Nhà cung cấp | `/nha-cung-cap` | 7 |
| 7 | Lô nhập | `/lo-nhap` | 6 |
| 8 | Thiết bị | `/thiet-bi` | 16 |
| 9 | Sự cố và sửa chữa | `/su-co` | 16 |
| 10 | Thông báo | `/thong-bao` | 3 |
| 11 | Bảo trì | `/bao-tri` | 23 |
| 12 | Dashboard | `/dashboard` | 1 |
| 13 | Báo cáo | `/bao-cao` | 5 |

---

## 3. Hệ thống

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/health` | Công khai | Kiểm tra backend đang hoạt động |

---

## 4. Xác thực

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `POST` | `/api/xac-thuc/dang-nhap` | Công khai | Đăng nhập và nhận JWT |
| `POST` | `/api/xac-thuc/khoi-tao-admin-dau-tien` | Công khai có điều kiện | Tạo Admin đầu tiên khi hệ thống chưa có tài khoản |
| `GET` | `/api/xac-thuc/toi` | Tất cả | Lấy thông tin tài khoản đang đăng nhập |
| `POST` | `/api/xac-thuc/dang-xuat` | Tất cả | Xác nhận đăng xuất phía client |

### 4.1. Đăng nhập

```http
POST /api/xac-thuc/dang-nhap
Content-Type: application/json
```

```json
{
  "email": "admin@factorycare.vn",
  "matKhau": "MatKhau123"
}
```

Kết quả `duLieu` gồm `nguoiDung` và `token`.

### 4.2. Khởi tạo Admin đầu tiên

```http
POST /api/xac-thuc/khoi-tao-admin-dau-tien
Content-Type: application/json
```

```json
{
  "hoTen": "Quản trị viên",
  "email": "admin@factorycare.vn",
  "matKhau": "MatKhau123",
  "soDienThoai": "0900000000",
  "anhDaiDien": null
}
```

API chỉ hoạt động khi bảng người dùng chưa có tài khoản. Backend tự gán vai trò `QUAN_TRI_VIEN`.

> `POST /dang-xuat` hiện không có blacklist token phía server. Mobile/Web cần xóa token đã lưu sau khi API thành công.

---

## 5. Người dùng và phân quyền

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `PATCH` | `/api/nguoi-dung/toi/mat-khau` | Tất cả | Đổi mật khẩu của chính mình |
| `GET` | `/api/nguoi-dung` | Admin | Danh sách người dùng |
| `POST` | `/api/nguoi-dung` | Admin | Tạo người dùng |
| `GET` | `/api/nguoi-dung/:id` | Admin | Chi tiết người dùng |
| `PUT` | `/api/nguoi-dung/:id` | Admin | Cập nhật người dùng |
| `PATCH` | `/api/nguoi-dung/:id/trang-thai` | Admin | Khóa hoặc mở lại tài khoản |

### Query danh sách

`trang`, `gioiHan`, `tuKhoa`, `vaiTro`, `trangThai`.

Giá trị hợp lệ:

- `vaiTro`: `QUAN_TRI_VIEN`, `KY_THUAT_VIEN`, `NHAN_VIEN`.
- `trangThai`: `HOAT_DONG`, `NGUNG_HOAT_DONG`.

### Body tạo người dùng

```json
{
  "hoTen": "Nguyễn Văn A",
  "email": "a@factorycare.vn",
  "matKhau": "MatKhau123",
  "soDienThoai": "0900000000",
  "anhDaiDien": null,
  "vaiTro": "NHAN_VIEN"
}
```

`hoTen`, `email`, `matKhau`, `vaiTro` là các trường bắt buộc.

### Body cập nhật người dùng

```json
{
  "hoTen": "Nguyễn Văn A",
  "email": "a@factorycare.vn",
  "soDienThoai": "0900000000",
  "anhDaiDien": null,
  "vaiTro": "KY_THUAT_VIEN"
}
```

### Body cập nhật trạng thái

```json
{
  "trangThai": "NGUNG_HOAT_DONG"
}
```

### Body đổi mật khẩu

```json
{
  "matKhauCu": "MatKhauCu",
  "matKhauMoi": "MatKhauMoi"
}
```

---

## 6. Loại thiết bị

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/loai-thiet-bi` | Tất cả | Danh sách loại thiết bị |
| `POST` | `/api/loai-thiet-bi` | Admin | Tạo loại thiết bị |
| `GET` | `/api/loai-thiet-bi/:id` | Tất cả | Chi tiết loại thiết bị |
| `PUT` | `/api/loai-thiet-bi/:id` | Admin | Cập nhật loại thiết bị |

### Query danh sách

`trang`, `gioiHan`, `tuKhoa`.

### Body tạo/cập nhật

```json
{
  "tenLoai": "Máy CNC",
  "moTa": "Nhóm máy gia công CNC"
}
```

`tenLoai` là bắt buộc và không được trùng.

---

## 7. Vị trí

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/vi-tri` | Tất cả | Danh sách vị trí có phân trang và bộ lọc |
| `GET` | `/api/vi-tri/cay` | Tất cả | Toàn bộ cây vị trí phân cấp |
| `POST` | `/api/vi-tri` | Admin | Tạo vị trí |
| `GET` | `/api/vi-tri/:id` | Tất cả | Chi tiết vị trí |
| `PUT` | `/api/vi-tri/:id` | Admin | Cập nhật vị trí |
| `DELETE` | `/api/vi-tri/:id` | Admin | Xóa vị trí chưa phát sinh dữ liệu |

### Query danh sách

`trang`, `gioiHan`, `tuKhoa`, `loaiViTri`, `viTriChaId`.

### Body tạo/cập nhật

```json
{
  "tenViTri": "Dây chuyền 01",
  "loaiViTri": "DAY_CHUYEN",
  "viTriChaId": 2,
  "moTa": "Dây chuyền sản xuất số 01"
}
```

Loại vị trí hiện có: `NHA_MAY`, `XUONG`, `DAY_CHUYEN`, `KHU_VUC`.

Phân cấp hợp lệ:

```text
NHA_MAY → XUONG → DAY_CHUYEN → KHU_VUC
```

`XUONG` hiện cũng có thể không có vị trí cha theo logic service hiện tại.

---

## 8. Nhà cung cấp

Tất cả API trong nhóm này chỉ dành cho Admin.

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/nha-cung-cap` | Danh sách nhà cung cấp |
| `POST` | `/api/nha-cung-cap` | Tạo nhà cung cấp |
| `GET` | `/api/nha-cung-cap/:id/lo-nhap` | Danh sách lô nhập của nhà cung cấp |
| `GET` | `/api/nha-cung-cap/:id/thiet-bi` | Danh sách thiết bị theo nhà cung cấp |
| `GET` | `/api/nha-cung-cap/:id` | Chi tiết nhà cung cấp |
| `PUT` | `/api/nha-cung-cap/:id` | Cập nhật nhà cung cấp |
| `DELETE` | `/api/nha-cung-cap/:id` | Xóa nhà cung cấp chưa phát sinh dữ liệu |

### Query

- Danh sách nhà cung cấp: `trang`, `gioiHan`, `tuKhoa`.
- Danh sách lô nhập/thiết bị liên quan: `trang`, `gioiHan`.

### Body tạo/cập nhật

```json
{
  "tenNhaCungCap": "Công ty Thiết bị ABC",
  "nguoiLienHe": "Trần Văn B",
  "soDienThoai": "0900000001",
  "email": "contact@abc.vn",
  "diaChi": "TP. Hồ Chí Minh",
  "ghiChu": "Nhà cung cấp máy CNC"
}
```

`tenNhaCungCap` là bắt buộc.

---

## 9. Lô nhập và hóa đơn

Tất cả API trong nhóm này chỉ dành cho Admin.

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/lo-nhap` | Danh sách lô nhập |
| `POST` | `/api/lo-nhap` | Tạo lô nhập, có thể tải hóa đơn |
| `GET` | `/api/lo-nhap/:id/thiet-bi` | Danh sách thiết bị của lô nhập |
| `GET` | `/api/lo-nhap/:id` | Chi tiết lô nhập |
| `PUT` | `/api/lo-nhap/:id` | Cập nhật lô nhập, có thể thay hóa đơn |
| `DELETE` | `/api/lo-nhap/:id` | Xóa lô nhập chưa có thiết bị |

### Query

- Danh sách lô nhập: `trang`, `gioiHan`, `tuKhoa`, `nhaCungCapId`.
- Danh sách thiết bị của lô: `trang`, `gioiHan`.

### Body tạo/cập nhật

API tạo và cập nhật hỗ trợ `multipart/form-data`:

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `maLo` | text | Bắt buộc, duy nhất |
| `nhaCungCapId` | number | Có thể để trống |
| `soHoaDon` | text | Có thể để trống |
| `ngayNhap` | `YYYY-MM-DD` | Mặc định là ngày hiện tại khi tạo |
| `tongGiaTri` | number | Không âm |
| `ghiChu` | text | Có thể để trống |
| `fileHoaDon` | file | PDF/JPG/JPEG/PNG/WEBP, tối đa 5 MB |

Tên trường file `tepHoaDon` cũng được chấp nhận.

Nếu không tải file, API cũng nhận JSON với các trường dữ liệu trên và có thể nhận `fileHoaDon` là đường dẫn.

---

## 10. Thiết bị

### 10.1. Tra cứu và QR dùng chung

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/thiet-bi` | Tất cả | Danh sách thiết bị; dữ liệu được giới hạn theo vai trò |
| `GET` | `/api/thiet-bi/:id` | Tất cả | Chi tiết thiết bị; dữ liệu được giới hạn theo vai trò |
| `GET` | `/api/thiet-bi/:id/qr` | Tất cả | Lấy nội dung và ảnh QR của thiết bị |
| `GET` | `/api/thiet-bi/qr/:maQr` | Tất cả | Tìm thiết bị bằng mã/nội dung QR |
| `POST` | `/api/thiet-bi/quet-qr` | Tất cả | Gửi nội dung vừa quét để tìm thiết bị |

Query danh sách: `trang`, `gioiHan`, `tuKhoa`, `loaiThietBiId`, `viTriId`, `trangThai`.

Body quét QR:

```json
{
  "noiDungQr": "FC:CNC-0001"
}
```

Có thể dùng thuộc tính `maQr` thay cho `noiDungQr`.

### 10.2. Quản trị thiết bị

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `POST` | `/api/thiet-bi` | Admin | Tạo thiết bị và tự sinh mã/QR |
| `PUT` | `/api/thiet-bi/:id` | Admin | Cập nhật hồ sơ thiết bị |
| `PATCH` | `/api/thiet-bi/:id/trang-thai` | Admin | Chuyển trạng thái thiết bị |
| `POST` | `/api/thiet-bi/:id/dieu-chuyen` | Admin | Điều chuyển thiết bị và lưu lịch sử |
| `GET` | `/api/thiet-bi/:id/lich-su-dieu-chuyen` | Admin | Lịch sử điều chuyển |
| `PATCH` | `/api/thiet-bi/:id/bao-hanh` | Admin | Cập nhật thời hạn bảo hành |
| `GET` | `/api/thiet-bi/:id/bao-hanh` | Admin | Xem thông tin bảo hành |
| `GET` | `/api/thiet-bi/:id/health-score` | Admin | Xem điểm sức khỏe thiết bị |
| `GET` | `/api/thiet-bi/:id/timeline` | Admin | Xem dòng thời gian thiết bị |

Body tạo thiết bị:

```json
{
  "tenThietBi": "Máy CNC số 01",
  "loaiThietBiId": 1,
  "viTriId": 4,
  "loNhapId": 2,
  "soSerial": "CNC-SN-0001",
  "model": "CNC-X1",
  "hangSanXuat": "ABC",
  "anhThietBi": null,
  "giaMua": 500000000,
  "ngayBatDauBaoHanh": "2026-01-01",
  "ngayHetBaoHanh": "2027-01-01",
  "trangThai": "DANG_HOAT_DONG",
  "moTa": "Máy gia công tại dây chuyền 01"
}
```

`tenThietBi`, `loaiThietBiId`, `trangThai` là bắt buộc. `viTriId` và `loNhapId` có thể là `null`.

Khi cập nhật bằng `PUT`, không được sửa trực tiếp `maThietBi`, `maQr`, `trangThai`, `viTriId`. Hãy dùng API trạng thái hoặc điều chuyển tương ứng.

Body cập nhật trạng thái:

```json
{
  "trangThai": "DANG_BAO_TRI"
}
```

Trạng thái hiện có: `DANG_HOAT_DONG`, `DANG_BAO_TRI`, `DANG_HONG`, `NGUNG_HOAT_DONG`, `THANH_LY`.

Body điều chuyển:

```json
{
  "viTriMoiId": 5,
  "lyDo": "Điều chuyển sang dây chuyền mới",
  "ghiChu": "Đã bàn giao"
}
```

Query lịch sử điều chuyển: `trang`, `gioiHan`.

Body cập nhật bảo hành:

```json
{
  "ngayBatDauBaoHanh": "2026-01-01",
  "ngayHetBaoHanh": "2027-01-01"
}
```

Query timeline:

| Query | Định dạng | Ý nghĩa |
|---|---|---|
| `tuNgay` | `YYYY-MM-DD` | Lọc từ ngày |
| `denNgay` | `YYYY-MM-DD` | Lọc đến hết ngày |
| `loaiSuKien` | Danh sách cách nhau bằng dấu phẩy | Lọc loại sự kiện timeline |

### 10.3. Import thiết bị

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `POST` | `/api/thiet-bi/import/preview` | Admin | Kiểm tra và xem trước file import |
| `POST` | `/api/thiet-bi/import` | Admin | Import hàng loạt thiết bị |

Với file, gửi `multipart/form-data`:

| Trường | Kiểu | Quy định |
|---|---|---|
| `tep` | file | `.xlsx` hoặc `.csv`, tối đa 5 MB và 500 dòng |

Các cột được nhận diện gồm:

`tenThietBi`, `loaiThietBiId` hoặc `tenLoai`, `soSerial`, `model`, `hangSanXuat`, `viTriId` hoặc `tenViTri`, `loNhapId` hoặc `maLo`, `trangThai`, `anhThietBi`, `giaMua`, `ngayBatDauBaoHanh`, `ngayHetBaoHanh`, `moTa`.

API import chính thức cũng có thể nhận JSON từ kết quả preview:

```json
{
  "danhSachDongHopLe": [
    {
      "dong": 2,
      "duLieu": {
        "tenThietBi": "Máy CNC số 01",
        "loaiThietBiId": 1,
        "trangThai": "DANG_HOAT_DONG"
      }
    }
  ]
}
```

---

## 11. Sự cố và sửa chữa

### 11.1. Nhân viên báo sự cố

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `POST` | `/api/su-co` | Nhân viên | Báo sự cố mới |
| `GET` | `/api/su-co/cua-toi` | Nhân viên | Danh sách sự cố do chính mình báo |
| `GET` | `/api/su-co/cua-toi/:id` | Nhân viên | Chi tiết sự cố do chính mình báo |

Body báo sự cố:

```json
{
  "thietBiId": 1,
  "tieuDe": "Máy phát ra tiếng động lạ",
  "moTa": "Tiếng động xuất hiện khi máy chạy tốc độ cao",
  "mucDo": "CAO",
  "thoiGianXayRa": "2026-09-16T08:30:00+07:00",
  "hinhAnh": [
    "/uploads/su_co/anh-01.jpg"
  ]
}
```

`thietBiId`, `tieuDe`, `moTa`, `mucDo` là bắt buộc. Có thể gửi JSON với `hinhAnh` là mảng đường dẫn đã có, hoặc gửi `multipart/form-data`; mỗi file ảnh dùng field `hinhAnh`. Hỗ trợ JPG/PNG/WEBP, tối đa 3 ảnh và 5 MB mỗi ảnh. Client không tự đặt header `Content-Type` khi gửi `FormData` để runtime tạo đúng boundary.

Mức độ: `THAP`, `TRUNG_BINH`, `CAO`, `NGHIEM_TRONG`.

### 11.2. Admin tiếp nhận và phân công

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/su-co` | Admin | Danh sách toàn bộ sự cố |
| `GET` | `/api/su-co/:id` | Admin | Chi tiết sự cố và hồ sơ sửa chữa |
| `GET` | `/api/su-co/ky-thuat-vien` | Admin | Danh sách kỹ thuật viên đang hoạt động |
| `POST` | `/api/su-co/:id/phan-cong` | Admin | Phân công hoặc phân công lại kỹ thuật viên |

Body phân công:

```json
{
  "kyThuatVienId": 3
}
```

Chỉ sự cố `MOI` hoặc `DA_PHAN_CONG` được phép phân công.

### 11.3. Kỹ thuật viên xử lý

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/su-co/cong-viec-cua-toi` | Kỹ thuật viên | Danh sách sự cố được phân công cho mình |
| `GET` | `/api/su-co/cong-viec-cua-toi/:id` | Kỹ thuật viên | Chi tiết công việc của mình |
| `PATCH` | `/api/su-co/:id/nhan-cong-viec` | Kỹ thuật viên | Nhận sự cố khẩn cấp chưa có người nhận |
| `PATCH` | `/api/su-co/:id/bat-dau-xu-ly` | Kỹ thuật viên | Bắt đầu xử lý sự cố |
| `PATCH` | `/api/su-co/:id/sua-chua` | Kỹ thuật viên | Lưu/cập nhật hồ sơ sửa chữa đang xử lý |
| `PATCH` | `/api/su-co/:id/cho-linh-kien` | Kỹ thuật viên | Chuyển công việc sang chờ linh kiện |
| `PATCH` | `/api/su-co/:id/tiep-tuc-xu-ly` | Kỹ thuật viên | Tiếp tục công việc đang chờ linh kiện |
| `GET` | `/api/su-co/:id/ho-so-sua-chua` | Kỹ thuật viên | Xem hồ sơ sửa chữa của mình trong sự cố |
| `POST` | `/api/su-co/:id/hoan-thanh` | Kỹ thuật viên | Hoàn thành sửa chữa |

Body lưu hoặc hoàn thành sửa chữa:

```json
{
  "nguyenNhan": "Vòng bi bị mòn",
  "cachXuLy": "Thay vòng bi và cân chỉnh lại trục",
  "linhKienThayThe": [
    {
      "tenLinhKien": "Vòng bi 6204",
      "soLuong": 1,
      "donVi": "cái",
      "ghiChu": null
    }
  ],
  "ketQua": "DA_SUA_XONG",
  "ghiChu": "Máy đã chạy thử ổn định",
  "hinhAnhSuaChua": ["/uploads/su_co/anh-sau-sua.jpg"]
}
```

Hai API `sua-chua` và `hoan-thanh` cũng nhận `multipart/form-data`. Các trường mảng gửi dưới dạng JSON string; file ảnh dùng field `hinhAnhSuaChua`, tối đa 3 file mỗi request.

Body chờ linh kiện:

```json
{
  "lyDo": "Thiếu vòng bi 6205",
  "ghiChu": "Đã báo bộ phận phụ trách chuẩn bị"
}
```

Kết quả sửa chữa: `DA_SUA_XONG`, `SUA_MOT_PHAN`, `KHONG_SUA_DUOC`.

Khi gọi API hoàn thành, hồ sơ sau khi gộp với dữ liệu đã lưu phải có `nguyenNhan`, `cachXuLy`, `ketQua`.

### 11.4. Bộ lọc danh sách sự cố

Các API danh sách sự cố của Admin, Nhân viên và Kỹ thuật viên dùng chung nhóm query sau:

| Query | Giá trị |
|---|---|
| `trang`, `gioiHan` | Phân trang |
| `tuKhoa` | Tìm theo nội dung liên quan |
| `mucDo` | `THAP`, `TRUNG_BINH`, `CAO`, `NGHIEM_TRONG` |
| `trangThai` | `MOI`, `DA_PHAN_CONG`, `DANG_XU_LY`, `CHO_LINH_KIEN`, `DA_XU_LY`, `DA_HUY` |
| `thietBiId` | Lọc theo thiết bị |
| `kyThuatVienId` | Lọc theo kỹ thuật viên; phạm vi vẫn bị giới hạn theo endpoint/quyền |
| `tuNgay`, `denNgay` | `YYYY-MM-DD` |

Danh sách kỹ thuật viên nhận `trang`, `gioiHan`, `tuKhoa`.

---

## 12. Thông báo

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/thong-bao` | Người dùng đã đăng nhập | Danh sách thông báo của chính người dùng |
| `PATCH` | `/api/thong-bao/:id/da-doc` | Chủ thông báo | Đánh dấu một thông báo đã đọc |
| `PATCH` | `/api/thong-bao/da-doc-tat-ca` | Người dùng đã đăng nhập | Đánh dấu toàn bộ thông báo đã đọc |
| `DELETE` | `/api/thong-bao/:id` | Chủ thông báo | Xóa một thông báo đã đọc |

API danh sách nhận `trang`, `gioiHan` và trả thêm `tongChuaDoc`. Thông báo sự cố nghiêm trọng có `loaiThongBao = SU_CO`; `doiTuongLienQuanId` là ID sự cố để ứng dụng mở đúng chi tiết công việc.

---

## 13. Bảo trì

Tất cả endpoint trong nhóm này yêu cầu đăng nhập. Quyền cụ thể được ghi trong từng bảng.

### 13.1. Kế hoạch và phân công bảo trì

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/bao-tri/ke-hoach` | Admin | Danh sách kế hoạch bảo trì |
| `POST` | `/api/bao-tri/ke-hoach` | Admin | Tạo kế hoạch bảo trì |
| `GET` | `/api/bao-tri/ke-hoach/cua-toi` | Kỹ thuật viên | Danh sách kế hoạch được phân công cho mình |
| `GET` | `/api/bao-tri/ke-hoach/:id/lich-su-phan-cong` | Admin | Lịch sử các phiếu phát sinh/phân công của kế hoạch |
| `POST` | `/api/bao-tri/ke-hoach/:id/phan-cong` | Admin | Phân công kỹ thuật viên và tạo/cập nhật phiếu bảo trì |
| `GET` | `/api/bao-tri/ke-hoach/:id` | Admin | Chi tiết kế hoạch bảo trì |
| `PUT` | `/api/bao-tri/ke-hoach/:id` | Admin | Cập nhật kế hoạch bảo trì |
| `DELETE` | `/api/bao-tri/ke-hoach/:id` | Admin | Ngừng hoạt động kế hoạch; không xóa lịch sử |

Query danh sách kế hoạch: `trang`, `gioiHan`, `trangThai`, `thietBiId`, `kyThuatVienId`.

Trạng thái kế hoạch: `HOAT_DONG`, `NGUNG_HOAT_DONG`. Đơn vị chu kỳ: `NGAY`, `TUAN`, `THANG`, `NAM`.

Body tạo kế hoạch:

```json
{
  "thietBiId": 1,
  "mauChecklistId": 2,
  "kyThuatVienId": 3,
  "giaTriChuKy": 1,
  "donViChuKy": "THANG",
  "ngayBatDau": "2026-10-01",
  "moTa": "Bảo trì định kỳ hằng tháng"
}
```

`kyThuatVienId` có thể là `null`. Khi cập nhật, chỉ cần gửi các trường muốn thay đổi.

Body phân công:

```json
{
  "kyThuatVienId": 3
}
```

### 13.2. Mẫu checklist

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/bao-tri/checklist` | Admin | Danh sách mẫu checklist |
| `POST` | `/api/bao-tri/checklist` | Admin | Tạo mẫu checklist |
| `GET` | `/api/bao-tri/checklist/:id` | Admin | Chi tiết mẫu checklist |
| `PUT` | `/api/bao-tri/checklist/:id` | Admin | Cập nhật mẫu checklist |
| `DELETE` | `/api/bao-tri/checklist/:id` | Admin | Ngừng hoạt động mẫu checklist |

Query danh sách: `trang`, `gioiHan`, `trangThai`, `loaiThietBiId`. Trạng thái gồm `HOAT_DONG`, `NGUNG_HOAT_DONG`.

Body tạo/cập nhật:

```json
{
  "tenMau": "Checklist bảo trì máy CNC",
  "loaiThietBiId": 1,
  "danhSachHangMuc": [
    {
      "noiDung": "Kiểm tra mức dầu bôi trơn"
    }
  ],
  "moTa": "Checklist kiểm tra định kỳ"
}
```

### 13.3. Phiếu và thực hiện bảo trì

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/bao-tri/phieu/cua-toi` | Kỹ thuật viên | Danh sách phiếu được giao cho mình |
| `GET` | `/api/bao-tri/phieu` | Admin | Danh sách toàn bộ phiếu bảo trì |
| `GET` | `/api/bao-tri/phieu/:id` | Admin, Kỹ thuật viên được giao | Chi tiết phiếu bảo trì |
| `POST` | `/api/bao-tri/phieu/:id/bat-dau` | Kỹ thuật viên được giao | Bắt đầu thực hiện bảo trì |
| `PUT` | `/api/bao-tri/phieu/:id/checklist` | Kỹ thuật viên được giao | Lưu kết quả checklist |
| `PUT` | `/api/bao-tri/phieu/:id/ket-qua` | Kỹ thuật viên được giao | Lưu kết quả và linh kiện thay thế |
| `POST` | `/api/bao-tri/phieu/:id/hoan-thanh` | Kỹ thuật viên được giao | Hoàn thành phiếu bảo trì |

Các API danh sách phiếu nhận `trang`, `gioiHan` và các bộ lọc được hỗ trợ như `trangThai`, `thietBiId`, `kyThuatVienId`, `tuNgay`, `denNgay`. Trạng thái phiếu: `CHO_THUC_HIEN`, `DANG_THUC_HIEN`, `HOAN_THANH`, `QUA_HAN`, `DA_HUY`.

Body cập nhật checklist:

```json
{
  "ketQuaChecklist": [
    {
      "noiDung": "Kiểm tra mức dầu bôi trơn",
      "loai": "CHECKLIST",
      "trangThai": "TOT",
      "ghiChu": "Mức dầu bình thường"
    }
  ]
}
```

Body cập nhật kết quả:

```json
{
  "linhKienThayThe": [
    {
      "ten": "Lọc dầu",
      "soLuong": 1
    }
  ],
  "ketQuaBaoTri": "Đã vệ sinh và chạy thử ổn định",
  "ghiChu": "Theo dõi lại sau 7 ngày"
}
```

API hoàn thành có thể nhận đồng thời `ketQuaChecklist`, `linhKienThayThe`, `ketQuaBaoTri`, `ghiChu` và `trangThaiThietBi`. Nếu không gửi `trangThaiThietBi`, backend tự chọn `DANG_HOAT_DONG` hoặc `DANG_HONG` dựa trên checklist.

### 13.4. Cảnh báo bảo trì

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/bao-tri/sap-den-han` | Admin, Kỹ thuật viên | Danh sách bảo trì sắp đến hạn |
| `GET` | `/api/bao-tri/qua-han` | Admin, Kỹ thuật viên | Danh sách bảo trì quá hạn |
| `POST` | `/api/bao-tri/canh-bao/xu-ly` | Admin | Cập nhật phiếu quá hạn và tạo thông báo cảnh báo |

Kỹ thuật viên chỉ nhận dữ liệu thuộc phạm vi được phân công. API sắp đến hạn nhận query `soNgay` từ 0 đến 90, mặc định 7. API xử lý cảnh báo nhận body tùy chọn `{ "soNgay": 7 }` với cùng giới hạn.

---

## 14. Dashboard

| Method | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| `GET` | `/api/dashboard/tong-quan` | Admin | Lấy toàn bộ số liệu tổng quan Dashboard |

Query hỗ trợ:

| Query | Giá trị |
|---|---|
| `khoangThoiGian` | `7_NGAY`, `30_NGAY`, `THANG_NAY`, `TUY_CHINH`; mặc định `30_NGAY` |
| `tuNgay`, `denNgay` | Bắt buộc với `TUY_CHINH`, định dạng `YYYY-MM-DD` |
| `soNgayCanhBao` | Số nguyên từ 1 đến 90; mặc định 7 |
| `gioiHanTop` | Số nguyên từ 1 đến 20; mặc định 5 |

Kết quả gồm tổng quan thiết bị, sự cố, thời gian xử lý trung bình, bảo trì, các nhóm thống kê, top thiết bị nhiều sự cố và danh sách cần chú ý.

---

## 15. Báo cáo và xuất file

Tất cả API báo cáo chỉ dành cho Admin.

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/bao-cao/su-co` | Báo cáo sự cố |
| `GET` | `/api/bao-cao/sua-chua` | Báo cáo sửa chữa |
| `GET` | `/api/bao-cao/bao-tri` | Báo cáo bảo trì |
| `GET` | `/api/bao-cao/thiet-bi` | Báo cáo thiết bị hiện tại |
| `GET` | `/api/bao-cao/:loai/export` | Tải báo cáo Excel hoặc PDF |

`:loai` nhận `su-co`, `sua-chua`, `bao-tri`, `thiet-bi`.

Query chung: `trang`, `gioiHan`, `tuNgay`, `denNgay`, `thietBiId`, `loaiThietBiId`, `viTriId`, `kyThuatVienId`, `sapXepTheo`, `thuTu`. `thuTu` nhận `ASC` hoặc `DESC`.

Bộ lọc riêng:

- Sự cố: `mucDo`, `trangThai`.
- Sửa chữa: `ketQua` (`DA_SUA_XONG`, `SUA_MOT_PHAN`, `KHONG_SUA_DUOC`).
- Bảo trì: `trangThai` của phiếu bảo trì.
- Thiết bị: `trangThai`; không hỗ trợ `tuNgay`, `denNgay` hoặc `kyThuatVienId` vì đây là snapshot hiện tại.

Cột `sapXepTheo` hợp lệ:

- Sự cố: `thoiGianBao`, `maSuCo`, `mucDo`, `trangThai`.
- Sửa chữa: `ngayTao`, `thoiGianHoanThanh`, `ketQua`.
- Bảo trì: `ngayDuKien`, `thoiGianHoanThanh`, `trangThai`.
- Thiết bị: `maThietBi`, `tenThietBi`, `trangThai`, `ngayTao`.

Ví dụ xuất file:

```http
GET /api/bao-cao/su-co/export?dinhDang=excel&tuNgay=2026-09-01&denNgay=2026-09-30
```

`dinhDang` nhận `excel`, `xlsx` hoặc `pdf`, mặc định là `excel`. File xuất tối đa 5.000 bản ghi; cần thu hẹp bộ lọc nếu vượt giới hạn.

---

## 16. Luồng gọi API theo ứng dụng

### Web Admin

```text
Đăng nhập
→ quản lý người dùng
→ loại thiết bị/vị trí/nhà cung cấp/lô nhập
→ quản lý thiết bị
→ xem sự cố và phân công kỹ thuật viên
→ quản lý bảo trì
→ xem dashboard, báo cáo và xuất file
```

### Mobile Nhân viên

```text
Đăng nhập
→ quét QR hoặc tra cứu thiết bị
→ báo sự cố
→ theo dõi sự cố của tôi
```

### Mobile Kỹ thuật viên

```text
Đăng nhập
→ xem công việc của tôi
→ bắt đầu xử lý
→ cập nhật hồ sơ sửa chữa
→ hoàn thành sửa chữa
→ xem và thực hiện phiếu bảo trì được giao
```

## 17. HTTP status thường gặp

| Mã | Ý nghĩa |
|---:|---|
| `200` | Lấy/cập nhật dữ liệu thành công |
| `201` | Tạo mới/import thành công |
| `400` | Body, query hoặc dữ liệu tải lên không hợp lệ |
| `401` | Chưa đăng nhập, token sai/hết hạn hoặc sai thông tin đăng nhập |
| `403` | Đã đăng nhập nhưng không có quyền hoặc tài khoản bị khóa |
| `404` | Không tìm thấy tài nguyên/API |
| `409` | Trùng dữ liệu hoặc xung đột trạng thái nghiệp vụ |
| `500` | Lỗi server/cơ sở dữ liệu |

## 17. Nhóm chưa có route trong mã nguồn

Tại thời điểm cập nhật tài liệu, `src/routes/index.js` chưa đăng ký API riêng cho **thông báo**. Model thông báo đã tồn tại và đang được các luồng nghiệp vụ nội bộ sử dụng, nhưng chưa có endpoint để client lấy danh sách hoặc đánh dấu đã đọc.
