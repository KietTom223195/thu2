import { useState, useEffect, useRef } from "react";
import { sound } from "./AudioEngine";

interface Room5Props {
  onLevelCleared: (nextLevel: number, message: string, bonusScore: number, finalMetrics?: any) => void;
  triggerAlert: (msg: string, isSuccess?: boolean) => void;
  sessionId: string;
  onGoToRoom?: (roomNum: number) => void;
}

// Highly authentic AES-128 state decryption simulator
function getAESSteps(key: string) {
  const cleanKey = key.trim().toUpperCase();
  const isCorrect = cleanKey === "HELLODEATH33";
  
  const getRoundKey = (r: number) => {
    const bytes = Array.from({ length: 16 }).map((_, idx) => {
      const charVal = cleanKey.charCodeAt(idx % (cleanKey.length || 1)) || 0x41;
      return (charVal ^ (r * 0x3d) ^ (idx * 0x17)) & 0xFF;
    });
    return [
      bytes.slice(0, 4),
      bytes.slice(4, 8),
      bytes.slice(8, 12),
      bytes.slice(12, 16)
    ];
  };

  // Plaintext state (HELLODEATH33 padded with spaces)
  let plainState: number[][];
  if (isCorrect) {
    plainState = [
      [0x48, 0x45, 0x4C, 0x4C], // H E L L
      [0x4F, 0x44, 0x45, 0x41], // O D E A
      [0x54, 0x48, 0x33, 0x33], // T H 3 3
      [0x20, 0x20, 0x20, 0x20]  // spaces
    ];
  } else {
    const hashSum = Array.from(cleanKey).reduce((sum, c) => sum + c.charCodeAt(0), 0) || 73;
    plainState = Array.from({ length: 4 }).map((_, r) =>
      Array.from({ length: 4 }).map((_, c) => {
        const val = (hashSum * (r + 1) * (c + 1) + 0x2A) & 0xFF;
        return val < 0x20 || val > 0x7E ? (0x41 + (val % 26)) : val;
      })
    );
  }

  const stepsList: any[] = [];
  let state = JSON.parse(JSON.stringify(plainState));

  // Run backward loops to construct the ciphertext matrix for Round 10
  for (let r = 0; r <= 10; r++) {
    const rKey = getRoundKey(r);
    
    // Step 1: AddRoundKey simulation (XOR)
    const arkState = state.map((row: number[], rowIdx: number) =>
      row.map((val: number, colIdx: number) => (val ^ rKey[rowIdx][colIdx]) & 0xFF)
    );

    // Step 2: Inverse shift rows simulation
    let srState = JSON.parse(JSON.stringify(arkState));
    if (r > 0) {
      for (let rowIdx = 1; rowIdx < 4; rowIdx++) {
        const tempRow = srState[rowIdx];
        srState[rowIdx] = [
          ...tempRow.slice(rowIdx),
          ...tempRow.slice(0, rowIdx)
        ];
      }
    }

    // Step 3: Inverse SubBytes simulation
    const subState = srState.map((row: number[]) =>
      row.map((val: number) => (val ^ 0x5C) & 0xFF)
    );

    // Step 4: Inverse MixColumns simulation for intermediate rounds
    let mixState = JSON.parse(JSON.stringify(subState));
    if (r > 0 && r < 10) {
      for (let col = 0; col < 4; col++) {
        const c0 = mixState[0][col];
        const c1 = mixState[1][col];
        const c2 = mixState[2][col];
        const c3 = mixState[3][col];
        mixState[0][col] = (c0 ^ 3) & 0xFF;
        mixState[1][col] = (c1 ^ 7) & 0xFF;
        mixState[2][col] = (c2 ^ 11) & 0xFF;
        mixState[3][col] = (c3 ^ 13) & 0xFF;
      }
    }

    stepsList.push({
      round: r,
      stepName: r === 10 ? "CHIẾT XUẤT THÔ (CIPHERTEXT END)" : r === 0 ? "BƯỚC GIẢI MÃ CUỐI (ROUND 0 STATE)" : `VÒNG GIẢI MÃ PHÂN TÁCH ${r}`,
      description: r === 10 
        ? "Cơ cấu mã hóa cấp quân sự AES-128 của Lõi Thời Không. Hãy liên kết các kết quả từ các căn phòng trước thành một chuỗi văn bản làm Khóa Giải Mã để kích hoạt chu trình ngược!" 
        : r === 0 
        ? "Round 0: Phép toán XOR với Round Key 0 hoàn tất đảo ngược mật mã học. Giải phóng toàn bộ tệp byte chứa chữ rõ rõ nghĩa!"
        : `Vòng r=${r}: Tính toán nghịch đảo ma trận MixColumns trên GF(2^8), dịch chuyển hàng InvShiftRows cơ học, thay thế byte qua bảng S-Box nghịch đảo (InvSubBytes), và bóc tách khóa con AddRoundKey ${r}.`,
      state: JSON.parse(JSON.stringify(state)),
      roundKey: rKey
    });

    state = mixState;
  }

  return stepsList.reverse();
}

export default function Room5_Cryptex({ onLevelCleared, triggerAlert, sessionId, onGoToRoom }: Room5Props) {
  const [aesKey, setAesKey] = useState("");
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [selectedFlaw, setSelectedFlaw] = useState("");
  const [selectedDefense, setSelectedDefense] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [finalMetricsData, setFinalMetricsData] = useState<any>(null);

  const [slider1, setSlider1] = useState(60);
  const [slider2, setSlider2] = useState(40);
  const [knob1, setKnob1] = useState(45);
  const [powerOn, setPowerOn] = useState(true);
  const [oscillationSpeed, setOscillationSpeed] = useState(1);
  const [bubbles, setBubbles] = useState<{ id: number; bottom: number; left: number; rate: number }[]>([]);

  // AES Interactive Simulation States
  const [aesRound, setAesRound] = useState(10);
  const [aesSteps, setAesSteps] = useState<any[]>(getAESSteps(""));
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showASCII, setShowASCII] = useState(false);

  useEffect(() => {
    setAesSteps(getAESSteps(aesKey));
  }, [aesKey]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (aesRound === 0) {
      setIsAutoPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setAesRound((prev) => prev - 1);
      sound.playMetalClash();
    }, 600);
    return () => clearTimeout(timer);
  }, [isAutoPlaying, aesRound]);

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return;
    }
    setAesRound(10);
    setIsAutoPlaying(true);
    sound.playSuccess();
    triggerAlert("Bắt đầu chu trình chạy giải mã AES-128 tự động từ Vòng 10 xuống Vòng 0...", true);
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate bubbling particles
  useEffect(() => {
    const initialBubbles = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      bottom: Math.random() * 80,
      left: 15 + Math.random() * 70,
      rate: 1.5 + Math.random() * 2,
    }));
    setBubbles(initialBubbles);

    const interval = setInterval(() => {
      setBubbles((prev) =>
        prev.map((b) => {
          let nextBottom = b.bottom + b.rate;
          if (nextBottom > 100) {
            nextBottom = 0;
            return { ...b, bottom: 0, left: 15 + Math.random() * 70 };
          }
          return { ...b, bottom: nextBottom };
        })
      );
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // Oscilloscope drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frameId: number;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = "#0c1710";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(40, 240, 40, 0.15)";
      ctx.lineWidth = 0.5;
      for (let x = 10; x < canvas.width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 10; y < canvas.height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(40, 240, 40, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.strokeStyle = "#3bf145";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#3bf145";
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const freq = 0.08 * oscillationSpeed;
        const amplitude = 14 + (slider1 / 8);
        const y = canvas.height / 2 + Math.sin(x * freq + offset) * amplitude + Math.cos(x * 0.03 - offset) * (amplitude / 3);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (Math.random() > 0.93) {
        ctx.strokeStyle = "#39ff14";
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 5);
        ctx.lineTo(canvas.width / 2 + 5, 45);
        ctx.stroke();
      }

      offset += 0.05 * oscillationSpeed;
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [slider1, oscillationSpeed]);

  const handleSubmitAES = async () => {
    if (!aesKey) {
      triggerAlert("Hãy nạp khóa kích hoạt để liên hợp thời không!", false);
      return;
    }

    try {
      const res = await fetch("/api/verify_aes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          aes_key: aesKey,
          flaw: selectedFlaw,
          defense: selectedDefense
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        sound.playSuccess();
        setSuccessMessage(data.message);
        setFinalMetricsData({
          totalScore: data.total_score,
          elapsedTime: data.elapsed_time,
        });
        setShowSecurityModal(false);
        setShowExplanation(true);
      } else {
        triggerAlert(data.message || "Tích tắc! Phản ứng nhiệt của cỗ máy quá tải, mật mã sai lầm...", false);
      }
    } catch (err) {
      triggerAlert("Có luồng nhiễu từ trường phong tỏa bảng mã...", false);
    }
  };

  const handleCloseExplanation = () => {
    setShowExplanation(false);
    onLevelCleared(6, successMessage, 500, finalMetricsData);
  };

  const togglePower = () => {
    sound.playMetalClash();
    setPowerOn(!powerOn);
    setOscillationSpeed(powerOn ? 0.1 : 1);
    triggerAlert(powerOn ? "Tắt nguồn chính! Hệ thống giảm tần động năng." : "Bật nguồn chính! Cỗ máy rít lên kịch liệt.", true);
  };

  const currentRoundData = aesSteps[10 - aesRound] || { state: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d1410] font-pixel text-[#ebdcb9] flex flex-col justify-between select-none">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.9))] z-10" />

      {/* Header Bar to prevent overlapping with close button and keep design clean */}
      <div className="w-full h-[44px] shrink-0 flex items-center justify-between px-3 border-b border-green-950/60 bg-black/40 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onGoToRoom) {
                sound.playDoorOpen();
                onGoToRoom(4);
              }
            }}
            className="w-7 h-7 rounded-full border border-green-800 bg-[#162a1e] hover:bg-[#1f3d2b] text-green-200 flex items-center justify-center font-bold shadow transition-transform hover:scale-105 cursor-pointer font-serif text-sm"
            title="Quay lại phòng trước"
          >
            ↰
          </button>
          <div className="w-7 h-7 rounded-full border border-green-800 bg-[#0d1612] flex items-center justify-center font-sans font-bold text-green-400 text-xs shadow">
            5
          </div>
          <span className="text-[9px] text-green-500 font-bold uppercase tracking-wider ml-1 font-pixel">
            [PHÒNG 5] CỔ TRẬN LÕI CƠ AES-128
          </span>
        </div>
        {/* Keep right side empty so that Dialog close [X] button doesn't overlap */}
        <div className="w-20" />
      </div>

      {/* Main Interactive Screen */}
      <div className="flex-grow w-full flex flex-col justify-between p-3 z-20 pb-0">
        <div className="grid grid-cols-12 gap-3.5 flex-grow items-stretch my-1.5">
          
          {/* LEFT: AES Key input & Cryptex cylinders (Width: 4/12) */}
          <div className="col-span-12 md:col-span-4 pixel-card flex flex-col justify-between gap-3">
            <div>
              <div className="text-green-500 text-xs font-bold border-b border-[#1b3a2a] pb-1 mb-2">
                [1] KHÓA LIÊN HỢP THỜI KHÔNG
              </div>
              <p className="text-[9px] text-stone-400 leading-normal">
                Nhập mật mã cuối gồm 12 ký tự viết liền ghép từ: Màn 1 (HELLO) + Màn 2 (DEATH) + Màn 4 (n=33).
              </p>

              <div className="mt-3">
                <input
                  type="text"
                  value={aesKey}
                  onChange={(e) => setAesKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
                  placeholder="Nhập khóa 12 ký tự..."
                  className="w-full bg-black border-2 border-green-950 text-green-400 px-2 py-1.5 text-xs font-mono focus:border-green-500 focus:outline-none tracking-[2px] font-pixel"
                />
              </div>

              {/* Cylinders Status list */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-[9px] bg-black/40 p-1.5 border border-green-950/40">
                  <span className="text-stone-400">MẢNH 1 (CAESAR):</span>
                  <span className="text-green-400 font-bold font-mono">HELLO</span>
                </div>
                <div className="flex justify-between items-center text-[9px] bg-black/40 p-1.5 border border-green-950/40">
                  <span className="text-stone-400">MẢNH 2 (VIGENERE):</span>
                  <span className="text-green-400 font-bold font-mono">DEATH</span>
                </div>
                <div className="flex justify-between items-center text-[9px] bg-black/40 p-1.5 border border-green-950/40">
                  <span className="text-stone-400">MẢNH 3 (RSA n):</span>
                  <span className="text-green-400 font-bold font-mono">33</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#1b3a2a] pt-2 text-[9px] text-stone-400">
              <span className="text-red-400 font-bold">MỤC TIÊU PHÒNG 5:</span>
              <p className="mt-1 leading-normal">
                Đưa vòng chạy giải mã về Vòng 0 để bộc lộ hoàn toàn bản rõ "HELLODEATH33" trên ma trận 4x4, sau đó nhấn "KÍCH HOẠT THỜI GIAN" và chỉ cấu hình vá lỗi mật mã.
              </p>
            </div>
          </div>

          {/* MIDDLE: 4x4 Decryption State Matrix (Width: 5/12) */}
          <div className="col-span-12 md:col-span-5 pixel-card flex flex-col justify-between items-center">
            <div className="w-full text-center">
              <span className="text-green-500 text-xs font-bold border-b border-[#1b3a2a] pb-1 mb-2 block uppercase">
                [2] MA TRẬN TRẠNG THÁI AES (ROUND {aesRound})
              </span>
            </div>

            {/* 4x4 Grid Board */}
            <div className="grid grid-cols-4 gap-2.5 my-3 p-3 bg-black/60 border-2 border-green-950 rounded-lg">
              {currentRoundData.state.map((row: number[], rIdx: number) =>
                row.map((val: number, cIdx: number) => {
                  const displayAscii = val >= 32 && val <= 126 ? String.fromCharCode(val) : ".";
                  const isMatchChar = val === "HELLODEATH33".charCodeAt(rIdx * 4 + cIdx % 12);
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-14 h-14 border-2 flex flex-col justify-center items-center relative rounded shadow-md transition-all ${
                        aesRound === 0 && isMatchChar
                          ? "bg-green-950/60 border-green-400 text-green-300 scale-105"
                          : "bg-stone-900/80 border-stone-700 text-stone-300"
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">
                        {showASCII ? `'${displayAscii}'` : val.toString(16).toUpperCase().padStart(2, "0")}
                      </span>
                      <span className="text-[6px] text-stone-500 font-mono mt-1">
                        {showASCII ? `0x${val.toString(16).toUpperCase()}` : `'${displayAscii}'`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Matrix Controls */}
            <div className="w-full flex justify-between gap-2">
              <button
                disabled={isAutoPlaying || aesRound >= 10}
                onClick={() => {
                  sound.playMetalClash();
                  setAesRound((prev) => Math.min(10, prev + 1));
                }}
                className="pixel-btn text-[9px] flex-1"
              >
                ◄ TRƯỚC
              </button>
              <button
                onClick={handleAutoPlay}
                className={`pixel-btn flex-1 text-[9px] ${
                  isAutoPlaying ? "pixel-btn-danger animate-pulse" : "pixel-btn-success"
                }`}
              >
                {isAutoPlaying ? "⏹ DỪNG" : "▶ TỰ CHẠY"}
              </button>
              <button
                disabled={isAutoPlaying || aesRound <= 0}
                onClick={() => {
                  sound.playMetalClash();
                  setAesRound((prev) => Math.max(0, prev - 1));
                }}
                className="pixel-btn text-[9px] flex-1"
              >
                BƯỚC TIẾP ►
              </button>
              <button
                onClick={() => {
                  sound.playMetalClash();
                  setShowASCII(!showASCII);
                }}
                className="pixel-btn text-[9px]"
              >
                {showASCII ? "HEX" : "TXT"}
              </button>
            </div>
          </div>

          {/* RIGHT: Terminal Logs & Launch Button (Width: 3/12) */}
          <div className="col-span-12 md:col-span-3 pixel-card flex flex-col justify-between">
            <div>
              <span className="text-green-500 text-[10px] font-bold border-b border-[#1b3a2a] pb-1 mb-2 block">
                [3] NHẬT KÝ THUẬT TOÁN
              </span>
              <div className="w-full h-36 bg-[#040906] border border-green-950 p-2 rounded text-[7.5px] font-mono text-[#33e244] leading-relaxed overflow-y-auto">
                <p className="text-stone-400 font-bold border-b border-green-950 pb-0.5 mb-1">
                  {aesSteps[10 - aesRound]?.stepName || "CHƯA KHỞI ĐỘNG"}
                </p>
                <p>{aesSteps[10 - aesRound]?.description || "Nhập khóa hợp lệ để bắt đầu bộ tuần hoàn."}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-green-950">
              {aesRound === 0 && aesKey.trim() === "HELLODEATH33" ? (
                <div className="flex flex-col gap-1.5 text-center">
                  <span className="text-[7px] text-green-400 font-bold animate-pulse">
                    ★★ GIẢI MÃ HOÀN TẤT ★★
                  </span>
                  <button
                    onClick={() => {
                      sound.playDoorOpen();
                      setShowSecurityModal(true);
                    }}
                    className="pixel-btn pixel-btn-success text-[9px] w-full"
                  >
                    KÍCH HOẠT THỜI GIAN ▶
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1 text-center opacity-60">
                  <span className="text-[6.5px] text-stone-500 font-mono">CHỜ HOÀN TẤT GIẢI MÃ (VÒNG 0)</span>
                  <div className="bg-stone-900 border border-stone-800 text-stone-600 text-[9px] py-2">
                    ĐỢI HỆ THỐNG
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* The Control Panel Chassis (Bottom) */}
      <div 
        className="w-full h-[32%] bg-[#1a2b22] border-t-8 border-[#0d1612] relative flex justify-between px-8 pt-3 pb-2 z-20 shadow-[inset_0_4px_12px_rgba(255,255,255,0.1)]"
        style={{
          backgroundImage: "linear-gradient(to bottom, #16241c 0%, #080e0a 100%)"
        }}
      >
        {/* Sliders */}
        <div className="w-[120px] h-full bg-[#0a110d] border-2 border-green-950 rounded p-2 flex justify-around items-center">
          {[
            { val: slider1, setVal: setSlider1, label: "TẦN SỐ" },
            { val: slider2, setVal: setSlider2, label: "BIÊN ĐỘ" },
          ].map((slider, sIdx) => (
            <div key={sIdx} className="h-full flex flex-col items-center justify-between pb-1">
              <span className="text-[5px] text-stone-500">{slider.label}</span>
              <div className="relative w-3 h-16 bg-black rounded border border-green-950 flex justify-center cursor-pointer" onClick={() => slider.setVal(Math.round(Math.random()*100))}>
                <div className="absolute bottom-0 w-2 bg-green-500/20" style={{ height: `${slider.val}%` }} />
                <div className="absolute w-2.5 h-1.5 bg-stone-500 border border-black shadow" style={{ bottom: `calc(${slider.val}% - 3px)` }} />
              </div>
              <span className="text-[5.5px] font-mono text-green-500">{slider.val}%</span>
            </div>
          ))}
        </div>

        {/* Oscilloscope Green Screen */}
        <div className="w-[160px] h-full bg-[#0a110d] border-2 border-green-950 rounded p-1.5 flex flex-col items-center">
          <canvas ref={canvasRef} className="w-full flex-grow border border-green-950 bg-black" width={150} height={50} />
          <span className="text-[5px] text-green-500 font-mono mt-1">DÒ SÓNG LÕI NĂNG LƯỢNG</span>
        </div>

        {/* Controls toggles */}
        <div className="w-[110px] h-full bg-[#0a110d] border-2 border-green-950 rounded p-2 flex flex-col justify-between items-center">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={togglePower}>
            <div className="w-8 h-4 bg-black border border-green-950 rounded-full relative p-0.5 flex items-center">
              <div className={`w-3 h-3 rounded-full transition-transform duration-200 ${powerOn ? "translate-x-4 bg-green-500" : "bg-red-600"}`} />
            </div>
            <span className="text-[5px] font-mono text-stone-500">SYS_PWR</span>
          </div>

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => { setKnob1((prev) => (prev+45)%360); sound.playMetalClash(); }}>
            <div className="w-5 h-5 rounded-full bg-black border border-green-950 relative" style={{ transform: `rotate(${knob1}deg)` }}>
              <div className="absolute top-[1.5px] left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
            </div>
            <span className="text-[5px] font-mono text-stone-500">KNOB</span>
          </div>
        </div>
      </div>

      {/* Flaw and Defense configuration Sub-modal popup */}
      {showSecurityModal && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto font-pixel">
          <div className="pixel-card max-w-[500px] w-full text-stone-200 border-red-900 bg-[#1c120c] flex flex-col justify-between gap-4">
            <div>
              <div className="text-red-500 text-xs font-bold border-b border-red-950 pb-2 mb-2 text-center uppercase tracking-widest">
                ⚠ CẢNH BÁO BẢO MẬT: THIẾT LẬP AES
              </div>
              <p className="text-[9px] text-stone-400 leading-normal mb-3">
                Lõi Cryptex phát hiện sơ đồ mã hóa đối xứng AES của bạn đang bị lỗi thiết kế. Bạn phải chỉ ra lỗi và cấu hình lại chế độ an toàn để tránh sập hầm thời không!
              </p>

              {/* Selector 1: Flaw */}
              <div className="mb-4">
                <label className="block text-[9px] text-amber-500 mb-1">
                  1. CHỈ RA LỖ HỔNG MẬT MÃ HIỆN TẠI:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="aes_flaw"
                      value="cbc_fixed_iv"
                      checked={selectedFlaw === "cbc_fixed_iv"}
                      onChange={() => { sound.playMetalClash(); setSelectedFlaw("cbc_fixed_iv"); }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[8px] leading-normal text-stone-400">
                      Sử dụng chế độ mã hóa CBC kết hợp Vector khởi tạo (IV) cố định
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="aes_flaw"
                      value="ecb_mode"
                      checked={selectedFlaw === "ecb_mode"}
                      onChange={() => { sound.playMetalClash(); setSelectedFlaw("ecb_mode"); }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[8px] leading-normal text-stone-100 font-pixel">
                      Sử dụng chế độ ECB (Electronic Codebook) khiến các khối giống nhau cho ra bản mã giống nhau (Lộ mẫu hình ảnh chim Tux)
                    </span>
                  </label>
                </div>
              </div>

              {/* Selector 2: Defense */}
              <div>
                <label className="block text-[9px] text-amber-500 mb-1">
                  2. GIẢI PHÁP PHÒNG THỦ ĐỀ XUẤT:
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="aes_defense"
                      value="gcm_mode"
                      checked={selectedDefense === "gcm_mode"}
                      onChange={() => { sound.playMetalClash(); setSelectedDefense("gcm_mode"); }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[8px] leading-normal text-stone-100 font-pixel">
                      Sử dụng chế độ CBC/GCM kết hợp Vector khởi tạo (IV/Nonce) ngẫu nhiên và duy nhất cho mỗi lần mã hóa
                    </span>
                  </label>
                  <label className="flex items-start gap-2 bg-black/40 p-1.5 border border-[#3c1c14] cursor-pointer hover:border-red-800">
                    <input
                      type="radio"
                      name="aes_defense"
                      value="double_aes"
                      checked={selectedDefense === "double_aes"}
                      onChange={() => { sound.playMetalClash(); setSelectedDefense("double_aes"); }}
                      className="mt-0.5 accent-red-500"
                    />
                    <span className="text-[8px] leading-normal text-stone-400">
                      Mã hóa hai lần bằng AES-128 (Double AES) để nhân đôi kích thước khóa bảo mật
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { sound.playMetalClash(); setShowSecurityModal(false); }}
                className="pixel-btn text-[9px] w-1/3"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleSubmitAES}
                className="pixel-btn pixel-btn-success text-[9px] flex-grow"
              >
                ÁP DỤNG VÁ LỖI & PHÓNG KHỞI HÀNH ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spooky Knowledge Explanation Modal overlay */}
      {showExplanation && (
        <div className="absolute inset-0 bg-black/95 z-55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="pixel-card max-w-[600px] w-full text-stone-200 border-[#00ff00] bg-[#0c1611] flex flex-col justify-between">
            <div>
              <div className="text-green-500 text-sm font-bold border-b-2 border-green-950 pb-2 mb-3 tracking-widest text-center">
                THƯ TỊCH CỔ: MÃ HÓA ĐỐI XỨNG AES
              </div>
              
              <div className="text-[9px] text-stone-400 font-mono mb-2 text-right">
                CHUYÊN ĐỀ: CHẾ ĐỘ MÃ HÓA KHỐI (BLOCK CIPHER MODES)
              </div>

              <div className="space-y-3 text-[10px] leading-relaxed max-h-[300px] overflow-y-auto pr-2 font-pixel">
                <div className="bg-black/30 p-2 border-l-4 border-[#ffaa00]">
                  <strong className="text-[#ffaa00]">1. Mã hóa đối xứng AES:</strong>
                  <p className="mt-1 text-stone-300">
                    AES (Advanced Encryption Standard) là thuật toán mã hóa đối xứng khối được tin cậy trên toàn cầu. Nó sử dụng cùng một khóa bí mật cho cả mã hóa và giải mã, thực hiện biến đổi dữ liệu qua nhiều vòng lặp toán học phức tạp.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-red-700">
                  <strong className="text-red-400">2. Lỗi chế độ mã hóa ECB (Electronic Codebook):</strong>
                  <p className="mt-1 text-stone-300">
                    Trong chế độ ECB, mỗi khối dữ liệu 16 byte được mã hóa độc lập bằng cùng một khóa. Nghĩa là **các khối dữ liệu giống nhau ở đầu vào sẽ cho ra các khối bản mã giống hệt nhau ở đầu ra**. Điều này vô tình làm lộ các mẫu cấu trúc gốc của dữ liệu (ví dụ kinh điển là hình ảnh chim cánh cụt Tux được mã hóa bằng ECB vẫn hiển thị rõ hình dáng đường viền con chim).
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-emerald-600">
                  <strong className="text-emerald-400">3. Khắc phục: Vector khởi tạo (IV) và Chế độ CBC/GCM</strong>
                  <p className="mt-1 text-stone-300">
                    Để chống rò rỉ mẫu dữ liệu, chúng ta phải sử dụng chế độ mã hóa như **CBC** (Cipher Block Chaining) hoặc **GCM** (Galois/Counter Mode). Các chế độ này ghép (XOR) kết quả khối trước vào khối sau và sử dụng một **Vector khởi tạo (IV) ngẫu nhiên và duy nhất** cho mỗi lần mã hóa. Điều này đảm bảo hai tệp tin giống hệt nhau khi mã hóa sẽ cho ra hai bản mã hoàn toàn khác nhau.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseExplanation}
              className="pixel-btn pixel-btn-success text-xs mt-5 w-full uppercase tracking-wider py-2"
            >
              HOÀN TẤT THỬ THÁCH & THOÁT LY MẬT THẤT ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
