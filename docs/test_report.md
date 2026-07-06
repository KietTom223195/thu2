# Security Test Report - FIT4012 Challenge

Báo cáo này trình bày chi tiết các kịch bản kiểm thử bảo mật (security test cases) đã được xây dựng và chạy thực tế trên hệ thống game **Crypto Quest** nhằm xác minh các cơ chế bảo mật hoạt động đúng.

---

## 1. Môi trường kiểm thử
* **Hệ điều hành:** Windows 10/11
* **Runtime:** Node.js v24.15.0
* **Công cụ chạy test:** Lệnh `npm test` thực thi kịch bản kiểm thử bảo mật CommonJS nằm tại [tests/test_security.cjs](file:///c:/Users/Tom/Desktop/BTL_MA_HOA/BTL_MA_HOA/BTL_Ma_hoa-main/tests/test_security.cjs).

---

## 2. Danh sách các Test Case bảo mật và Kết quả

Hệ thống đã xây dựng và kiểm thử thành công 6 kịch bản kiểm thử bảo mật bắt buộc:

| STT | Kịch bản kiểm thử (Test Case) | Mục tiêu kiểm chứng | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **TC1** | Khởi tạo phiên & Trao đổi khóa | Đảm bảo Client trao đổi khóa phiên ngẫu nhiên thành công với Server. | Nhận mã khóa hex 256-bit trong response của `/api/start`. | **PASSED** |
| **TC2** | Truyền tin hợp lệ (Valid Flow) | Xác minh Client ký đúng chữ ký HMAC, gửi kèm nonce và timestamp hợp lệ được Server phê duyệt. | Server trả về `200 OK` và ghi nhận kết quả giải đố đúng. | **PASSED** |
| **TC3** | Tấn công sửa đổi dữ liệu (Tampering) | Đảm bảo Server phát hiện dữ liệu payload bị thay đổi trong quá trình truyền tải trên mạng. | Server phát hiện sai lệch chữ ký, từ chối yêu cầu với lỗi `400 Bad Request`. | **PASSED** |
| **TC4** | Chống Replay bằng Timestamp hết hạn | Xác minh Server chặn đứng các gói tin cũ bị Hacker chặn bắt và gửi lại sau đó. | Server từ chối xử lý gói tin có timestamp cũ quá 15s (`403 Forbidden`). | **PASSED** |
| **TC5** | Chống Replay bằng Nonce trùng lặp | Đảm bảo mỗi nonce chỉ được sử dụng duy nhất một lần trong thời hạn cửa sổ. | Gửi lại gói tin hợp lệ lần thứ hai lập tức bị chặn đứng (`403 Forbidden`). | **PASSED** |
| **TC6** | Giả mạo chữ ký / Sai khóa mật mã | Xác minh Server chặn đứng các yêu cầu có chữ ký giả mạo bằng khóa phiên sai lệch. | Chữ ký HMAC không khớp, Server chặn đứng với mã lỗi `400 Bad Request`. | **PASSED** |

---

## 3. Minh chứng Ghi Log Bảo Mật thực tế (`security.log`)

Khi thực hiện chạy kịch bản kiểm thử bằng lệnh `npm test`, Server Express đã phát hiện và ghi lại chi tiết các sự kiện bảo mật vào tệp [security.log](file:///c:/Users/Tom/Desktop/BTL_MA_HOA/BTL_MA_HOA/BTL_Ma_hoa-main/security.log).

Dưới đây là một đoạn trích xuất nhật ký thực tế ghi nhận quá trình tấn công bị chặn đứng:

```text
[2026-07-06T14:29:14.932Z] [SUCCESS] [Session: test-secure-session-12345] Event: SESSION_START | Details: Initialized session with secure key: 0f6eb9b7...
[2026-07-06T14:29:14.945Z] [SUCCESS] [Session: test-secure-session-12345] Event: INTEGRITY_CHECK | Details: Verified secure request for POST /api/verify_caesar
[2026-07-06T14:29:14.952Z] [FAILED] [Session: test-secure-session-12345] Event: INTEGRITY_CHECK | Details: Data tampering detected! Signature mismatch.
[2026-07-06T14:29:14.958Z] [FAILED] [Session: test-secure-session-12345] Event: REPLAY_PREVENTION | Details: Expired request timestamp: 1783348124952 (Diff: -30000ms)
[2026-07-06T14:29:14.965Z] [FAILED] [Session: test-secure-session-12345] Event: REPLAY_PREVENTION | Details: Replay attack detected: Nonce d3a5cf8a139e4a2c already processed!
[2026-07-06T14:29:14.972Z] [FAILED] [Session: test-secure-session-12345] Event: INTEGRITY_CHECK | Details: Data tampering detected! Signature mismatch.
```

### Nhận xét:
* File log ghi nhận đầy đủ, rõ ràng và mạch lạc tất cả các mốc thời gian, loại sự kiện (`SESSION_START`, `INTEGRITY_CHECK`, `REPLAY_PREVENTION`) và trạng thái (`SUCCESS`, `FAILED`).
* **Đặc biệt an toàn:** Nhật ký log hoàn toàn không in ra các thông tin nhạy cảm như khóa mật mã đầy đủ, mật khẩu thô của người chơi hay đáp án rõ của câu đố, đáp ứng 100% tiêu chí an toàn thông tin (Vấn đề 4.5 & 4.3).
