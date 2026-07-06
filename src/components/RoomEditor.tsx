import React, { useState, useEffect } from "react";
import { ROOM_CONFIGS, RoomConfig, RoomFurniture } from "./RoomConfigs";

// List of all furniture assets we support with their default sizes and images
const FURNITURE_PRESETS = [
  // ── Nội thất cơ bản ──────────────────────────────
  { type: "PC (Gray/Green)", value: "PC", img: "/assets/furniture/PC/PC_FRONT_ON_3.png", w: 2, h: 2 },
  { type: "PC (Gray/Blue)", value: "PC", img: "/assets/furniture/PC/PC_FRONT_ON_1.png", w: 2, h: 2 },
  { type: "PC (Gray/Red)", value: "PC", img: "/assets/furniture/PC/PC_FRONT_ON_2.png", w: 2, h: 2 },
  { type: "Chair (Cushioned)", value: "CHAIR", img: "/assets/furniture/CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png", w: 1, h: 1 },
  { type: "Chair (Wooden)", value: "CHAIR", img: "/assets/furniture/WOODEN_CHAIR/WOODEN_CHAIR_BACK.png", w: 1, h: 1 },
  { type: "Desk (Double)", value: "DESK", img: "/assets/furniture/DESK/DESK_FRONT.png", w: 2, h: 1 },
  { type: "Table (Small)", value: "SMALL_TABLE", img: "/assets/furniture/SMALL_TABLE/SMALL_TABLE_FRONT.png", w: 1, h: 1 },
  { type: "Bookshelf (Double)", value: "DOUBLE_BOOKSHELF", img: "/assets/furniture/DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png", w: 2, h: 2 },
  { type: "Bookshelf (Single)", value: "BOOKSHELF", img: "/assets/furniture/BOOKSHELF/BOOKSHELF.png", w: 2, h: 1 },
  { type: "Wooden Bench", value: "WOODEN_BENCH", img: "/assets/furniture/WOODEN_BENCH/WOODEN_BENCH.png", w: 2, h: 1 },
  { type: "Sofa (Front)", value: "SOFA", img: "/assets/furniture/SOFA/SOFA_FRONT.png", w: 2, h: 2 },
  { type: "Coffee Table", value: "COFFEE_TABLE", img: "/assets/furniture/COFFEE_TABLE/COFFEE_TABLE.png", w: 1, h: 1 },
  { type: "Trash Bin", value: "BIN", img: "/assets/furniture/BIN/BIN.png", w: 1, h: 1 },
  { type: "Clock (Wall)", value: "CLOCK", img: "/assets/furniture/CLOCK/CLOCK.png", w: 1, h: 1 },
  { type: "Hanging Plant", value: "HANGING_PLANT", img: "/assets/furniture/HANGING_PLANT/HANGING_PLANT.png", w: 1, h: 1 },
  { type: "Cactus", value: "CACTUS", img: "/assets/furniture/CACTUS/CACTUS.png", w: 1, h: 1 },
  { type: "Plant Pot (Small)", value: "POT", img: "/assets/furniture/POT/POT.png", w: 1, h: 1 },
  { type: "Plant (Medium)", value: "PLANT", img: "/assets/furniture/PLANT/PLANT.png", w: 1, h: 1 },
  { type: "Plant (Large)", value: "LARGE_PLANT", img: "/assets/furniture/LARGE_PLANT/LARGE_PLANT.png", w: 1, h: 2 },
  { type: "Whiteboard", value: "WHITEBOARD", img: "/assets/furniture/WHITEBOARD/WHITEBOARD.png", w: 2, h: 2 },
  { type: "Large Painting", value: "LARGE_PAINTING", img: "/assets/furniture/LARGE_PAINTING/LARGE_PAINTING.png", w: 2, h: 1 },

  // ── 🏰 Guild Hall Pack - Trang trí ──
  { type: "🏰 Bù nhìn gỗ loại 1", value: "DECOR", img: "/assets/guild_hall/Attacked_Manequin1_with_shadow.png", w: 1, h: 1 },
  { type: "🏰 Bù nhìn gỗ loại 2", value: "DECOR", img: "/assets/guild_hall/Attacked_Manequin2_with_shadow.png", w: 1, h: 1 },
  { type: "🏰 Bù nhìn gỗ loại 3", value: "DECOR", img: "/assets/guild_hall/Attacked_Manequin3_with_shadow.png", w: 1, h: 1 },
  { type: "🏰 Lửa thiêng Guild Hall", value: "DECOR", img: "/assets/guild_hall/Fire.png", w: 1, h: 1 },
  { type: "🏰 Cờ hiệu hoàng gia", value: "DECOR", img: "/assets/guild_hall/Flags_animation.png", w: 1, h: 1 },
  { type: "🏰 Vết nứt nền gạch", value: "DECOR", img: "/assets/guild_hall/Decorative_cracks.png", w: 1, h: 1 },

  // ── 🔐 Cyberpunk Items - Phòng 1: Caesar (Cổ điển/Cơ khí) ──
  { type: "⚙️ Bánh răng cổ điển", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/20.png", w: 1, h: 1 },
  { type: "⚙️ Cánh quạt Caesar", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/1.png", w: 1, h: 1 },
  { type: "⚙️ Ngôi sao 3 cánh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/9.png", w: 1, h: 1 },
  { type: "⚙️ Cuộn dây từ trường", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/30.png", w: 1, h: 1 },
  { type: "⚙️ Máy phát điện đỏ", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/35.png", w: 1, h: 1 },
  { type: "⚙️ Động cơ cuộn dây", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/25.png", w: 1, h: 1 },
  { type: "⚙️ Bóng đèn sét vàng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/43.png", w: 1, h: 1 },

  // ── 🔑 Cyberpunk Items - Phòng 2: Vigenère (Năng lượng xanh/Mã hóa) ──
  { type: "💎 Lõi năng lượng xanh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/4.png", w: 1, h: 1 },
  { type: "💎 Pin năng lượng xanh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/10.png", w: 1, h: 1 },
  { type: "💎 Viên năng lượng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/6.png", w: 1, h: 1 },
  { type: "💎 Ổ cắm nguồn", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/5.png", w: 1, h: 1 },
  { type: "💎 Tụ điện xanh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/7.png", w: 1, h: 1 },
  { type: "💎 Lọ hóa chất tím", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/45.png", w: 1, h: 1 },

  // ── 🖥️ Cyberpunk Items - Phòng 3: Hash (Máy chủ/Server) ──
  { type: "🖥️ Máy chủ Hexagon", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/15.png", w: 1, h: 2 },
  { type: "🖥️ Hệ thống làm mát", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/2.png", w: 1, h: 1 },
  { type: "🖥️ Ổ cứng cyberpunk", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/40.png", w: 1, h: 1 },
  { type: "🖥️ Bộ nguồn vàng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/50.png", w: 1, h: 1 },
  { type: "🖥️ Chip xử lý", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/3.png", w: 1, h: 1 },
  { type: "🖥️ Thanh RAM xanh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/8.png", w: 1, h: 1 },

  // ── 🔒 Cyberpunk Items - Phòng 4: RSA (Khóa/Rèn/Lab bảo mật) ──
  { type: "🔒 Lõi mã RSA đỏ", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/11.png", w: 1, h: 1 },
  { type: "🔒 Khóa năng lượng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/12.png", w: 1, h: 1 },
  { type: "🔒 Module bảo mật", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/13.png", w: 1, h: 1 },
  { type: "🔒 Viên pin khóa", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/14.png", w: 1, h: 1 },
  { type: "🔒 Thiết bị giải mã", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/16.png", w: 1, h: 1 },
  { type: "🔒 Ống dẫn năng lượng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/17.png", w: 1, h: 1 },

  // ── ⚡ Cyberpunk Items - Phòng 5: AES (Công nghệ cao/Lab hiện đại) ──
  { type: "⚡ Lõi AES phát sáng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/18.png", w: 1, h: 1 },
  { type: "⚡ Tháp năng lượng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/19.png", w: 1, h: 1 },
  { type: "⚡ Cuộn cảm plasma", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/21.png", w: 1, h: 1 },
  { type: "⚡ Ống chứa ion", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/22.png", w: 1, h: 1 },
  { type: "⚡ Viên năng lượng nhỏ", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/23.png", w: 1, h: 1 },
  { type: "⚡ Bình phản ứng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/24.png", w: 1, h: 1 },

  // ── 🌐 Cyberpunk Items - Đồ trang trí chung ──
  { type: "🌐 Ống neon tím", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/26.png", w: 1, h: 1 },
  { type: "🌐 Thiết bị phát sóng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/27.png", w: 1, h: 1 },
  { type: "🌐 Pin dự trữ", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/28.png", w: 1, h: 1 },
  { type: "🌐 Ống nghiệm xanh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/29.png", w: 1, h: 1 },
  { type: "🌐 Lõi phản ứng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/31.png", w: 1, h: 1 },
  { type: "🌐 Cáp quang học", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/32.png", w: 1, h: 1 },
  { type: "🌐 Bộ chuyển đổi", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/33.png", w: 1, h: 1 },
  { type: "🌐 Bình acquy mini", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/34.png", w: 1, h: 1 },
  { type: "🌐 Ống dẫn sáng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/36.png", w: 1, h: 1 },
  { type: "🌐 Module truyền tin", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/37.png", w: 1, h: 1 },
  { type: "🌐 Hộp mạch điện", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/38.png", w: 1, h: 1 },
  { type: "🌐 Đầu nối từ tính", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/39.png", w: 1, h: 1 },
  { type: "🌐 Ống bức xạ UV", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/41.png", w: 1, h: 1 },
  { type: "🌐 Viên nang điện", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/42.png", w: 1, h: 1 },
  { type: "🌐 Bình plasma cam", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/44.png", w: 1, h: 1 },
  { type: "🌐 Cuộn siêu dẫn", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/46.png", w: 1, h: 1 },
  { type: "🌐 Pin lithium xanh", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/47.png", w: 1, h: 1 },
  { type: "🌐 Lõi phản vật chất", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/48.png", w: 1, h: 1 },
  { type: "🌐 Ống chứa năng lượng", value: "CYBER_ITEM", img: "/assets/cyberpunk_items/49.png", w: 1, h: 1 },
];

interface RoomEditorProps {
  onClose: () => void;
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

export default function RoomEditor({ onClose }: RoomEditorProps) {
  const [configs, setConfigs] = useState<Record<number, RoomConfig>>(() => {
    // Clone ROOM_CONFIGS to prevent direct state mutability issues
    return JSON.parse(JSON.stringify(ROOM_CONFIGS));
  });

  const [activeRoom, setActiveRoom] = useState<number>(1);
  const [selectedFurnitureIndex, setSelectedFurnitureIndex] = useState<number | null>(null);
  const [presetIndexToAdd, setPresetIndexToAdd] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [saveError, setSaveError] = useState<string>("");

  const [dragStart, setDragStart] = useState<{
    index: number;
    startX: number;
    startY: number;
    startCol: number;
    startRow: number;
  } | null>(null);

  const currentConfig = configs[activeRoom];
  const map = currentConfig.map;
  const ROWS = map.length;
  const COLS = map[0].length;

  useEffect(() => {
    if (!dragStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diffX = e.clientX - dragStart.startX;
      const diffY = e.clientY - dragStart.startY;
      
      // Snapping: 1 grid cell width = 50px (800px width / 16 cols), height = 50px (500px / 10 rows)
      const deltaCol = Math.round(diffX / 50);
      const deltaRow = Math.round(diffY / 50);
      
      const updatedConfigs = { ...configs };
      const item = updatedConfigs[activeRoom].furniture[dragStart.index];
      
      const newCol = Math.max(0, Math.min(COLS - item.width, dragStart.startCol + deltaCol));
      const newRow = Math.max(0, Math.min(ROWS - item.height, dragStart.startRow + deltaRow));
      
      if (item.col !== newCol || item.row !== newRow) {
        item.col = newCol;
        item.row = newRow;
        setConfigs(updatedConfigs);
      }
    };

    const handleMouseUp = () => {
      setDragStart(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragStart, configs, activeRoom, COLS, ROWS]);

  const handleMouseDown = (e: React.MouseEvent, index: number, item: RoomFurniture) => {
    e.preventDefault();
    setSelectedFurnitureIndex(index);
    setDragStart({
      index,
      startX: e.clientX,
      startY: e.clientY,
      startCol: item.col,
      startRow: item.row
    });
  };

  // Toggle map grid cell type
  const handleCellClick = (row: number, col: number) => {
    const updatedConfigs = { ...configs };
    const currentVal = updatedConfigs[activeRoom].map[row][col];
    
    // Cycle between: Floor (0) -> Wall (1) -> Exit (3)
    let newVal = 0;
    if (currentVal === 0) newVal = 1;
    else if (currentVal === 1) newVal = 3;
    else newVal = 0;

    // Update cell
    updatedConfigs[activeRoom].map[row][col] = newVal;
    setConfigs(updatedConfigs);
  };

  // Add new furniture
  const handleAddFurniture = () => {
    const preset = FURNITURE_PRESETS[presetIndexToAdd];
    const newFurnitureItem: RoomFurniture = {
      type: preset.value,
      col: 7, // Spawn in center
      row: 4,
      width: preset.w,
      height: preset.h,
      image: preset.img
    };

    const updatedConfigs = { ...configs };
    updatedConfigs[activeRoom].furniture.push(newFurnitureItem);
    setConfigs(updatedConfigs);
    
    // Auto-select the newly added furniture
    setSelectedFurnitureIndex(updatedConfigs[activeRoom].furniture.length - 1);
  };

  // Update selected furniture properties
  const updateFurnitureProperty = (key: keyof RoomFurniture, val: any) => {
    if (selectedFurnitureIndex === null) return;
    const updatedConfigs = { ...configs };
    const item = updatedConfigs[activeRoom].furniture[selectedFurnitureIndex];
    
    // Cast appropriately
    if (key === "col" || key === "row" || key === "width" || key === "height") {
      item[key] = parseInt(val, 10) || 0;
    } else {
      (item as any)[key] = val;
    }

    setConfigs(updatedConfigs);
  };

  // Delete furniture
  const handleDeleteFurniture = () => {
    if (selectedFurnitureIndex === null) return;
    const updatedConfigs = { ...configs };
    updatedConfigs[activeRoom].furniture.splice(selectedFurnitureIndex, 1);
    setConfigs(updatedConfigs);
    setSelectedFurnitureIndex(null);
  };

  // Duplicate furniture
  const handleDuplicateFurniture = () => {
    if (selectedFurnitureIndex === null) return;
    const updatedConfigs = { ...configs };
    const original = updatedConfigs[activeRoom].furniture[selectedFurnitureIndex];
    const clone: RoomFurniture = {
      ...original,
      col: Math.min(original.col + 1, COLS - 1), // shift slightly to side
      row: Math.min(original.row + 1, ROWS - 1)
    };
    updatedConfigs[activeRoom].furniture.push(clone);
    setConfigs(updatedConfigs);
    setSelectedFurnitureIndex(updatedConfigs[activeRoom].furniture.length - 1);
  };

  // Update global coordinates (Spawn, Puzzle, Exit)
  const updateGlobalCoord = (key: keyof RoomConfig, val: any) => {
    const updatedConfigs = { ...configs };
    if (key === "exitOnTop") {
      updatedConfigs[activeRoom].exitOnTop = val === "true" || val === true;
    } else if (key === "puzzleName" || key === "floorUrl" || key === "wallUrl") {
      (updatedConfigs[activeRoom] as any)[key] = val;
    } else {
      (updatedConfigs[activeRoom] as any)[key] = parseInt(val, 10) || 0;
    }
    setConfigs(updatedConfigs);
  };

  // Save configurations directly to codebase
  const handleSaveToCodebase = async () => {
    setSaveStatus("Đang lưu...");
    setSaveError("");
    try {
      const response = await fetch("/api/save_room_configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs }),
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        setSaveStatus("✅ Đã lưu cấu hình trực tiếp vào mã nguồn thành công!");
        setTimeout(() => setSaveStatus(""), 4000);
      } else {
        setSaveError("Lỗi: " + (data.message || "Không rõ nguyên nhân"));
      }
    } catch (err: any) {
      setSaveError("Không thể kết nối đến máy chủ: " + err.message);
    }
  };

  // Copy JSON to clipboard
  const handleCopyToClipboard = () => {
    const jsonStr = JSON.stringify(configs, null, 2);
    navigator.clipboard.writeText(jsonStr).then(
      () => {
        alert("Đã sao chép toàn bộ cấu hình JSON vào Clipboard!");
      },
      () => {
        alert("Không thể sao chép. Vui lòng copy tay.");
      }
    );
  };

  const selectedFurniture = selectedFurnitureIndex !== null ? currentConfig.furniture[selectedFurnitureIndex] : null;

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 flex flex-col font-sans overflow-hidden text-gray-100">
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

      {/* Main content wrapper to overlay on top of cropped background */}
      <div className="flex flex-col h-full w-full relative z-10">
      {/* ── Header Bar ────────────────────────────────────────── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-orange-950/40 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wider text-orange-400 font-mono">
            CRYPTO QUEST - TRÌNH THIẾT KẾ BẢN ĐỒ PHÒNG (LEVEL EDITOR)
          </h1>
        </div>
        <button 
          onClick={onClose}
          className="px-5 py-2 rounded bg-red-950/80 hover:bg-red-800 border border-red-500/30 text-red-200 transition font-medium hover:scale-105 font-mono"
        >
          ✖ ĐÓNG EDITOR & CHƠI GAME
        </button>
      </header>

      {/* ── Main Area ───────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── LEFT: Visual Map Grid (16x10) ──────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border-r border-orange-950/20 overflow-auto">
          {/* Room Selection Tabs */}
          <div className="flex gap-2 mb-4 bg-black/40 p-1.5 rounded-lg border border-orange-950/30">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setActiveRoom(num);
                  setSelectedFurnitureIndex(null);
                }}
                className={`px-4 py-2 rounded text-sm font-semibold transition font-mono ${
                  activeRoom === num
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-700/40"
                    : "text-gray-400 hover:bg-orange-950/30 hover:text-orange-300"
                }`}
              >
                PHÒNG {num} ({configs[num].puzzleName})
              </button>
            ))}
          </div>

          <div className="text-xs text-orange-400 mb-2 font-mono">
            🖱️ Click ô lưới để đổi loại gạch: Nền (Gỗ) ➔ Tường (Xám) ➔ Cửa Ra (Đỏ). Hộp đỏ nét đứt thể hiện đồ vật đang chọn.
          </div>

          {/* Grid Viewport - styled identically to GameWorld2D */}
          <div 
            className="relative border-4 border-[#3a2818] shadow-[0_0_40px_rgba(0,0,0,0.9)] rounded overflow-hidden"
            style={{
              width: "100%",
              maxWidth: "1160px",
              aspectRatio: `${COLS} / ${ROWS}`,
              backgroundImage: "url(/assets/floors/wood_floor.png)",
              backgroundSize: `${100 / COLS}% ${100 / ROWS}%`,
              backgroundRepeat: "repeat",
              imageRendering: "pixelated",
              backgroundColor: activeRoom === 3 || activeRoom === 5 ? "#4a3319" : "#ffffff",
              backgroundBlendMode: activeRoom === 3 || activeRoom === 5 ? "multiply" : "normal",
            }}
          >
            {/* Tile layer: only non-floor tiles (walls & exits) */}
            {map.map((rowArr, y) =>
              rowArr.map((tile, x) => {
                if (tile === 0) return null; // transparent — floor bg shows through
                const tileStyle: React.CSSProperties = {
                  position: "absolute",
                  left: `${(x / COLS) * 100}%`,
                  top: `${(y / ROWS) * 100}%`,
                  width: `${(1 / COLS) * 100}%`,
                  height: `${(1 / ROWS) * 100}%`,
                };

                 if (tile === 1) return (
                   <div key={`t${y}-${x}`} style={{ ...tileStyle, overflow: "visible" }}>
                     {renderPixelWallWithTorch(x, y)}
                   </div>
                 );

                 if (tile === 3) return (
                   <div key={`t${y}-${x}`} style={tileStyle}>
                     {renderPixelExit(false)}
                   </div>
                 );
                return null;
              })
            )}

            {/* Invisible click handlers over the grid for tile editing */}
            <div className="absolute inset-0 grid grid-cols-16 grid-rows-10 z-20">
              {Array.from({ length: ROWS * COLS }).map((_, i) => {
                const r = Math.floor(i / COLS);
                const c = i % COLS;
                return (
                  <div
                    key={i}
                    onClick={() => handleCellClick(r, c)}
                    className="cursor-pointer hover:bg-orange-500/15 transition"
                  />
                );
              })}
            </div>

            {/* ── Spawn/Puzzle Indicators ── */}
            {/* Spawn Point */}
            <div
              className="absolute z-10 border border-emerald-400 bg-emerald-500/40 flex items-center justify-center text-[10px] font-bold text-emerald-200 pointer-events-none rounded font-mono"
              style={{
                left: `${(currentConfig.spawnX / COLS) * 100}%`,
                top: `${(currentConfig.spawnY / ROWS) * 100}%`,
                width: `${(1 / COLS) * 100}%`,
                height: `${(1 / ROWS) * 100}%`,
              }}
            >
              SPAWN
            </div>
            {/* Puzzle Point */}
            <div
              className="absolute z-10 border border-indigo-400 bg-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-200 pointer-events-none rounded font-mono text-center leading-tight"
              style={{
                left: `${(currentConfig.puzzleX / COLS) * 100}%`,
                top: `${(currentConfig.puzzleY / ROWS) * 100}%`,
                width: `${(1 / COLS) * 100}%`,
                height: `${(1 / ROWS) * 100}%`,
              }}
            >
              ĐỐ
            </div>
            {/* Exit Coordinates indicator */}
            <div
              className="absolute z-10 border border-rose-400 bg-rose-500/40 flex items-center justify-center text-[10px] font-bold text-rose-200 pointer-events-none rounded font-mono"
              style={{
                left: `${(currentConfig.exitX / COLS) * 100}%`,
                top: `${(currentConfig.exitY / ROWS) * 100}%`,
                width: `${(1 / COLS) * 100}%`,
                height: `${(1 / ROWS) * 100}%`,
              }}
            >
              EXIT
            </div>

            {/* ── Furniture layer ── */}
            {currentConfig.furniture.map((item, idx) => {
              const isSelected = selectedFurnitureIndex === idx;
              const isChair = item.type === "CHAIR";
              const isPC = item.type === "PC";
              const isDragging = dragStart?.index === idx;

              if (isPC) {
                const monitorLeft = "27.5%";
                return (
                  <div
                    key={idx}
                    onMouseDown={(e) => handleMouseDown(e, idx, item)}
                    className={`absolute z-30 group ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    } ${
                      isSelected 
                        ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black/50 border border-red-500 bg-red-500/10" 
                        : "hover:bg-orange-500/10"
                    }`}
                    style={{
                      left:   `${(item.col / COLS) * 100}%`,
                      top:    `${(item.row / ROWS) * 100}%`,
                      width:  `${(item.width  / COLS) * 100}%`,
                      height: `${(item.height / ROWS) * 100}%`,
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
                        height: "75%",
                        objectFit: "contain",
                        imageRendering: "pixelated",
                        zIndex: 10,
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
                        zIndex: 11,
                      }}
                      draggable={false}
                    />
                    <div className="absolute top-0 right-0 bg-black/85 text-[8px] text-orange-400 px-1 py-0.5 rounded font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition z-40">
                      {item.type} ({item.col},{item.row})
                    </div>
                  </div>
                );
              }

              // Determine chair horizontal position (centered if associated with a PC!)
              let itemLeftPercent = (item.col / COLS) * 100;
              if (isChair) {
                const associatedPC = currentConfig.furniture.find(f =>
                  f.type === "PC" && f.row === item.row - 1 && (f.col === item.col || f.col === item.col - 1)
                );
                if (associatedPC) {
                  itemLeftPercent = ((associatedPC.col + 0.5) / COLS) * 100;
                }
              }



              return (
                <div
                  key={idx}
                  onMouseDown={(e) => handleMouseDown(e, idx, item)}
                  className={`absolute z-30 flex items-end justify-center group ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  } ${
                    isSelected 
                      ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black/50 border border-red-500 bg-red-500/10" 
                      : "hover:bg-orange-500/10"
                  }`}
                  style={{
                    left: `${itemLeftPercent}%`,
                    top: `${(item.row / ROWS) * 100}%`,
                    width: `${(item.width / COLS) * 100}%`,
                    height: `${(item.height / ROWS) * 100}%`,
                    transform: `${isChair ? "translateY(-6px)" : ""} ${item.scale ? `scale(${item.scale})` : ""}`,
                    transformOrigin: "bottom center",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.type}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      imageRendering: "pixelated",
                      zIndex: isChair ? 12 : 10,
                    }}
                    className="pointer-events-none"
                    draggable={false}
                  />
                  <div className="absolute top-0 right-0 bg-black/85 text-[8px] text-orange-400 px-1 py-0.5 rounded font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition">
                    {item.type} ({item.col},{item.row})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Properties & Editing Panel ──────────────── */}
        <div className="w-[450px] bg-black/60 backdrop-blur-md border-l border-orange-950/40 flex flex-col overflow-y-auto p-6 font-mono text-sm">
          
          {/* Section: Global Settings */}
          <div className="mb-6 p-4 bg-orange-950/10 rounded-lg border border-orange-950/30">
            <h3 className="text-orange-400 font-bold mb-3 border-b border-orange-950/40 pb-1.5 flex items-center justify-between">
              <span>🏠 THÔNG SỐ PHÒNG {activeRoom}</span>
              <span className="text-[10px] text-gray-500 font-normal">Sử dụng để di chuyển & kích hoạt</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Tọa độ xuất phát (X, Y):</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0" max="15"
                    value={currentConfig.spawnX}
                    onChange={(e) => updateGlobalCoord("spawnX", e.target.value)}
                    className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-center text-orange-300"
                  />
                  <input
                    type="number"
                    min="0" max="9"
                    value={currentConfig.spawnY}
                    onChange={(e) => updateGlobalCoord("spawnY", e.target.value)}
                    className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-center text-orange-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Tọa độ đố (X, Y):</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0" max="15"
                    value={currentConfig.puzzleX}
                    onChange={(e) => updateGlobalCoord("puzzleX", e.target.value)}
                    className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-center text-orange-300"
                  />
                  <input
                    type="number"
                    min="0" max="9"
                    value={currentConfig.puzzleY}
                    onChange={(e) => updateGlobalCoord("puzzleY", e.target.value)}
                    className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-center text-orange-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Cánh cửa thoát (X, Y):</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    min="0" max="15"
                    value={currentConfig.exitX}
                    onChange={(e) => updateGlobalCoord("exitX", e.target.value)}
                    className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-center text-orange-300"
                  />
                  <input
                    type="number"
                    min="0" max="9"
                    value={currentConfig.exitY}
                    onChange={(e) => updateGlobalCoord("exitY", e.target.value)}
                    className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-center text-orange-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Kiểu cửa thoát:</label>
                <select
                  value={currentConfig.exitOnTop ? "true" : "false"}
                  onChange={(e) => updateGlobalCoord("exitOnTop", e.target.value === "true")}
                  className="w-full bg-black/50 border border-orange-950/50 rounded px-2 py-1 text-orange-300"
                >
                  <option value="true">Cửa ở TRÊN (Top wall)</option>
                  <option value="false">Cửa ở DƯỚI (Bottom wall)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Tên mật mã căn phòng:</label>
              <input
                type="text"
                value={currentConfig.puzzleName}
                onChange={(e) => updateGlobalCoord("puzzleName", e.target.value)}
                className="w-full bg-black/50 border border-orange-950/50 rounded px-3 py-1.5 text-orange-300 font-sans"
              />
            </div>
          </div>

          {/* Section: Furniture Editor */}
          <div className="mb-6 p-4 bg-orange-950/10 rounded-lg border border-orange-950/30 flex-1 flex flex-col">
            <h3 className="text-orange-400 font-bold mb-3 border-b border-orange-950/40 pb-1.5 flex items-center justify-between">
              <span>🛋️ ĐỒ NỘI THẤT (FURNITURE)</span>
              <span className="text-[10px] text-gray-500 font-normal">{currentConfig.furniture.length} vật thể</span>
            </h3>

            {/* Form to add new furniture */}
            <div className="flex gap-2 mb-4 bg-black/30 p-2 rounded border border-orange-950/30">
              <select
                value={presetIndexToAdd}
                onChange={(e) => setPresetIndexToAdd(parseInt(e.target.value, 10))}
                className="flex-1 bg-black/50 border border-orange-950/50 rounded px-2 py-1.5 text-xs text-orange-300"
              >
                {FURNITURE_PRESETS.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.type} ({p.w}x{p.h})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddFurniture}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-xs font-bold transition hover:scale-105"
              >
                ➕ THÊM
              </button>
            </div>

            {/* Editing properties of selected furniture */}
            {selectedFurniture ? (
              <div className="flex-1 flex flex-col bg-black/45 p-3.5 rounded border border-red-950/30">
                <div className="flex items-center justify-between mb-3 text-red-400 text-xs font-bold tracking-wider">
                  <span>⚙️ ĐANG CHỈNH: {selectedFurniture.type}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleDuplicateFurniture}
                      className="text-[10px] bg-indigo-950 hover:bg-indigo-800 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded transition"
                      title="Duplicate"
                    >
                      Nhân bản
                    </button>
                    <button 
                      onClick={handleDeleteFurniture}
                      className="text-[10px] bg-red-950 hover:bg-red-800 border border-red-500/30 text-red-300 px-2 py-0.5 rounded transition"
                    >
                      Xóa bỏ
                    </button>
                  </div>
                </div>

                {/* Arrow Pad helper to move item easily */}
                <div className="mb-4">
                  <label className="text-[11px] text-gray-400 block mb-1.5 text-center">Di chuyển nhanh (Arrow Pad):</label>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => updateFurnitureProperty("row", Math.max(selectedFurniture.row - 1, 0))}
                      className="px-3 py-1 bg-orange-950/40 hover:bg-orange-900 border border-orange-950 text-orange-300 text-xs rounded transition"
                    >
                      ▲ Lên
                    </button>
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateFurnitureProperty("col", Math.max(selectedFurniture.col - 1, 0))}
                        className="px-3 py-1 bg-orange-950/40 hover:bg-orange-900 border border-orange-950 text-orange-300 text-xs rounded transition"
                      >
                        ◀ Trái
                      </button>
                      <button
                        onClick={() => updateFurnitureProperty("col", Math.min(selectedFurniture.col + 1, COLS - 1))}
                        className="px-3 py-1 bg-orange-950/40 hover:bg-orange-900 border border-orange-950 text-orange-300 text-xs rounded transition"
                      >
                        Phải ▶
                      </button>
                    </div>
                    <button
                      onClick={() => updateFurnitureProperty("row", Math.min(selectedFurniture.row + 1, ROWS - 1))}
                      className="px-3 py-1 bg-orange-950/40 hover:bg-orange-900 border border-orange-950 text-orange-300 text-xs rounded transition"
                    >
                      ▼ Xuống
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Cột (Col X):</label>
                    <input
                      type="number"
                      min="0" max="15"
                      value={selectedFurniture.col}
                      onChange={(e) => updateFurnitureProperty("col", e.target.value)}
                      className="w-full bg-black/60 border border-orange-950/60 rounded px-2.5 py-1 text-orange-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Hàng (Row Y):</label>
                    <input
                      type="number"
                      min="0" max="9"
                      value={selectedFurniture.row}
                      onChange={(e) => updateFurnitureProperty("row", e.target.value)}
                      className="w-full bg-black/60 border border-orange-950/60 rounded px-2.5 py-1 text-orange-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Rộng (Width):</label>
                    <input
                      type="number"
                      min="1" max="16"
                      value={selectedFurniture.width}
                      onChange={(e) => updateFurnitureProperty("width", e.target.value)}
                      className="w-full bg-black/60 border border-orange-950/60 rounded px-2.5 py-1 text-orange-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Cao (Height):</label>
                    <input
                      type="number"
                      min="1" max="10"
                      value={selectedFurniture.height}
                      onChange={(e) => updateFurnitureProperty("height", e.target.value)}
                      className="w-full bg-black/60 border border-orange-950/60 rounded px-2.5 py-1 text-orange-300"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-[11px] text-gray-400 block mb-1">
                    Tỷ lệ phóng to/thu nhỏ (Scale): <strong className="text-orange-400">{Math.round((selectedFurniture.scale ?? 1.0) * 100)}%</strong>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateFurnitureProperty("scale", Math.max(parseFloat(((selectedFurniture.scale ?? 1.0) - 0.1).toFixed(2)), 0.5))}
                      className="px-2.5 py-1 bg-orange-950/40 hover:bg-orange-900 border border-orange-950 text-orange-300 text-xs rounded transition"
                    >
                      -10%
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={selectedFurniture.scale ?? 1.0}
                      onChange={(e) => updateFurnitureProperty("scale", parseFloat(e.target.value))}
                      className="flex-grow accent-orange-500 cursor-pointer h-1 bg-black/50 rounded-lg appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => updateFurnitureProperty("scale", Math.min(parseFloat(((selectedFurniture.scale ?? 1.0) + 0.1).toFixed(2)), 2.0))}
                      className="px-2.5 py-1 bg-orange-950/40 hover:bg-orange-900 border border-orange-950 text-orange-300 text-xs rounded transition"
                    >
                      +10%
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFurnitureProperty("scale", 1.0)}
                      className="px-2 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-[10px] rounded transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mb-1">
                  <label className="text-[11px] text-gray-400 block mb-1">Đường dẫn ảnh (Asset URL):</label>
                  <input
                    type="text"
                    value={selectedFurniture.image}
                    onChange={(e) => updateFurnitureProperty("image", e.target.value)}
                    className="w-full bg-black/60 border border-orange-950/60 rounded px-2 py-1 text-xs text-orange-300 font-sans"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border border-dashed border-orange-950/30 rounded-lg p-6 text-center text-gray-500 text-xs">
                💡 Click chọn một đồ nội thất trên màn hình game (bên trái) để bắt đầu căn chỉnh tọa độ hoặc thay đổi kích thước của nó.
              </div>
            )}
          </div>

          {/* Section: Action Panel */}
          <div className="p-4 bg-orange-950/15 rounded-lg border border-orange-950/40">
            <h3 className="text-orange-400 font-bold mb-2">💾 LƯU & XUẤT BẢN</h3>
            
            {saveStatus && (
              <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-3 py-2 rounded text-xs mb-3">
                {saveStatus}
              </div>
            )}
            {saveError && (
              <div className="bg-red-950/80 border border-red-500/40 text-red-200 px-3 py-2 rounded text-xs mb-3">
                {saveError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSaveToCodebase}
                className="w-full py-3 rounded bg-orange-600 hover:bg-orange-500 border border-orange-400/40 text-white font-bold transition hover:scale-[1.02] shadow-lg shadow-orange-950/40 text-xs tracking-wider"
              >
                💾 LƯU TRỰC TIẾP VÀO MÃ NGUỒN GAME
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className="w-full py-2.5 rounded bg-black/40 hover:bg-black/60 border border-orange-950/60 text-orange-300 font-bold transition text-xs"
              >
                📋 SAO CHÉP TOÀN BỘ CẤU HÌNH JSON
              </button>
            </div>
          </div>

        </div>

      </div>
      </div>
    </div>
  );
}
