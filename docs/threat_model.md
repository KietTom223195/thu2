# Threat Model & Security Analysis

Báo cáo này phân tích threat model và các nguy cơ bảo mật đối với hệ thống game mật mã **Huyền Thoại Bẻ Khóa** theo chuẩn bài tập lớn FIT4012.

---

## 1. Tài sản cần bảo vệ (Assets)
* **Leaderboard Data (Bảng xếp hạng):** Lưu trữ trong tệp `leaderboard.json` trên server. Cần bảo vệ tính bí mật và toàn vẹn để tránh việc sửa đổi điểm trái phép trực tiếp trên hệ thống file hoặc gian lận thứ hạng.
* **Game Session State (Tiến trình trò chơi):** Lưu trữ trong bộ nhớ đệm (in-memory sessions) của server, bao gồm: `currentLevel`, `score`, `startTime`, và `completed`. Cần tránh việc sửa đổi trái phép tiến trình (ví dụ: tự ý vượt cấp từ phòng 1 lên phòng 5).
* **Cryptographic Keys (Khóa mật mã):** Khóa dùng để ký HMAC (`sessionKey`) và khóa mã hóa dữ liệu (`LEADERBOARD_KEY`). Phải bảo vệ tuyệt đối tính bí mật.

---

## 2. Đối tượng người dùng (Actors)
* **Người dùng hợp lệ (Valid Player):** Học sinh, sinh viên chơi game một cách trung thực, giải đố tuần tự qua từng phòng.
* **Tác nhân tấn công (Attacker / Adversary):** Những người chơi gian lận có kiến thức về kỹ thuật hoặc hacker bên ngoài muốn:
  * Hack điểm số hoặc tự động nâng cấp độ phòng mà không cần giải mã.
  * Tấn công phá hoại bảng xếp hạng bằng cách gửi thư rác (spam) hoặc chỉnh sửa dữ liệu người dùng khác.
  * Tấn công phát lại (Replay attack) các yêu cầu API hợp lệ trước đó để nhân điểm số.

---

## 3. Nguy cơ và Mối đe dọa bảo mật (Threats & Vulnerabilities)

### T1: Tấn công sửa đổi dữ liệu trên đường truyền (Data Tampering)
* **Mô tả:** Attacker bắt các yêu cầu gửi đáp án giải mã (ví dụ: `/api/verify_caesar`) và sửa đổi nội dung tham số (ví dụ: sửa kết quả dịch mã hoặc điểm số) trước khi gửi tới server nhằm đánh lừa server ghi nhận kết quả đúng.
* **Mức độ rủi ro:** Cao (High).

### T2: Tấn công phát lại (Replay Attack)
* **Mô tả:** Attacker chặn bắt gói tin gửi đáp án đúng của một phiên chơi trước, sau đó gửi lại gói tin đó nhiều lần lên server để spam điểm số cộng thêm mà không cần thực hiện giải đố lại.
* **Mức độ rủi ro:** Cao (High).

### T3: Tấn công đọc/ghi file bảng xếp hạng trái phép (Leaderboard Storage Leak)
* **Mô tả:** Nếu tệp `leaderboard.json` được lưu dưới dạng văn bản rõ (cleartext JSON) trên server, bất kỳ ai có quyền truy cập cục bộ vào server (hoặc qua một lỗ hổng Directory Traversal) đều có thể sửa đổi điểm số của mình trực tiếp trong file.
* **Mức độ rủi ro:** Trung bình (Medium).

### T4: Rò rỉ khóa bí mật (Hardcoded Key Leakage)
* **Mô tả:** Khóa bí mật dùng cho mã hóa hoặc xác thực bị ghi cứng (hardcoded) trong mã nguồn Client hoặc Server, dẫn đến việc bị lộ khi code được đẩy lên kho lưu trữ công khai như GitHub.
* **Mức độ rủi ro:** Nghiêm trọng (Critical).

---

## 4. Các giải pháp kiểm soát bảo mật đã triển khai

| Mối đe dọa | Cơ chế kiểm soát | Thuật toán & Thư viện sử dụng |
| :--- | :--- | :--- |
| **Data Tampering (T1)** | Ký xác thực toàn vẹn gói tin ở mỗi request API. | **HMAC-SHA256** (Node.js `crypto` & Web Crypto API). |
| **Replay Attack (T2)** | Sử dụng duy nhất một lần chuỗi ngẫu nhiên (`nonce`) kết hợp cửa sổ thời gian giới hạn (`timestamp` lệch không quá 15s). | Nonce in-memory mapping database trên Server. |
| **Storage Leak (T3)** | Mã hóa dữ liệu bảng xếp hạng trước khi ghi xuống đĩa cứng. | **AES-256-GCM** (Mã hóa đối xứng có xác thực AEAD). |
| **Hardcoded Keys (T4)** | Dẫn xuất khóa phiên động ngẫu nhiên và sử dụng biến môi trường cho khóa lưu trữ. | `crypto.randomBytes(32)` & `crypto.scryptSync`. |

---

## 5. Giả định và Giới hạn hệ thống (Assumptions & Scope)
* **Giả định:** Đường truyền mạng giữa Client và Server được bảo vệ bởi giao thức HTTPS (TLS) trong môi trường sản xuất thực tế để chống tấn công nghe trộm (Eavesdropping) khóa phiên ban đầu.
* **Giới hạn:** Bộ nhớ in-memory sessions và nonces được lưu trữ trong RAM của server. Nếu server khởi động lại (restart), các session và nonces hiện tại sẽ bị xóa sạch, buộc người chơi phải tạo phiên mới. Đây là hành vi chấp nhận được để tối ưu hiệu năng không cần Database ngoài cho sản phẩm game này.
