# SyncTube - Nghe nhạc YouTube cùng nhau

## Phiên bản
Hiện tại: v1.1

## Mô tả
SyncTube là ứng dụng web cho phép hai người tìm kiếm và nghe nhạc trên YouTube cùng lúc, với thời gian phát được đồng bộ. Người dùng cũng có thể nhắn tin trong thời gian thực.

## Yêu cầu
- API Key từ YouTube Data API (https://developers.google.com/youtube/v3).
- Thay `YOUR_YOUTUBE_API_KEY` trong `script.js`.
- Cấu hình Firebase (Realtime Database):
  - Đăng ký Firebase tại https://firebase.google.com/.
  - Tạo project, bật Realtime Database (chế độ test mode).
  - Lấy cấu hình (`apiKey`, `databaseURL`, v.v.) và thay vào `firebaseConfig` trong `script.js`.

## Hướng dẫn cài đặt
1. Clone repository: `git clone <URL>`
2. Cập nhật các API Key và Firebase config trong `script.js`.
3. Push lên GitHub và cấu hình GitHub Pages:
   - Vào **Settings** > **Pages**, chọn nhánh `main` và thư mục `/public`.
4. Mở URL GitHub Pages (ví dụ: `https://username.github.io/SyncTube`) trên hai trình duyệt/tab để kiểm tra.

## Tính năng
- Tìm kiếm video YouTube.
- Đồng bộ phát nhạc giữa hai người dùng.
- Nhắn tin thời gian thực với tên người dùng, màu sắc, và lịch sử.
- Chạy hoàn toàn trên GitHub Pages với Firebase Realtime Database.

## Deploy
- Frontend: GitHub Pages.
- Backend: Sử dụng Firebase Realtime Database (không cần server riêng).

## Lưu ý
- Đảm bảo không chia sẻ API Key hoặc Firebase config công khai trên GitHub.
- Gói miễn phí Firebase (Spark Plan) đủ dùng cho thử nghiệm, không tốn tiền.