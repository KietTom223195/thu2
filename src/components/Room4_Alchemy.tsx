import { useState } from "react";
import { sound } from "./AudioEngine";

interface Room4Props {
  onLevelCleared: (nextLevel: number, message: string, bonusScore: number) => void;
  triggerAlert: (msg: string, isSuccess?: boolean) => void;
  sessionId: string;
  onGoToRoom?: (roomNum: number) => void;
}

export default function Room4_Alchemy({ onLevelCleared, triggerAlert, sessionId, onGoToRoom }: Room4Props) {
  const [bookletOpen, setBookletOpen] = useState(false);
  const [nInput, setNInput] = useState("");
  const [dInput, setDInput] = useState("");
  const [selectedFlaw, setSelectedFlaw] = useState("");
  const [isHammering, setIsHammering] = useState(false);
  const [keyCastSuccess, setKeyCastSuccess] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmitRSA = async () => {
    if (!nInput || !dInput) {
      triggerAlert("Hãy nập đầy đủ thông số n và d vào khuôn rèn!", false);
      return;
    }
    if (!selectedFlaw) {
      triggerAlert("Hãy chỉ ra lỗ hổng thiết kế của lò đúc khóa giả kim này!", false);
      return;
    }

    setIsHammering(true);
    sound.playMetalClash();

    setTimeout(async () => {
      setIsHammering(false);
      try {
        const res = await fetch("/api/verify_rsa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ n: nInput, d: dInput, flaw: selectedFlaw }),
        });

        const data = await res.json();
        if (res.ok && data.status === "success") {
          setKeyCastSuccess(true);
          sound.playSuccess();
          setSuccessMessage(data.message);
          setShowExplanation(true);
        } else {
          triggerAlert(data.message || "Xử lý đúc nguội tắt lạnh vì rò khí hỏng...", false);
        }
      } catch (err) {
        triggerAlert("Có biến động lượng tử cản trở quá trình nung chảy...", false);
      }
    }, 800);
  };

  const handleCloseExplanation = () => {
    setShowExplanation(false);
    onLevelCleared(5, successMessage, 400); // Transitions to Level 5 (AES)
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#140805] text-[#ebdcb9] font-pixel p-4 flex flex-col justify-between select-none">
      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85))] z-0" />
      
      {/* Header */}
      <div className="z-10 flex justify-between items-center border-b-4 border-[#3c1810] pb-2">
        <div className="text-red-500 text-[10px] md:text-xs tracking-wider animate-pulse">
          FORGE_CONTROLLER_V4.0
        </div>
        <div className="text-red-400 text-[10px] md:text-xs">
          LÒ LUYỆN CHÌ RSA
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-2 flex-grow overflow-y-auto pr-1">
        {/* Left Side: Instructions and Formulas */}
        <div className="md:col-span-5 flex flex-col gap-3">
          <div className="pixel-card flex-grow flex flex-col justify-between">
            <div>
              <div className="text-[#ffaa00] text-xs font-bold border-b border-[#3c1810] pb-1 mb-2">
                BÍ THƯ GIẢ KIM (RSA)
              </div>
              <p className="text-[10px] leading-relaxed text-stone-300 mb-2">
                Hệ thống yêu cầu rèn một chiếc chìa khóa cơ từ hai số nguyên tố bí truyền p = 3 và q = 11, sử dụng số mũ công khai e = 3.
              </p>

              {/* RSA cheat-sheet math */}
              <div className="bg-black/90 p-2.5 border border-[#3c1810] font-mono text-[9px] text-[#ffdf9c] space-y-1 mt-2">
                <div>• Tính tích khóa: n = p * q</div>
                <div>• Tính hàm Euler: phi(n) = (p-1) * (q-1)</div>
                <div>• Tìm số mũ bí mật d: (d * e) % phi(n) = 1</div>
                <div className="text-red-400 mt-1 border-t border-stone-800 pt-1">
                  * Khai căn khóa d: Tìm số nguyên d sao cho d * 3 chia cho phi(n) dư 1.
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-[#3c1810]">
              <button
                onClick={() => {
                  sound.playDoorOpen();
                  setBookletOpen(true);
                }}
                className="pixel-btn text-[9px] w-full text-center"
              >
                MỞ HƯỚNG DẪN RÈN CỔ 📖
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Inputs & Flaw Detection */}
        <div className="md:col-span-7 flex flex-col gap-3">
          <div className="pixel-card flex-grow flex flex-col justify-between gap-3">
            <div>
              <div className="text-[#ffaa00] text-xs font-bold border-b border-[#3c1810] pb-1 mb-3">
                RÈN CHÌA KHÓA BÍ MẬT (PRIVATE KEY)
              </div>

              {/* Calculator Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[9px] text-stone-300 mb-1">
                    TÍCH SỐ MÔ-ĐUN n:
                  </label>
                  <input
                    type="number"
                    value={nInput}
                    onChange={(e) => setNInput(e.target.value)}
                    placeholder="Tính n..."
                    className="w-full bg-black border-2 border-[#5c2a1c] text-white px-2 py-1 text-xs font-mono focus:border-red-500 focus:outline-none font-pixel"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-stone-300 mb-1">
                    SỐ MŨ BÍ MẬT d:
                  </label>
                  <input
                    type="number"
                    value={dInput}
                    onChange={(e) => setDInput(e.target.value)}
                    placeholder="Tính d..."
                    className="w-full bg-black border-2 border-[#5c2a1c] text-white px-2 py-1 text-xs font-mono focus:border-red-500 focus:outline-none font-pixel"
                  />
                </div>
              </div>

              {/* Security Flaw selection */}
              <div>
                <label className="block text-[10px] text-stone-300 mb-1">
                  PHÁT HIỆN LỖ HỔNG KHÓA VỪA ĐÚC:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="rsa_flaw"
                      value="no_padding"
                      checked={selectedFlaw === "no_padding"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedFlaw("no_padding");
                      }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-400">
                      Thiếu cơ chế đệm thông tin (Padding) PKCS#1 khi mã hóa bản rõ
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="rsa_flaw"
                      value="small_primes"
                      checked={selectedFlaw === "small_primes"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedFlaw("small_primes");
                      }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-100 font-pixel">
                      Sử dụng số nguyên tố quá nhỏ (3 và 11) dẫn đến n=33 dễ bị phân tích thừa số nguyên tố để dò khóa d
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="rsa_flaw"
                      value="bad_rng"
                      checked={selectedFlaw === "bad_rng"}
                      onChange={() => {
                        sound.playMetalClash();
                        setSelectedFlaw("bad_rng");
                      }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[9px] leading-normal text-stone-400">
                      Sử dụng bộ sinh số ngẫu nhiên đồng dư tuyến tính (LCG) có tính dự đoán trước
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {onGoToRoom && (
                <button
                  onClick={() => {
                    sound.playDoorOpen();
                    onGoToRoom(3); // Room 3 is Hash
                  }}
                  className="pixel-btn text-[10px] w-1/3"
                >
                  ◀ Lùi phòng
                </button>
              )}
              <button
                onClick={handleSubmitRSA}
                className={`pixel-btn pixel-btn-success text-[10px] flex-grow ${
                  isHammering ? "animate-pulse" : ""
                }`}
                disabled={isHammering}
              >
                {isHammering ? "🔨 ĐANG QUAI BÚA..." : "ĐẬP BÚA RÈN KHÓA d ▶"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* booklet popup manual */}
      {bookletOpen && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="pixel-card max-w-[480px] w-full text-stone-200 border-amber-800 bg-[#251710] flex flex-col justify-between">
            <div>
              <div className="text-amber-500 text-xs font-bold border-b border-[#3c1810] pb-1.5 mb-2 uppercase text-center">
                SỔ TAY THỢ RÈN RSA
              </div>
              <div className="text-[9px] text-stone-300 space-y-2 leading-relaxed max-h-[250px] overflow-y-auto pr-1">
                <p>
                  Thuật toán RSA sinh hai khóa: Công khai (e, n) để mã hóa, và Bí mật (d, n) để giải mã.
                </p>
                <p className="bg-black/40 p-2 font-mono text-amber-500 border border-amber-900/50">
                  Ví dụ rèn khóa với p=3, q=11, e=3:<br/>
                  1. Mô-đun n = p * q = 3 * 11 = 33.<br/>
                  2. Euler phi(n) = (p-1) * (q-1) = 2 * 10 = 20.<br/>
                  3. Tìm d sao cho (d * 3) chia cho 20 dư 1.<br/>
                     d=7 là nghiệm vì (7 * 3) = 21, 21 chia 20 dư 1!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playMetalClash();
                setBookletOpen(false);
              }}
              className="pixel-btn text-[10px] mt-4 w-full"
            >
              ĐÓNG SÁCH RÈN
            </button>
          </div>
        </div>
      )}

      {/* Spooky Knowledge Explanation Modal overlay */}
      {showExplanation && (
        <div className="absolute inset-0 bg-black/95 z-55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="pixel-card max-w-[600px] w-full text-stone-200 border-red-900 bg-[#1c120c] flex flex-col justify-between">
            <div>
              <div className="text-red-500 text-sm font-bold border-b-2 border-red-950 pb-2 mb-3 tracking-widest text-center">
                THƯ TỊCH CỔ: MẬT MÃ BẤT ĐỐI XỨNG RSA
              </div>
              
              <div className="text-[9px] text-stone-400 font-mono mb-2 text-right">
                CHUYÊN ĐỀ: PHÂN TÍCH THỪA SỐ NGUYÊN TỐ
              </div>

              <div className="space-y-3 text-[10px] leading-relaxed max-h-[300px] overflow-y-auto pr-2 font-pixel">
                <div className="bg-black/30 p-2 border-l-4 border-[#ffaa00]">
                  <strong className="text-[#ffaa00]">1. Nguyên lý bất đối xứng:</strong>
                  <p className="mt-1 text-stone-300">
                    RSA sử dụng hai khóa khác nhau: Khóa công khai dùng để mã hóa (phổ biến rộng rãi) và Khóa bí mật dùng để giải mã (giữ bảo mật). An toàn của RSA dựa trên bài toán khó phân tích một số lớn n thành tích của hai số nguyên tố lớn p và q.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-red-700">
                  <strong className="text-red-400">2. Lỗ hổng số nguyên tố nhỏ (Small Primes):</strong>
                  <p className="mt-1 text-stone-300">
                    Khi sinh khóa, nếu chọn các số nguyên tố p và q quá nhỏ (ví dụ 3 và 11 như trên lò rèn), tích số n = 33 có thể bị phân tích thừa số nguyên tố ngay lập tức. Bất cứ ai cũng có thể tìm được p và q, tính ra hàm Euler phi(n), và dễ dàng tìm được khóa giải mã bí mật d.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-emerald-600">
                  <strong className="text-emerald-400">3. Tiêu chuẩn công nghệ hiện đại:</strong>
                  <p className="mt-1 text-stone-300">
                    Trong các hệ thống thực tế, các số nguyên tố p và q phải được chọn ngẫu nhiên cực kỳ lớn, sao cho độ dài của mô-đun n đạt ít nhất **2048-bit** hoặc **4096-bit** để chống lại các thuật toán phân tích số nguyên tố siêu việt.
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
