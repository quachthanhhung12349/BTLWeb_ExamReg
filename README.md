README dự án - Hướng dẫn cài đặt & chạy (Phiên bản dev)

Mục tiêu: Hướng dẫn nhanh cho các developer khác để chạy ứng dụng trên máy cục bộ (local) phục vụ phát triển tính năng.

Yêu cầu trước khi bắt đầu
- Node.js (phiên bản >= 16) và npm/yarn.
- MongoDB local hoặc remote (Mongo Atlas) sẵn sàng và có URI kết nối.

Cấu trúc dự án (chỉ những thư mục chính liên quan):
- `client/` - Frontend (React + Vite)
- `server/` - Backend (Express + MongoDB)

1) Chuẩn bị biến môi trường
- Server: tạo file `.env` trong thư mục `server/` với tối thiểu các biến:

```
MONGO_URI=mongodb://localhost:27017/UniversityDB
PORT=5000
```

- Client: tạo file `.env` trong thư mục `client/` (hoặc `.env.local`) để cấu hình API base URL của server:

```
VITE_API_BASE=http://localhost:5000
```

2) Cài đặt dependencies
- Cài dependencies cho server và client riêng:

```bash
# Ở thư mục gốc dự án
cd server
npm install

cd ../client
npm install
```

3) Khởi động server và client (chạy song song)
- Chạy server (development):

```bash
cd server
npm run dev   # dùng nodemon nếu đã cài
```

- Chạy frontend (Vite):

```bash
cd client
npm run dev
```

Client mặc định sẽ mở ở `http://localhost:5173` (hoặc port do Vite cung cấp). Backend mặc định lắng nghe trên `PORT` (mặc định 5000). Nếu cần đổi port, cập nhật `.env` tương ứng và `VITE_API_BASE`.

4) Seed dữ liệu mẫu (tùy chọn, rất hữu ích cho dev)
- Có script seed trong `server/scripts/seed.js` để sinh dữ liệu giả mẫu (students, courses, exam rooms, exams, notifications...). Để chạy:

```bash
cd server
node scripts/seed.js
```

Lưu ý: package.json hiện tại có script `seed` trỏ tới `scripts/generate_seed.js` (không tồn tại). Vì vậy chạy trực tiếp `node scripts/seed.js` sẽ là cách an toàn.

5) Các đường dẫn API chính (backend)
- `GET /api/students` - danh sách sinh viên
- `GET /api/courses` - danh sách học phần
- `GET /api/exam-rooms` - danh sách ca thi

Frontend sử dụng biến `VITE_API_BASE` để xây dựng URL (xem `client/src/api/*.jsx`).

6) Thực hành phát triển nhanh - nơi sửa code
- Frontend:
	- Giao diện quản lý nằm trong `client/src/` (ví dụ `student_management.jsx`, `course_management.jsx`, `exam_room_management.jsx`).
	- Các gọi API nằm trong `client/src/api/`.

- Backend:
	- Models trong `server/models/`
	- Routes trong `server/routes/`
	- Seed script trong `server/scripts/seed.js`

7) Pagination (ghi chú cho devs)
- Mặc định tôi đã thêm phân trang phía client cho các trang quản lý (10 mục/trang). Bạn có thể thay đổi con số này bằng cách chỉnh hằng `PAGE_SIZE` trong các file:
	- `client/src/student_management.jsx`
	- `client/src/course_management.jsx`
	- `client/src/exam_room_management.jsx`

8) Lưu ý khi debug kết nối DB
- Nếu server không khởi động do lỗi kết nối MongoDB, kiểm tra `MONGO_URI` trong `.env`. Một URI ví dụ cho Mongo local:

```
mongodb://localhost:27017/UniversityDB
```

9) Gợi ý workflow khi phát triển tính năng mới
- Tạo branch riêng cho tính năng: `git checkout -b feat/some-feature`.
- Chạy seed nếu cần dữ liệu mẫu.
- Chạy client + server, thực hiện thay đổi, test giao diện.
- Viết unit/integration tests nếu cần (hiện repo chưa có test runner cấu hình).

10) Các lỗi thường gặp & cách khắc phục nhanh
- Lỗi CORS: backend đã bật `cors()` mặc định; nếu frontend không gọi được API, kiểm tra `VITE_API_BASE` và port.
- Lỗi `mongoose` kết nối: kiểm tra `MONGO_URI`, đảm bảo MongoDB đang chạy.
- Lỗi npm: chạy `npm install` lại ở từng folder `client`/`server`.

Các thành viên của nhóm:
Quách Thanh Hưng
Lý Đức Tú
Nguyễn Văn Tráng
