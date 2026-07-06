import { useState } from "react";
import { sound } from "./AudioEngine";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [activeTab, setActiveTab] = useState<"student" | "instructor">("student");

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none font-pixel">
      <div className="pixel-card max-w-[680px] w-full text-stone-200 border-[#ffaa00] bg-[#1c140e] flex flex-col justify-between max-h-[90%] overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b-4 border-[#3c2a1a] pb-2 mb-3">
            <span className="text-[#ffaa00] text-xs font-bold tracking-widest">
              CẨM NANG HƯỚNG DẪN HỌC TẬP (FIT4012)
            </span>
            <button
              onClick={() => {
                sound.playMetalClash();
                onClose();
              }}
              className="bg-red-900/60 hover:bg-red-800 text-white border-2 border-black text-[9px] px-2 py-0.5"
            >
              [X] Đóng
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-3 border-b border-[#3c2a1a] pb-2">
            <button
              onClick={() => {
                sound.playMetalClash();
                setActiveTab("student");
              }}
              className={`text-[9px] px-3 py-1.5 border-2 border-black ${
                activeTab === "student"
                  ? "bg-[#ffaa00] text-black font-bold"
                  : "bg-[#2c2016] text-[#ebdcb9] hover:bg-[#3c2d20]"
              }`}
            >
              DÀNH CHO SINH VIÊN
            </button>
            <button
              onClick={() => {
                sound.playMetalClash();
                setActiveTab("instructor");
              }}
              className={`text-[9px] px-3 py-1.5 border-2 border-black ${
                activeTab === "instructor"
                  ? "bg-[#ffaa00] text-black font-bold"
                  : "bg-[#2c2016] text-[#ebdcb9] hover:bg-[#3c2d20]"
              }`}
            >
              DÀNH CHO GIẢNG VIÊN
            </button>
          </div>

          {/* Tab content area */}
          <div className="text-[10px] leading-relaxed space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {activeTab === "student" ? (
              <div className="space-y-4">
                <div className="bg-black/30 p-2 border-l-4 border-amber-500">
                  <strong className="text-amber-400">1. Lộ trình phiêu lưu & Học tập:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-stone-300">
                    <li><strong>Màn 1:</strong> Thực hành mật mã Caesar (giải mã tịnh tiến). Nhận thức yếu điểm dễ bị brute force.</li>
                    <li><strong>Màn 2:</strong> Giải mã Vigenère (mã hóa nhiều bảng chữ cái). Nhận thức yếu điểm dùng lại khóa.</li>
                    <li><strong>Màn 3:</strong> Giải mã Hash (MD5) & Phát hiện lỗi **Hash không có Salt**.</li>
                    <li><strong>Màn 4:</strong> Tính toán cặp khóa RSA & Phát hiện lỗi **sử dụng số nguyên tố quá nhỏ**.</li>
                    <li><strong>Màn 5:</strong> Vượt qua Cryptex AES & Phát hiện lỗi rò rỉ mẫu dữ liệu do **chế độ ECB**.</li>
                  </ul>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-green-500">
                  <strong className="text-green-400">2. Mẹo chơi & Nghiên cứu:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-stone-300">
                    <li>Ở Màn 1 & 2, sử dụng công cụ quay bánh xe hoặc ráp các mảnh tranh để tìm từ khóa gợi ý.</li>
                    <li>Ở Màn 3, mã băm MD5 `5d41402abc4b2a76b9719d911017c592` là một mã băm cực kỳ phổ biến. Hãy tìm kiếm/tra cứu bảng băm trực tuyến để tìm mật khẩu gốc.</li>
                    <li>Lưu lại các từ khóa tìm được ở mỗi phòng để kết hợp thành mã khóa tổng hợp tại Màn 5.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black/30 p-2 border-l-4 border-amber-500">
                  <strong className="text-amber-400">1. Mục tiêu giáo dục (Learning Objectives):</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-stone-300">
                    <li>Giúp học viên hiểu trực quan nguyên lý các thuật toán mật mã từ cổ điển đến hiện đại.</li>
                    <li>Rèn luyện tư duy phân tích bảo mật thông qua việc bắt buộc phát hiện **lỗi thiết kế mật mã (Crypto Design Flaws)** thực tế thay vì chỉ giải mã thông thường.</li>
                  </ul>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-blue-500">
                  <strong className="text-blue-400">2. Hướng dẫn tích hợp vào bài học:</strong>
                  <p className="mt-1 text-stone-300">
                    Giảng viên có thể giao game như một bài tập về nhà 15 phút, hoặc làm trò chơi nhóm khởi động trên lớp. Yêu cầu sinh viên chụp lại màn hình kết quả (Success Overlay) hiển thị tổng điểm và thời gian giải mã để chấm điểm thi đua.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-red-700">
                  <strong className="text-red-400">3. Đáp án & Lời giải (Answer Key):</strong>
                  <table className="w-full text-[9px] mt-2 border border-stone-700 bg-black/60">
                    <thead>
                      <tr className="border-b border-stone-700 text-amber-500">
                        <th className="p-1 text-left">Màn</th>
                        <th className="p-1 text-left">Đáp án giải mã</th>
                        <th className="p-1 text-left">Lỗi thiết kế bảo mật</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-stone-800 text-stone-300">
                        <td className="p-1 font-bold">1 (Caesar)</td>
                        <td className="p-1 font-mono">FITDNU / HELLO</td>
                        <td className="p-1">Không gian khóa quá nhỏ (chỉ 26 khóa)</td>
                      </tr>
                      <tr className="border-b border-stone-800 text-stone-300">
                        <td className="p-1 font-bold">2 (Vigenere)</td>
                        <td className="p-1 font-mono">VFR ROO (Khóa: DEATH)</td>
                        <td className="p-1">Dùng lại khóa lặp gây lộ chu kỳ</td>
                      </tr>
                      <tr className="border-b border-stone-800 text-stone-300">
                        <td className="p-1 font-bold">3 (Hash)</td>
                        <td className="p-1 font-mono">hello</td>
                        <td className="p-1 text-red-400">Hash thô không có Salt (muối)</td>
                      </tr>
                      <tr className="border-b border-stone-800 text-stone-300">
                        <td className="p-1 font-bold">4 (RSA)</td>
                        <td className="p-1 font-mono">n = 33, d = 7</td>
                        <td className="p-1 text-red-400">Số nguyên tố quá nhỏ / Khóa quá ngắn</td>
                      </tr>
                      <tr className="text-stone-300">
                        <td className="p-1 font-bold">5 (AES)</td>
                        <td className="p-1 font-mono">HELLODEATH33</td>
                        <td className="p-1 text-red-400">Chế độ ECB rò rỉ mẫu dữ liệu</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            sound.playMetalClash();
            onClose();
          }}
          className="pixel-btn pixel-btn-success text-xs mt-4 w-full py-1.5 uppercase"
        >
          TIẾP TỤC TRÒ CHƠI ▶
        </button>
      </div>
    </div>
  );
}
