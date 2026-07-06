import React, { useState, useEffect, useCallback, useRef } from "react";


interface GuildHallEntranceProps {
  onEnter: () => void;
}

// ── char_0.png: 112×96 px | 7 cols × 3 rows | frame = 16×32 px
// Display at 4x scale → sprite = 64×128 px
type Dir = "left" | "right" | "down" | "up";

export default function GuildHallEntrance({ onEnter }: GuildHallEntranceProps) {
  const [charX, setCharX] = useState(48);
  const [dir, setDir] = useState<Dir>("down");
  const [frame, setFrame] = useState(0); // 0 = idle, 1 = walk1, 2 = walk2
  const [moving, setMoving] = useState(false);
  const [entering, setEntering] = useState(false);

  // Animation states
  const [flagFrame, setFlagFrame] = useState(0);
  const [fireFrame, setFireFrame] = useState(0);

  const [targetX, setTargetX] = useState<number | null>(null);
  const [autoEnterOnArrive, setAutoEnterOnArrive] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (entering) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Boundary clamp: 5% to 95%
    const safeTargetX = Math.max(5, Math.min(95, clickXPercent));
    setTargetX(safeTargetX);
    
    // If clicked near the door on the far right (X >= 80%), trigger auto enter upon arrival
    if (safeTargetX >= 80) {
      setAutoEnterOnArrive(true);
    } else {
      setAutoEnterOnArrive(false);
    }
  };

  const keys = useRef<Record<string, boolean>>({});
  const moveId = useRef<number | null>(null);
  const animId = useRef<number | null>(null);

  const nearDoor = charX >= 82;

  // Banners animation tick (12 frames)
  useEffect(() => {
    const flagId = setInterval(() => {
      setFlagFrame(f => (f + 1) % 12);
    }, 110);
    return () => clearInterval(flagId);
  }, []);

  // Torch fire animation tick (24 frames)
  useEffect(() => {
    const fireId = setInterval(() => {
      setFireFrame(f => (f + 1) % 24);
    }, 70);
    return () => clearInterval(fireId);
  }, []);

  const onDown = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = true;
    const isUp = ["Space", "Enter", "ArrowUp", "KeyW"].includes(e.code);
    if (isUp && nearDoor && !entering) {
      e.preventDefault();
      setDir("up");
      setEntering(true);
      setTimeout(() => onEnter(), 750);
      return;
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "Space", "Enter"].includes(e.code)) {
      e.preventDefault();
    }
  }, [nearDoor, entering, onEnter]);

  const onUp = useCallback((e: KeyboardEvent) => {
    keys.current[e.code] = false;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [onDown, onUp]);

  useEffect(() => {
    moveId.current = window.setInterval(() => {
      if (entering) return;
      
      const L = keys.current["ArrowLeft"] || keys.current["KeyA"];
      const R = keys.current["ArrowRight"] || keys.current["KeyD"];
      
      if (L) {
        setDir("left");
        setMoving(true);
        setCharX(x => Math.max(5, x - 0.45));
        setTargetX(null); // Key presses cancel auto walk
        setAutoEnterOnArrive(false);
      } else if (R) {
        setDir("right");
        setMoving(true);
        setCharX(x => Math.min(95, x + 0.45));
        setTargetX(null); // Key presses cancel auto walk
        setAutoEnterOnArrive(false);
      } else if (targetX !== null) {
        // Auto walk logic
        setCharX(x => {
          const diff = targetX - x;
          if (Math.abs(diff) < 0.5) {
            setTargetX(null);
            setMoving(false);
            
            // If near the door on the far right and auto enter is flagged, enter room
            if (autoEnterOnArrive && x >= 82) {
              setDir("up");
              setEntering(true);
              setAutoEnterOnArrive(false);
              setTimeout(() => onEnter(), 750);
            }
            return x;
          }
          
          const step = 0.45;
          if (diff > 0) {
            setDir("right");
            setMoving(true);
            return Math.min(targetX, x + step);
          } else {
            setDir("left");
            setMoving(true);
            return Math.max(targetX, x - step);
          }
        });
      } else {
        setMoving(false);
      }
    }, 16);
    return () => {
      if (moveId.current) clearInterval(moveId.current);
    };
  }, [entering, targetX, autoEnterOnArrive, onEnter]);

  // Frame tick animation for 7x3 character sheet
  useEffect(() => {
    animId.current = window.setInterval(() => {
      if (moving) setFrame(f => (f === 1 ? 2 : 1));
      else setFrame(0);
    }, 110);
    return () => {
      if (animId.current) clearInterval(animId.current);
    };
  }, [moving]);

  const getPlayerBgPos = () => {
    const colPercent = (frame * 100) / 6;
    let rowPercent = 0;
    if (dir === "down") rowPercent = 0;
    else if (dir === "up") rowPercent = 50;
    else rowPercent = 100;
    return `${colPercent}% ${rowPercent}%`;
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleContainerClick}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "#000",
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        userSelect: "none",
        cursor: "pointer",
      }}>
      {/* Background container to crop and display only the top half of the battleground (1 dragon) */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "200%",
        backgroundImage: "url(/assets/battleground.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* ── Interactive Arched Pixel-Art Door on the far right end ── */}
      <div style={{
        position: "absolute",
        bottom: "16%", // placed on the carpet road
        left: "90%", // at the far right end
        transform: "translateX(-50%)",
        width: "68px",
        height: "88px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        zIndex: 14,
        pointerEvents: "none",
      }}>
        {/* Door frame / stone archway */}
        <div style={{
          width: "64px",
          height: "84px",
          backgroundColor: "#0d0603", // Dark threshold interior
          border: "4px solid #ffd700", // Gold magical trim
          borderBottom: "none",
          borderTopLeftRadius: "32px",
          borderTopRightRadius: "32px",
          boxShadow: "0 0 24px rgba(255,215,0,0.55), inset 0 0 16px rgba(0,0,0,0.95)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
        }}>
          {/* Left Door Wing */}
          <div style={{
            width: entering ? "0%" : "50%",
            height: "100%",
            backgroundColor: "#3a210f",
            borderRight: "2px solid #160d06",
            backgroundImage: "linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.18) 50%)",
            backgroundSize: "6px 100%",
            position: "relative",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "left center",
          }}>
            {/* Hinge detail */}
            <div style={{ position: "absolute", top: "20px", left: "2px", width: "8px", height: "4px", backgroundColor: "#222" }} />
            <div style={{ position: "absolute", top: "54px", left: "2px", width: "8px", height: "4px", backgroundColor: "#222" }} />
            {/* Handle detail */}
            <div style={{ position: "absolute", top: "42px", right: "2px", width: "3px", height: "8px", backgroundColor: "#ffd700", borderRadius: 1 }} />
          </div>
          
          {/* Right Door Wing */}
          <div style={{
            width: entering ? "0%" : "50%",
            height: "100%",
            backgroundColor: "#3a210f",
            borderLeft: "2px solid #160d06",
            backgroundImage: "linear-gradient(90deg, transparent 50%, rgba(0,0,0,0.18) 50%)",
            backgroundSize: "6px 100%",
            position: "relative",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "right center",
          }}>
            {/* Hinge detail */}
            <div style={{ position: "absolute", top: "20px", right: "2px", width: "8px", height: "4px", backgroundColor: "#222" }} />
            <div style={{ position: "absolute", top: "54px", right: "2px", width: "8px", height: "4px", backgroundColor: "#222" }} />
            {/* Handle detail */}
            <div style={{ position: "absolute", top: "42px", left: "2px", width: "3px", height: "8px", backgroundColor: "#ffd700", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* ── PLAYER CHARACTER (char_0.png) ── */}
      <div style={{
        position: "absolute",
        bottom: entering ? "calc(16% + 40px)" : "calc(16% + 2px)", // enters inside the doorway on the carpet level
        left: `${charX}%`,
        transform: "translateX(-50%)",
        transition: entering ? "bottom 0.7s ease-in, opacity 0.5s" : "left 0.04s linear",
        opacity: entering ? 0 : 1,
        pointerEvents: "none",
        zIndex: entering ? 10 : 25, // dynamic z-index to walk behind the door frame when entering
      }}>
        {/* Shadow */}
        <div style={{
          position: "absolute",
          bottom: -4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 48,
          height: 10,
          background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        {/* Sprite */}
        <div style={{
          backgroundImage: "url(/assets/characters/char_0.png)",
          backgroundSize: "700% 300%",
          backgroundPosition: getPlayerBgPos(),
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          width: "64px",
          height: "128px",
          transform: dir === "left" ? "scaleX(-1)" : "none",
        }} />
      </div>

      {/* ── ENTER PROMPT ── */}
      {nearDoor && !entering && (
        <div style={{
          position: "absolute",
          bottom: "31%", // slightly above the door
          left: "90%", // centered on the right-hand door position
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 40,
          animation: "pls 1s ease-in-out infinite",
          whiteSpace: "nowrap",
        }}>
          <div style={{
            background: "rgba(0,0,0,.93)",
            border: "2px solid #ffd700",
            borderRadius: 6,
            padding: "9px 24px",
            fontSize: "clamp(11px, 1.1vw, 14px)",
            color: "#ffd700",
            textShadow: "0 0 8px rgba(255,215,0,.7)",
            boxShadow: "0 0 20px rgba(255,215,0,.25)",
            textAlign: "center",
          }}>
            [ SPACE / ENTER / ↑ ] — MỞ CỬA VÀO PHÒNG
          </div>
        </div>
      )}

      {/* ── WALK HINT ── */}
      {!nearDoor && !entering && (
        <div style={{
          position: "absolute",
          bottom: "1%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 40,
          whiteSpace: "nowrap",
        }}>
          <div style={{
            background: "rgba(0,0,0,.5)",
            border: "1px solid rgba(200,184,138,.2)",
            borderRadius: 4,
            padding: "5px 16px",
            fontSize: "clamp(10px, 1vw, 13px)",
            color: "#a89a6a",
          }}>
            ← A / → D, MŨI TÊN hoặc NHẤP CHUỘT để di chuyển · Nhấp vào cửa để vào
          </div>
        </div>
      )}

      <style>{`
        @keyframes twk { 0%, 100% { opacity: .3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes flk { 0% { opacity: .7; transform: translateX(-50%) scaleX(.8); } 100% { opacity: 1; transform: translateX(-50%) scaleX(1.2); } }
        @keyframes pls { 0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); } 50% { opacity: .5; transform: translateX(-50%) translateY(-5px); } }
      `}</style>
    </div>
  );
}
