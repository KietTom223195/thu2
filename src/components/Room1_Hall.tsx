import { useState, useEffect } from "react";
import { sound } from "./AudioEngine";

interface Room1Props {
  onLevelCleared: (nextLevel: number, message: string, bonusScore: number) => void;
  triggerAlert: (msg: string, isSuccess?: boolean) => void;
  sessionId: string;
}

export default function Room1_Hall({ onLevelCleared, triggerAlert, sessionId }: Room1Props) {
  const [modalOpen, setModalOpen] = useState(true); // Default open to showcase the beautiful interface matching screenshot!
  const [selectedCipher, setSelectedCipher] = useState("KHOOR"); // Start with KHOOR to match screenshot, can select ILWGQX to pass
  const [currentK, setCurrentK] = useState(0);
  const [resultText, setResultText] = useState("");
  const [crowBubbleVisible, setCrowBubbleVisible] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const runes = [
    "ᛥ", "ᛖ", "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ", "ᛁ", 
    "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛋ", "ᛏ", "ᛒ", "ᛗ", "ᛚ", "ᛜ", "ᛞ", "ᛟ", "ᚤ"
  ];

  // Recalculate plaintext in realtime whenever chosen key k or ciphertext changes
  useEffect(() => {
    let plain = "";
    for (let i = 0; i < selectedCipher.length; i++) {
      const char = selectedCipher[i];
      if (alphabet.includes(char)) {
        const code = char.charCodeAt(0) - 65;
        const pCode = (code - currentK + 26) % 26;
        plain += alphabet[pCode];
      } else {
        plain += char;
      }
    }
    setResultText(plain);
  }, [selectedCipher, currentK]);

  const handleAdjustK = (amount: number) => {
    const newK = (currentK + amount + 26) % 26;
    setCurrentK(newK);
    sound.playMetalClash();
  };

  const handleSpeakToCrow = () => {
    setCrowBubbleVisible(true);
    sound.playSpookyPulse();
    triggerAlert(
      "Ngài Quạ khàn giọng trầm đục: 'Chìa khóa nằm ngay trên vách tường... Hãy giải mã chuỗi KHOOR và ILWGQX bằng bánh xe số tịnh tiến để tiến bước.'",
      true
    );
    setTimeout(() => setCrowBubbleVisible(false), 5000);
  };

  const handleSubmitSolution = async () => {
    try {
      const res = await fetch("/api/verify_caesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ ciphertext: selectedCipher, k: currentK }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setModalOpen(false);
        sound.playSuccess();
        setSuccessMessage(data.message);
        setShowExplanation(true);
      } else {
        triggerAlert(data.message || "Bánh xe xoay kẹt cứng, chốt cửa phát ra tiếng gầm gừ cự tuyệt...", false);
      }
    } catch (err: any) {
      triggerAlert("Có luồng năng lượng tà ác cản trở vòng đá tịnh tiến...", false);
    }
  };

  const handleCloseExplanation = () => {
    setShowExplanation(false);
    onLevelCleared(2, successMessage, 100);
  };

  const innerRotationAngle = -currentK * (360 / 26);

  // Helper to draw circular letters dynamically around centers
  const renderRadialLetters = (radius: number, colorStyle: string, isKeyShifted = false) => {
    const lettersOffset = isKeyShifted ? innerRotationAngle : 0;
    return alphabet.split("").map((letter, i) => {
      const angle = (i * 360) / 26 - 90 + lettersOffset;
      const rad = (angle * Math.PI) / 180;
      const x = 110 + radius * Math.cos(rad);
      const y = 110 + radius * Math.sin(rad);
      return (
        <text
          key={i}
          x={x}
          y={y}
          transform={`rotate(${angle + 90}, ${x}, ${y})`}
          className={`text-[8px] font-sans font-extrabold select-none transition-transform duration-300 ${colorStyle}`}
          style={{ textAnchor: "middle", dominantBaseline: "central" }}
        >
          {letter}
        </text>
      );
    });
  };

  // Helper to draw magical Futhark runes around centers
  const renderRadialRunes = (radius: number, colorStyle: string) => {
    return runes.map((rune, i) => {
      const angle = (i * 360) / 26 - 90 + innerRotationAngle;
      const rad = (angle * Math.PI) / 180;
      const x = 110 + radius * Math.cos(rad);
      const y = 110 + radius * Math.sin(rad);
      return (
        <text
          key={i}
          x={x}
          y={y}
          transform={`rotate(${angle + 90}, ${x}, ${y})`}
          className={`text-[9px] font-mono leading-none select-none transition-transform duration-300 ${colorStyle}`}
          style={{ textAnchor: "middle", dominantBaseline: "central" }}
        >
          {rune}
        </text>
      );
    });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#120f0c] text-stone-200 select-none flex flex-row items-stretch">
      {/* Root Ambient Dark Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.9))] z-20" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-20 z-20" />

      {/* ========================================================================= */}
      {/* SECTION 1: LEFT WALL WITH THE DAMASK WALLPAPER, BLOOD "3", & "KHOOR" WORK */}
      {/* ========================================================================= */}
      <div 
        className="w-[33%] bg-[#241a13] border-r-4 border-stone-950 relative flex flex-col justify-between p-4 z-10 overflow-hidden shadow-[2px_0_15px_rgba(0,0,0,0.9)]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(30,22,16,0.3) 0%, rgba(12,8,6,0.5) 100%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='160' viewBox='0 0 100 160'><g fill='none' stroke='%23423023' stroke-width='0.75' opacity='0.3'><path d='M50 10 C35 35, 35 55, 50 80 C65 55, 65 35, 50 10 Z'/><path d='M50 80 C25 95, 10 115, 10 135 C10 155, 30 160, 50 180 C70 160, 90 155, 90 135 C90 115, 75 95, 50 80 Z'/><path d='M10 135 C-5 125, -5 105, 10 95 C25 105, 25 125, 10 135 Z'/><path d='M90 135 C75 125, 75 105, 90 95 C105 105, 105 125, 90 135 Z'/></g></svg>")
          `,
          backgroundSize: "cover, 80px 128px"
        }}
      >
        {/* Wall lamp on the left wall */}
        <div className="absolute top-[8%] right-6 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-amber-400/30 blur-md absolute top-1 animate-pulse" />
          <svg viewBox="0 0 40 60" className="w-8 h-12 drop-shadow-[0_4px_8px_black]">
            <path d="M20,5 L8,32 Q20,38 32,32 Z" fill="rgba(255,220,150,0.6)" stroke="#22160d" strokeWidth="1.5" className="animate-pulse" />
            <path d="M20,8 L15,22 Q20,25 25,22 Z" fill="#ff9f1c" className="animate-pulse" />
            <rect x="18" y="32" width="4" height="15" fill="#a4845c" stroke="#111" />
            <path d="M12,47 H28 V52 H12 Z" fill="#4d321d" stroke="#111" />
            {/* Curved bracket */}
            <path d="M20,52 C20,52 30,55 35,50" fill="none" stroke="#a4845c" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Vintage Desk with Cabriole Legs & Oval Mirror in background */}
        <div className="absolute bottom-[8%] left-[10%] w-[80%] flex flex-col items-center opacity-70 pointer-events-none">
          {/* Gilded Oval Mirror on Wall */}
          <div className="w-16 h-24 rounded-full bg-[#1b2a30]/80 border-[3.5px] border-[#a48243] shadow-[inset_0_3px_10px_rgba(0,0,0,0.8),_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center relative mb-2">
            <div className="absolute top-2 right-2 w-4 h-16 bg-white/5 rotate-12 rounded-full" />
          </div>
          {/* Wood Console Table */}
          <div className="w-full h-8 bg-[#3d2719] border border-stone-950 rounded-sm relative flex justify-between px-2">
            <div className="w-1 h-8 bg-stone-900" />
            <div className="w-2 h-4 bg-amber-800/20 border border-stone-950 self-center rounded-sm" />
            <div className="w-1 h-8 bg-stone-900" />
          </div>
          <div className="w-full flex justify-between px-3">
            {/* Curved legs */}
            <div className="w-1.5 h-16 bg-[#2d1b10] border-r border-stone-950 rounded-b-xl" style={{ transform: "skewX(4deg)" }} />
            <div className="w-1.5 h-16 bg-[#2d1b10] border-l border-stone-950 rounded-b-xl" style={{ transform: "skewX(-4deg)" }} />
          </div>
        </div>

        {/* Red dripping blood "3" */}
        <div className="mt-8 flex flex-col items-center">
          <svg viewBox="0 0 160 160" className="w-[110px] h-[110px] drop-shadow-[1px_2px_4px_rgba(0,0,0,0.95)]">
            {/* Bloody 3 path with beautiful crimson flow */}
            <path 
              d="M35,28 C50,22 95,20 100,28 C105,35 90,62 75,65 C95,65 118,85 110,110 C102,130 54,128 38,122 M75,65 L72,78 L70,95 M105,105 L106,128 L107,142 M42,122 L41,135" 
              fill="none" 
              stroke="#800c0c" 
              strokeWidth="11" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Added blood splatters */}
            <circle cx="48" cy="132" r="2.5" fill="#800c0c" />
            <circle cx="107" cy="148" r="3" fill="#800c0c" />
            <circle cx="70" cy="104" r="2" fill="#800c0c" />
            <circle cx="82" cy="72" r="1.5" fill="#800c0c" />
          </svg>
        </div>

        {/* Torn Parchment Paper with duct tape saying "KHOOR" skew angled */}
        <button
          id="btn_examine_wall_clue"
          onClick={() => triggerAlert("Mảnh nến nhăn nhún ghi chữ 'KHOOR'. Phía trên sườn gạch bôi vệt dịch máu số 3. Đó là gợi ý giải tích tiến k = 3!")}
          className="mx-auto w-[150px] bg-[#dfcca7] border border-stone-850 p-3 shadow-[2px_10px_20px_rgba(0,0,0,0.7)] transform rotate-[-4deg] hover:rotate-[-2deg] duration-300 relative select-none flex flex-col items-center justify-center border-dashed cursor-pointer z-20 mb-8"
        >
          {/* Simulated gray mounting tape pieces */}
          <div className="absolute top-[-8px] left-[15px] w-6 h-3.5 bg-stone-500/40 border border-stone-600/20 rotate-[-12deg] shadow-sm" />
          <div className="absolute top-[-6px] right-[20px] w-7 h-3 bg-stone-500/40 border border-stone-600/20 rotate-[18deg] shadow-sm" />
          
          <div className="w-full text-center border-stone-800 p-0.5">
            <span className="font-sans font-black text-[#1e130a] text-2xl tracking-[4px] uppercase select-text block">
              KHOOR
            </span>
          </div>
        </button>

        {/* Dark Wood Trim Baseboard */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-stone-900 border-t border-stone-950 pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DEEP HALLWAY CORRIDOR VIEWPORT WITH DOORS AND PERSPECTIVE */}
      {/* ========================================================================= */}
      <div className="flex-grow bg-[#161210] relative flex items-end justify-center">
        {/* Background corridor walls perspective */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Red carpet runner lines */}
          <svg viewBox="0 0 300 640" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <polygon points="120,410 210,410 240,640 90,640" className="fill-[#631818] opacity-60" />
            <polygon points="120,410 210,410 220,640 110,640" className="fill-[#4d1010] opacity-50" />
          </svg>

          {/* Symmetrical wall trims */}
          <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-stone-800/40" />
          <div className="absolute top-0 bottom-0 right-[15%] w-[1px] bg-stone-800/40" />
          
          {/* Distant background wall light sconce */}
          <div className="absolute top-[28%] left-[24%] w-2 h-2 rounded-full bg-amber-500 blur-sm animate-pulse" />
          <div className="absolute top-[28%] left-[24%] w-[3px] h-[8px] bg-stone-700" />

          {/* Arched wooden frame structure in the center hallway */}
          <svg viewBox="0 0 200 200" className="absolute top-[10%] left-[8%] w-[84%] h-[90%] opacity-25">
            <path d="M10,200 V70 A80,80 0 0,1 190,70 V200" fill="none" stroke="#523927" strokeWidth="8" />
            <path d="M22,200 V75 A68,68 0 0,1 178,75 V200" fill="none" stroke="#2c1d13" strokeWidth="3" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: DOOR TO "THƯ VIỆN" AND GENTLEMAN CROW (NGÀI QUẠ) ON THE RIGHT */}
        {/* ========================================================================= */}
        {/* "THƯ VIỆN" Door on Right panel wall */}
        <div className="absolute right-[6%] bottom-[20%] w-[110px] h-[190px] flex flex-col items-center">
          <button
            onClick={() => triggerAlert("Cổng rào gỗ sẫm dẫn sâu vào Thư viện. Hãy dùng k = 3 để bẻ khóa sảnh chính và mở cửa này!")}
            className="w-full h-full border-4 border-[#3e2e21] rounded bg-gradient-to-b from-[#1b120c] to-[#0c0805] hover:bg-stone-900 flex flex-col items-center justify-between py-6 transition-colors duration-300 relative shadow-[0_12px_24px_rgba(0,0,0,0.95)] cursor-pointer group border-b-[6px]"
          >
            {/* Panel recessed moldings */}
            <div className="w-[80%] h-[35%] border-2 border-[#2b1f14] rounded-sm bg-black/30 flex items-center justify-center p-1">
              <span className="text-[12px] font-mono tracking-widest text-[#a8825c] group-hover:text-amber-500 duration-150 select-none uppercase">THƯ VIỆN</span>
            </div>
            
            {/* Rusty Padlock Icon */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 24 32" className="w-8 h-10 fill-current text-[#a4845c] drop-shadow-[0_2px_6px_black] animate-pulse">
                <path d="M12,2 C7.5,2 4.5,5 4.5,9 L4.5,14 H19.5 V9 C19.5,5 16.5,2 12,2 Z" fill="none" stroke="#a4845c" strokeWidth="3" />
                <rect x="2" y="12" width="20" height="18" rx="3" fill="#6d5438" stroke="#111" strokeWidth="1.5" />
                <circle cx="12" cy="20" r="2.5" fill="#111" />
                <path d="M12,20 L12,27 H14 L12,20 Z" fill="#111" />
              </svg>
            </div>

            <span className="text-[7px] font-mono tracking-widest text-stone-500 uppercase mt-1">KHÓA SẬP</span>
          </button>
        </div>

        {/* Ngài Quạ (Mr. Crow) dressed in fine black suit sitting in highback armchair */}
        <div className="absolute right-[3%] bottom-[2%] w-[130px] h-[145px] flex flex-col items-center z-10">
          {/* Speach text bubble when talking to Crow */}
          {crowBubbleVisible && (
            <div className="absolute bottom-[115px] right-[-10px] w-[210px] bg-[#1a1512] text-stone-200 text-[10px] leading-relaxed border border-red-900 p-3 rounded-lg shadow-2xl text-center after:content-[''] after:absolute after:bottom-[-8px] after:right-[40px] after:border-t-8 after:border-t-[#1a1512] after:border-x-8 after:border-transparent z-40">
              "Hãy quay bánh xe đá tịnh tiến k = 3 dịch chuyển mã KHOOR thành HELLO, rồi dịch mã chính cửa để khơi mật cảnh!"
            </div>
          )}

          {/* Victorian armchair containing the Crow gentleman */}
          <button
            id="btn_talk_to_crow"
            onClick={handleSpeakToCrow}
            className="w-full h-full bg-center bg-no-repeat bg-contain cursor-pointer relative flex justify-center items-end"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 130'><path d='M15,120 L85,120 L88,140 L12,140 Z' fill='%233a1e1b' stroke='%23000' stroke-width='2.5'/><path d='M8,55 L20,95 L15,130 L3,95 Z' fill='%23220f0d' stroke='%23000' stroke-width='1.5'/><path d='M92,55 L80,95 L85,130 L97,95 Z' fill='%23220f0d' stroke='%23000' stroke-width='1.5'/><path d='M15,55 L85,55 L85,95 L15,95 Z' fill='%23481b18' stroke='%23000' stroke-width='2'/><circle cx='50' cy='35' r='20' fill='%231f1f1e' stroke='%23111' stroke-width='2'/><path d='M35,32 Q50,48 65,32 L50,44 Z' fill='%23e0a816' stroke='%23111'/></svg>")`
            }}
          >
            {/* Crow detailed suit jacket render */}
            <div className="absolute top-[40px] w-20 h-24 pointer-events-none flex flex-col items-center">
              {/* Crow beady orange-yellow eyes with custom gleam */}
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping absolute top-[-10px] left-[26px]" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping absolute top-[-10px] left-[42px]" />
              
              {/* Suit Body */}
              <svg viewBox="0 0 60 80" className="w-14 h-20">
                {/* White dynamic shirt collar */}
                <polygon points="20,10 30,30 25,10" fill="#fff" />
                <polygon points="40,10 30,30 35,10" fill="#fff" />
                {/* Slim dark tie */}
                <polygon points="28,24 32,24 33,55 30,62 27,55" fill="#2b2d2f" stroke="#111" strokeWidth="0.5" />
                {/* Black sleek wings suit jacket lapels */}
                <path d="M10,12 L30,32 L26,75 L5,35 Z" fill="#1e1f21" stroke="#000" strokeWidth="1" />
                <path d="M50,12 L30,32 L34,75 L55,35 Z" fill="#1e1f21" stroke="#000" strokeWidth="1" />
                {/* Fancy red lapel rose */}
                <circle cx="16" cy="24" r="2.5" fill="#a11111" />
                <circle cx="18" cy="25" r="1.5" fill="#c41a1a" />
              </svg>
            </div>
            
            <span className="bg-[#1a0f0a] border border-red-950 px-1.5 py-0.5 text-[7px] text-[#bf9e65] font-mono tracking-widest scale-90 uppercase translate-y-[-6px] rounded-sm select-none shadow">NGÀI QUẠ</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: CLASSICAL WOOD PEDESTAL WITH GIANT MOUNTED CAESAR STONE WHEEL */}
        {/* ========================================================================= */}
        <div className="absolute left-[45%] bottom-[14%] w-[200px] flex flex-col items-center">
          {/* Decorative baroque brackets layout for the mounting */}
          <div 
            id="btn_open_caesar_wheel"
            onClick={() => {
              setModalOpen(true);
              sound.playDoorOpen();
            }}
            className="w-[180px] h-[180px] flex items-center justify-center relative select-none cursor-pointer group z-10"
          >
            {/* SVG Interactive Caesar Stone Wheel with runes */}
            <svg viewBox="0 0 220 220" className="w-[180px] h-[180px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]">
              {/* Pedestal classic curved mounting bracket with bottom scrollwork */}
              <path d="M40,195 Q8,195 24,160 Q34,145 60,150 L160,150 Q186,145 196,160 Q212,195 180,195 Z" fill="#2c1f17" stroke="#111" strokeWidth="2" />
              <circle cx="50" cy="172" r="5" fill="#4d3728" stroke="#111" />
              <circle cx="170" cy="172" r="5" fill="#4d3728" stroke="#111" />
              
              {/* Outer classic wooden static dial containing the alphabet */}
              <circle cx="110" cy="110" r="92" fill="#3e2d21" stroke="#100b08" strokeWidth="3" />
              <circle cx="110" cy="110" r="82" fill="#2d1f16" stroke="#111" strokeWidth="1" />
              <g>{renderRadialLetters(87, "fill-[#ebdcb9] font-sans")}</g>

              {/* Middle dynamic stone dial containing runic/alchemy symbols */}
              <circle cx="110" cy="110" r="74" fill="#31221a" stroke="#100b08" strokeWidth="2.5" />
              <g className="origin-[110px_110px] transition-transform duration-300 pointer-events-none">
                {renderRadialRunes(65, "fill-red-500/70 font-mono")}
              </g>

              {/* Inner sandstone dial containing letters */}
              <circle cx="110" cy="110" r="56" fill="#ded5bf" stroke="#3c2f24" strokeWidth="2" />
              <circle cx="110" cy="110" r="44" fill="#cfc6ae" stroke="#3c2f24" strokeWidth="1" />
              <g className="origin-[110px_110px] transition-transform duration-300 pointer-events-none">
                {renderRadialLetters(50, "fill-stone-900 font-sans", true)}
              </g>

              {/* Rotating Concentric Inner Stone core */}
              <circle cx="110" cy="110" r="32" fill="#8d7d6c" stroke="#111" strokeWidth="2" />
              <circle cx="110" cy="110" r="16" fill="#3d2d20" stroke="#111" strokeWidth="1.5" />
              <polygon points="105,110 115,110 110,95" fill="#111" />

              {/* Top pointer arrow indicating alignment selection point */}
              <polygon points="110,6 104,22 116,22" fill="#e2dab7" stroke="#100b08" strokeWidth="1.5" />
              <line x1="110" y1="6" x2="110" y2="28" stroke="#a11111" strokeWidth="1.5" />
            </svg>
            
            {/* Glow Aura when hovering / interacting */}
            <div className="absolute inset-0 bg-amber-400/5 rounded-full opacity-0 group-hover:opacity-100 duration-300 pointer-events-none" />
          </div>

          {/* Classic wooden column pedestal base with heavy detailed molding */}
          <div className="w-[110px] h-[75px] bg-[#2a1d15] border-x-4 border-[#16100c] relative shadow-2xl flex flex-col items-center justify-between pointer-events-none border-b-8 select-none">
            {/* Pedestal Capital head */}
            <div className="w-[130px] h-4 bg-[#3d2c20] border-y border-stone-950 shadow-md" />
            
            {/* Inscription line */}
            <div className="bg-stone-950/70 px-2.5 py-0.5 rounded border border-stone-850 transform scale-75 mt-0.5">
              <span className="text-[7.5px] text-[#bf9e65] font-mono tracking-widest font-black uppercase">
                MẬT QUỸ K={currentK}
              </span>
            </div>

            {/* Pedestal Plinth bottom */}
            <div className="w-[140px] h-5 bg-[#3d2c20] border-t border-stone-950" />
          </div>
        </div>

        {/* Foreground Stone Floor overlay */}
        <div className="absolute bottom-0 inset-x-0 h-3 bg-stone-950 pointer-events-none border-t border-stone-900 shadow-inner" />
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: THE Parchment Dialog Modal placed side-by-side on the LEFT */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="absolute inset-x-0 top-0 bottom-0 bg-black/60 z-30 transition-opacity flex items-center justify-start px-2 md:px-12 pointer-events-auto">
          {/* Parchment box overlay on the left, next to Caesar Wheel on pedestal */}
          <div className="bg-[#ebdcb9] border-[10px] border-[#3e2e21] p-6 rounded shadow-2xl relative w-full max-w-[430px] text-stone-900 font-serif translate-y-4 animate-fade-in z-40">
            {/* Wooden tactile frame outline and Close button */}
            <button
              onClick={() => {
                setModalOpen(false);
                sound.playDoorOpen();
              }}
              className="absolute top-2 right-3 w-8 h-8 rounded border border-stone-950 bg-[#3a2818] hover:bg-[#8b1a15] text-white flex items-center justify-center font-sans font-bold text-lg shadow hover:scale-105 duration-105 cursor-pointer"
            >
              &times;
            </button>
            
            {/* Header section with Times New Roman serif styling exactly as mockup */}
            <div className="text-center pb-2.5 border-b border-stone-800/20 mb-4">
              <h2 className="font-serif font-extrabold tracking-[2px] text-[#2c1a0e] text-2xl uppercase">
                GIẢI MÃ CAESAR
              </h2>
            </div>

            {/* Selection dropdown inside parchment modal representing ciphers */}
            <div className="flex items-center gap-3 justify-center mb-4 text-[11px] font-sans">
              <label className="font-mono text-stone-600 uppercase font-black tracking-wide">CHUỖI NHẬM:</label>
              <select
                id="select_ciphertext"
                value={selectedCipher}
                onChange={(e) => setSelectedCipher(e.target.value)}
                className="bg-[#dfcca7] border border-stone-950/70 p-1 rounded font-mono text-center font-bold text-xs select-none outline-none cursor-pointer focus:bg-[#f1e5c2] text-stone-900"
              >
                <option value="KHOOR">KHOOR (Bút tích sườn tường)</option>
                <option value="ILWGQX">ILWGQX (Mã khóa sập cửa thư viện)</option>
              </select>
            </div>

            {/* Concentric-shaped internal frame */}
            <div className="w-full p-4 bg-[#f8f5ea]/80 rounded border border-amber-950/20 shadow-inner flex flex-col gap-4">
              
              {/* Ciphertext label display */}
              <div className="text-center font-serif py-1.5 border-b border-dashed border-stone-300">
                <span className="text-[12px] uppercase text-stone-500 font-mono">BẢN MÃ CHỌN:</span>
                <span className="font-mono text-[#8a1a15] font-black text-2xl block tracking-widest mt-0.5">
                  {selectedCipher}
                </span>
              </div>

              {/* Number rotation dial adjust layout (SỐ BƯỚC DỊCH (k)) with stack indicators */}
              <div className="flex items-center justify-between text-stone-900">
                <span className="text-[11px] font-sans font-black tracking-widest text-[#2c1a0e] uppercase shrink-0">
                  SỐ BƯỚC DỊCH (k):
                </span>
                
                <div className="flex items-center gap-1.5">
                  {/* Grey tactile numerical container */}
                  <div className="w-[64px] h-9 bg-zinc-400 border-[2.5px] border-stone-950 rounded shadow-inner flex items-center justify-center font-sans font-black text-[#1a110a] text-lg select-all">
                    {currentK}
                  </div>
                  
                  {/* Small styled vertical triangle controls (wooden spinning style) */}
                  <div className="flex flex-col gap-[3px] w-[26px]">
                    <button
                      onClick={() => handleAdjustK(1)}
                      className="bg-[#3e2e21] hover:bg-[#8b1a15] text-[#ebdcb9] border border-stone-950 rounded-sm text-[8px] py-1 select-none focus:outline-none flex justify-center items-center h-4 cursor-pointer hover:scale-105"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleAdjustK(-1)}
                      className="bg-[#3e2e21] hover:bg-[#8b1a15] text-[#ebdcb9] border border-stone-950 rounded-sm text-[8px] py-1 select-none focus:outline-none flex justify-center items-center h-4 cursor-pointer hover:scale-105"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Output text-bar (CHUỒI KẾT QUẢ) in ivory rectangle box */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-sans font-black tracking-widest text-stone-600 uppercase text-left">
                  CHUỒI KẾT QUẢ:
                </span>
                <div className="w-full bg-[#f1ebd6] border-[2px] border-stone-950 p-2 text-center rounded flex items-center justify-center shadow-inner h-11">
                  <span className="font-mono text-[#aa201a] font-extrabold uppercase text-xl tracking-[4px]">
                    {resultText || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dark wood bordered red action button precisely matches screenshot */}
            <div className="w-full flex justify-center mt-6">
              <button
                id="btn_submit_caesar"
                onClick={handleSubmitSolution}
                className="bg-[#78221b] hover:bg-red-800 text-[#ebdcb9] border-2 border-stone-950 font-sans tracking-[4px] uppercase text-xs font-black rounded-sm py-2.5 px-10 shadow-lg select-none duration-150 cursor-pointer"
                style={{ borderWidth: "3.5px" }}
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spooky Knowledge Explanation Modal overlay */}
      {showExplanation && (
        <div className="absolute inset-0 bg-black/95 z-55 flex items-center justify-center p-4 overflow-y-auto font-pixel">
          <div className="pixel-card max-w-[600px] w-full text-stone-200 border-red-900 bg-[#1c120c] flex flex-col justify-between">
            <div>
              <div className="text-red-500 text-sm font-bold border-b-2 border-red-950 pb-2 mb-3 tracking-widest text-center">
                THƯ TỊCH CỔ: MẬT MÃ CAESAR
              </div>
              
              <div className="text-[9px] text-stone-400 font-mono mb-2 text-right">
                CHUYÊN ĐỀ: MẬT MÃ TỊNH TIẾN CỔ ĐIỂN
              </div>

              <div className="space-y-3 text-[10px] leading-relaxed max-h-[300px] overflow-y-auto pr-2">
                <div className="bg-black/30 p-2 border-l-4 border-[#ffaa00]">
                  <strong className="text-[#ffaa00]">1. Nguyên lý hoạt động:</strong>
                  <p className="mt-1 text-stone-300">
                    Mật mã Caesar là một trong những kỹ thuật mã hóa đối xứng cổ điển và đơn giản nhất. Nó hoạt động bằng cách dịch chuyển mỗi chữ cái trong bản rõ đi một số bước cố định (khóa \(k\)) trong bảng chữ cái để tạo thành bản mã. Công thức mã hóa: \(C = (P + k) \pmod{26}\).
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-red-700">
                  <strong className="text-red-400">2. Điểm yếu bảo mật (Lỗ hổng thiết kế):</strong>
                  <p className="mt-1 text-stone-300">
                    Mật mã Caesar có không gian khóa cực kỳ nhỏ. Vì bảng chữ cái tiếng Anh chỉ có 26 ký tự, chỉ có tối đa **25 khóa hợp lệ**. Kẻ tấn công có thể dễ dàng giải mã bằng phương pháp **vét cạn (Brute Force)**: thử tất cả 25 khóa và tìm bản dịch có ý nghĩa trong vài phần triệu giây.
                  </p>
                </div>

                <div className="bg-black/30 p-2 border-l-4 border-[#00ff00]">
                  <strong className="text-[#00ff00]">3. Bài học thực tiễn:</strong>
                  <p className="mt-1 text-stone-300">
                    Mật mã này không an toàn cho bất kỳ giao tiếp thực tế nào. Tuy nhiên, nó là nền tảng để hiểu các phương pháp mã hóa khóa đối xứng phức tạp hơn sau này.
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
