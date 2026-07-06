import { useState, useEffect } from "react";
import Room1_Hall from "./components/Room1_Hall";
import Room2_Library from "./components/Room2_Library";
import Room3_Hash from "./components/Room3_Hash";
import Room4_Alchemy from "./components/Room4_Alchemy";
import Room5_Cryptex from "./components/Room5_Cryptex";
import SuccessOverlay from "./components/SuccessOverlay";
import GuideModal from "./components/GuideModal";
import GameWorld2D from "./components/GameWorld2D";
import GuildHallEntrance from "./components/GuildHallEntrance";
import { sound } from "./components/AudioEngine";

export default function App() {
  const [sessionId] = useState(() => {
    let sid = localStorage.getItem("escapesid");
    if (!sid) {
      sid = "cryptsession_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("escapesid", sid);
    }
    localStorage.setItem("session_id", sid);
    return sid;
  });
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeRoom, setActiveRoom] = useState(1);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [showEntrance, setShowEntrance] = useState(true); // v1.1.24 - Recompile HMR
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Listen to the first interaction to start BGM loop
  useEffect(() => {
    const startAudioOnInteraction = () => {
      sound.startBGM();
      window.removeEventListener("mousedown", startAudioOnInteraction);
      window.removeEventListener("keydown", startAudioOnInteraction);
    };
    window.addEventListener("mousedown", startAudioOnInteraction);
    window.addEventListener("keydown", startAudioOnInteraction);
    return () => {
      window.removeEventListener("mousedown", startAudioOnInteraction);
      window.removeEventListener("keydown", startAudioOnInteraction);
    };
  }, []);

  const toggleMute = () => {
    const newMute = !isMuted;
    sound.setMute(newMute);
    setIsMuted(newMute);
    if (!newMute) {
      sound.startBGM();
    }
  };

  // Spooky alert overlay states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [isSuccessAlert, setIsSuccessAlert] = useState(false);
  const [shouldShakeAlert, setShouldShakeAlert] = useState(false);

  // Initialize secure session ID to avoid third-party cookie blocks in iframe sandbox
  useEffect(() => {
    syncGameState(sessionId);
  }, [sessionId]);

  // Sync game status from Express backend
  const syncGameState = async (targetSid: string) => {
    if (!targetSid) return;

    // Check if we have the session key. If not, register session first
    const hasCryptoKey = localStorage.getItem("session_crypto_key");
    if (!hasCryptoKey) {
      try {
        const res = await fetch("/api/start", {
          method: "POST",
          headers: {
            "x-session-id": targetSid,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentLevel(data.level || 1);
          setActiveRoom(data.level || 1);
          setScore(data.score || 0);
          setCompleted(false);
          setElapsedTime(0);
        }
      } catch (e) {
        console.error("Failed to initialize session key", e);
      }
      return;
    }

    try {
      const res = await fetch("/api/state", {
        headers: {
          "x-session-id": targetSid,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentLevel(data.currentLevel);
        setActiveRoom(data.currentLevel > 5 ? 5 : data.currentLevel);
        setScore(data.score);
        setCompleted(data.completed);
        setElapsedTime(data.elapsed_time);
      }
    } catch (e) {
      console.error("Failed to sync secure game state", e);
    }
  };

  useEffect(() => {
    if (sessionId) {
      syncGameState(sessionId);
    }
  }, [sessionId]);

  const triggerAlert = (message: string, isSuccess = false) => {
    setAlertText(message);
    setIsSuccessAlert(isSuccess);
    setAlertVisible(true);

    if (isSuccess) {
      sound.playSuccess();
    } else {
      sound.playError();
      setShouldShakeAlert(true);
      setTimeout(() => setShouldShakeAlert(false), 600);
    }
  };

  const closeSpookyAlert = () => {
    setAlertVisible(false);
  };

  const handleLevelCleared = (nextLevel: number, message: string, bonusScore: number, finalMetrics?: any) => {
    sound.playDoorOpen();
    if (nextLevel === 6 && finalMetrics) {
      setCurrentLevel(6);
      setActiveRoom(6);
      setScore(finalMetrics.totalScore);
      setElapsedTime(finalMetrics.elapsedTime);
      setCompleted(true);
    } else {
      setCurrentLevel(nextLevel);
      setScore((prev) => prev + bonusScore);
    }
  };

  const handleUseHint = async () => {
    const newScore = Math.max(0, score - 50);
    setScore(newScore);
    if (sessionId) {
      try {
        await fetch("/api/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({
            currentLevel,
            score: newScore,
            elapsedTime,
            completed
          })
        });
      } catch (err) {
        console.warn("Failed to sync score after hint usage:", err);
      }
    }
  };

  const handleResetGame = () => {
    setResetConfirmVisible(true);
  };

  // Titles mapping per active screen level
  const roomTitles: Record<number, string> = {
    1: "SẢNH PIXEL CAESAR",
    2: "THƯ VIỆN CHỮ VIGENÈRE",
    3: "HẦM NGẦM HASH & SALT",
    4: "LÒ LUYỆN GIẢ KIM RSA",
    5: "CỔ TRẬN LÕI CƠ AES",
    6: "TỰ DO KIẾP ĐỌC MÃ",
  };

  // Scenery themes dynamically adapting to each level's room type
  const roomThemes: Record<number, {
    outerFloorUrl: string;
    cabinetBorderColor: string;
    headerBgColor: string;
    headerBorderColor: string;
  }> = {
    1: { // Caesar Slate Temple
      outerFloorUrl: "/assets/battleground.jpg",
      cabinetBorderColor: "border-[#2e3136]",
      headerBgColor: "bg-[#202225]",
      headerBorderColor: "border-[#18191b]",
    },
    2: { // Vigenere Wooden Library
      outerFloorUrl: "/assets/battleground.jpg",
      cabinetBorderColor: "border-[#5a3f28]",
      headerBgColor: "bg-[#4a3220]",
      headerBorderColor: "border-[#2b1c13]",
    },
    3: { // Hash Vault (Toxic Green Iron)
      outerFloorUrl: "/assets/battleground.jpg",
      cabinetBorderColor: "border-[#1e3d2f]",
      headerBgColor: "bg-[#12281e]",
      headerBorderColor: "border-[#0b1712]",
    },
    4: { // RSA Volcanic Forge (Obsidian/Copper)
      outerFloorUrl: "/assets/battleground.jpg",
      cabinetBorderColor: "border-[#6e2b1e]",
      headerBgColor: "bg-[#4c1e15]",
      headerBorderColor: "border-[#2c0f0b]",
    },
    5: { // AES Lab (Clean Slate Steel)
      outerFloorUrl: "/assets/battleground.jpg",
      cabinetBorderColor: "border-[#394952]",
      headerBgColor: "bg-[#263238]",
      headerBorderColor: "border-[#1a2327]",
    },
    6: { // Victory Gold
      outerFloorUrl: "/assets/battleground.jpg",
      cabinetBorderColor: "border-[#b08c43]",
      headerBgColor: "bg-[#70541e]",
      headerBorderColor: "border-[#45320f]",
    }
  };

  const theme = roomThemes[activeRoom] || roomThemes[1];

  const renderActiveRoom = () => {
    if (activeRoom === 6) {
      return (
        <SuccessOverlay
          totalScore={score}
          elapsedTime={elapsedTime}
          onRestart={handleResetGame}
        />
      );
    }
    return (
      <GameWorld2D
        key={resetCounter}
        currentLevel={currentLevel}
        activeRoom={activeRoom}
        score={score}
        sessionId={sessionId}
        onLevelCleared={handleLevelCleared}
        onGoToRoom={(r) => setActiveRoom(r)}
        triggerAlert={triggerAlert}
        onUseHint={handleUseHint}
      />
    );
  };

  const isBattleground = theme.outerFloorUrl.includes("battleground");

  return (
    <div className="flex justify-center items-center h-screen w-screen p-4 overflow-hidden select-none font-sans bg-[#0c0806] relative">
      {/* Background container to crop and display only the top half of the battleground (1 dragon) */}
      {!showEntrance && isBattleground && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200%",
          backgroundImage: `url(${theme.outerFloorUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          pointerEvents: "none",
        }} />
      )}
      {!showEntrance && !isBattleground && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${theme.outerFloorUrl})`,
          backgroundSize: "64px 64px",
          imageRendering: "pixelated",
          zIndex: 0,
          pointerEvents: "none",
        }} />
      )}
      {/* Guild Hall Entrance Screen */}
      {showEntrance && (
        <div className="absolute inset-0 z-50">
          <GuildHallEntrance onEnter={() => setShowEntrance(false)} />
        </div>
      )}



      {/* Dark vignette overlay for the outer screen room */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />

      <div className={`w-full h-full max-w-[1280px] max-h-[840px] border-[12px] ${theme.cabinetBorderColor} shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col bg-[#140e0a] relative overflow-hidden rounded-lg z-10`}>
        
        {/* Retro Header Board */}
        <header className={`h-[54px] ${theme.headerBgColor} border-b-[4px] ${theme.headerBorderColor} flex items-center justify-between px-4 text-[#ebdcb9] shrink-0 select-none z-30 font-sans`}>
          <div className="flex items-center gap-2 truncate max-w-[50%]">
            {activeRoom > 1 && currentLevel < 6 && (
              <button
                onClick={() => {
                  sound.playDoorOpen();
                  setActiveRoom((r) => r - 1);
                }}
                className="bg-[#2d1b11] hover:bg-stone-800 text-[#ebdcb9] px-2.5 py-1 border-2 border-black text-[9px] font-bold cursor-pointer select-none shrink-0 rounded transition-transform active:scale-95"
                title="Quay lại phòng trước"
              >
                ◀ Lùi
              </button>
            )}
            <span className="text-amber-500 font-bold tracking-wider text-xs drop-shadow-[1px_1px_2px_#000] truncate uppercase font-sans">
              {roomTitles[activeRoom] || "MẬT CẢNH CAESAR"}
            </span>
            {activeRoom < currentLevel && currentLevel < 6 && (
              <button
                onClick={() => {
                  sound.playDoorOpen();
                  setActiveRoom((r) => r + 1);
                }}
                className="bg-[#2d1b11] hover:bg-stone-800 text-[#ebdcb9] px-2.5 py-1 border-2 border-black text-[9px] font-bold cursor-pointer select-none shrink-0 rounded transition-transform active:scale-95"
                title="Tiến sang phòng kế"
              >
                Tiến ▶
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[10px]">


            {/* Mute/Unmute BGM Button */}
            <button
              onClick={toggleMute}
              className="bg-black/40 hover:bg-black/60 border border-stone-800 text-[#ebdcb9] font-bold px-2.5 py-1 uppercase tracking-wide cursor-pointer rounded text-[9px] transition active:scale-95 flex items-center gap-1"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? "🔇 Tắt nhạc" : "🔊 Bật nhạc"}
            </button>

            {/* Guide Button */}
            <button
              onClick={() => {
                sound.playDoorOpen();
                setGuideOpen(true);
              }}
              className="bg-[#dca11d] hover:bg-amber-600 border-2 border-black text-black font-bold px-2 py-1 uppercase tracking-wide cursor-pointer"
            >
              HƯỚNG DẪN 📖
            </button>

            <span className="bg-black/60 px-2 py-1 border border-stone-800 rounded">
              ĐIỂM: <strong className="text-red-500 font-bold font-mono">{score}</strong>
            </span>
            <span className="bg-black/60 px-2 py-1 border border-stone-800 rounded">
              CẤP ĐỘ: <strong className="text-red-500 font-bold font-mono">{Math.min(5, currentLevel)}/5</strong>
            </span>
            <button
              id="btn_header_reset"
              onClick={handleResetGame}
              className="bg-red-950 border-2 border-black text-white rounded font-bold px-2.5 py-1 uppercase tracking-wider cursor-pointer duration-150 hover:bg-red-700 focus:outline-none shrink-0"
            >
              Đặt lại
            </button>
          </div>
        </header>

        {/* Dynamic active point & click scene viewport */}
        <div className="flex-grow relative overflow-hidden z-0">
          {renderActiveRoom()}
        </div>

        {/* Learning Guide Modal */}
        <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

        {/* Full-screen Spooky blood notification alert custom overlay modals */}
        {alertVisible && (
          <div className="absolute inset-0 bg-black/85 z-55 flex items-center justify-center p-4 animate-fade-in font-sans">
            <div
              id="alert_box_container"
              className={`bg-[#1c120c] border-4 border-red-800 rounded p-6 max-w-[440px] text-center shadow-2xl relative select-none ${
                shouldShakeAlert ? "animate-shake border-red-500" : ""
              } ${isSuccessAlert ? "border-emerald-700 shadow-[0_0_25px_rgba(50,250,50,0.25)]" : ""}`}
            >
              <div className="absolute top-2 right-3 text-red-800 text-[8px] font-mono select-none pointer-events-none opacity-20">
                SCARLET_HINT
              </div>
              
              <p
                id="alert_message_paragraph"
                className="text-stone-200 text-[10px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: alertText }}
              />

              <button
                id="btn_confirm_alert_close"
                onClick={closeSpookyAlert}
                className="pixel-btn pixel-btn-success text-[10px] mt-5 w-full uppercase tracking-widest cursor-pointer"
              >
                Tiếp tục khảo sát
              </button>
            </div>
          </div>
        )}

        {/* Custom Reset Game Confirmation Modal */}
        {resetConfirmVisible && (
          <div className="absolute inset-0 bg-black/90 z-55 flex items-center justify-center p-4 animate-fade-in font-sans">
            <div className="bg-[#1c120c] border-4 border-red-950 rounded p-6 max-w-[440px] text-center shadow-2xl relative select-none">
              <div className="absolute top-2 right-3 text-red-800 text-[8px] font-mono select-none pointer-events-none opacity-20">
                WIPE_MEMORY
              </div>
              
              <h3 className="text-[#ebdcb9] text-xs font-bold mb-3 uppercase tracking-wider">
                Xoá Sạch Ký Ức?
              </h3>
              
              <p className="text-stone-300 text-[9px] leading-relaxed mb-6">
                Bạn có chắc chắn muốn bôi xóa đi mọi ký ức kinh sợ trước đó và quay trở về điểm khởi nguồn (Phòng 1) không? Tiến độ hiện tại sẽ bị hoàn tác hoàn toàn.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    setResetConfirmVisible(false);
                    try {
                      const res = await fetch("/api/start", {
                        method: "POST",
                        headers: {
                          "x-session-id": sessionId,
                        },
                      });
                      if (res.ok) {
                        setCurrentLevel(1);
                        setActiveRoom(1);
                        setScore(0);
                        setCompleted(false);
                        setElapsedTime(0);
                        setResetCounter((c) => c + 1);
                        sound.playDoorOpen();
                        triggerAlert("Ký ức tan rã... Bạn giật mình tỉnh dậy tại Sảnh chính rêu xám lạnh giá.", true);
                      }
                    } catch (err) {
                      triggerAlert("Cỗ máy cơ quan kẹt cứng không thể thanh tẩy...", false);
                    }
                  }}
                  className="flex-1 pixel-btn pixel-btn-danger text-[9px] py-2 uppercase cursor-pointer"
                >
                  Thanh tẩy
                </button>
                <button
                  onClick={() => setResetConfirmVisible(false)}
                  className="flex-1 pixel-btn text-[9px] py-2 uppercase cursor-pointer"
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
