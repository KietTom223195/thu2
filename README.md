# Huyền Thoại Bẻ Khóa - Secure RPG 2D Game

Huyền Thoại Bẻ Khóa là một trò chơi nhập vai giải đố 2D giáo dục, nơi người chơi phải vượt qua các phòng giam mật mã cổ xưa bằng cách giải các câu đố thuật toán mật mã cổ điển và hiện đại. Hệ thống đã được nâng cấp bảo mật toàn diện để đáp ứng các yêu cầu kỹ thuật bắt buộc của bài tập lớn **FIT4012 Secure System Upgrade Challenge**.

---

## 🚀 Tính năng nổi bật đã nâng cấp

### 1. Trải nghiệm người chơi RPG 2D mượt mà
* Nhân vật chính Mage có hoạt ảnh thở thở (`breathing idle`) khi đứng yên.
* Đèn đuốc gắn tường rực cháy chao nghiêng lan tỏa bóng sáng ấm cúng.
* Hoạt ảnh Cutscene: Nhân vật tự động tìm đường đi bộ đến cửa Exit và tự động mở khóa cửa khi giải mã câu đố thành công.
* Âm thanh bẻ khóa cơ khí vui tai, tiếng xích đứt tung rơi loảng xoảng kết hợp hiệu ứng chấn động rung màn hình (`screen shake`) sống động.

### 2. Các cơ chế bảo mật mật mã đạt điểm tối đa
* **Mã hóa AES-256-GCM:** Bảo mật cơ sở dữ liệu bảng xếp hạng (`leaderboard.json`) chống đọc ghi file trái phép.
* **Xác thực & Toàn vẹn (HMAC-SHA256):** Tự động ký chữ ký số trên client bằng Web Crypto API và xác thực ở server cho mọi request.
* **Chống tấn công phát lại (Anti-Replay Attack):** Kết hợp kiểm tra cửa sổ thời gian (Timestamp window lệch tối đa 15s) và bộ lọc duy nhất Nonce ngẫu nhiên.
* **Security Logging:** Ghi nhật ký bảo mật chi tiết vào tệp `security.log` mà không làm lộ các khóa hoặc thông tin nhạy cảm.

---

## 📂 Cấu trúc thư mục dự án

```text
fit4012-secure-system/
 ├── README.md               # Hướng dẫn cài đặt và chạy chương trình
 ├── server.ts               # Backend Express Server, Middleware bảo mật, AES-GCM & HMAC
 ├── package.json            # Cấu hình dự án & scripts chạy
 ├── report/
 │    └── report.md          # Báo cáo BTL chính thức (Bảng Kế thừa & Nâng cấp bắt buộc)
 ├── docs/
 │    ├── threat_model.md    # Phân tích mô hình mối đe dọa bảo mật
 │    ├── protocol_design.md # Thiết kế chi tiết giao thức mật mã (Mermaid Sequence)
 │    ├── test_report.md     # Báo cáo các kịch bản kiểm thử bảo mật
 │    └── benchmark.md       # Benchmark đo lường hiệu năng các thuật toán
 ├── src/
 │    ├── crypto/
 │    │    └── secureFetch.ts # Global Fetch Interceptor tự động ký HMAC & Nonce phía client
 │    ├── components/        # Các phòng đố con & HUD game 2D
 │    ├── App.tsx            # Component chính điều phối trò chơi
 │    └── main.tsx           # Khởi tạo React & nạp secureFetch
 └── tests/
      └── test_security.cjs  # Kịch bản kiểm thử bảo mật tự động CommonJS (Node.js)
```

---

## 🛠️ Hướng dẫn chạy ứng dụng

### 1. Cài đặt các thư viện phụ thuộc
Yêu cầu hệ thống đã cài đặt sẵn **Node.js** (Khuyến nghị phiên bản mới nhất v20+).
Mở Terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 2. Chạy ứng dụng ở chế độ phát triển (Development)
Để chạy game cục bộ và kích hoạt Hot Module Replacement (HMR) của Vite:
```bash
npm run dev
```
Sau đó, mở trình duyệt và truy cập: **`http://localhost:3000`**.

### 3. Chạy các kịch bản kiểm thử bảo mật tự động (Security Testing)
Trong khi server đang hoạt động tại cổng 3000, mở một cửa sổ Terminal mới tại thư mục dự án và chạy:
```bash
npm test
```
Hệ thống sẽ chạy 6 kịch bản kiểm thử giả lập tấn công (tampering, replay, expired timestamp, bad signatures) và báo cáo kết quả chi tiết lên màn hình:
```text
==================================================
🛡️ STARTING FIT4012 SECURITY PROTOCOL INTEGRITY TESTS
==================================================
[TEST 1] Key Exchange Protocol Init -> ✅ SUCCESS
[TEST 2] Valid Cryptographic Flow -> ✅ SUCCESS
[TEST 3] Data Tampering Detection -> ✅ SUCCESS
[TEST 4] Expired Timestamp Prevention -> ✅ SUCCESS
[TEST 5] Replay Attack Prevention -> ✅ SUCCESS
[TEST 6] Invalid Key / Forged Signature -> ✅ SUCCESS
==================================================
🎉 ALL SECURITY PROTOCOL VERIFICATION TESTS PASSED!
==================================================
```
Đồng thời, bạn có thể mở file `security.log` ở thư mục gốc để kiểm chứng các dòng log cảnh báo bảo mật được ghi nhận thực tế.
