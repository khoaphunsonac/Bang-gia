# Bảng Giá Vàng - Gold Price Display

Trang web hiển thị giá vàng real-time với giao diện responsive và tính năng quản trị.

## 🌟 Tính năng

-   ⏰ Hiển thị thời gian real-time
-   💰 Bảng giá vàng có thể cập nhật
-   📱 Responsive design (Mobile, Tablet, Desktop, TV)
-   🎨 Giao diện vàng đẹp mắt
-   👨‍💼 Panel quản trị để cập nhật giá
-   💾 Lưu dữ liệu trong localStorage

## 🚀 Demo

Xem demo tại: https://yourusername.github.io/Bang-gia

## 📁 Cấu trúc project

```
Bang-gia/
├── index.html          # Trang chính
├── style.css           # CSS styling
├── main.js             # JavaScript logic
├── data.json           # Dữ liệu giá vàng
├── save-data.php       # Lưu dữ liệu (không hoạt động trên GitHub Pages)
├── img/                # Hình ảnh
│   ├── golden_liquild.jpg
│   ├── facebook-qr.png
│   └── zalo-qr.png
└── README.md           # Tài liệu này
```

## 🛠️ Cài đặt

1. Clone repository:

```bash
git clone https://github.com/yourusername/Bang-gia.git
```

2. Mở file `index.html` trong trình duyệt

## 📊 Cách sử dụng

1. **Xem giá vàng**: Mở trang web để xem bảng giá vàng hiện tại
2. **Cập nhật giá**: Click nút "Quản Trị" để mở panel cập nhật giá
3. **Responsive**: Trang web tự động điều chỉnh theo kích thước màn hình

## 🎯 Triển khai lên GitHub Pages

### Bước 1: Tạo Repository GitHub

1. Đăng nhập vào GitHub
2. Tạo repository mới có tên `Bang-gia`
3. Đặt repository là **Public**

### Bước 2: Upload code

```bash
# Di chuyển vào thư mục project
cd c:\laragon\www\Bang-gia

# Khởi tạo git
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Initial commit - Gold price website"

# Thêm remote origin
git remote add origin https://github.com/yourusername/Bang-gia.git

# Push lên GitHub
git push -u origin main
```

### Bước 3: Kích hoạt GitHub Pages

1. Vào Settings của repository
2. Scroll xuống phần **Pages**
3. Trong **Source**, chọn **Deploy from a branch**
4. Chọn branch **main** và folder **/ (root)**
5. Click **Save**

### Bước 4: Truy cập website

Sau 2-3 phút, website sẽ có sẵn tại:

```
https://yourusername.github.io/Bang-gia
```

## ⚠️ Lưu ý

-   GitHub Pages chỉ hỗ trợ static files (HTML, CSS, JS)
-   PHP file (`save-data.php`) sẽ không hoạt động
-   Dữ liệu được lưu trong localStorage của trình duyệt
-   Để backup dữ liệu, cần export/import thủ công

## 🔧 Tùy chỉnh

### Thay đổi màu sắc

Chỉnh sửa trong file `style.css`:

```css
/* Màu vàng chính */
#ffd700

/* Màu nâu */
#8b4513

/* Màu gradient */
linear-gradient(135deg, #ffd700, #ffa500)
```

### Cập nhật dữ liệu mặc định

Chỉnh sửa file `data.json`:

```json
{
    "row1-col1": "SJC 1L, 5C",
    "row1-col2": "76.50",
    "row1-col3": "78.50"
}
```

## 📱 Responsive Breakpoints

-   **Mobile**: ≤ 767px
-   **Tablet**: 768px - 1023px
-   **Desktop**: 1024px - 1439px
-   **Large Screen**: ≥ 1440px

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trong repository này.

---

**Tác giả**: [Your Name]  
**License**: MIT
