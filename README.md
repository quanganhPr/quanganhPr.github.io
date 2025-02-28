# SyncTube - Nghe nhạc YouTube cùng nhau

## Mô tả
SyncTube là ứng dụng web cho phép hai người tìm kiếm và nghe nhạc trên YouTube cùng lúc, với thời gian phát được đồng bộ.

## Hướng dẫn cài đặt
1. Clone repository: `git clone <URL>`
2. Vào thư mục server: `cd server`
3. Cài đặt dependency: `npm install`
4. Khởi động server: `npm start`
5. Mở `public/index.html` trên trình duyệt hoặc deploy lên GitHub Pages.

## Yêu cầu
- API Key từ YouTube Data API (https://developers.google.com/youtube/v3)
- Thay `YOUR_API_KEY` trong `script.js`.

## Tính năng
- Tìm kiếm video YouTube.
- Đồng bộ phát nhạc giữa hai người dùng.

## Deploy
- Frontend: GitHub Pages
- Backend: Heroku