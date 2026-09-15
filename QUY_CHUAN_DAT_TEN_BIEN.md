# Quy chuan dat ten bien - FactoryCare Backend

Tai lieu nay thong nhat cach dat ten bien, ham, hang so va ten file trong backend FactoryCare. Muc tieu la giup code de doc, de tim kiem, va khong bi moi nguoi dat ten theo mot kieu khac nhau.

## 1. Nguyen tac chung

- Dung tieng Viet khong dau cho ten bien va ten ham nghiep vu.
- Ten phai noi ro y nghia, khong viet tat tuy tien.
- Uu tien ten gan voi nghiep vu nha may: `nguoiDung`, `thietBi`, `suCo`, `baoTri`, `viTri`.
- Khong dat ten qua chung chung neu co the dat ro hon.
- Khong tron tieng Anh va tieng Viet trong cung mot ten bien, tru cac ten chuan cua framework.

Vi du nen dung:

```js
const nguoiDung = await nguoiDungModel.timTheoEmail(email);
const danhSachThietBi = await thietBiModel.layDanhSachThietBi();
const trangThaiMoi = "DANG_HOAT_DONG";
```

Vi du khong nen dung:

```js
const user = await nguoiDungModel.timTheoEmail(email);
const listDevice = await thietBiModel.layDanhSachThietBi();
const stt = "DANG_HOAT_DONG";
```

## 2. Quy uoc chu hoa, chu thuong

| Loai ten                 | Quy uoc                   | Vi du                                              |
| ------------------------ | ------------------------- | -------------------------------------------------- |
| Bien JavaScript          | `camelCase`               | `nguoiDung`, `matKhau`, `ngayBaoTriTiepTheo`       |
| Ham JavaScript           | `camelCase`               | `timTheoEmail`, `taoNguoiDung`, `capNhatTrangThai` |
| Hang so trong code       | `UPPER_SNAKE_CASE`        | `VAI_TRO_QUAN_TRI`, `TRANG_THAI_HOAT_DONG`         |
| Gia tri enum tu database | `UPPER_SNAKE_CASE`        | `HOAT_DONG`, `DANG_XU_LY`, `QUAN_TRI_VIEN`         |
| Ten bang database        | `snake_case`              | `nguoi_dung`, `thiet_bi`, `su_co`                  |
| Ten cot database         | `snake_case`              | `ho_ten`, `mat_khau`, `ngay_tao`                   |
| Ten file module          | `snake_case.loai_file.js` | `nguoi_dung.model.js`, `xac_thuc.service.js`       |

## 3. Ten bien theo tang code

### Controller

Controller xu ly `req`, `res`, `next`, doc du lieu tu request, goi service, va tra response.

Duoc phep giu ten chuan cua Express:

```js
async function dangNhap(req, res, next) {
  const { email, matKhau } = req.body;
}
```

Nen dat bien theo du lieu nhan tu client:

```js
const { hoTen, email, soDienThoai, vaiTro } = req.body;
const nguoiDungId = req.params.id;
const ketQua = await nguoiDungService.taoNguoiDung(req.body);
```

### Service

Service chua logic nghiep vu. Ten bien nen mo ta dung y nghia xu ly.

```js
const emailChuanHoa = email.trim().toLowerCase();
const nguoiDung = await nguoiDungModel.timTheoEmail(emailChuanHoa);
const matKhauDung = await bcrypt.compare(matKhau, nguoiDung.mat_khau);
```

### Model

Model lam viec truc tiep voi MySQL. Co the dung ten gan voi SQL nhu `rows`, `ketQua`, `thamSo`, `dieuKien`.

```js
const dieuKien = "WHERE trang_thai = ?";
const thamSo = ["HOAT_DONG"];
const [rows] = await pool.execute(sql, thamSo);
const [ketQua] = await pool.execute(sql, [id]);
```

Khi du lieu di vao code JavaScript, uu tien `camelCase`. Khi doc tu database, ten cot tra ve van la `snake_case`.

```js
return {
  id: nguoiDung.id,
  hoTen: nguoiDung.ho_ten,
  soDienThoai: nguoiDung.so_dien_thoai,
  vaiTro: nguoiDung.vai_tro,
};
```

## 4. Ten ham nghiep vu

Ten ham nen bat dau bang dong tu ro hanh dong.

| Hanh dong   | Khi nao dung                        | Vi du                                       |
| ----------- | ----------------------------------- | ------------------------------------------- |
| `lay`       | Lay danh sach hoac thong tin        | `layDanhSachNguoiDung`, `layThongTinCaNhan` |
| `tim`       | Tim mot ban ghi theo dieu kien      | `timTheoEmail`, `timTheoId`                 |
| `tao`       | Tao ban ghi moi                     | `taoNguoiDung`, `taoThietBi`                |
| `capNhat`   | Cap nhat du lieu                    | `capNhatNguoiDung`, `capNhatTrangThai`      |
| `khoa`      | Khoa tai khoan hoac ngung kich hoat | `khoaNguoiDung`                             |
| `moKhoa`    | Mo khoa tai khoan                   | `moKhoaNguoiDung`                           |
| `kiemTra`   | Kiem tra dieu kien dung/sai         | `kiemTraMatKhau`, `kiemTraQuyen`            |
| `dem`       | Dem so luong                        | `demTongNguoiDung`, `demSuCoDangMo`         |
| `phanCong`  | Gan viec cho ky thuat vien          | `phanCongKyThuatVien`                       |
| `batDau`    | Bat dau quy trinh                   | `batDauXuLySuCo`, `batDauBaoTri`            |
| `hoanThanh` | Hoan thanh quy trinh                | `hoanThanhSuaChua`, `hoanThanhBaoTri`       |
| `huy`       | Huy mot quy trinh                   | `huySuCo`, `huyPhieuBaoTri`                 |

Khong nen dat ham qua ngan hoac mo ho:

```js
// Khong nen
getUser();
updateStatus();
handleData();

// Nen
layThongTinCaNhan();
capNhatTrangThaiNguoiDung();
xuLyDangNhap();
```

## 5. Ten bien boolean

Bien boolean nen co tien to giup doc len la hieu gia tri dung/sai.

| Tien to | Y nghia                        | Vi du                                |
| ------- | ------------------------------ | ------------------------------------ |
| `la`    | La mot loai/vai tro nao do     | `laQuanTriVien`, `laKyThuatVien`     |
| `co`    | Co ton tai/co quyen/co du lieu | `coQuyen`, `coNguoiDung`, `coSuCoMo` |
| `da`    | Da lam xong mot viec           | `daDoc`, `daPhanCong`, `daHoanThanh` |
| `can`   | Can thuc hien hanh dong        | `canThongBao`, `canCapNhatTrangThai` |
| `duoc`  | Duoc phep lam gi do            | `duocSuaSuCo`, `duocXemBaoCao`       |

Vi du:

```js
const laQuanTriVien = nguoiDung.vai_tro === "QUAN_TRI_VIEN";
const daHoanThanh = suCo.trang_thai === "DA_XU_LY";
const coQuyen = danhSachVaiTroChoPhep.includes(nguoiDung.vai_tro);
```

## 6. Ten bien danh sach, mang va so luong

Danh sach nen co tien to `danhSach` hoac ten so nhieu ro rang.

```js
const danhSachNguoiDung = await nguoiDungModel.layDanhSachNguoiDung();
const danhSachThietBi = await thietBiModel.layDanhSachThietBi();
const danhSachSuCo = await suCoModel.layDanhSachSuCo();
```

So luong nen dung `tong`, `soLuong`, hoac ten cu the hon.

```js
const tongNguoiDung = await nguoiDungModel.demTongNguoiDung();
const soLuongSuCoMo = await suCoModel.demSuCoDangMo();
```

Khong nen dung:

```js
const list = [];
const arr = [];
const count = 0;
```

Tru khi pham vi rat nho va y nghia da qua ro.

## 7. Ten bien id

Neu bien id thuoc ve mot doi tuong cu the, dat ten theo mau:

```js
const nguoiDungId = req.params.id;
const thietBiId = req.body.thietBiId;
const suCoId = req.params.id;
const kyThuatVienId = req.body.kyThuatVienId;
```

Trong controller cua route chi thao tac mot tai nguyen, co the dung `id` neu ngan gon va khong gay nham lan:

```js
const { id } = req.params;
```

Neu co tu 2 id tro len trong cung ham, bat buoc dat ro ten:

```js
const { thietBiId, viTriMoiId } = req.body;
const nguoiThucHienId = req.nguoiDung.id;
```

## 8. Ten bien mat khau va bao mat

Khong dat ten gay nham lan giua mat khau goc va mat khau da bam.

```js
const matKhau = req.body.matKhau;
const matKhauDaBam = await bcrypt.hash(matKhau, 10);
const matKhauDung = await bcrypt.compare(matKhau, nguoiDung.mat_khau);
```

Khong log cac bien sau:

```js
matKhau;
matKhauDaBam;
token;
refreshToken;
JWT_SECRET;
```

## 9. Ten bien request va response

Du lieu lay tu `req.body` nen dat theo ten field client gui len:

```js
const { email, matKhau } = req.body;
const { hoTen, soDienThoai, vaiTro } = req.body;
```

Du lieu tra ve client nen dung `camelCase` de frontend de dung:

```js
return {
  id: nguoiDung.id,
  hoTen: nguoiDung.ho_ten,
  email: nguoiDung.email,
  vaiTro: nguoiDung.vai_tro,
  trangThai: nguoiDung.trang_thai,
};
```

Khong tra ve truc tiep `mat_khau` hoac du lieu nhay cam.

## 10. Ten hang so va enum

Gia tri enum phai dung dung voi database hien tai. Khong tu tao gia tri moi neu database chua co.

```js
const TRANG_THAI_HOAT_DONG = "HOAT_DONG";
const VAI_TRO_QUAN_TRI_VIEN = "QUAN_TRI_VIEN";
const TRANG_THAI_SU_CO_MOI = "MOI";
```

Khong dung enum khong ton tai trong database:

```js
// Khong dung neu database chua co
const TRANG_THAI_CHO_LINH_KIEN = "CHO_LINH_KIEN";
const TRANG_THAI_HOAN_THANH = "HOAN_THANH";
```

## 11. Ten file

Giu dung kieu hien tai cua backend.

```text
src/models/nguoi_dung.model.js
src/services/xac_thuc.service.js
src/controllers/nguoi_dung.controller.js
src/routes/nguoi_dung.route.js
src/middlewares/xac_thuc.middleware.js
```

Khong tao file trung y nghia voi file da co:

```text
// Khong nen neu da co nguoi_dung.model.js
user.model.js
nguoiDung.model.js
nguoidung.model.js
```

## 12. Ten bien nen tranh

Han che cac ten qua chung chung:

```js
data;
item;
obj;
temp;
result;
value;
info;
list;
arr;
x;
y;
```

Chi dung cac ten tren khi pham vi rat nho, vi du callback ngan:

```js
const ids = danhSachNguoiDung.map((nguoiDung) => nguoiDung.id);
```

## 13. Bang doi chieu ten database va JavaScript

| Database                 | JavaScript           |
| ------------------------ | -------------------- |
| `ho_ten`                 | `hoTen`              |
| `mat_khau`               | `matKhau`            |
| `so_dien_thoai`          | `soDienThoai`        |
| `anh_dai_dien`           | `anhDaiDien`         |
| `vai_tro`                | `vaiTro`             |
| `trang_thai`             | `trangThai`          |
| `ngay_tao`               | `ngayTao`            |
| `ngay_cap_nhat`          | `ngayCapNhat`        |
| `ma_thiet_bi`            | `maThietBi`          |
| `ten_thiet_bi`           | `tenThietBi`         |
| `thiet_bi_id`            | `thietBiId`          |
| `nguoi_bao_id`           | `nguoiBaoId`         |
| `ky_thuat_vien_id`       | `kyThuatVienId`      |
| `ngay_bao_tri_tiep_theo` | `ngayBaoTriTiepTheo` |

## 14. Checklist truoc khi commit code

Truoc khi commit, tu kiem tra nhanh:

- Ten bien co doc len hieu ngay y nghia khong?
- Ten ham co bat dau bang dong tu khong?
- Bien JavaScript da dung `camelCase` chua?
- Ten cot va ten bang SQL van dung `snake_case` chua?
- Co dung enum that su ton tai trong database khong?
- Co tranh tra ve hoac log `mat_khau`, token, secret khong?
- Co bi tron lung tung `user`, `nguoiDung`, `account` trong cung mot file khong?

## 15. Quy tac uu tien khi phan van

Neu khong chac nen dat ten the nao, uu tien theo thu tu:

1. Theo cach dat ten da co trong file dang sua.
2. Theo ten nghiep vu tieng Viet khong dau.
3. Theo ten cot database neu dang o tang model.
4. Theo ten de frontend doc va dung neu la response API.
5. Hoi lai nhom neu ten lien quan den nghiep vu moi.
