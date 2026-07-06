import React, { useState, useEffect, useCallback } from "react";
import { sound } from "./AudioEngine";
import Room1_Hall from "./Room1_Hall";
import Room2_Library from "./Room2_Library";
import Room3_Hash from "./Room3_Hash";
import Room4_Alchemy from "./Room4_Alchemy";
import Room5_Cryptex from "./Room5_Cryptex";

// ─────────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────────
interface GameWorld2DProps {
  currentLevel: number;
  activeRoom:   number;
  score:        number;
  sessionId:    string;
  onLevelCleared: (nextLevel: number, msg: string, bonus: number, metrics?: any) => void;
  onGoToRoom:   (roomNum: number) => void;
  triggerAlert: (msg: string, isSuccess?: boolean) => void;
  onUseHint:    () => void;
  key?: any;
}

// ─────────────────────────────────────────────────────────────
//  Grid constants
// ─────────────────────────────────────────────────────────────
const COLS = 16;
const ROWS = 10;

// ─────────────────────────────────────────────────────────────
//  Original Character Sprite constants (char_0.png to char_5.png)
//  Sheet: 112×96 px | 7 cols × 3 rows | frame = 16×32 px
//  Row 0 = Down, Row 1 = Up, Row 2 = Right/Left (Flipped with scaleX)
// ─────────────────────────────────────────────────────────────
type Direction = "down" | "up" | "left" | "right";

import { ROOM_CONFIGS, RoomConfig, RoomFurniture } from "./RoomConfigs";

// ─────────────────────────────────────────────────────────────
//  BFS Pathfinding function for mouse click-to-move
// ─────────────────────────────────────────────────────────────
function findPath(
  startX: number, startY: number,
  targetX: number, targetY: number,
  map: number[][],
  blockedByFurniture: (x: number, y: number) => boolean,
  doorOpen: boolean,
  currentLevel: number,
  activeRoom: number
): { x: number; y: number }[] | null {
  const queue: { x: number; y: number; path: { x: number; y: number }[] }[] = [];
  const visited = new Set<string>();

  queue.push({ x: startX, y: startY, path: [] });
  visited.add(`${startX},${startY}`);

  const isWalkable = (x: number, y: number) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    const tile = map[y]?.[x];
    if (tile === 1) return false; // Wall
    if (tile === 3) {
      return doorOpen || currentLevel > activeRoom;
    }
    return !blockedByFurniture(x, y);
  };

  // If the target tile clicked is not walkable, find the closest walkable adjacent tile
  let realTargetX = targetX;
  let realTargetY = targetY;
  if (!isWalkable(targetX, targetY)) {
    const neighbors = [
      { x: targetX, y: targetY - 1 },
      { x: targetX, y: targetY + 1 },
      { x: targetX - 1, y: targetY },
      { x: targetX + 1, y: targetY }
    ];
    let bestDist = Infinity;
    let found = false;
    for (const n of neighbors) {
      if (isWalkable(n.x, n.y)) {
        const dist = Math.abs(n.x - startX) + Math.abs(n.y - startY);
        if (dist < bestDist) {
          bestDist = dist;
          realTargetX = n.x;
          realTargetY = n.y;
          found = true;
        }
      }
    }
    if (!found) return null;
  }

  if (startX === realTargetX && startY === realTargetY) return [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === realTargetX && curr.y === realTargetY) {
      return curr.path;
    }

    const nextDirs = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    for (const d of nextDirs) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      const key = `${nx},${ny}`;
      if (isWalkable(nx, ny) && !visited.has(key)) {
        visited.add(key);
        queue.push({ x: nx, y: ny, path: [...curr.path, { x: nx, y: ny }] });
      }
    }
  }

  return null;
}

const renderPixelWall = () => (
  <svg viewBox="0 0 16 16" shapeRendering="crispEdges" width="100%" height="100%">
    {/* Dark bricks background */}
    <rect x="0" y="0" width="16" height="16" fill="#2d3238" />
    
    {/* Row 1 */}
    <rect x="0" y="1" width="7" height="3" fill="#4a525a" />
    <rect x="8" y="1" width="8" height="3" fill="#4a525a" />
    
    {/* Row 2 */}
    <rect x="0" y="5" width="3" height="3" fill="#3a4047" />
    <rect x="4" y="5" width="8" height="3" fill="#4a525a" />
    <rect x="13" y="5" width="3" height="3" fill="#3a4047" />
    
    {/* Row 3 */}
    <rect x="0" y="9" width="7" height="3" fill="#4a525a" />
    <rect x="8" y="9" width="8" height="3" fill="#4a525a" />
    
    {/* Row 4 */}
    <rect x="0" y="13" width="3" height="3" fill="#3a4047" />
    <rect x="4" y="13" width="8" height="3" fill="#4a525a" />
    <rect x="13" y="13" width="3" height="3" fill="#3a4047" />
    
    {/* Grouting line shadows */}
    <rect x="0" y="0" width="16" height="1" fill="#1b1e22" />
    <rect x="0" y="4" width="16" height="1" fill="#1b1e22" />
    <rect x="0" y="8" width="16" height="1" fill="#1b1e22" />
    <rect x="0" y="12" width="16" height="1" fill="#1b1e22" />
    
    <rect x="7" y="1" width="1" height="3" fill="#1b1e22" />
    <rect x="3" y="5" width="1" height="3" fill="#1b1e22" />
    <rect x="12" y="5" width="1" height="3" fill="#1b1e22" />
    <rect x="7" y="9" width="1" height="3" fill="#1b1e22" />
    <rect x="3" y="13" width="1" height="3" fill="#1b1e22" />
    <rect x="12" y="13" width="1" height="3" fill="#1b1e22" />
    
    {/* Highlights */}
    <rect x="0" y="1" width="6" height="1" fill="#88929a" opacity="0.4" />
    <rect x="8" y="1" width="7" height="1" fill="#88929a" opacity="0.4" />
    <rect x="4" y="5" width="7" height="1" fill="#88929a" opacity="0.4" />
    <rect x="0" y="9" width="6" height="1" fill="#88929a" opacity="0.4" />
    <rect x="8" y="9" width="7" height="1" fill="#88929a" opacity="0.4" />
    <rect x="4" y="13" width="7" height="1" fill="#88929a" opacity="0.4" />
  </svg>
);

const renderPixelWallWithTorch = (x: number, y: number) => {
  // Only add torches to specific wall tiles on the top row
  const hasTorch = y === 0 && (x === 3 || x === 7 || x === 12);
  
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "visible" }}>
      {renderPixelWall()}
      {hasTorch && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: "16px",
          height: "24px",
          zIndex: 10,
          overflow: "visible",
          pointerEvents: "none",
        }}>
          <style>{`
            @keyframes torchFlicker {
              0% {
                transform: scale(1) translateY(0);
                filter: drop-shadow(0 0 3px #f97316) drop-shadow(0 0 6px #ef4444);
              }
              50% {
                transform: scale(0.9, 1.15) translateY(-1px);
                filter: drop-shadow(0 0 5px #f97316) drop-shadow(0 0 8px #ef4444);
              }
              100% {
                transform: scale(1.1, 0.9) translateY(0);
                filter: drop-shadow(0 0 3px #f97316) drop-shadow(0 0 6px #ef4444);
              }
            }
          `}</style>
          {/* Torch bracket */}
          <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges" style={{ overflow: "visible" }}>
            <rect x="7" y="10" width="2" height="6" fill="#1e293b" />
            <rect x="6" y="9" width="4" height="2" fill="#334155" />
            <rect x="7" y="5" width="2" height="5" fill="#78350f" />
            <rect x="6" y="4" width="4" height="1" fill="#451a03" />
          </svg>
          
          {/* Flickering flame */}
          <div style={{
            position: "absolute",
            top: "-3px",
            left: "4px",
            width: "8px",
            height: "10px",
            animation: "torchFlicker 0.35s infinite alternate ease-in-out",
            transformOrigin: "bottom center",
            overflow: "visible",
          }}>
            <svg viewBox="0 0 8 10" width="100%" height="100%" shapeRendering="crispEdges" style={{ overflow: "visible" }}>
              <path d="M 4,0 C 1,2 1,7 4,10 C 7,7 7,2 4,0 Z" fill="#ef4444" />
              <path d="M 4,2 C 2,4 2,7 4,9 C 6,7 6,4 4,2 Z" fill="#f97316" />
              <path d="M 4,4 C 3,5 3,7 4,8 C 5,7 5,5 4,4 Z" fill="#f1c40f" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

const renderPixelExit = (open: boolean) => {
  if (open) {
    return (
      <svg viewBox="0 0 32 32" shapeRendering="crispEdges" width="100%" height="100%">
        {/* Archway shadow background */}
        <rect x="0" y="0" width="32" height="32" fill="#1b1e22" />
        
        {/* Arch bricks */}
        <path d="M 2,32 L 2,6 Q 2,2 6,2 L 26,2 Q 30,2 30,6 L 30,32 L 26,32 L 26,6 Q 26,4 24,4 L 8,4 Q 6,4 6,6 L 6,32 Z" fill="#4a525a" />
        <path d="M 0,0 L 32,0 L 32,4 L 28,4 L 28,8 L 4,8 L 4,4 L 0,4 Z" fill="#2d3238" opacity="0.5" />
        
        {/* Deep emerald green passage light */}
        <path d="M 6,32 L 6,6 Q 6,4 8,4 L 24,4 Q 26,4 26,6 L 26,32 Z" fill="#0c1015" />
        <path d="M 9,32 L 9,8 Q 9,6 11,6 L 21,6 Q 23,6 23,8 L 23,32 Z" fill="#115e59" opacity="0.4" />
        <path d="M 12,32 L 12,12 Q 12,10 14,10 L 18,10 Q 20,10 20,12 L 20,32 Z" fill="#14b8a6" opacity="0.3" />

        {/* Opened wooden door flaps */}
        <rect x="6" y="6" width="3" height="26" fill="#3a2818" />
        <rect x="5" y="6" width="1" height="26" fill="#1a1008" />
        <rect x="7" y="10" width="1" height="2" fill="#88929a" />
        <rect x="7" y="24" width="1" height="2" fill="#88929a" />

        <rect x="23" y="6" width="3" height="26" fill="#3a2818" />
        <rect x="26" y="6" width="1" height="26" fill="#1a1008" />
        <rect x="24" y="10" width="1" height="2" fill="#88929a" />
        <rect x="24" y="24" width="1" height="2" fill="#88929a" />

        {/* Snapped chain pieces on ground */}
        <rect x="8" y="29" width="3" height="1" fill="#7f8c8d" />
        <rect x="7" y="30" width="4" height="1" fill="#bdc3c7" />
        <rect x="21" y="29" width="3" height="1" fill="#7f8c8d" />
        <rect x="21" y="30" width="4" height="1" fill="#bdc3c7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" shapeRendering="crispEdges" width="100%" height="100%">
      {/* Archway shadow background */}
      <rect x="0" y="0" width="32" height="32" fill="#1b1e22" />
      
      {/* Arch bricks */}
      <path d="M 2,32 L 2,6 Q 2,2 6,2 L 26,2 Q 30,2 30,6 L 30,32 L 26,32 L 26,6 Q 26,4 24,4 L 8,4 Q 6,4 6,6 L 6,32 Z" fill="#4a525a" />
      
      {/* Locked wooden door */}
      <path d="M 6,32 L 6,6 Q 6,4 8,4 L 24,4 Q 26,4 26,6 L 26,32 Z" fill="#4a2e1b" />
      
      {/* Wood lines */}
      <rect x="10" y="5" width="2" height="27" fill="#2d1c10" />
      <rect x="15" y="4" width="2" height="28" fill="#2d1c10" />
      <rect x="20" y="5" width="2" height="27" fill="#2d1c10" />

      {/* Metal brackets */}
      <rect x="6" y="9" width="2" height="3" fill="#1b1e22" />
      <rect x="6" y="23" width="2" height="3" fill="#1b1e22" />
      <rect x="24" y="9" width="2" height="3" fill="#1b1e22" />
      <rect x="24" y="23" width="2" height="3" fill="#1b1e22" />

      {/* Chained cross pattern */}
      <line x1="7" y1="7" x2="25" y2="29" stroke="#95a5a6" strokeWidth="2.5" strokeDasharray="3 2" />
      <line x1="7" y1="7" x2="25" y2="29" stroke="#7f8c8d" strokeWidth="1.5" />
      
      <line x1="25" y1="7" x2="7" y2="29" stroke="#95a5a6" strokeWidth="2.5" strokeDasharray="3 2" />
      <line x1="25" y1="7" x2="7" y2="29" stroke="#7f8c8d" strokeWidth="1.5" />

      {/* Heavy gold padlock */}
      <path d="M 13,15 C 13,11 19,11 19,15" fill="none" stroke="#bdc3c7" strokeWidth="2.5" />
      <rect x="12" y="15" width="8" height="8" rx="1.5" fill="#f1c40f" stroke="#d68910" strokeWidth="1" />
      <rect x="15" y="17" width="2" height="3" fill="#1b1e22" />
      <circle cx="16" cy="17" r="1.5" fill="#1b1e22" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function GameWorld2D({
  currentLevel, activeRoom, score, sessionId,
  onLevelCleared, onGoToRoom, triggerAlert, onUseHint,
}: GameWorld2DProps) {

  const config = ROOM_CONFIGS[activeRoom] ?? ROOM_CONFIGS[1];

  const [px, setPx]             = useState(config.spawnX);
  const [py, setPy]             = useState(config.spawnY);
  const [dir, setDir]           = useState<Direction>("down");
  const [walkFrame, setWalkFrame] = useState(0); // 0 = idle, 1 = walk1, 2 = walk2, 3..6 = action
  const [dialogOpen, setDialogOpen] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [skin, setSkin]         = useState("char_0"); // Default retro character skin

  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchLabel, setSearchLabel] = useState("🔍 ĐANG TÌM KIẾM MANH MỐI...");
  const [autoTransition, setAutoTransition] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [dusts, setDusts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Cleanup old dust particles after 400ms
  useEffect(() => {
    if (dusts.length === 0) return;
    const interval = setInterval(() => {
      setDusts((prev) => prev.filter((d) => Date.now() - d.id < 400));
    }, 100);
    return () => clearInterval(interval);
  }, [dusts.length]);

  // Action animation and audio play loop when searching/typing
  useEffect(() => {
    if (!isSearching) return;
    let frame = 3;
    const interval = setInterval(() => {
      setWalkFrame(frame);
      frame = frame === 6 ? 3 : frame + 1;
      
      // Look for adjacent furniture to play context sound (keyboard for PC, paper rustle for others)
      const nearbyFurniture = config.furniture.find(f => 
        Math.abs(px - f.col) + Math.abs(py - f.row) <= 1.5
      );
      if (nearbyFurniture) {
        if (nearbyFurniture.type === "PC") {
          sound.playKeyboard();
        } else {
          sound.playPaper();
        }
      } else {
        sound.playPaper();
      }
    }, 120);
    return () => clearInterval(interval);
  }, [isSearching, px, py, config]);

  // Pathfinding and mouse-click movement states
  const [walkingPath, setWalkingPath] = useState<{ x: number; y: number }[]>([]);
  const [clickedTarget, setClickedTarget] = useState<{ x: number; y: number } | null>(null);

  // Idle state states matching screenshot!
  const [isIdle, setIsIdle] = useState(false);
  const [lastMoved, setLastMoved] = useState(Date.now());

  // Reset state when room changes
  useEffect(() => {
    const cfg = ROOM_CONFIGS[activeRoom] ?? ROOM_CONFIGS[1];
    setPx(cfg.spawnX); setPy(cfg.spawnY);
    setDir("down");    setWalkFrame(0);
    setDialogOpen(false);
    setDoorOpen(false); // Reset door lock state for the new room!
    setWalkingPath([]);
    setClickedTarget(null);
    setIsIdle(false);
    setLastMoved(Date.now());
    setAutoTransition(false);
    setPendingOpen(false);
  }, [activeRoom]);

  // Reset idle timer on any player coordinate/dialog state change
  useEffect(() => {
    setIsIdle(false);
    setLastMoved(Date.now());
  }, [px, py, dialogOpen, activeRoom]);

  // Idle checking loop (Checks every second, triggers idle after 5 seconds of standing still!)
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastMoved;
      if (elapsed > 5000 && !dialogOpen && !isIdle && walkingPath.length === 0) {
        setIsIdle(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastMoved, dialogOpen, isIdle, walkingPath]);

  // When puzzle dialog is open, face the puzzle object directly
  useEffect(() => {
    if (dialogOpen) {
      if (activeRoom === 1 || activeRoom === 3 || activeRoom === 5) {
        setDir("up");
      } else {
        setDir("down");
      }
    }
  }, [dialogOpen, activeRoom]);

  // Typing/working animation loop when dialog is open (Pixel Agents style!)
  useEffect(() => {
    if (!dialogOpen) return;
    const interval = setInterval(() => {
      // Cycle through original character action/typing frames 3, 4, 5, 6
      setWalkFrame(f => {
        if (f < 3 || f >= 6) return 3;
        return f + 1;
      });
    }, 150);
    return () => {
      clearInterval(interval);
      setWalkFrame(0); // Reset to idle frame
    };
  }, [dialogOpen]);

  // Furniture collision check
  const blockedByFurniture = useCallback((tx: number, ty: number) => {
    return config.furniture.some(f =>
      tx >= f.col && tx < f.col + f.width &&
      ty >= f.row && ty < f.row + f.height
    );
  }, [config]);

  // Handle character arriving at clicked cell or inspecting a tile
  const handleInspect = useCallback((tx: number, ty: number) => {
    const isPuzzleClicked = (tx === config.puzzleX && ty === config.puzzleY) ||
                            (tx === config.puzzleX + 1 && ty === config.puzzleY);
    const isAdjacentToPuzzle = Math.abs(px - config.puzzleX) + Math.abs(py - config.puzzleY) <= 1.5 ||
                               Math.abs(px - (config.puzzleX + 1)) + Math.abs(py - config.puzzleY) <= 1.5;

    const clickedTile = config.map[ty]?.[tx];

    // Face the target item
    if (tx < px) setDir("left");
    else if (tx > px) setDir("right");
    else if (ty < py) setDir("up");
    else if (ty > py) setDir("down");

    // Start progress bar timer interaction
    if (clickedTile === 3) {
      setSearchLabel("🔑 ĐANG MỞ KHÓA CỬA...");
      sound.playLockClick();
    } else {
      setSearchLabel("🔍 ĐANG TÌM KIẾM MANH MỐI...");
    }
    setIsSearching(true);
    setSearchProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSearchProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsSearching(false);
        setSearchProgress(0);
        setWalkFrame(0);

        // 1. If puzzle target
        if (isPuzzleClicked || isAdjacentToPuzzle) {
          const isCleared = doorOpen || currentLevel > activeRoom;
          if (isCleared) {
            triggerAlert("🎉 Bạn đã giải mã thành công câu đố của phòng này rồi! Cửa Exit đã mở.", true);
          } else {
            sound.playDoorOpen();
            setDialogOpen(true);
          }
          return;
        }

        // 2. If exit door
        if (clickedTile === 3) {
          if (pendingOpen) {
            setPendingOpen(false);
            setDoorOpen(true);
            sound.playMetalClash();
            sound.playDoorOpen();
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            triggerAlert("🎉 Khóa xích đã đứt! Cửa Exit đã được mở hoàn toàn.", true);
            // Delay auto room change by 800ms so they see chain falling and magic emerald portal!
            setTimeout(() => {
              onGoToRoom(activeRoom + 1);
            }, 800);
            return;
          }

          const open = doorOpen || currentLevel > activeRoom;
          if (open) {
            sound.playDoorOpen();
            onGoToRoom(activeRoom + 1);
          } else {
            triggerAlert("🔒 Cửa đang bị xích sắt và khóa vàng phong ấn! Hãy giải mật mã để mở.", false);
          }
          return;
        }

        // 3. Context alerts for empty items
        const clickedFurniture = config.furniture.find(f => 
          tx >= f.col && tx < f.col + f.width &&
          ty >= f.row && ty < f.row + f.height
        );
        if (clickedFurniture) {
          if (clickedFurniture.type === "PC") {
            triggerAlert("🖥️ Máy tính này không hoạt động hoặc đã khóa mật khẩu màn hình.", false);
          } else if (clickedFurniture.type.includes("BOOKSHELF")) {
            triggerAlert("📚 Bạn đã lật từng cuốn sách cổ nhưng không phát hiện mật thư hay gợi ý nào.", false);
          } else if (clickedFurniture.type === "CLOCK") {
            triggerAlert("⏳ Chiếc đồng hồ cát cổ vẫn đang chảy bình thường, không chứa gì bên trong.", false);
          } else if (clickedFurniture.type === "BIN") {
            triggerAlert("🗑️ Thùng rác rỗng không có tài liệu nào bị xé hay bỏ xó cả.", false);
          } else {
            triggerAlert(`🔍 Bạn lục lọi kỹ xung quanh nhưng không tìm thấy manh mối gì đặc biệt.`, false);
          }
        } else {
          triggerAlert("🔍 Không phát hiện thấy vật phẩm hay mật mã nào ở ô gạch này.", false);
        }
      }
    }, 120);

  }, [px, py, config, doorOpen, currentLevel, activeRoom, onGoToRoom, triggerAlert, setDir, setIsSearching, setSearchProgress, setWalkFrame, setSearchLabel, pendingOpen, setPendingOpen, setIsShaking]);

  // Path walking step-by-step
  useEffect(() => {
    if (isSearching) return;
    if (walkingPath.length === 0) {
      if (clickedTarget) {
        handleInspect(clickedTarget.x, clickedTarget.y);
        setClickedTarget(null);
        setAutoTransition(false);
      }
      return;
    }

    const nextStep = walkingPath[0];
    const timer = setTimeout(() => {
      let newDir: Direction = dir;
      if (nextStep.x > px) newDir = "right";
      else if (nextStep.x < px) newDir = "left";
      else if (nextStep.y > py) newDir = "down";
      else if (nextStep.y < py) newDir = "up";

      setDir(newDir);
      setPx(nextStep.x);
      setPy(nextStep.y);
      setWalkFrame(f => (f % 2) + 1);

      // Spawn footstep dust particles at the heel of character
      const posX = ((nextStep.x + 0.5) / COLS) * 100;
      const posY = ((nextStep.y + 0.95) / ROWS) * 100;
      setDusts((prev) => [
        ...prev,
        { id: Date.now(), x: posX - 1.5 + Math.random() * 3, y: posY },
        { id: Date.now() + 1, x: posX - 1.5 + Math.random() * 3, y: posY }
      ]);

      setTimeout(() => setWalkFrame(0), 280);

      setWalkingPath(path => path.slice(1));
    }, 320);

    return () => clearTimeout(timer);
  }, [walkingPath, px, py, dir, clickedTarget, handleInspect, isSearching, autoTransition, setAutoTransition, setDusts]);

  // Map mouse click to move handler
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogOpen || isSearching) return; // Prevent clicking while dialog or search is active

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const tx = Math.floor((clickX / rect.width) * COLS);
    const ty = Math.floor((clickY / rect.height) * ROWS);

    setClickedTarget({ x: tx, y: ty });

    const path = findPath(
      px, py,
      tx, ty,
      config.map,
      blockedByFurniture,
      doorOpen,
      currentLevel,
      activeRoom
    );

    if (path) {
      setWalkingPath(path);
    } else {
      sound.playError();
      triggerAlert("❌ Vị trí này bị chặn hoặc không thể đi tới được!", false);
      setClickedTarget(null);
    }
  };

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (dialogOpen || isSearching) return;

    // Interrupt mouse walking if keyboard keys are pressed
    if (walkingPath.length > 0) {
      setWalkingPath([]);
      setClickedTarget(null);
    }

    type MoveEntry = { dx: number; dy: number; d: Direction };
    const MOVES: Record<string, MoveEntry> = {
      ArrowUp:    { dx:0,  dy:-1, d:"up"    },
      ArrowDown:  { dx:0,  dy:1,  d:"down"  },
      ArrowLeft:  { dx:-1, dy:0,  d:"left"  },
      ArrowRight: { dx:1,  dy:0,  d:"right" },
      w:{ dx:0,  dy:-1, d:"up"    }, W:{ dx:0,  dy:-1, d:"up"    },
      s:{ dx:0,  dy:1,  d:"down"  }, S:{ dx:0,  dy:1,  d:"down"  },
      a:{ dx:-1, dy:0,  d:"left"  }, A:{ dx:-1, dy:0,  d:"left"  },
      d:{ dx:1,  dy:0,  d:"right" }, D:{ dx:1,  dy:0,  d:"right" },
    };

    const mv = MOVES[e.key];
    if (mv) {
      e.preventDefault();
      setDir(mv.d);
      setWalkFrame(f => (f % 2) + 1); // alternate 1 and 2 while walking
      setTimeout(() => setWalkFrame(0), 280);

      const tx = px + mv.dx;
      const ty = py + mv.dy;
      const tile = config.map[ty]?.[tx];

      if (tile === undefined || tile === 1) { sound.playError(); return; }

      if (tile === 3) {
        const open = doorOpen || currentLevel > activeRoom;
        if (open) {
          sound.playDoorOpen();
          onGoToRoom(activeRoom + 1);
        } else {
          triggerAlert("🔒 Cửa đang khóa! Hãy giải mật mã để mở.", false);
        }
        return;
      }

      if (blockedByFurniture(tx, ty)) { sound.playError(); return; }

      setPx(tx); setPy(ty);
    }

    if ((e.key === " " || e.key === "Enter") && !dialogOpen) {
      e.preventDefault();
      const near = Math.abs(px - config.puzzleX) + Math.abs(py - config.puzzleY) <= 1.5 ||
                   Math.abs(px - (config.puzzleX + 1)) + Math.abs(py - config.puzzleY) <= 1.5;
      if (near) {
        handleInspect(config.puzzleX, config.puzzleY);
      }
    }

  }, [px, py, config, dialogOpen, doorOpen, activeRoom, currentLevel, onGoToRoom, triggerAlert, blockedByFurniture, walkingPath, isSearching, handleInspect]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const nearPuzzle = Math.abs(px - config.puzzleX) + Math.abs(py - config.puzzleY) <= 1;

  // Puzzle dialog
  const renderDialog = () => {
    if (!dialogOpen) return null;
    const handleClear = (nextLevel: number, msg: string, bonus: number, metrics?: any) => {
      setDialogOpen(false);
      onLevelCleared(nextLevel, msg, bonus, metrics);
      
      setPendingOpen(true);

      const targetCol = config.exitX;
      const targetRow = Math.min(ROWS - 1, config.exitY + 1); // Row below exit

      const exitPath = findPath(
        px, py,
        targetCol, targetRow,
        config.map,
        blockedByFurniture,
        true,
        nextLevel,
        activeRoom
      );

      if (exitPath && exitPath.length > 0) {
        setClickedTarget({ x: config.exitX, y: config.exitY });
        setWalkingPath(exitPath);
        setAutoTransition(true);
      } else {
        // Teleport if path is blocked
        setPx(targetCol);
        setPy(targetRow);
        setDir("up");
        setAutoTransition(true);
        setClickedTarget({ x: config.exitX, y: config.exitY });
        setTimeout(() => {
          handleInspect(config.exitX, config.exitY);
        }, 300);
      }
    };
    return (
      <div className="fixed inset-0 z-55 bg-black/85 flex items-center justify-center p-3 font-pixel">
        <div className="relative w-[960px] h-[580px] max-w-[95vw] max-h-[90vh] overflow-hidden bg-stone-900 border-4 border-[#3a2818] shadow-2xl rounded flex flex-col">
          <button
            onClick={() => setDialogOpen(false)}
            className="absolute top-2 right-2 text-stone-400 hover:text-red-500 font-bold border border-stone-600 px-1.5 py-0.5 text-[8px] bg-black/40 z-50 cursor-pointer"
          >ĐÓNG [X]</button>

          {activeRoom === 1 && <Room1_Hall    onLevelCleared={handleClear} triggerAlert={triggerAlert} sessionId={sessionId} />}
          {activeRoom === 2 && <Room2_Library onLevelCleared={handleClear} triggerAlert={triggerAlert} sessionId={sessionId} onGoToRoom={() => setDialogOpen(false)} />}
          {activeRoom === 3 && <Room3_Hash    onLevelCleared={handleClear} triggerAlert={triggerAlert} sessionId={sessionId} onGoToRoom={() => setDialogOpen(false)} />}
          {activeRoom === 4 && <Room4_Alchemy onLevelCleared={handleClear} triggerAlert={triggerAlert} sessionId={sessionId} onGoToRoom={() => setDialogOpen(false)} />}
          {activeRoom === 5 && <Room5_Cryptex onLevelCleared={handleClear} triggerAlert={triggerAlert} sessionId={sessionId} onGoToRoom={() => setDialogOpen(false)} />}
        </div>
      </div>
    );
  };



  // Original character sheet position generator
  const getPlayerBgPosition = () => {
    // 7 columns: 0=idle, 1=walk1, 2=walk2, 3..6=action
    // 3 rows: 0=down, 1=up, 2=right/left
    const colPercent = (walkFrame * 100) / 6;
    let rowPercent = 0;
    if (dir === "down") rowPercent = 0;
    else if (dir === "up") rowPercent = 50;
    else rowPercent = 100;
    return `${colPercent}% ${rowPercent}%`;
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col items-center gap-2 p-2 select-none font-pixel"
      style={{ backgroundColor: "#110d07" }}
    >
      {/* ── Top HUD bar ─────────────────────────────────────── */}
      <div className="w-full max-w-[1160px] bg-[#160f0b] border-2 border-[#3a2818] px-3 py-1.5 flex justify-between items-center text-[11px] text-[#ebdcb9] shrink-0">
        <div className="flex gap-4 items-center">
          <span>🖱️ <strong className="text-amber-400">Click Chuột</strong> Di chuyển & Tìm kiếm</span>
          <span>🎮 <strong className="text-amber-400">WASD / ↑↓←→</strong> Di chuyển phím</span>
          <span>⚡ <strong className="text-amber-400">SPACE</strong> Tương tác</span>
        </div>
        <div>
          Cửa:{" "}
          <strong className={doorOpen || currentLevel > activeRoom ? "text-emerald-400" : "text-red-400"}>
            {doorOpen || currentLevel > activeRoom ? "🔓 MỞ" : "🔒 KHÓA"}
          </strong>
        </div>
      </div>

      {/* ── MAP VIEWPORT ─────────────────────────────────────── */}
      <div
        onClick={handleMapClick}
        className="w-full max-w-[1160px] border-4 border-[#3a2818] shadow-[0_0_40px_rgba(0,0,0,0.9)] rounded overflow-hidden relative cursor-crosshair"
        style={{
          aspectRatio: `${COLS} / ${ROWS}`,
          backgroundImage:  "url(/assets/floors/wood_floor.png)",
          backgroundSize:   `${100 / COLS}% ${100 / ROWS}%`,
          backgroundRepeat: "repeat",
          imageRendering:   "pixelated",
          backgroundColor:  activeRoom === 3 || activeRoom === 5 ? "#4a3319" : "#ffffff", // Blend dark brown for server rooms, keep original warm wood for others!
          backgroundBlendMode: activeRoom === 3 || activeRoom === 5 ? "multiply" : "normal",
          animation: isShaking ? "screenShake 0.45s ease-in-out" : "none",
        }}
      >
        <style>{`
          @keyframes screenShake {
            0%, 100% { transform: translate(0, 0) rotate(0); }
            15% { transform: translate(-3px, 2px) rotate(-0.5deg); }
            30% { transform: translate(3px, -1px) rotate(0.3deg); }
            45% { transform: translate(-2px, -2px) rotate(-0.3deg); }
            60% { transform: translate(2px, 1px) rotate(0.2deg); }
            75% { transform: translate(-1px, 1px) rotate(-0.1deg); }
            90% { transform: translate(1px, -1px) rotate(0.1deg); }
          }
          @keyframes dustFadeUp {
            0% {
              transform: translate(-50%, 0) scale(0.6);
              opacity: 0.85;
            }
            100% {
              transform: translate(-50%, -10px) scale(1.4);
              opacity: 0;
            }
          }
        `}</style>

        {/* Footstep Dust Particles */}
        {dusts.map((d) => (
          <div
            key={d.id}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: "4px",
              height: "4px",
              backgroundColor: "#d7ccc8",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 15,
              animation: "dustFadeUp 0.38s forwards ease-out",
            }}
          />
        ))}
        {/* ── Tile layer: only non-floor tiles ─────────────── */}
        {config.map.map((rowArr, y) =>
          rowArr.map((tile, x) => {
            if (tile === 0) return null; // transparent — floor bg shows through
            const style: React.CSSProperties = {
              position: "absolute",
              left:   `${(x / COLS) * 100}%`,
              top:    `${(y / ROWS) * 100}%`,
              width:  `${(1 / COLS) * 100}%`,
              height: `${(1 / ROWS) * 100}%`,
            };

            if (tile === 1) return (
              <div key={`t${y}-${x}`} style={{ ...style, overflow: "visible" }}>
                {renderPixelWallWithTorch(x, y)}
              </div>
            );

            if (tile === 3) {
              const open = doorOpen || currentLevel > activeRoom;
              return (
                <div key={`t${y}-${x}`} style={{ ...style, overflow: "visible" }}>
                  {renderPixelExit(open)}
                  
                  {/* Magic Particle FX floating up when Exit is open */}
                  {open && (
                    <div style={{
                      position: "absolute",
                      left: "15%",
                      right: "15%",
                      bottom: "0px",
                      height: "100%",
                      pointerEvents: "none",
                      overflow: "visible",
                      zIndex: 30,
                    }}>
                      <style>{`
                        @keyframes exitFloatParticle {
                          0% {
                            transform: translateY(12px) scale(0.6);
                            opacity: 0;
                          }
                          30% {
                            opacity: 0.9;
                          }
                          100% {
                            transform: translateY(-38px) scale(0.1);
                            opacity: 0;
                          }
                        }
                      `}</style>
                      {Array.from({ length: 10 }).map((_, i) => {
                        const randomLeft = 10 + (i * 8) + Math.sin(i) * 4;
                        const randomDelay = (i * 0.22).toFixed(2);
                        const randomSize = 2 + (i % 3);
                        const randomSpeed = 1.1 + (i % 2) * 0.35;
                        const randomColor = i % 2 === 0 ? "#14b8a6" : "#2dd4bf";

                        return (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              left: `${randomLeft}%`,
                              bottom: "10%",
                              width: `${randomSize}px`,
                              height: `${randomSize}px`,
                              backgroundColor: randomColor,
                              borderRadius: "50%",
                              boxShadow: `0 0 6px ${randomColor}`,
                              animation: `exitFloatParticle ${randomSpeed}s infinite linear`,
                              animationDelay: `${randomDelay}s`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })
        )}

        {/* ── Furniture layer ───────────────────────────────── */}
        {config.furniture.map((item, idx) => {
          const isChair = item.type === "CHAIR";
          const isPC = item.type === "PC";

          if (isPC) {
            // Monitor is centered on the desk (W: 45%, centered means left: 27.5%)
            const monitorLeft = "27.5%";

            return (
              <div
                key={`f${idx}`}
                style={{
                  position:"absolute",
                  left:   `${(item.col / COLS) * 100}%`,
                  top:    `${(item.row / ROWS) * 100}%`,
                  width:  `${(item.width  / COLS) * 100}%`,
                  height: `${(item.height / ROWS) * 100}%`,
                  pointerEvents:"none",
                  zIndex: 10,
                  transform: item.scale ? `scale(${item.scale})` : "none",
                  transformOrigin: "bottom center",
                }}
              >
                {/* The computer tower/monitor scaled down to 45% size */}
                <img
                  src={item.image} alt={item.type}
                  style={{
                    position: "absolute",
                    left: monitorLeft,
                    bottom: "-8%", // Shifted down to sit directly on the desk top
                    width: "45%",
                    height: "75%", // Tall enough to render the monitor clearly
                    objectFit: "contain",
                    imageRendering: "pixelated",
                    zIndex: 10, // behind the desk to hide legs
                  }}
                  draggable={false}
                />
                {/* The desk base underneath the computer, rendered on top of the computer legs */}
                <img
                  src="/assets/furniture/DESK/DESK_FRONT.png" alt="Desk"
                  style={{
                    position: "absolute",
                    left: "0%",
                    bottom: "0%",
                    width: "100%",
                    height: "50%",
                    objectFit: "contain",
                    imageRendering: "pixelated",
                    zIndex: 11, // in front of the computer to block its legs!
                  }}
                  draggable={false}
                />
              </div>
            );
          }

          // Determine chair horizontal position (centered if associated with a PC!)
          let itemLeftPercent = (item.col / COLS) * 100;
          if (isChair) {
            const associatedPC = config.furniture.find(f =>
              f.type === "PC" && f.row === item.row - 1 && (f.col === item.col || f.col === item.col - 1)
            );
            if (associatedPC) {
              itemLeftPercent = ((associatedPC.col + 0.5) / COLS) * 100;
            }
          }



          return (
            <div
              key={`f${idx}`}
              style={{
                position:"absolute",
                left:   `${itemLeftPercent}%`,
                top:    `${(item.row / ROWS) * 100}%`,
                width:  `${(item.width  / COLS) * 100}%`,
                height: `${(item.height / ROWS) * 100}%`,
                pointerEvents:"none",
                display:"flex", alignItems:"flex-end", justifyContent:"center",
                zIndex: isChair ? 12 : 10,
                transform: `${isChair ? "translateY(-6px)" : ""} ${item.scale ? `scale(${item.scale})` : ""}`,
                transformOrigin: "bottom center",
              }}
            >
              <img
                src={item.image} alt={item.type}
                style={{
                  width:"100%", height:"100%",
                  objectFit:"contain",
                  imageRendering:"pixelated",
                }}
                draggable={false}
              />
            </div>
          );
        })}

        {/* ── Player character (Restored to original char_0 sizing) ── */}
        <div
          style={{
            position:"absolute",
            left:     `${(px / COLS) * 100}%`,
            top:      `${(py / ROWS) * 100}%`,
            width:    `${(1 / COLS) * 100}%`,
            height:   `${(1 / ROWS) * 100}%`,
            overflow: "visible",
            display:  "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex:   30,
            transition: "left .32s ease-out, top .32s ease-out",
            pointerEvents: "none",
          }}
        >
          {/* Ground shadow */}
          <div style={{
            position:"absolute", bottom:0, left:"15%",
            width:"70%", height:"18%",
            background:"radial-gradient(ellipse,rgba(0,0,0,.5) 0%,transparent 70%)",
            borderRadius:"50%",
          }} />

          {/* Pixel Agents Style: Cute interactive speech bubble above player's head */}
          {dialogOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "90px", // sits right above head
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#160f0b",
                border: "2px solid #3a2818",
                color: "#eab308",
                padding: "4px 8px",
                borderRadius: "3px",
                fontSize: "11px",
                fontFamily: "monospace",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                zIndex: 40,
                boxShadow: "0 4px 10px rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span style={{ animation: "pulse 1s infinite alternate" }}>
                {activeRoom === 1 && "⚙️ Đang xoay đĩa Caesar..."}
                {activeRoom === 2 && "📚 Đang dò tìm khóa Vigenère..."}
                {activeRoom === 3 && "💻 Đang tính băm SHA-256..."}
                {activeRoom === 4 && "🧪 Đang luyện khóa Modulo RSA..."}
                {activeRoom === 5 && "🗝️ Đang chạy bộ khóa AES..."}
              </span>
              {/* Speech bubble arrow pointer pointing down to player */}
              <div style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #3a2818",
              }} />
            </div>
          )}

          {/* Searching / Typing Progress Bar Bubble */}
          {isSearching && (
            <div
              style={{
                position: "absolute",
                bottom: "90px", // sits right above head
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#160f0b",
                border: "2px solid #eab308",
                color: "#eab308",
                padding: "6px 10px",
                borderRadius: "4px",
                fontSize: "10px",
                fontFamily: "monospace",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                zIndex: 40,
                boxShadow: "0 4px 10px rgba(0,0,0,0.8)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span className="animate-pulse">
                {searchLabel}
              </span>
              {/* Progress bar container */}
              <div style={{
                width: "80px",
                height: "6px",
                backgroundColor: "#2c1c10",
                border: "1px solid #3a2818",
                borderRadius: "3px",
                overflow: "hidden",
              }}>
                {/* Progress bar fill */}
                <div style={{
                  width: `${searchProgress}%`,
                  height: "100%",
                  backgroundColor: "#eab308",
                  transition: "width 0.1s linear",
                }} />
              </div>
              {/* Speech bubble arrow pointer pointing down to player */}
              <div style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #eab308",
              }} />
            </div>
          )}

          {/* Idle status hint bubble (matching requested screenshot!) */}
          {isIdle && !dialogOpen && !isSearching && (
            <div
              style={{
                position: "absolute",
                bottom: "90px", // sits right above head
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#0d1117",
                border: "2px solid #30363d",
                color: "#ffca28",
                padding: "4px 8px",
                borderRadius: "3px",
                fontSize: "11px",
                fontFamily: "monospace",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                zIndex: 40,
                boxShadow: "0 4px 10px rgba(0,0,0,0.8)",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <span style={{ animation: "pulse 1.2s infinite alternate" }}>
                {activeRoom === 1 && "💤 Idle... (Click vào tủ sách để giải Caesar)"}
                {activeRoom === 2 && "💤 Idle... (Click vào bàn học để giải Vigenère)"}
                {activeRoom === 3 && "💤 Idle... (Click vào máy chủ để giải Hash)"}
                {activeRoom === 4 && "💤 Idle... (Click vào bảng đen để giải RSA)"}
                {activeRoom === 5 && "💤 Idle... (Click vào lõi cơ để giải AES)"}
              </span>
              {/* Arrow pointer */}
              <div style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #30363d",
              }} />
            </div>
          )}

          {/* Restored char_0 sprite: 16x32px frame scaled to 40x80px */}
          <div style={{
            backgroundImage:    `url(/assets/characters/${skin}.png)`,
            backgroundSize:     "700% 300%",
            backgroundPosition: getPlayerBgPosition(),
            backgroundRepeat:   "no-repeat",
            imageRendering:     "pixelated",
            width:  "40px",
            height: "80px",
            transform: dir === "left" ? "scaleX(-1)" : "none",
            transformOrigin:    "bottom center",
            flexShrink: 0,
            marginBottom: "2px",
            marginTop: "-32px",
            animation: walkFrame === 0 ? "playerBreath 1.0s infinite alternate ease-in-out" : "none",
          }}>
            <style>{`
              @keyframes playerBreath {
                0% {
                  transform: scaleY(1) scaleX(1);
                }
                100% {
                  transform: scaleY(1.04) scaleX(0.97);
                }
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* ── Proximity prompt ─────────────────────────────────── */}
      {nearPuzzle && !(doorOpen || currentLevel > activeRoom) && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/95 text-yellow-400 border-2 border-yellow-500 px-5 py-2 text-[11px] rounded animate-pulse cursor-pointer z-20 font-pixel"
          onClick={() => handleInspect(config.puzzleX, config.puzzleY)}
        >
          🎯 GẦN {config.puzzleName.toUpperCase()} — NHẤN SPACE ĐỂ GIẢI MÃ
        </div>
      )}

      {renderDialog()}
    </div>
  );
}
