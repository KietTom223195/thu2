import { useState, useEffect, Fragment } from "react";
import { sound } from "./AudioEngine";

interface Room2Props {
  onLevelCleared: (nextLevel: number, message: string, bonusScore: number) => void;
  triggerAlert: (msg: string, isSuccess?: boolean) => void;
  sessionId: string;
  onGoToRoom?: (roomNum: number) => void;
}

interface Piece {
  id: number;
  label: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export default function Room2_Library({ onLevelCleared, triggerAlert, sessionId, onGoToRoom }: Room2Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [safeModalOpen, setSafeModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [ciphertext, setCiphertext] = useState("YJR KVR");
  const [plaintextSpin, setPlaintextSpin] = useState("AAAAAA");
  const [decodedPreview, setDecodedPreview] = useState("");
  const [lanternLit, setLanternLit] = useState(true);
  const [lookupKey, setLookupKey] = useState("D");
  const [lookupCipher, setLookupCipher] = useState("Y");
  const [showExplanation, setShowExplanation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Puzzle state for the torn painting of "DEATH"
  const initialPieces: Piece[] = [
    { id: 2, label: "A", offsetX: -2, offsetY: 4, rotation: 5 },
    { id: 0, label: "D", offsetX: 4, offsetY: -3, rotation: -4 },
    { id: 4, label: "H", offsetX: 1, offsetY: -5, rotation: 6 },
    { id: 1, label: "E", offsetX: -3, offsetY: 2, rotation: -3 },
    { id: 3, label: "T", offsetX: 5, offsetY: 1, rotation: 2 },
  ];

  const [puzzlePieces, setPuzzlePieces] = useState<Piece[]>(initialPieces);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [puzzleAssembled, setPuzzleAssembled] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Calculate live decryption preview and update cylinder gears/spins
  useEffect(() => {
    if (!keyword) {
      setDecodedPreview("");
      return;
    }
    const cleanKey = keyword.toUpperCase().replace(/[^A-Z]/g, "");
    if (!cleanKey) {
      setDecodedPreview("");
      return;
    }
    const upperCipher = ciphertext.toUpperCase();
    let plain = "";
    let j = 0;
    for (let i = 0; i < upperCipher.length; i++) {
      const char = upperCipher[i];
      if (char === " ") {
        plain += " ";
        continue;
      }
      if (alphabet.includes(char)) {
        const cCode = char.charCodeAt(0) - 65;
        const kCode = cleanKey[j % cleanKey.length].charCodeAt(0) - 65;
        const pCode = (cCode - kCode + 26) % 26;
        plain += alphabet[pCode];
        j++;
      } else {
        plain += char;
      }
    }
    setDecodedPreview(plain);

    // Auto-update the spinners with fully/partially decrypted text matching the ciphertext sequence
    const cleanCipher = ciphertext.toUpperCase().replace(/[^A-Z]/g, ""); // "YJRKVR" (6 chars)
    let autoPlain = "";
    for (let i = 0; i < cleanCipher.length; i++) {
      const cChar = cleanCipher[i];
      const cCode = cChar.charCodeAt(0) - 65;
      const kChar = cleanKey[i % cleanKey.length];
      const kCode = kChar.charCodeAt(0) - 65;
      const pCode = (cCode - kCode + 26) % 26;
      autoPlain += alphabet[pCode];
    }
    if (autoPlain.length === 6) {
      setPlaintextSpin(autoPlain);
    }
  }, [keyword, ciphertext]);

  // Check if puzzle is assembled correctly
  useEffect(() => {
    const isCorrect = puzzlePieces.map((p) => p.label).join("") === "DEATH";
    if (isCorrect && !puzzleAssembled) {
      setPuzzleAssembled(true);
      sound.playSuccess();
      triggerAlert("Cạch! Các mảnh giấy khít khao hoàn hảo, hiện lên chữ 'DEATH'. Bạn đã tìm thấy TỪ KHÓA chính xác!", true);
    }
  }, [puzzlePieces]);

  const handlePieceClick = (index: number) => {
    if (puzzleAssembled) return;
    if (selectedPieceIndex === null) {
      setSelectedPieceIndex(index);
      sound.playMetalClash();
    } else {
      // Swap elements in the array
      const newPieces = [...puzzlePieces];
      const temp = newPieces[selectedPieceIndex];
      newPieces[selectedPieceIndex] = newPieces[index];
      newPieces[index] = temp;
      setPuzzlePieces(newPieces);
      setSelectedPieceIndex(null);
      sound.playMetalClash();
    }
  };

  const handleWheelChange = (idx: number, direction: number) => {
    const alphabetStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const currentChars = plaintextSpin.split("");
    const curVal = currentChars[idx] || "A";
    let codeIndex = alphabetStr.indexOf(curVal);
    if (codeIndex === -1) codeIndex = 0;
    const newValIndex = (codeIndex + direction + 26) % 26;
    currentChars[idx] = alphabetStr[newValIndex];
    
    const newPlaintext = currentChars.join("");
    setPlaintextSpin(newPlaintext);
    sound.playMetalClash();
  };

  const handleDirectKeyChange = (idx: number, newVal: string) => {
    const alphabetStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const cleanChar = newVal.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
    if (!cleanChar) return;
    const currentChars = plaintextSpin.split("");
    currentChars[idx] = cleanChar;
    setPlaintextSpin(currentChars.join(""));
    sound.playMetalClash();
  };

  const handleOpenBook = () => {
    sound.playDoorOpen();
    setIsZoomed(true);
  };

  const handleOpenLock = () => {
    setSafeModalOpen(true);
  };

  const handleSubmitVigenere = async () => {
    const cleanKey = keyword.trim().toUpperCase();
    if (!cleanKey) {
      triggerAlert("Ổ khóa xoay rỗng tuếch. Xin hãy nhập từ khóa DEATH tìm được từ bức tranh rách!", false);
      return;
    }

    if (plaintextSpin !== "VFRROO") {
      triggerAlert("Ký tự trên các vòng xi-lanh xoay lệch khớp, rương đá cổ vẫn đóng chặt. Hãy dùng Từ khóa và Bản mã gióng tra cứu bảng trong sách cổ để giải mật Bản Rõ!", false);
      return;
    }

    try {
      const res = await fetch("/api/verify_vigenere", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ keyword: cleanKey, ciphertext }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSafeModalOpen(false);
        sound.playSuccess();
        setSuccessMessage(data.message);
        setShowExplanation(true);
      } else {
        triggerAlert(data.message || "Bụi hầm bám dính, ổ xoay kẹt nghẹt...", false);
      }
    } catch (err: any) {
      triggerAlert("Cơ quan bị một xúc lực siêu nhiên kiềm ghì sững...", false);
    }
  };

  const handleCloseExplanation = () => {
    setShowExplanation(false);
    onLevelCleared(3, successMessage, 200);
  };

  return (
    <div className="w-full h-full relative bg-[#1c150c] select-none text-stone-200 overflow-hidden font-serif">
      {/* Background Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85))] z-10" />

      {/* Retro television scanning lines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-10 z-10" />

      {/* Back button and level indicator at top-left inside room viewport */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-35">
        <button
          id="btn_back_to_hall"
          onClick={() => {
            if (isZoomed) {
              setIsZoomed(false);
              sound.playDoorOpen();
            } else {
              if (onGoToRoom) {
                sound.playDoorOpen();
                onGoToRoom(1);
              } else {
                triggerAlert("Không thể quay lại căn phòng trước khi chưa giải mã xong chiếc rương đá!");
              }
            }
          }}
          className="w-10 h-10 rounded-full border-2 border-white bg-black/85 hover:bg-stone-900 text-white flex items-center justify-center font-bold shadow-2xl transition-transform hover:scale-105 cursor-pointer"
        >
          <span className="text-xl transform -translate-y-0.5">←</span>
        </button>
        <div className="w-10 h-10 rounded-full border-2 border-white bg-black/85 text-[#f5ebd2] flex items-center justify-center font-sans font-extrabold text-sm shadow-2xl">
          2
        </div>
      </div>

      {!isZoomed ? (
        /* ==================== VIEW 1: MAIN ROOM PERSPECTIVE (Matches Screenshot perfectly) ==================== */
        <div 
          className="w-full h-full relative bg-[#3d3326] flex flex-col justify-end overflow-hidden z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%),
              radial-gradient(circle at 25% 45%, rgba(255,200,100,0.15) 0%, transparent 60%),
              url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' opacity='0.05'><filter id='rough'><feTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='3' result='noise'/><feDisplacementMap in='SourceGraphic' in2='noise' scale='4'/></filter><path d='M0,0 M10,40 C30,20 60,60 90,40' stroke='white' fill='none' stroke-width='0.75' filter='url(%23rough)'/></svg>")
            `,
            backgroundSize: "cover"
          }}
        >
          {/* Aesthetic Gothic Bookshelves on the Back Wall */}
          <div className="absolute left-[5%] top-[10%] w-[66%] h-[50%] opacity-[0.82] flex flex-col justify-between border-4 border-[#3a2618] bg-[#1a110a]/90 p-2.5 rounded-sm shadow-2xl pointer-events-none select-none z-1 animate-fade-in">
            {/* Shelf 1 */}
            <div className="border-b-[5px] border-[#2c1d12] h-[45%] flex items-end px-2 gap-[3px] relative">
              <div className="w-5 h-[95%] bg-[#5c1b18] border border-black rounded-sm shadow" />
              <div className="w-4 h-[85%] bg-[#404c38] border border-black rounded-sm transform -rotate-12 translate-x-1 shadow" />
              <div className="w-5.5 h-[80%] bg-[#5c4a37] border border-black rounded-sm shadow" />
              <div className="w-4 h-[90%] bg-[#1b2a47] border border-black rounded-sm shadow" />
              <div className="w-3.5 h-[95%] bg-[#321f14] border border-black rounded-sm shadow" />
              <div className="w-5 h-[100%] bg-[#7c5b35] border border-black rounded-sm shadow" />
              <div className="w-4 h-[75%] bg-[#4c5958] border border-black rounded-sm shadow transform rotate-6" />
              <div className="w-[1px] flex-grow" />
              <div className="w-4.5 h-[85%] bg-[#785b30] border border-black rounded-sm shadow" />
              <div className="w-4 h-[95%] bg-[#452718] border border-[#ffdf9c]/30 rounded-sm shadow" />
              <div className="w-5 h-[90%] bg-[#2d3a3a] border border-black rounded-sm transform rotate-6 shadow" />
              <div className="w-4 h-[100%] bg-[#801815] border border-black rounded-sm shadow" />
            </div>
            {/* Shelf 2 */}
            <div className="border-b-[5px] border-[#2c1d12] h-[45%] flex items-end px-2 gap-[3px] relative mt-1">
              <div className="w-4 h-[90%] bg-[#6a5437] border border-black rounded-sm shadow" />
              <div className="w-5 h-[100%] bg-[#1b3a2a] border border-[#ebdcb9]/20 rounded-sm shadow" />
              <div className="w-4 h-[85%] bg-[#511311] border border-black rounded-sm shadow" />
              <div className="w-4 h-[90%] bg-[#414345] border border-black rounded-sm transform -rotate-12 translate-x-1 shadow" />
              <div className="w-5.5 h-[95%] bg-[#8f6d3d] border border-black rounded-sm shadow" />
              <div className="w-4.5 h-[80%] bg-[#224455] border border-black rounded-sm shadow" />
              <div className="w-[1px] flex-grow" />
              <div className="w-5 h-[95%] bg-[#5d4631] border border-[#ffc266]/20 rounded-sm shadow" />
              <div className="w-4 h-[90%] bg-[#364b59] border border-black rounded-sm shadow" />
              <div className="w-5.5 h-[100%] bg-[#403024] border border-black rounded-sm shadow" />
              <div className="w-4 h-[85%] bg-[#4a1c1a] border border-black rounded-sm transform rotate-6 shadow" />
            </div>
          </div>

          {/* Decorative Lit Oil Lamp on Desk */}
          <div 
            onClick={() => {
              setLanternLit(!lanternLit);
              sound.playMetalClash();
            }}
            className="absolute bottom-[28%] left-[23%] w-[75px] h-[130px] z-15 cursor-pointer group flex flex-col items-center"
          >
            <svg viewBox="0 0 60 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)]">
              {/* Lamp Base body */}
              <path d="M12,85 C12,80 18,78 30,78 C42,78 48,80 48,85 L44,95 C40,95 20,95 16,95 Z" fill="#4d3b2c" stroke="#120e0a" strokeWidth="1.5" />
              <ellipse cx="30" cy="78" rx="14" ry="4" fill="#6e5742" stroke="#120e0a" strokeWidth="1" />
              {/* Burner section */}
              <path d="M22,74 L38,74 L36,60 L24,60 Z" fill="#221e1a" stroke="#111" strokeWidth="1" />
              {/* Glass shade/chimney transparent yellow glow */}
              <path d="M20,60 C12,50 12,35 30,22 C48,35 48,50 40,60 Z" fill={lanternLit ? "rgba(253, 224, 110, 0.4)" : "rgba(255,255,255,0.08)"} stroke="#111" strokeWidth="1.2" />
              {/* Wick knob */}
              <rect x="27" y="70" width="6" height="4" fill="#a8825c" stroke="#111" strokeWidth="0.75" />
              {/* Flickering light flame */}
              {lanternLit && (
                <path d="M30,32 Q35,46 30,52 Q25,46 30,32 Z" fill="#ff9015" className="animate-pulse" />
              )}
              {/* Curved metal hoop bracket handle */}
              <path d="M14,48 C14,24 20,10 30,10 C40,10 46,24 46,48" fill="none" stroke="#2a1f16" strokeWidth="1.5" />
              <path d="M22,22 L38,22 Q30,16 38,12 L22,12 Z" fill="#4d3b2c" stroke="#111" strokeWidth="1" />
            </svg>
            {/* Dynamic Ambient Yellow Lighting blur */}
            {lanternLit && (
              <div className="absolute top-[20px] w-32 h-32 rounded-full bg-amber-400/15 blur-2xl animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Table Book: MẬT MÃ CỔ ĐẠI (Brown leather 3D book exactly as screenshot) */}
          <button
            id="btn_table_book"
            onClick={handleOpenBook}
            className="absolute bottom-[9%] left-[6%] w-[130px] h-[165px] bg-[#3e291b]/95 border-[3.5px] border-stone-1050 rounded shadow-[0_15px_30px_rgba(0,0,0,0.92)] hover:rotate-[-2deg] duration-300 pointer-events-auto cursor-pointer flex flex-col items-center justify-between p-3.5 select-none z-15 group"
            style={{ transform: "rotate(-6deg)" }}
          >
            <div className="w-full h-full border-2 border-[#d0af74]/60 rounded-sm flex flex-col items-center justify-center p-2.5 relative">
              <div className="absolute inset-1 border border-dashed border-[#d0af74]/15 pointer-events-none" />
              <span className="text-[12px] text-[#ebd29e] tracking-[3px] uppercase font-serif font-black block text-center leading-normal">
                MẬT MÃ
              </span>
              <span className="text-[12px] text-[#ebd29e] tracking-[2px] font-serif font-black block text-center mt-1.5 leading-normal">
                CỔ ĐẠI
              </span>
              <div className="w-7 h-[1.5px] bg-[#ebd29e]/50 my-2" />
              <span className="text-[7.5px] text-stone-400 font-mono tracking-widest uppercase block mt-1">
                LIBER V
              </span>
            </div>
          </button>

          {/* Aged Crumpled Parchment under center container area */}
          <div 
            className="absolute bottom-[3%] left-[28%] w-[165px] h-[95px] bg-[#ded2bc] opacity-80 border border-stone-900 rounded-sm shadow-md pointer-events-none z-10"
            style={{
              transform: "rotate(4deg) skewX(-2deg)",
              backgroundImage: "radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.1) 100%)"
            }}
          >
            <div className="p-2 flex flex-col gap-1 w-full h-full opacity-60">
              <div className="w-[80%] h-1 bg-stone-800/40 rounded-sm" />
              <div className="w-[90%] h-0.5 bg-stone-800/30 rounded-sm" />
              <div className="w-[60%] h-1 bg-stone-800/40 rounded-sm mt-1" />
              <div className="w-[75%] h-0.5 bg-stone-800/30 rounded-sm" />
              <svg viewBox="0 0 30 30" className="w-6 h-6 self-end opacity-45">
                <circle cx="15" cy="15" r="12" fill="none" stroke="black" strokeWidth="0.75" />
                <polygon points="15,5 18,15 15,25 12,15" fill="none" stroke="black" strokeWidth="0.5" />
              </svg>
            </div>
          </div>

          {/* 3D Recessed Dark Corridor Walk-in Tunnel on the Right Side containing Chest */}
          <div className="absolute right-[4%] top-[10%] bottom-[12%] w-[26%] bg-[#080605] border-l-[3.5px] border-y-[3.5px] border-[#1c140e] flex flex-col items-center justify-end p-2 overflow-hidden shadow-2xl z-10">
            <div className="absolute inset-x-0 top-0 h-[40px] bg-sky-950/5 border-b border-stone-1050 origin-top transform scale-x-110" style={{ transform: "perspective(100px) rotateX(-20deg)" }} />
            <div className="absolute inset-y-0 left-0 w-[40px] bg-gradient-to-r from-stone-950/90 to-transparent border-r border-stone-1050 origin-left transform scale-y-110" style={{ transform: "perspective(100px) rotateY(20deg)" }} />
            <div className="absolute inset-y-0 right-0 w-[40px] bg-gradient-to-l from-stone-950/90 to-transparent border-l border-stone-1050 origin-right transform scale-y-110" style={{ transform: "perspective(100px) rotateY(-20deg)" }} />
            
            {/* Locked wooden Chest with Compass star drawing */}
            <div 
              onClick={() => {
                triggerAlert("Chiếc rương sắt nêm chặt mật mã Vigenère. Hãy trích xuất từ khóa từ các mảnh rách của bức họa cổ và giải mã để bật chốt rương!");
                setSafeModalOpen(true);
                sound.playDoorOpen();
              }}
              className="w-full max-w-[125px] h-[105px] flex flex-col items-center justify-end cursor-pointer group hover:scale-105 duration-200 z-15 relative"
            >
              <svg viewBox="0 0 100 85" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.95)]">
                <path d="M8,36 C8,14 92,14 92,36 Z" fill="#4d3321" stroke="#000" strokeWidth="2" />
                <path d="M8,36 L92,36 L86,80 L14,80 Z" fill="#321f14" stroke="#000" strokeWidth="2" />
                <rect x="22" y="16" width="10" height="64" fill="#3a3c3e" stroke="#111" strokeWidth="0.5" />
                <rect x="68" y="16" width="10" height="64" fill="#3a3c3e" stroke="#111" strokeWidth="0.5" />
                
                <g stroke="#222" strokeWidth="0.5">
                  <circle cx="50" cy="58" r="9" fill="none" stroke="#222" strokeWidth="0.75" />
                  <polygon points="50,45 53,55 50,58 47,55" fill="#1b1c1d" />
                  <polygon points="50,71 53,61 50,58 47,61" fill="#1b1c1d" />
                  <polygon points="37,58 47,55 50,58 47,61" fill="#1b1c1d" />
                  <polygon points="63,58 53,55 50,58 53,61" fill="#1b1c1d" />
                </g>
                
                <rect x="42" y="32" width="16" height="18" fill="#a48243" rx="1.5" stroke="#111" strokeWidth="1" />
                <rect x="44" y="44" width="12" height="12" rx="2" fill="#59442a" stroke="#111" strokeWidth="1" />
                <path d="M46,44 Q46,38 50,38 Q54,38 54,44" fill="none" stroke="#111" strokeWidth="1.7" />
                <circle cx="50" cy="49" r="1.5" fill="#111" />
              </svg>
              <span className="text-[7.5px] font-mono tracking-widest text-[#d8ae78] uppercase mt-0.5 animate-pulse">RƯƠNG CỔ CHƯA MỞ</span>
            </div>
          </div>

          {/* Wooden Desktop Base filling the bottom, clicking it opens safe box decoder popup */}
          <div 
            onClick={() => {
              if (!safeModalOpen) {
                setSafeModalOpen(true);
                sound.playDoorOpen();
              }
            }}
            className="w-full h-[22%] bg-gradient-to-t from-[#1b120c] to-[#3a2c1f] border-t-4 border-[#1c1410] relative z-10 cursor-pointer flex justify-center items-start pt-3 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]"
          >
            <div className="bg-stone-950/80 border border-stone-800 rounded px-4 py-1.5 text-center scale-90 mb-4 animate-pulse">
              <span className="text-[10px] text-[#bf9e65] font-serif tracking-[3px] uppercase block">
                CƠ QUAN CHẠM THÌN CO TRUYỀN
              </span>
              <span className="text-[8px] text-stone-400 font-mono block">CLICK ĐỂ MỞ BẢNG QUAY VIGENERE</span>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== VIEW 2: EXTREMELY DETAILED CLOSE-UP VIEW (Bottom-Left image) ==================== */
        <div className="w-full h-full relative p-4 flex flex-col justify-end" style={{
          background: "radial-gradient(circle, rgba(62,50,38,0.98) 0%, rgba(20,16,13,1) 100%)"
        }}>
          {/* Wooden tables board seam lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><line x1='0' y1='50' x2='100' y2='50' stroke='black' stroke-width='4'/><line x1='50' y1='0' x2='50' y2='100' stroke='black' stroke-width='2'/></svg>")`
          }} />

          <div className="w-full h-full flex gap-4 pt-10 pb-4 relative items-stretch">
            {/* LEFT BOOK: Open Vigenere grid textbook */}
            <div className="flex-1 bg-[#ede4c7] border-[6px] border-[#36261b] rounded shadow-2xl p-4 flex flex-col text-[#2e2b25] relative">
              {/* Book central seam overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-[#1a110a] opacity-30 shadow-[0_0_8px_black]" />
              
              <div className="w-full flex justify-between items-center border-b border-stone-400 pb-1.5 mb-2">
                <span className="font-sans font-black tracking-widest text-[#8a1a15] text-[13px] uppercase">MẬT MÃ CỔ ĐẠI</span>
                <span className="font-mono text-[9px] text-stone-500 uppercase">Trang 41</span>
              </div>

              {/* Grid content */}
              <div className="flex-grow flex flex-col overflow-auto scrollbar-hide">
                <p className="text-[10px] leading-tight italic text-stone-700 font-serif mb-2">
                  "Sắp xếp mật mã theo dòng kẻ. Giao của cột TỪ KHÓA và dòng BẢN MÃ phản chiếu chữ cái nguyên vân."
                </p>

                {/* Complete Scrollable Vigenere Table */}
                <div className="flex-grow overflow-auto max-h-[140px] border border-stone-400 bg-stone-900/5 rounded p-1 mb-2 shadow-inner">
                  <div className="grid grid-cols-[20px_repeat(26,minmax(14px,1fr))] gap-[1px] font-mono text-[7px] font-bold select-none leading-none w-max">
                    {/* Header Row */}
                    <div className="text-red-900 bg-stone-950/20 text-center py-1 sticky top-0 left-0 z-20 w-[20px] border-r border-b border-stone-400">X</div>
                    {"A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ").map((ch) => (
                      <div key={ch} className="text-red-900 text-center bg-stone-950/15 py-1 sticky top-0 z-10 px-0.5 border-b border-stone-400 min-w-[14px]">{ch}</div>
                    ))}

                    {/* Table Rows A-Z */}
                    {"A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ").map((rowLabel, rIdx) => (
                      <Fragment key={rowLabel}>
                        <div className="text-stone-700 bg-stone-950/15 text-center py-1 sticky left-0 z-10 font-bold border-r border-stone-400 w-[20px]">{rowLabel}</div>
                        {Array.from({ length: 26 }).map((_, cIdx) => {
                          const code = (rIdx + cIdx) % 26;
                          const char = String.fromCharCode(65 + code);
                          return (
                            <div 
                              key={`${rowLabel}-${cIdx}`} 
                              className="text-stone-800 text-center py-1 px-0.5 hover:bg-amber-200/60 min-w-[14px]"
                            >
                              {char}
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>
                </div>

                {/* Highly Interactive Quick Lookup Tool Widget */}
                <div className="mb-2 p-1.5 bg-[#ebdcb9] border border-amber-950/20 rounded-md shadow-sm">
                  <span className="font-sans font-extrabold text-[10px] tracking-wider uppercase text-amber-950 block mb-1 text-center border-b border-amber-950/10 pb-0.5">
                    🔍 TRA CỨU NHANH BẢNG QUAY CỔ ĐẠI
                  </span>
                  <div className="flex items-center justify-center gap-1.5 font-sans text-[10px] text-stone-800">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-stone-500 uppercase font-mono">Cột Dòng (Khóa/Key)</span>
                      <select 
                        value={lookupKey} 
                        onChange={(e) => setLookupKey(e.target.value)}
                        className="bg-stone-100 border border-stone-400 rounded px-1 py-0.5 text-[11px] font-black text-stone-900 focus:outline-none cursor-pointer"
                      >
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <span className="font-extrabold text-amber-900 text-xs mt-3">+</span>

                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-stone-500 uppercase font-mono">Bản Mã (Cipher)</span>
                      <select 
                        value={lookupCipher} 
                        onChange={(e) => setLookupCipher(e.target.value)}
                        className="bg-stone-100 border border-stone-400 rounded px-1 py-0.5 text-[11px] font-black text-stone-900 focus:outline-none cursor-pointer"
                      >
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <span className="font-extrabold text-[#8a1a15] text-xs mt-3">➔</span>

                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-stone-500 uppercase font-mono">Bản Rõ (Plain)</span>
                      <span className="bg-[#5c1b18] text-[#ffdf9c] font-mono font-black text-xs px-2.5 py-1 rounded shadow-md border border-[#1a110a] min-w-[24px] text-center">
                        {alphabet[(alphabet.indexOf(lookupCipher) - alphabet.indexOf(lookupKey) + 26) % 26]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-1 border-t border-dashed border-stone-400 pt-1.5 text-left">
                  <span className="text-[10px] uppercase font-mono text-[#8a1a15] font-extrabold tracking-widest block">BẢN MÃ TRONG THƯ TỊCH:</span>
                  <div className="flex gap-1.5 mt-1">
                    {ciphertext.split("").filter(ch => ch !== " ").map((ch, idx) => (
                      <span key={idx} className="w-6 h-6 border-b-2 border-stone-800 font-sans font-black flex items-center justify-center text-xs bg-stone-950/5 text-stone-900 rounded-sm">
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER: Torn Fragment Jigsaw puzzle */}
            <div className="w-[45%] flex flex-col items-center justify-between p-2 relative bg-[#2a1e15] border-2 border-stone-950 rounded-lg shadow-inner">
              <span className="text-[9px] font-mono tracking-widest text-stone-400 block pb-1 border-b border-stone-800 w-full text-center uppercase">
                {puzzleAssembled ? "BẢN THƯ KHẢI HOÀN" : "CÁC MẢNH GHÉP TẢ TƠI (CLICK ĐỂ SWAP)"}
              </span>

              {/* Jigsaw stage area */}
              <div className="w-full flex-grow relative flex items-center justify-center p-3">
                <div className="relative w-full h-[140px] bg-[#1a110a] rounded border border-stone-950 flex items-center justify-center px-4 overflow-hidden">
                  
                  {puzzleAssembled ? (
                    // Seamless completed canvas
                    <div className="p-4 bg-[#dabfa2] border-4 border-amber-950/40 rounded-sm text-[#111] font-serif text-center shadow-lg transition-all scale-105 duration-500 max-w-[190px]">
                      <span className="font-['Creepster'] text-red-900 text-5xl tracking-[4px] uppercase block drop-shadow-[1px_1px_2px_white] select-text">
                        DEATH
                      </span>
                    </div>
                  ) : (
                    // Torn fragmented draggable elements
                    <div className="flex gap-1 w-full justify-center items-center">
                      {puzzlePieces.map((p, index) => {
                        const isSelected = selectedPieceIndex === index;
                        return (
                          <button
                            key={index}
                            onClick={() => handlePieceClick(index)}
                            className={`w-12 h-32 flex flex-col items-center justify-center text-[#2b251d] font-serif hover:scale-105 transition-all text-2xl font-black rounded border cursor-pointer border-dashed ${
                              isSelected
                                ? "bg-red-900 text-white translate-y-[-10px] border-red-500 scale-110 shadow-[0_0_15px_red]"
                                : "bg-[#ded1bd] border-stone-700/60 "
                            }`}
                            style={{
                              transform: `rotate(${p.rotation}deg) translateY(${p.offsetY}px)`,
                              boxShadow: isSelected ? "none" : `${p.offsetX}px ${p.offsetY}px 10px rgba(0,0,0,0.6)`
                            }}
                          >
                            {/* Torn edge simulator pattern */}
                            <div className="text-3xl font-serif text-[#1e140d] tracking-widest opacity-80 select-none">
                              {p.label}
                            </div>
                            <div className="text-[6px] font-mono opacity-25 mt-1">{p.id}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom status */}
              <div className="w-full text-center bg-[#150d08] p-1.5 rounded-sm border border-stone-850">
                <span className="text-[10px] text-[#bf9e65] block font-mono">
                  {puzzleAssembled ? "TỪ KHÓA MỞ RƯƠNG: DEATH" : "Đổi chỗ các mảnh ghép để sắp xếp thành một từ có nghĩa!"}
                </span>
              </div>
            </div>

            {/* RIGHT BAR: Mortar Apparatus and Mini-bar menu buttons as in Rusty Lake screenshot */}
            <div className="w-[52px] flex flex-col justify-between items-center bg-stone-950/60 p-1.5 rounded-md border border-stone-850 select-none">
              <div className="flex flex-col gap-2 w-full">
                {/* Help button "?" */}
                <button
                  onClick={() => triggerAlert("Gợi ý mật khải: Tìm từ khóa từ các mảnh tranh rách. Chữ cái ghép lại thành 'DEATH'. Dùng nó để mở Rương gỗ!")}
                  className="w-8 h-8 rounded bg-[#3e2f24] border border-stone-800 hover:bg-stone-800 text-[#edeada] flex items-center justify-center text-xs font-bold font-mono shadow cursor-pointer text-center"
                >
                  ?
                </button>
                {/* Inventory Indicator "=" */}
                <button
                  onClick={() => triggerAlert("Đồ dung luyện hầm: Sách Mật mã cổ đại, Bản mã YJR KVR, Khung tranh DEATH.")}
                  className="w-8 h-8 rounded bg-[#3e2f24] border border-stone-800 hover:bg-stone-800 text-[#edeada] flex items-center justify-center text-[10px] tracking-tighter shadow cursor-pointer text-center font-bold"
                >
                  〓
                </button>
                {/* Examine Eye button "👁️" */}
                <button
                  onClick={() => triggerAlert("Bạn nhìn sâu vào khoảng tối hẹp. Những chữ viết ròng ròng trên các vân giấy rách...")}
                  className="w-8 h-8 rounded bg-[#3e2f24] border border-stone-800 hover:bg-stone-800 text-[#edeada] flex items-center justify-center text-xs shadow cursor-pointer text-center"
                >
                  👁️
                </button>
              </div>

              {/* Mortar & Pestle in mortar vector bottom right corner */}
              <div className="w-[38px] h-[38px] bg-[#4a4947] border border-stone-900 rounded-b-xl flex flex-col justify-start items-center shadow-inner pt-1 select-none cursor-pointer"
                onClick={() => triggerAlert("Một cái cối đá cổ rạn nứt. Trong lòng cối trống không, bốc mùi hỏa tiều tùng xỉ than...")}>
                <div className="w-1.5 h-6 bg-stone-700 rounded-t border-r border-[#111] flex shrink-0 -translate-y-2 rotate-[-15deg]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIGENERE CYLINDER LOCK INPUT DIAL POPUP MODAL (styled exactly as image) ==================== */}
      {safeModalOpen && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-[#6b4c35] border-[5px] border-[#1c130e] p-5 rounded-sm shadow-2xl relative w-[95%] max-w-[480px] text-stone-100 font-serif select-none">
            {/* Golden screws at four corners */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ffd700] via-[#cda845] to-[#806517] border border-stone-900 shadow" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ffd700] via-[#cda845] to-[#806517] border border-stone-900 shadow" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ffd700] via-[#cda845] to-[#806517] border border-stone-900 shadow" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#ffd700] via-[#cda845] to-[#806517] border border-stone-900 shadow" />

            {/* Parchment-style Rounded close button */}
            <button
              id="btn_close_safe_modal_detailed"
              onClick={() => {
                setSafeModalOpen(false);
                sound.playDoorOpen();
              }}
              className="absolute top-[-14px] right-[-14px] w-8 h-8 rounded-full bg-[#f4ebd2] border-2 border-stone-950 hover:bg-red-800 hover:text-white text-stone-950 font-sans font-black flex items-center justify-center text-sm shadow-2xl transition-all cursor-pointer z-30"
            >
              X
            </button>
            
            {/* Main Cryptex Wooden slot */}
            <div className="w-full my-2.5 p-3.5 bg-[#402e21] rounded border-2 border-stone-950 shadow-inner flex flex-col items-center">
              
              <span className="text-[10px] uppercase font-mono text-[#ffdf9c] tracking-widest block mb-1">
                XOAY TRỤ GHÉP BẢN RÕ (PLAINTEXT) ĐỂ BẬT CHỐT:
              </span>

              {/* Spinning Cylinder Barrel */}
              <div className="w-full bg-[#1b120c] py-2 px-1 rounded border-2 border-stone-1000 flex justify-center items-center gap-[1px] shadow-inner mb-4 relative">
                {/* Visual axis overlay shine gradients */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-10" />
                
                {/* Left Brass Endcap */}
                <div className="w-2.5 h-[90px] bg-gradient-to-r from-yellow-700 via-amber-400 to-yellow-900 rounded-l border-r border-[#1a110a] shadow shrink-0" />

                {/* 6 Rotatable Columns */}
                {Array.from({ length: 6 }).map((_, idx) => {
                  const curLetter = plaintextSpin[idx] || "A";
                  
                  // Compute alphabetical neighbours
                  const alphabetStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  let cIdx = alphabetStr.indexOf(curLetter);
                  if (cIdx === -1) cIdx = 0;
                  const prevLetter = alphabetStr[(cIdx - 1 + 26) % 26];
                  const nextLetter = alphabetStr[(cIdx + 1) % 26];

                  return (
                    <div key={idx} className="flex flex-col items-center flex-grow shrink duration-100 max-w-[34px]">
                      {/* Interactive Up Button */}
                      <button 
                        onClick={() => handleWheelChange(idx, -1)}
                        className="text-[9px] text-[#cca55e] hover:text-[#ffdf9c] font-sans font-black select-none py-1 pointer-events-auto transform hover:scale-125 duration-100 active:translate-y-[1px]"
                      >
                        ▲
                      </button>

                      {/* Barrel Segment cylinder body */}
                      <div 
                        onClick={() => handleWheelChange(idx, 1)}
                        className="w-full h-[76px] bg-gradient-to-b from-[#1a110a] via-[#ebd0a3] to-[#1a110a] border-x border-[#342315] select-none flex flex-col justify-between items-center py-1 font-sans text-stone-900 cursor-pointer shadow-[inset_0_1px_3px_rgba(255,255,255,0.4),_0_2px_4px_rgba(0,0,0,0.4)] hover:brightness-105 active:brightness-95 duration-150"
                      >
                        {/* Upper element */}
                        <span className="text-[8px] font-semibold text-stone-900/40 select-none scale-90">{prevLetter}</span>
                        {/* Middle highlighted element - INPUTTABLE */}
                        <input
                          type="text"
                          value={curLetter}
                          maxLength={1}
                          onClick={(e) => {
                            e.stopPropagation(); // Avoid turning block
                          }}
                          onChange={(e) => {
                            handleDirectKeyChange(idx, e.target.value);
                          }}
                          className="w-full bg-transparent text-center font-black text-[#56140d] text-[15px] p-0 border-0 focus:outline-none focus:ring-0 select-all uppercase cursor-text scale-110 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                        />
                        {/* Lower element */}
                        <span className="text-[8px] font-semibold text-stone-900/40 select-none scale-90">{nextLetter}</span>
                      </div>

                      {/* Interactive Down Button */}
                      <button 
                        onClick={() => handleWheelChange(idx, 1)}
                        className="text-[9px] text-[#cca55e] hover:text-[#ffdf9c] font-sans font-black select-none py-1 pointer-events-auto transform hover:scale-125 duration-100 active:translate-y-[1px]"
                      >
                        ▼
                      </button>
                    </div>
                  );
                })}

                {/* Right Brass Endcap */}
                <div className="w-2.5 h-[90px] bg-gradient-to-l from-yellow-700 via-amber-400 to-yellow-905 rounded-r border-l border-[#1a110a] shadow shrink-0" />
              </div>

              {/* Input textboxes exactly matching screenshot layout style */}
              <div className="w-full flex flex-col gap-2 font-sans font-bold mt-2">
                <div className="flex flex-col gap-1 mb-2 bg-[#ffdf9c]/10 p-2 rounded border border-[#ffdf9c]/30 text-[10px] text-[#ffdf9c] font-mono leading-relaxed">
                  <span>💡 <strong>Hướng dẫn:</strong> Nhập từ khóa 5 chữ cái ghép được từ bức tranh rách (<strong>DEATH</strong>) vào ô <strong>TỪ KHÓA MẬT MÃ</strong>. Các cột xi-lanh sẽ tự động xoay để giải mã ra Bản Rõ (<strong>VFRROO</strong>).</span>
                </div>
                <div className="flex items-center">
                  <label className="text-[10px] uppercase w-28 tracking-wider select-none text-[#ebdcb9] font-mono shrink-0">TỪ KHÓA MẬT MÃ (KEY):</label>
                  <input
                    type="text"
                    id="input_vigenere_keyword_detailed"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5))}
                    placeholder="Nhập DEATH..."
                    className="flex-grow bg-[#ebdcb9] border-2 border-stone-950 p-1.5 font-mono text-stone-900 text-left font-black tracking-[3px] text-sm focus:bg-white outline-none rounded-sm shadow-inner"
                  />
                </div>
                <div className="flex items-center mt-1">
                  <label className="text-[10px] uppercase w-28 tracking-wider select-none text-[#ebdcb9] font-mono shrink-0">BẢN MÃ (CIPHER):</label>
                  <input
                    type="text"
                    id="input_vigenere_ciphertext_detailed"
                    value={ciphertext}
                    className="flex-grow bg-[#d1c4a5] border-2 border-stone-950 p-1.5 font-mono text-stone-900 text-left font-black tracking-[3px] text-sm outline-none rounded-sm shadow-sm opacity-90 cursor-not-allowed"
                    readOnly
                  />
                </div>
                <div className="flex items-center mt-1">
                  <label className="text-[10px] uppercase w-28 tracking-wider select-none text-[#ebdcb9] font-mono shrink-0">BẢN RÕ (PLAINTEXT):</label>
                  <input
                    type="text"
                    id="input_vigenere_plaintext_type"
                    value={plaintextSpin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);
                      const padded = (val + "AAAAAA").slice(0, 6);
                      setPlaintextSpin(padded);
                    }}
                    placeholder="Sẽ tự động xoay..."
                    className="flex-grow bg-[#ebdcb9] border-2 border-stone-950 p-1.5 font-mono text-stone-900 text-left font-black tracking-[3px] text-sm focus:bg-white outline-none rounded-sm shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Verification action button */}
            <div className="w-full flex justify-center mt-4">
              <button
                id="btn_submit_vigenere_detailed"
                onClick={handleSubmitVigenere}
                className="bg-[#533b2a] hover:bg-[#8b1a15] text-[#eeeada] border-2 border-[#1c140e] font-sans font-black uppercase text-xs tracking-widest px-11 py-2.5 rounded shadow-lg transition-transform active:scale-95 duration-100 cursor-pointer"
              >
                GIẢI MÃ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spooky Knowledge Explanation Modal overlay */}
      {showExplanation && (
        <div className="absolute inset-0 bg-black/95 z-55 flex items-center justify-center p-4 overflow-y-auto font-pixel">
          <div className="pixel-card max-w-[600px] w-full text-stone-200 border-[#ffaa00] bg-[#1c120c] flex flex-col justify-between">
            <div>
              <div className="text-red-500 text-sm font-bold border-b-2 border-red-950 pb-2 mb-3 tracking-widest text-center">
                THƯ TỊCH CỔ: MẬT MÃ VIGENÈRE
              </div>
              
              <div className="text-[9px] text-stone-400 font-mono mb-2 text-right">
                CHUYÊN ĐỀ: MẬT MÃ NHIỀU BẢNG CHỮ CÁI
              </div>

              <div className="space-y-3 text-[10px] leading-relaxed max-h-[300px] overflow-y-auto pr-2">
                <div className="bg-black/30 p-2 border-l-4 border-[#ffaa00]">
                  <strong className="text-[#ffaa00]">1. Nguyên lý hoạt động:</strong>
                  <p className="mt-1 text-stone-300">
                    Mật mã Vigenère cải tiến từ Caesar bằng cách sử dụng một từ khóa có độ dài bất kỳ. Mỗi ký tự trong từ khóa chỉ định một khoảng tịnh tiến riêng cho chữ cái bản rõ tương ứng theo vòng lặp tuần hoàn.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-red-700">
                  <strong className="text-red-400">2. Lỗ hổng dùng lại khóa (Key Reuse):</strong>
                  <p className="mt-1 text-stone-300">
                    Yếu điểm chết người của Vigenère là **tính tuần hoàn của khóa**. Nếu bản văn dài và dùng lại cùng một khóa, tin tặc có thể phân tích chu kỳ lặp để đoán độ dài khóa (phương pháp Kasiski) và dùng tần suất thống kê chữ cái để phá giải từng cụm dễ dàng.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-[#00ff00]">
                  <strong className="text-[#00ff00]">3. Bản nâng cấp an toàn tuyệt đối: One-Time Pad</strong>
                  <p className="mt-1 text-stone-300">
                    Để đạt bảo mật hoàn hảo, khóa băm phải dài tối thiểu bằng bản rõ, hoàn toàn ngẫu nhiên và tuyệt đối không bao giờ được dùng lại lần thứ hai (One-Time Pad).
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
