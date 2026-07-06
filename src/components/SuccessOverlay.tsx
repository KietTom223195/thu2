import React, { useState, useEffect } from "react";
import { sound } from "./AudioEngine";

interface SuccessProps {
  totalScore: number;
  elapsedTime: number;
  onRestart: () => void;
}

type EndStep = "fade" | "chest" | "opening" | "showResults";

export default function SuccessOverlay({ totalScore, elapsedTime, onRestart }: SuccessProps) {
  const [step, setStep] = useState<EndStep>("fade");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Step 1: Smooth transition to fade and chest presence
  useEffect(() => {
    const t = setTimeout(() => {
      setStep("chest");
    }, 1200); // 1.2s dark screen silence
    return () => clearTimeout(t);
  }, []);

  const handleChestClick = () => {
    if (step !== "chest") return;
    setStep("opening");
    sound.playDoorOpen(); // wooden chest creak sound

    // Step 2: Show victory metrics after chest opening animation finishes
    setTimeout(() => {
      setStep("showResults");
    }, 1400);
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.warn("Failed to fetch leaderboard:", e);
    }
  };

  useEffect(() => {
    if (step === "showResults") {
      fetchLeaderboard();
    }
  }, [step]);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    try {
      const res = await fetch("/api/leaderboard/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: playerName,
          score: totalScore,
          time: elapsedTime
        })
      });
      if (res.ok) {
        setIsSubmitted(true);
        sound.playSuccess();
        fetchLeaderboard(); // refresh ranking database
      }
    } catch (err) {
      console.warn("Failed to submit score:", err);
    }
  };

  let rank = "Học Viên Cryptography";
  if (totalScore >= 1000) rank = "Huyền Thoại Bẻ Khóa Thần Sầu";
  else if (totalScore >= 600) rank = "Chuyên Thần Mật Khải Sảnh";

  const chestStyles = `
    @keyframes glw {
      0% { opacity: 0.8; filter: drop-shadow(0 -4px 12px #ffd700); }
      100% { opacity: 1; filter: drop-shadow(0 -10px 28px #ffd700) drop-shadow(0 -18px 40px #ffcc00); }
    }
    @keyframes pls {
      0%, 100% { opacity: 1; transform: translateY(0); }
      50% { opacity: 0.6; transform: translateY(-4px); }
    }
  `;

  // Render ending steps
  if (step === "fade" || step === "chest" || step === "opening") {
    return (
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          transition: "background-color 1s ease-in-out",
        }}
      >
        <style>{chestStyles}</style>

        {/* Floating glowing treasure chest */}
        {(step === "chest" || step === "opening") && (
          <div 
            onClick={handleChestClick}
            style={{
              cursor: step === "chest" ? "pointer" : "default",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              transform: "scale(1.3)",
              transition: "transform 0.2s ease-out",
            }}
            className={step === "chest" ? "hover:scale-[1.45] active:scale-[1.25]" : ""}
          >
            {/* The Chest Box */}
            <div style={{
              width: "80px",
              height: "64px",
              position: "relative",
              imageRendering: "pixelated",
            }}>
              {/* Top Lid */}
              <div style={{
                width: "80px",
                height: "28px",
                backgroundColor: "#543310", // wood brown
                border: "4px solid #1a0f05",
                borderBottom: "2px solid #1a0f05",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px",
                position: "absolute",
                top: 0,
                left: 0,
                transform: step === "opening" ? "translateY(-18px) rotate(-12deg)" : "none",
                transition: "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                boxShadow: "inset 0 4px 0 rgba(255,255,255,0.15)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                zIndex: 10,
              }}>
                {/* Lock clasp */}
                <div style={{
                  width: "12px",
                  height: "10px",
                  backgroundColor: "#ffd700", // golden padlock
                  border: "2px solid #1a0f05",
                  borderTop: "none",
                  marginBottom: "-6px",
                  zIndex: 11,
                  transform: step === "opening" ? "rotate(35deg) translateY(-4px)" : "none",
                  transition: "transform 0.4s",
                }} />
                {/* Gold band highlights */}
                <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "6px", backgroundColor: "#ffd700", opacity: 0.8 }} />
                <div style={{ position: "absolute", right: "16px", top: 0, bottom: 0, width: "6px", backgroundColor: "#ffd700", opacity: 0.8 }} />
              </div>
              
              {/* Bottom Body */}
              <div style={{
                width: "80px",
                height: "36px",
                backgroundColor: "#3a2107", // dark wood brown
                border: "4px solid #1a0f05",
                borderTop: "none",
                borderBottomLeftRadius: "4px",
                borderBottomRightRadius: "4px",
                position: "absolute",
                bottom: 0,
                left: 0,
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                zIndex: 8,
              }}>
                {/* Gold band highlights */}
                <div style={{ position: "absolute", left: "16px", top: 0, bottom: 0, width: "6px", backgroundColor: "#ffd700", opacity: 0.8 }} />
                <div style={{ position: "absolute", right: "16px", top: 0, bottom: 0, width: "6px", backgroundColor: "#ffd700", opacity: 0.8 }} />
                
                {/* Glowing gold treasure inside when opened */}
                {step === "opening" && (
                  <div style={{
                    position: "absolute",
                    top: "-8px",
                    left: "6px",
                    right: "6px",
                    height: "12px",
                    background: "linear-gradient(0deg, #ffcc00, #ffffb3)",
                    borderRadius: "4px",
                    animation: "glw 0.8s ease-in-out infinite alternate",
                    zIndex: 9,
                  }} />
                )}
              </div>
            </div>
            
            {/* Chest label / prompt */}
            <div style={{
              color: "#ffd700",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              fontWeight: "bold",
              textShadow: "0 0 8px rgba(255,215,0,0.6), 2px 2px 0 #000",
              animation: "pls 1.2s ease-in-out infinite",
              marginTop: "8px",
              textAlign: "center",
              whiteSpace: "nowrap",
              letterSpacing: "1px",
            }}>
              {step === "chest" ? "🎁 CLICK VÀO RƯƠNG ĐỂ MỞ 🎁" : "ĐANG KHẢI HUYỀN RƯƠNG BÁU..."}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1d451e] via-[#040d04] to-black z-50 flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="bg-[#e6dfc3] border-[10px] border-[#1e3c20] p-6 text-[#2b2824] rounded-lg w-full max-w-[840px] shadow-2xl relative animate-fade-in font-serif">
        <h1 className="font-['Creepster'] text-red-800 text-4xl md:text-5xl drop-shadow-[0_2px_4px_black] uppercase animate-pulse text-center">
          THOÁT KHỎI PHÒNG GIAM!
        </h1>
        <p className="text-stone-700 italic text-xs mt-2 text-center leading-relaxed font-serif max-w-[600px] mx-auto">
          Gió lộng gầm rít bẻ cong dòng chảy không thời gian lỗ sụt nứt mở. Bạn rơi tự do xuyên qua luồng sáng xanh lục ngọc bích, bỏ lại phòng giam mật mã đáng sợ phía sau...
        </p>
        <hr className="border-t-2 border-green-800 my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Left Column: Your Results */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-stone-800 font-bold text-xs uppercase tracking-wider mb-2 font-sans border-b-2 border-stone-400 pb-1">
                🌟 THÀNH TÍCH CỦA BẠN
              </h2>
              <div className="bg-[#fbfcfa] border border-[#a2ac9c] p-4 rounded flex flex-col gap-3 text-stone-900 shadow-inner font-sans text-xs md:text-sm">
                <p className="flex justify-between border-b pb-1 border-stone-200">
                  <span className="font-bold text-stone-600">Điểm mật lượng:</span>
                  <span className="font-mono text-red-800 font-bold text-base">{totalScore} / 1000</span>
                </p>
                <p className="flex justify-between border-b pb-1 border-stone-200">
                  <span className="font-bold text-stone-600">Thời gian bẻ khóa:</span>
                  <span className="font-mono text-red-800 font-bold text-base">{elapsedTime} giây</span>
                </p>
                <p className="flex justify-between pb-0.5">
                  <span className="font-bold text-stone-600">Xếp loại thám mã:</span>
                  <span className="text-emerald-800 font-bold font-serif">{rank}</span>
                </p>
              </div>
            </div>

            {/* Submit Score Form */}
            <div className="mt-4 bg-[#f1ebd4] border border-[#d9cea3] p-4 rounded font-sans">
              {isSubmitted ? (
                <div className="text-emerald-800 text-xs font-bold text-center py-2 animate-bounce">
                  🎉 Đã lưu thành tích lên bảng vàng thành công!
                </div>
              ) : (
                <form onSubmit={handleSubmitScore} className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-stone-700 uppercase">
                    Khắc tên lên Bảng Vàng (Kỷ lục):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={18}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Nhập tên hiệp sĩ..."
                      className="flex-1 bg-white border border-stone-400 px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-green-800 rounded font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!playerName.trim()}
                      className="bg-green-800 hover:bg-green-700 disabled:bg-stone-400 disabled:cursor-not-allowed text-white font-bold text-[10px] px-3.5 py-1.5 uppercase transition rounded cursor-pointer"
                    >
                      Nộp 🏆
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={onRestart}
              className="bg-emerald-900 border-2 border-emerald-950 text-[#fffbef] hover:bg-emerald-700 duration-200 uppercase font-mono tracking-widest text-[10px] font-bold py-3 px-6 rounded mt-4 shadow-md shadow-emerald-900/30 cursor-pointer text-center"
            >
              Chơi lại kiếp thăng trầm
            </button>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="bg-[#f0ead2] border-4 border-[#c5b596] p-4 rounded-lg flex flex-col font-sans">
            <h2 className="text-[#634e2c] font-bold text-xs uppercase tracking-wider text-center mb-3 flex items-center justify-center gap-1">
              🏆 BẢNG VÀNG CAO THỦ 🏆
            </h2>
            <div className="flex-grow flex flex-col gap-1.5 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="text-stone-500 text-[10px] text-center py-10">Đang tải bảng vàng...</div>
              ) : (
                leaderboard.map((entry, idx) => {
                  let badge = "🥇";
                  if (idx === 1) badge = "🥈";
                  else if (idx === 2) badge = "🥉";
                  else badge = `   ${idx + 1}. `;

                  const isCurrentUserEntry = isSubmitted && entry.name === playerName.trim() && entry.score === totalScore;

                  return (
                    <div 
                      key={idx}
                      className={`flex justify-between items-center text-[11px] px-2.5 py-1.5 rounded border ${
                        isCurrentUserEntry 
                          ? "bg-amber-100 border-amber-500 font-bold" 
                          : idx < 3 
                            ? "bg-white/60 border-stone-300" 
                            : "bg-white/20 border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                        <span className="font-mono">{badge}</span>
                        <span className="truncate font-sans font-medium text-stone-900">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] text-stone-700">
                        <span className="text-red-800 font-bold">{entry.score}đ</span>
                        <span>{entry.time}s</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
