# SyncChat - Nhắn tin cùng nhau

## Phiên bản
Hiện tại: v1.7

## Mô tả
SyncChat là ứng dụng web cho phép hai người nhắn tin với nhau trong thời gian thực.

## Yêu cầu
- Cấu hình Firebase (Realtime Database):
  - Đăng ký Firebase tại https://firebase.google.com/.
  - Tạo project, bật Realtime Database (chế độ test mode).
  - Lấy cấu hình (`apiKey`, `databaseURL`, v.v.) và thay vào `firebaseConfig` trong `script.js`.

## Hướng dẫn cài đặt
1. Clone repository: `git clone <URL>`
2. Cập nhật Firebase config trong `script.js`.
3. Push lên GitHub và cấu hình GitHub Pages:
   - Vào **Settings** > **Pages**, chọn nhánh `main` và thư mục `/public`.
4. Mở URL GitHub Pages (ví dụ: `https://username.github.io/SyncChat`) trên hai trình duyệt/tab để kiểm tra.

## Tính năng
- Nhắn tin thời gian thực với tên người dùng.
- Chạy hoàn toàn trên GitHub Pages với Firebase Realtime Database.

## Deploy
- Frontend: GitHub Pages.
- Backend: Sử dụng Firebase Realtime Database (không cần server riêng).

## Lưu ý
- Đảm bảo không chia sẻ Firebase config công khai trên GitHub.
- Gói miễn phí Firebase (Spark Plan) đủ dùng cho thử nghiệm, không tốn tiền.