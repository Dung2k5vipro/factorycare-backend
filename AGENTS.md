# FactoryCare — Agent Context & Coding Instructions

> Canonical context file for coding agents working on the FactoryCare project.
> Read this file before modifying code.
> Language for explanations to the project owner: Vietnamese.

---

## 1. Project identity

**Project name:** FactoryCare  
**Vietnamese name:** Hệ thống quản lý sự cố & bảo trì thiết bị trong nhà máy.

FactoryCare is a student software project focused on digitizing the operational lifecycle of factory equipment:

- user authentication and role-based access
- equipment registration and QR identification
- equipment location and transfer tracking
- incident reporting
- incident assignment and repair workflow
- preventive maintenance
- maintenance checklist
- notifications
- dashboard and reports

### Scope boundary

This project is **NOT** intended to become:

- ERP
- accounting software
- purchasing management
- full warehouse/inventory management
- HR management

Supplier, invoice/document, warranty, and replacement-part information only exist to support equipment traceability, repair, and maintenance.

---

## 2. Technology stack

The project is split into separate applications/repos.

### Backend

- Node.js
- Express.js
- MySQL 8+
- JWT authentication
- REST API

### Mobile

- React Native

Main users:

- Nhân viên (`NHAN_VIEN`)
- Kỹ thuật viên (`KY_THUAT_VIEN`)

### Web Admin

- Next.js

Main users:

- Quản trị viên / quản lý (`QUAN_TRI_VIEN`)

### Database

Current database name in the SQL design:

```sql
QLSCvaBaoTri
```

Database engine:

```text
MySQL 8.0+
InnoDB
utf8mb4
```

---

## 3. Current development status

The backend is being developed module-by-module.

### Already completed

- JWT utility/authentication foundation has been implemented by the project owner.

Do **not** recreate JWT from scratch unless explicitly asked.

### Current learning/development approach

The owner is coding manually while learning.

When helping with backend code:

1. Explain what the file/function is for.
2. Explain where it belongs in the request flow.
3. Then provide the **complete code for that file**.
4. Explain the important parts of the code.
5. Explain how the file connects to the next layer.
6. Continue to the next file only after the current file is complete.

Do not provide half-finished files unless explicitly requested.

---

## 4. Coding conventions

### Naming

Project-specific preference:

- Function names: **Vietnamese without diacritics**.
- Variable names may also use Vietnamese without diacritics when reasonable.
- Database names follow the existing Vietnamese schema.

Examples:

```js
timNguoiDungTheoEmail()
layNguoiDungTheoId()
taoNguoiDung()
capNhatNguoiDung()
khoaNguoiDung()
kiemTraMatKhau()
```

Avoid mixing random English and Vietnamese names inside the same business layer.

Framework-standard names may remain English when appropriate:

```js
req
res
next
middleware
router
controller
service
model
```

### JavaScript style

Prefer:

- `async/await`
- small functions with one responsibility
- early validation
- explicit error handling
- parameterized SQL queries
- centralized error handling where the project structure supports it

Never concatenate raw user input into SQL.

Bad:

```js
const sql = `SELECT * FROM nguoi_dung WHERE email = '${email}'`;
```

Good:

```js
const sql = `SELECT * FROM nguoi_dung WHERE email = ?`;
const [rows] = await db.execute(sql, [email]);
```

### Responses

Keep API responses consistent.

Recommended shape:

```json
{
  "thanhCong": true,
  "thongBao": "...",
  "duLieu": {}
}
```

For errors:

```json
{
  "thanhCong": false,
  "thongBao": "..."
}
```

Do not introduce a different response format in every controller.

---

## 5. Preferred backend architecture

Use a clear layered structure.

Recommended backend structure:

```text
src/
├── config/
│   └── database.js
│
├── controllers/
│   ├── nguoi_dung.controller.js
│   ├── thiet_bi.controller.js
│   ├── su_co.controller.js
│   └── bao_tri.controller.js
│
├── middlewares/
│   ├── xac_thuc.middleware.js
│   ├── phan_quyen.middleware.js
│   └── xu_ly_loi.middleware.js
│
├── models/
│   ├── nguoi_dung.model.js
│   ├── loai_thiet_bi.model.js
│   ├── vi_tri.model.js
│   ├── nha_cung_cap.model.js
│   ├── lo_nhap.model.js
│   ├── thiet_bi.model.js
│   ├── dieu_chuyen_thiet_bi.model.js
│   ├── su_co.model.js
│   ├── ho_so_sua_chua.model.js
│   ├── mau_checklist.model.js
│   ├── ke_hoach_bao_tri.model.js
│   ├── phieu_bao_tri.model.js
│   └── thong_bao.model.js
│
├── routes/
│   ├── nguoi_dung.route.js
│   ├── thiet_bi.route.js
│   ├── su_co.route.js
│   └── bao_tri.route.js
│
├── services/
│   └── ...
│
├── utils/
│   ├── jwt.js
│   └── ...
│
├── app.js
└── server.js
```

If the existing repository already has a different but coherent structure, **follow the repository instead of forcibly restructuring it**.

---

## 6. Five business modules

The business specification groups the system into five high-level modules.

### Module 1 — Người dùng & Phân quyền

Main responsibilities:

- đăng nhập / đăng xuất
- quản lý tài khoản
- role-based authorization
- lock/unlock accounts
- user profile

Roles:

```text
NHAN_VIEN
KY_THUAT_VIEN
QUAN_TRI_VIEN
```

Business rules:

- locked/inactive users cannot log in
- password must never be stored as plain text
- authorization must be enforced by the backend, not only hidden in the UI
- historical users should normally be disabled rather than hard deleted

---

### Module 2 — Quản lý thiết bị

This is the central equipment module.

Responsibilities include:

- loại thiết bị
- hồ sơ thiết bị
- QR
- import hàng loạt
- vị trí
- điều chuyển
- nhà cung cấp
- lô nhập / hóa đơn
- bảo hành
- lifecycle status
- equipment history / timeline

Important idea:

**Lịch sử thiết bị is not a separate top-level module.**

It belongs inside the equipment profile.

Typical flow:

```text
Admin tạo/nhập thiết bị
→ gán loại
→ sinh mã
→ tạo QR
→ gán vị trí
→ vận hành
→ sự cố/bảo trì/điều chuyển
→ cập nhật lịch sử thiết bị
```

---

### Module 3 — Sự cố & Sửa chữa

End-to-end flow:

```text
Nhân viên báo sự cố
→ hệ thống ghi nhận
→ Admin tiếp nhận/phân công
→ Kỹ thuật viên nhận việc
→ bắt đầu xử lý
→ ghi nguyên nhân
→ ghi phương án
→ ghi linh kiện thay thế
→ hoàn thành
→ cập nhật trạng thái thiết bị
→ lưu lịch sử
→ thông báo
```

Important principles:

- incident must always belong to a device
- reporter must be traceable
- technician can be NULL before assignment
- do not delete historical incidents
- repair result must remain traceable

Emergency incidents should receive higher priority.

---

### Module 4 — Quản lý bảo trì

Main responsibilities:

- kế hoạch bảo trì
- chu kỳ bảo trì
- phiếu/task bảo trì
- phân công kỹ thuật viên
- checklist
- thực hiện bảo trì
- ghi kết quả
- cảnh báo quá hạn
- tính lần bảo trì tiếp theo

Typical flow:

```text
Tạo kế hoạch
→ sinh/đến hạn phiếu bảo trì
→ phân công kỹ thuật viên
→ kỹ thuật viên bắt đầu
→ thực hiện checklist
→ ghi kết quả
→ hoàn thành
→ tính ngày bảo trì tiếp theo
```

Checklist template must not rewrite historical maintenance results.

---

### Module 5 — Dashboard & Báo cáo

Web Admin only.

Main data:

- tổng số thiết bị
- thiết bị theo trạng thái
- sự cố đang mở
- sự cố nghiêm trọng
- bảo trì sắp đến hạn
- bảo trì quá hạn
- thời gian xử lý
- top thiết bị có nhiều sự cố
- báo cáo theo thời gian/khu vực/loại thiết bị

Export PDF/Excel is an extension of reporting, not an independent module.

---

## 7. Current database schema — source of truth for backend code

Unless the task explicitly requests a migration, backend code must match the **current database schema**.

### Table 1 — `nguoi_dung`

Important fields:

```text
id
ho_ten
email
mat_khau
so_dien_thoai
anh_dai_dien
vai_tro
trang_thai
ngay_tao
ngay_cap_nhat
```

Enums:

```text
vai_tro:
- QUAN_TRI_VIEN
- KY_THUAT_VIEN
- NHAN_VIEN

trang_thai:
- HOAT_DONG
- NGUNG_HOAT_DONG
```

`email` is unique.

---

### Table 2 — `loai_thiet_bi`

```text
id
ten_loai
mo_ta
ngay_tao
ngay_cap_nhat
```

`ten_loai` is unique.

---

### Table 3 — `vi_tri`

Hierarchical/self-referencing location table.

```text
id
ten_vi_tri
loai_vi_tri
vi_tri_cha_id
mo_ta
ngay_tao
ngay_cap_nhat
```

Current enums:

```text
NHA_MAY
XUONG
DAY_CHUYEN
KHU_VUC
```

`vi_tri_cha_id` references `vi_tri.id`.

---

### Table 4 — `nha_cung_cap`

```text
id
ten_nha_cung_cap
nguoi_lien_he
so_dien_thoai
email
dia_chi
ghi_chu
ngay_tao
ngay_cap_nhat
```

---

### Table 5 — `lo_nhap`

Purpose:

- group imported equipment
- store invoice/source traceability
- connect supplier and devices

Fields:

```text
id
ma_lo
nha_cung_cap_id
so_hoa_don
file_hoa_don
ngay_nhap
tong_gia_tri
ghi_chu
ngay_tao
ngay_cap_nhat
```

`ma_lo` is unique.

---

### Table 6 — `thiet_bi`

Central equipment table.

Important fields:

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

Current status enum:

```text
DANG_HOAT_DONG
DANG_BAO_TRI
DANG_HONG
NGUNG_HOAT_DONG
THANH_LY
```

Unique:

```text
ma_thiet_bi
so_serial
ma_qr
```

`lo_nhap_id` may be NULL.

---

### Table 7 — `dieu_chuyen_thiet_bi`

Stores device movement history.

```text
id
thiet_bi_id
vi_tri_cu_id
vi_tri_moi_id
nguoi_thuc_hien_id
ly_do
ghi_chu
ngay_dieu_chuyen
ngay_tao
```

A device transfer should normally be handled as one transaction:

```text
insert movement history
+
update thiet_bi.vi_tri_id
```

Never silently update the current location without considering transfer history when the change represents a real physical movement.

---

### Table 8 — `su_co`

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

Current severity enum:

```text
THAP
TRUNG_BINH
CAO
NGHIEM_TRONG
```

Current status enum:

```text
MOI
DA_PHAN_CONG
DANG_XU_LY
DA_XU_LY
DA_HUY
```

`ky_thuat_vien_id` may be NULL before assignment.

`hinh_anh` is JSON.

---

### Table 9 — `ho_so_sua_chua`

A single incident may have multiple repair records.

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
ngay_tao
ngay_cap_nhat
```

`linh_kien_thay_the` is JSON.

Result enum:

```text
DA_SUA_XONG
SUA_MOT_PHAN
KHONG_SUA_DUOC
```

This is only a usage log for replacement parts. It is **not inventory management**.

---

### Table 10 — `mau_checklist`

Reusable maintenance checklist template.

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

`danh_sach_hang_muc` is JSON.

Current status:

```text
HOAT_DONG
NGUNG_HOAT_DONG
```

---

### Table 11 — `ke_hoach_bao_tri`

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

Cycle units:

```text
NGAY
TUAN
THANG
NAM
```

---

### Table 12 — `phieu_bao_tri`

One real maintenance execution/task.

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

Current status enum:

```text
CHO_THUC_HIEN
DANG_THUC_HIEN
HOAN_THANH
QUA_HAN
DA_HUY
```

`ket_qua_checklist` is JSON.

It may contain both:

- original checklist items
- extra issues discovered by the technician

---

### Table 13 — `thong_bao`

```text
id
nguoi_dung_id
tieu_de
noi_dung
loai_thong_bao
doi_tuong_lien_quan_id
da_doc
ngay_tao
ngay_doc
```

Types:

```text
SU_CO
PHAN_CONG
BAO_TRI
HE_THONG
```

`doi_tuong_lien_quan_id` intentionally has no foreign key because it may refer to different entity types.

---

## 8. Important known discrepancies

The business analysis describes the desired system, while the current SQL file represents the database that actually exists.

Do **not** silently merge them.

### 8.1 Device code prefix

Business requirement:

```text
CNC-0001
NHIET-0001
...
```

The business document expects a prefix/sequence per equipment type.

However, the current `loai_thiet_bi` table does **not** contain a `prefix` or sequence column.

Therefore:

- do not write backend SQL against `loai_thiet_bi.prefix`
- do not invent the column in model code
- if automatic prefix generation is being implemented, first propose a database migration or clarify the chosen design

---

### 8.2 Location hierarchy

Business design wants:

```text
Xưởng
→ Dây chuyền
→ Ô máy
```

Current database uses:

```text
NHA_MAY
XUONG
DAY_CHUYEN
KHU_VUC
```

There is currently no enum value named `O_MAY`.

Therefore use the schema as-is unless a migration is explicitly approved.

---

### 8.3 Device statuses

The business design contains a richer lifecycle, such as:

```text
Chưa đưa vào sử dụng
Đang hoạt động
Đang có sự cố
Đang sửa chữa
Đang bảo trì
Tạm ngừng sử dụng
Ngừng hoạt động
Chờ thanh lý
Đã thanh lý
```

The current database only contains:

```text
DANG_HOAT_DONG
DANG_BAO_TRI
DANG_HONG
NGUNG_HOAT_DONG
THANH_LY
```

Backend implementation must currently use the database enum unless the schema is deliberately migrated.

---

### 8.4 Incident workflow statuses

Desired business workflow is richer:

```text
Mới
→ Đã tiếp nhận
→ Đã phân công
→ Đang xử lý
↔ Chờ linh kiện
→ Hoàn thành
```

Current `su_co.trang_thai` only has:

```text
MOI
DA_PHAN_CONG
DANG_XU_LY
DA_XU_LY
DA_HUY
```

Do not use nonexistent states such as:

```text
DA_TIEP_NHAN
CHO_LINH_KIEN
HOAN_THANH
```

unless the database is migrated.

---

## 9. Business rules the backend must protect

Frontend validation is not enough.

### Authentication

- validate JWT on protected APIs
- never trust role sent from frontend
- role must come from authenticated user/token/database as appropriate

### Authorization

Examples:

`NHAN_VIEN`

- view permitted device information
- report incident
- view their own incident progress

`KY_THUAT_VIEN`

- view assigned work
- process repairs
- perform maintenance
- record cause, solution, parts, result

`QUAN_TRI_VIEN`

- manage users
- manage equipment
- assign technicians
- manage maintenance plans
- view reports

Return HTTP `403` when authenticated but unauthorized.

### Data integrity

Use database transactions for operations involving multiple dependent writes.

Examples:

#### Transfer equipment

```text
BEGIN
insert dieu_chuyen_thiet_bi
update thiet_bi.vi_tri_id
COMMIT
```

#### Assign incident

Potentially:

```text
BEGIN
update su_co.ky_thuat_vien_id
update su_co.trang_thai
update su_co.thoi_gian_phan_cong
insert thong_bao
COMMIT
```

#### Complete repair

Potentially:

```text
BEGIN
insert/update ho_so_sua_chua
update su_co
update thiet_bi.trang_thai
insert thong_bao
COMMIT
```

Exact implementation must follow the current codebase and requested business decision.

---

## 10. Mobile vs Web responsibility

### Mobile — Nhân viên

Focus on field actions.

Main functions:

- login
- scan QR
- view simplified device profile
- report incident
- upload incident image
- track own incidents
- notifications

Do not expose sensitive supplier/invoice/admin data.

---

### Mobile — Kỹ thuật viên

Main functions:

- login
- assigned jobs
- incident detail
- accept/start repair
- update repair progress
- cause
- solution
- replacement parts
- repair result
- maintenance tasks
- checklist
- maintenance result
- notifications

---

### Web Admin

Main functions:

- dashboard
- user management
- equipment CRUD
- bulk import
- QR administration
- location
- equipment transfer
- supplier
- import lot/invoice traceability
- incidents
- technician assignment
- maintenance plans
- maintenance supervision
- reports

---

## 11. UX/business design principles

When implementing APIs or proposing UI-related data structures, preserve these principles:

### Role-based disclosure

Each role sees only what it needs.

### Progressive disclosure

Do not return or display unnecessary sensitive information by default.

### List → Detail → Action

Lists should be lightweight.

Detailed actions belong in record detail views.

### State-based actions

Available actions should depend on current state.

Example:

```text
MOI
→ assign

DA_PHAN_CONG
→ technician starts

DANG_XU_LY
→ complete repair
```

Avoid arbitrary state changes.

---

## 12. API design guidance

Prefer resource-oriented endpoints.

Example style:

```text
POST   /api/auth/dang-nhap

GET    /api/nguoi-dung
GET    /api/nguoi-dung/:id
POST   /api/nguoi-dung
PUT    /api/nguoi-dung/:id
PATCH  /api/nguoi-dung/:id/trang-thai

GET    /api/thiet-bi
GET    /api/thiet-bi/:id
POST   /api/thiet-bi
PUT    /api/thiet-bi/:id

POST   /api/thiet-bi/:id/dieu-chuyen

GET    /api/su-co
GET    /api/su-co/:id
POST   /api/su-co
POST   /api/su-co/:id/phan-cong
POST   /api/su-co/:id/bat-dau-xu-ly
POST   /api/su-co/:id/hoan-thanh

GET    /api/bao-tri
```

This is guidance, not a command to rename working existing routes.

Follow existing project routes when they already exist.

---

## 13. HTTP status guidance

Use meaningful status codes.

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

Examples:

- wrong login credentials → `401`
- no permission → `403`
- missing device → `404`
- duplicate email/serial → `409`
- invalid form data → `400` or `422`

---

## 14. Security requirements

Never:

- log raw passwords
- return password hashes
- hardcode secrets
- commit `.env`
- trust role/owner IDs from request body without authorization checks
- build SQL by string concatenation
- expose invoice files publicly without authorization

Use:

- environment variables
- bcrypt or the password solution already in the repository
- JWT utilities already implemented
- parameterized queries
- middleware-based authentication
- backend authorization

---

## 15. What an agent must do before changing code

Before implementing a task:

1. Inspect the existing repository tree.
2. Read existing related files.
3. Reuse existing patterns when they are correct.
4. Check actual database column names.
5. Check actual enum values.
6. Check whether JWT/auth helpers already exist.
7. Avoid creating duplicate utilities.
8. Keep changes focused on the requested module.
9. Do not redesign unrelated modules.
10. Explain schema changes before making them unless the user explicitly requested the migration.

---

## 16. What an agent must NOT do

Do not:

- recreate the whole project when one file is requested
- switch the backend language/framework
- replace MySQL with MongoDB/PostgreSQL
- create a new ORM unless requested
- rename database tables without migration
- invent missing fields
- invent enum values
- silently alter the database schema
- create unnecessary microservices
- turn supplier/invoice data into a purchasing/accounting module
- turn replacement parts into a warehouse system
- create a separate top-level history module
- expose admin data to mobile employees
- replace Vietnamese business naming with unrelated English naming
- modify JWT implementation merely for stylistic reasons

---

## 17. How to explain code to the project owner

The project owner wants to **understand the code while typing it manually**.

When asked to implement a file, use this teaching sequence.

### A. Purpose

Explain:

```text
File này dùng để làm gì?
Nó nằm ở tầng nào?
Ai gọi nó?
Nó gọi tiếp file nào?
```

### B. Flow

Example:

```text
Route
→ Middleware xác thực
→ Controller
→ Model
→ MySQL
→ Controller
→ Response
```

### C. Complete code

Provide the entire file, not only fragments.

### D. Explain important lines

Focus on:

- imports
- async/await
- parameters
- SQL
- returned values
- error handling
- security implications

### E. Test

Give a small test example using:

- Postman
- Thunder Client
- REST Client

depending on what is already used in the repo.

---

## 18. Module implementation priority

For the backend, prefer completing an end-to-end slice before adding advanced features.

Suggested order:

```text
1. Authentication / authorization
2. Người dùng
3. Loại thiết bị
4. Vị trí
5. Nhà cung cấp
6. Lô nhập
7. Thiết bị
8. Điều chuyển thiết bị
9. Sự cố
10. Hồ sơ sửa chữa
11. Checklist
12. Kế hoạch bảo trì
13. Phiếu bảo trì
14. Thông báo
15. Dashboard/report queries
```

This order may be adjusted based on existing code.

---

## 19. MVP priority

Core MVP:

- authentication
- role authorization
- equipment CRUD
- equipment lookup
- QR
- equipment location
- equipment transfer
- incident reporting
- incident assignment
- technician repair
- maintenance plans/tasks
- checklist
- basic history
- basic dashboard/reporting

Extensions after MVP:

- complete realtime
- push notification infrastructure
- Health Score
- richer warranty/document workflow
- advanced checklist behavior
- PDF/Excel export
- more complex analytics

Do not spend significant implementation time on extensions while core end-to-end flows are incomplete unless explicitly asked.

---

## 20. Business examples

### Example 1 — Incident

```text
NHAN_VIEN quét QR CNC-0001
→ mở thiết bị
→ báo sự cố
→ su_co được tạo với trạng thái MOI
→ QUAN_TRI_VIEN phân công KY_THUAT_VIEN
→ trạng thái DA_PHAN_CONG
→ kỹ thuật viên bắt đầu
→ DANG_XU_LY
→ ghi hồ sơ sửa chữa
→ DA_XU_LY
→ thông báo người liên quan
```

---

### Example 2 — Device transfer

```text
Thiết bị đang ở vị trí A
→ Admin chọn điều chuyển
→ kiểm tra vị trí mới
→ lưu dieu_chuyen_thiet_bi
→ cập nhật thiet_bi.vi_tri_id
→ vẫn giữ được lịch sử vị trí cũ
```

---

### Example 3 — Maintenance

```text
ke_hoach_bao_tri
→ ngày đến hạn
→ phieu_bao_tri
→ kỹ thuật viên thực hiện
→ ket_qua_checklist
→ ket_qua_bao_tri
→ HOAN_THANH
→ tính/cập nhật ngay_bao_tri_tiep_theo
```

---

## 21. Source-of-truth precedence

When information conflicts, use this priority:

```text
1. Explicit instruction in the current user task
2. Existing working repository code
3. Current database schema
4. Business analysis document
5. This AGENTS.md context
6. Generic best practices
```

However, if existing code appears to conflict with the database or business rules, point it out instead of silently spreading the inconsistency.

---

## 22. Final agent rule

The objective is not merely to generate code quickly.

The objective is to build FactoryCare in a way that:

- matches the current MySQL schema
- preserves the agreed 5-module business model
- keeps the backend understandable to a student developer
- completes one file/module properly before moving on
- avoids unnecessary complexity
- keeps business logic traceable and secure

When uncertain about a database field or enum, **inspect the schema instead of guessing**.
