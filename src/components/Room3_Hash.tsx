import { useState } from "react";
import { sound } from "./AudioEngine";

interface Room3Props {
  onLevelCleared: (nextLevel: number, message: string, bonusScore: number) => void;
  triggerAlert: (msg: string, isSuccess?: boolean) => void;
  sessionId: string;
  onGoToRoom?: (roomNum: number) => void;
}

export default function Room3_Hash({ onLevelCleared, triggerAlert, sessionId, onGoToRoom }: Room3Props) {
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedFlaw, setSelectedFlaw] = useState("");
  const [selectedDefense, setSelectedDefense] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const dbHash = "5d41402abc4b2a76b9719d911017c592";

  const handleSubmit = async () => {
    if (!passwordInput.trim()) {
      triggerAlert("Hãy nhập mật khẩu giải băm để mở khóa thiết bị!", false);
      return;
    }
    if (!selectedFlaw) {
      triggerAlert("Hãy xác định lỗ hổng bảo mật của cơ chế lưu trữ này!", false);
      return;
    }
    if (!selectedDefense) {
      triggerAlert("Hãy đề xuất giải pháp phòng vệ mật mã phù hợp!", false);
      return;
    }

    try {
      const res = await fetch("/api/verify_hash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          password: passwordInput,
          flaw: selectedFlaw,
          defense: selectedDefense,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        sound.playSuccess();
        setSuccessMessage(data.message);
        setShowExplanation(true);
      } else {
        triggerAlert(data.message || "Báo lỗi: Mật mã hoặc lựa chọn thiết kế sai lệch...", false);
      }
    } catch (err) {
      triggerAlert("Cỗ máy cơ quan băm chập mạch, không thể xác thực...", false);
    }
  };

  const handleCloseExplanation = () => {
    setShowExplanation(false);
    onLevelCleared(4, successMessage, 300);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d0a08] text-[#ebdcb9] font-pixel p-4 flex flex-col justify-between select-none">
      {/* Background decoration lines */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85))] z-0" />
      
      {/* Header */}
      <div className="z-10 flex justify-between items-center border-b-4 border-[#3c2a1a] pb-2">
        <div className="text-[#00ff00] text-[10px] md:text-xs tracking-wider animate-pulse">
          SYSTEM_DECRYPTOR_V3.0
        </div>
        <div className="text-red-500 text-[10px] md:text-xs">
          HẦM NGẦM HASH & SALT
        </div>
      </div>

      {/* Main Grid content */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-2 flex-grow overflow-y-auto pr-1">
        {/* Left column: Console & Leak info */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="pixel-card flex-grow flex flex-col justify-between">
            <div>
              <div className="text-[#ffaa00] text-xs font-bold border-b border-[#3c2a1a] pb-1 mb-2">
                NHẬT KÝ HỆ THỐNG
              </div>
              <p className="text-[10px] leading-relaxed text-stone-300">
                Lục lọi đống đổ nát, bạn tìm thấy một ổ cứng lưu trữ của lính canh hầm ngầm. Trên màn hình máy tính CRT chập chờn, bảng dữ liệu tài khoản bị rò rỉ:
              </p>
              
              {/* Leaked DB Table View */}
              <div className="bg-black/90 p-2 border-2 border-[#3c2a1a] font-mono text-[9px] mt-3">
                <div className="text-green-500 border-b border-stone-800 pb-1 mb-1 grid grid-cols-3">
                  <span>USER</span>
                  <span className="col-span-2">HASH (MD5)</span>
                </div>
                <div className="grid grid-cols-3 text-stone-400">
                  <span className="text-white">admin</span>
                  <span className="col-span-2 text-amber-500 break-all select-text">{dbHash}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-[#3c2a1a]">
              <div className="text-red-400 text-[9px]">GỢI Ý QUẠ ĐEN:</div>
              <p className="text-[9px] text-stone-400 italic mt-1 leading-normal">
                "Hệ thống băm thô (MD5) không thêm 'muối' rất dễ bị giải mã ngược. Hãy tra bảng băm phổ biến trực tuyến để tìm mật khẩu thô của chuỗi '{dbHash.substring(0, 8)}...'.
                Có thể nó là một từ chào hỏi rất phổ biến đấy!"
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Interactive decryptor puzzle */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <div className="pixel-card flex-grow flex flex-col justify-between gap-3">
            <div>
              <div className="text-[#ffaa00] text-xs font-bold border-b border-[#3c2a1a] pb-1 mb-3">
                BẢNG ĐIỀU KHIỂN CƠ QUAN
              </div>

              {/* Input field for plaintext */}
              <div className="mb-4">
                <label className="block text-[10px] text-stone-300 mb-1">
                  MẬT KHẨU GIẢI BĂM (BẢN RÕ):
                </label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu tìm được..."
                  className="w-full bg-black border-2 border-[#5c402b] text-white px-2 py-1.5 text-xs font-mono focus:border-[#ffaa00] focus:outline-none font-pixel"
                />
              </div>

              {/* Selection of vulnerability */}
              <div className="mb-4">
                <label className="block text-[10px] text-stone-300 mb-1">
                  1. PHÁT HIỆN LỖ HỔNG THIẾT KẾ:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3a2c20] cursor-pointer hover:border-amber-700">
                    <input
                      type="radio"
                      name="flaw"
                      value="weak_algorithm"
                      checked={selectedFlaw === "weak_algorithm"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedFlaw("weak_algorithm");
                      }}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-400">
                      Thuật toán MD5 quá chậm để mã hóa dữ liệu lớn
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3a2c20] cursor-pointer hover:border-amber-700">
                    <input
                      type="radio"
                      name="flaw"
                      value="no_salt"
                      checked={selectedFlaw === "no_salt"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedFlaw("no_salt");
                      }}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-100 font-pixel">
                      Lưu mật khẩu dạng Hash thô không có Salt (muối) làm lộ mật khẩu qua Rainbow Table
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3a2c20] cursor-pointer hover:border-amber-700">
                    <input
                      type="radio"
                      name="flaw"
                      value="small_modulus"
                      checked={selectedFlaw === "small_modulus"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedFlaw("small_modulus");
                      }}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-400">
                      Lưu dữ liệu mà không mã hóa bất đối xứng khóa riêng tư
                    </span>
                  </label>
                </div>
              </div>

              {/* Selection of defense */}
              <div>
                <label className="block text-[10px] text-stone-300 mb-1">
                  2. GIẢI PHÁP KHẮC PHỤC HỢP LỆ:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3a2c20] cursor-pointer hover:border-amber-700">
                    <input
                      type="radio"
                      name="defense"
                      value="caesar"
                      checked={selectedDefense === "caesar"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedDefense("caesar");
                      }}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-400">
                      Mã hóa toàn bộ cơ sở dữ liệu bằng mật mã dịch chuyển Caesar k=3
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3a2c20] cursor-pointer hover:border-amber-700">
                    <input
                      type="radio"
                      name="defense"
                      value="sha256_plain"
                      checked={selectedDefense === "sha256_plain"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedDefense("sha256_plain");
                      }}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-400">
                      Chuyển sang băm bằng SHA-256 thô không cần thêm muối để tăng tốc độ
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3a2c20] cursor-pointer hover:border-amber-700">
                    <input
                      type="radio"
                      name="defense"
                      value="bcrypt"
                      checked={selectedDefense === "bcrypt"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedDefense("bcrypt");
                      }}
                      className="mt-0.5 accent-amber-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-100 font-pixel">
                      Sử dụng Bcrypt / PBKDF2 kết hợp Salt ngẫu nhiên được sinh mới cho từng tài khoản
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              {onGoToRoom && (
                <button
                  onClick={() => {
                    sound.playDoorOpen();
                    onGoToRoom(2);
                  }}
                  className="pixel-btn text-[10px] w-1/3"
                >
                  ◀ Lùi phòng
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="pixel-btn pixel-btn-success text-[10px] flex-grow"
              >
                NỘP ÁNH SÁNG GIẢI MÃ ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spooky Knowledge Explanation Modal overlay */}
      {showExplanation && (
        <div className="absolute inset-0 bg-black/95 z-55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="pixel-card max-w-[600px] w-full text-stone-200 border-red-900 bg-[#1c120c] flex flex-col justify-between">
            <div>
              <div className="text-red-500 text-sm font-bold border-b-2 border-red-950 pb-2 mb-3 tracking-widest text-center">
                THƯ TỊCH CỔ: HÀM BĂM & SALT
              </div>
              
              <div className="text-[9px] text-stone-400 font-mono mb-2 text-right">
                CHUYÊN ĐỀ: BẢO MẬT MẬT KHẨU
              </div>

              <div className="space-y-3 text-[10px] leading-relaxed max-h-[300px] overflow-y-auto pr-2 font-pixel">
                <div className="bg-black/30 p-2 border-l-4 border-[#ffaa00]">
                  <strong className="text-[#ffaa00]">1. Hàm băm là gì?</strong>
                  <p className="mt-1 text-stone-300">
                    Hàm băm mật mã học (như MD5, SHA-256) nhận vào một đầu vào có độ dài bất kỳ và chuyển đổi thành một chuỗi bản mã có độ dài cố định. Hàm băm là một chiều (không thể dịch ngược toán học trực tiếp từ bản mã sang bản rõ).
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-red-700">
                  <strong className="text-red-400">2. Lỗ hổng Hash không Salt (Băm không muối)</strong>
                  <p className="mt-1 text-stone-300">
                    Khi lưu mật khẩu thô chỉ qua hàm băm đơn giản, các mật khẩu giống nhau sẽ cho ra chuỗi hash giống nhau. Tin tặc xây dựng các bảng chứa hàng tỷ mật khẩu thông dụng băm sẵn (gọi là **Rainbow Tables**). Khi lấy được cơ sở dữ liệu băm thô, hacker chỉ việc đối chiếu ngược là tìm ra mật khẩu trong vài giây.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-emerald-600">
                  <strong className="text-emerald-400">3. Giải pháp phòng chống: Salt (Muối mật mã)</strong>
                  <p className="mt-1 text-stone-300">
                    **Salt** là một chuỗi ký tự ngẫu nhiên được tự động sinh ra và ghép thêm vào trước khi thực hiện hàm băm mật khẩu. Vì Salt của mỗi người dùng là duy nhất và ngẫu nhiên, các mật khẩu giống nhau sẽ cho ra các chuỗi hash hoàn toàn khác nhau. Điều này triệt tiêu hoàn toàn hiệu quả của việc tấn công bằng Rainbow Tables.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseExplanation}
              className="pixel-btn pixel-btn-success text-xs mt-5 w-full uppercase tracking-wider py-2"
            >
              HIỂU RÕ KIẾN THỨC - TIẾN BƯỚC ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
