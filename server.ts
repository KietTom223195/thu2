import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory sessions storage by session ID.
// This is 100% robust against cookie-blocking in browser iframes!
interface GameSession {
  currentLevel: number;
  score: number;
  startTime: number;
  completed: boolean;
  sessionKey: string; // Random secure session key exchanged upon startup
}

const gameSessions = new Map<string, GameSession>();

function getSession(req: express.Request): GameSession {
  const sessionId = (req.headers["x-session-id"] as string) || "default-session-id";
  if (!gameSessions.has(sessionId)) {
    gameSessions.set(sessionId, {
      currentLevel: 1,
      score: 0,
      startTime: Date.now(),
      completed: false,
      sessionKey: crypto.randomBytes(32).toString("hex") // Secure runtime key
    });
  }
  return gameSessions.get(sessionId)!;
}

// Maximum score per level
const LEVEL_POINTS: Record<number, number> = {
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500
};

// --- Decryption helpers ---
function decryptCaesar(ciphertext: string, k: number): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let plaintext = "";
  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i];
    const isUpper = char === char.toUpperCase();
    const cleanChar = char.toUpperCase();
    if (alphabet.includes(cleanChar)) {
      const code = cleanChar.charCodeAt(0) - 65;
      const pCode = (code - k + 26) % 26;
      const decChar = String.fromCharCode(pCode + 65);
      plaintext += isUpper ? decChar : decChar.toLowerCase();
    } else {
      plaintext += char;
    }
  }
  return plaintext;
}

function decryptVigenere(ciphertext: string, keyword: string): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const upperKey = keyword.toUpperCase();
  const upperCipher = ciphertext.toUpperCase();
  let plaintext = "";
  let j = 0;
  for (let i = 0; i < upperCipher.length; i++) {
    const char = upperCipher[i];
    if (char === " ") {
      plaintext += " ";
      continue;
    }
    if (alphabet.includes(char)) {
      const cCode = char.charCodeAt(0) - 65;
      const kCode = upperKey[j % upperKey.length].charCodeAt(0) - 65;
      const pCode = (cCode - kCode + 26) % 26;
      plaintext += String.fromCharCode(pCode + 65);
      j++;
    } else {
      plaintext += char;
    }
  }
  return plaintext;
}

// --- SECURITY LOGGING SYSTEM ---
const SECURITY_LOG_FILE = path.resolve(process.cwd(), "security.log");

function writeSecurityLog(event: string, details: string, status: "SUCCESS" | "WARNING" | "FAILED", sessionId?: string) {
  const timestamp = new Date().toISOString();
  const cleanSessionId = sessionId || "unknown-session";
  const logLine = `[${timestamp}] [${status}] [Session: ${cleanSessionId}] Event: ${event} | Details: ${details}\n`;
  try {
    fs.appendFileSync(SECURITY_LOG_FILE, logLine, "utf-8");
  } catch (err) {
    // ignore
  }
  console.log(`[SECURITY] [${status}] ${event} - ${details}`);
}

// --- DATA ENCRYPTION (AES-256-GCM) ---
// Secure key derivation for leaderboard file encryption
const LEADERBOARD_KEY = crypto.scryptSync(process.env.LEADERBOARD_SECRET || "fit4012-secret-salt-2026", "salt", 32);

function encryptData(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", LEADERBOARD_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decryptData(cipherText: string): string {
  const parts = cipherText.split(":");
  if (parts.length !== 3) throw new Error("Invalid cipher text format");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], "hex");
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", LEADERBOARD_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// --- ANTI-REPLAY & INTEGRITY MIDDLEWARE ---
const processedNonces = new Map<string, number>();

// Cleanup expired nonces every 15s
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of processedNonces.entries()) {
    if (now > expiry) {
      processedNonces.delete(nonce);
    }
  }
}, 15000);

function verifySecuritySignature(req: express.Request, res: express.Response, next: express.NextFunction) {
  const path = req.path;
  // Bypass validation for non-api or start routes
  if (path === "/api/start" || !path.startsWith("/api/")) {
    return next();
  }

  // Bypass signature check for GET leaderboard (public)
  if (path === "/api/leaderboard" && req.method === "GET") {
    return next();
  }

  const sessionId = (req.headers["x-session-id"] as string) || "default-session-id";
  const nonce = req.headers["x-nonce"] as string;
  const timestampHeader = req.headers["x-timestamp"] as string;
  const signature = req.headers["x-signature"] as string;

  if (!nonce || !timestampHeader || !signature) {
    writeSecurityLog("SIGNATURE_VALIDATION", "Missing required security headers", "FAILED", sessionId);
    return res.status(401).json({
      status: "error",
      message: "🔐 Yêu cầu bị chặn: Thiếu tiêu đề bảo mật an toàn hệ thống (nonce, timestamp hoặc signature)!"
    });
  }

  const now = Date.now();
  const requestTime = parseInt(timestampHeader, 10);

  // 1. Timestamp validation (anti-replay time window of 15 seconds)
  if (isNaN(requestTime) || Math.abs(now - requestTime) > 15000) {
    writeSecurityLog("REPLAY_PREVENTION", `Expired request timestamp: ${timestampHeader} (Diff: ${now - requestTime}ms)`, "FAILED", sessionId);
    return res.status(403).json({
      status: "error",
      message: "🔐 Yêu cầu bị chặn: Phiên gửi dữ liệu đã hết hạn (Yêu cầu lệch quá 15 giây so với máy chủ)!"
    });
  }

  // 2. Nonce validation (anti-replay unique check)
  if (processedNonces.has(nonce)) {
    writeSecurityLog("REPLAY_PREVENTION", `Replay attack detected: Nonce ${nonce} already processed!`, "FAILED", sessionId);
    return res.status(403).json({
      status: "error",
      message: "🔐 Yêu cầu bị chặn: Phát hiện tấn công phát lại (Replay Attack)! Nonce này đã được sử dụng."
    });
  }

  // Record nonce as used (valid for 15 seconds)
  processedNonces.set(nonce, requestTime + 15000);

  // 3. Signature verification (integrity check)
  if (!gameSessions.has(sessionId)) {
    writeSecurityLog("SESSION_VALIDATION", "Invalid or unknown session ID", "FAILED", sessionId);
    return res.status(401).json({
      status: "error",
      message: "🔐 Phiên làm việc không hợp lệ. Vui lòng làm mới trang."
    });
  }

  const session = gameSessions.get(sessionId)!;
  const sessionKey = session.sessionKey;

  // Re-calculate HMAC-SHA256
  const bodyString = typeof req.body === "object" ? JSON.stringify(req.body) : (req.body || "");
  const payload = bodyString + nonce + timestampHeader;
  
  const hmac = crypto.createHmac("sha256", sessionKey);
  hmac.update(payload);
  const calculatedSignature = hmac.digest("hex");

  if (calculatedSignature !== signature) {
    console.log("=== SIGNATURE MISMATCH DEBUG ===");
    console.log("Client Signature:", signature);
    console.log("Calculated Signature:", calculatedSignature);
    console.log("Server Payload:", JSON.stringify(payload));
    console.log("Server req.body:", JSON.stringify(req.body));
    console.log("================================");
    writeSecurityLog("INTEGRITY_CHECK", `Signature mismatch. Server payload: ${payload}`, "FAILED", sessionId);
    return res.status(400).json({
      status: "error",
      message: "🔐 Cảnh báo: Dữ liệu truyền tải đã bị thay đổi (Tampered) hoặc giả mạo chữ ký trên đường truyền!"
    });
  }

  writeSecurityLog("INTEGRITY_CHECK", `Verified secure request for ${req.method} ${path}`, "SUCCESS", sessionId);
  next();
}

app.use(verifySecuritySignature);

// --- API routes ---

app.post("/api/start", (req, res) => {
  const sessionId = (req.headers["x-session-id"] as string) || "default-session-id";
  const sessionKey = crypto.randomBytes(32).toString("hex");
  gameSessions.set(sessionId, {
    currentLevel: 1,
    score: 0,
    startTime: Date.now(),
    completed: false,
    sessionKey
  });
  writeSecurityLog("SESSION_START", `Initialized session with secure key: ${sessionKey.substring(0, 8)}...`, "SUCCESS", sessionId);
  res.json({ status: "success", level: 1, score: 0, sessionKey });
});

app.get("/api/state", (req, res) => {
  const session = getSession(req);
  const elapsed = Math.round((Date.now() - session.startTime) / 100) / 10;
  res.json({
    currentLevel: session.currentLevel,
    score: session.score,
    completed: session.completed,
    elapsed_time: elapsed
  });
});

app.post("/api/verify_caesar", (req, res) => {
  const session = getSession(req);
  try {
    const { ciphertext, k: kRaw } = req.body;

    if (kRaw === undefined || kRaw === null || kRaw === "") {
      return res.status(400).json({
        status: "error",
        message: "Chiếc bánh xe đá kẹt cứng. Bạn chưa chọn số bước dịch (k) để căn chỉnh..."
      });
    }

    const k = parseInt(kRaw, 10);
    if (isNaN(k) || k < 0 || k > 25) {
      return res.status(400).json({
        status: "error",
        message: "Ký tự k lạ lùng làm ổ khóa rỉ máu. Số bước dịch (k) buộc phải là một con số nguyên dương!"
      });
    }

    if (!ciphertext) {
      return res.status(400).json({
        status: "error",
        message: "Không tìm thấy văn bản mã hóa. Bạn đang định xoay bánh xe trong vô vọng sao?"
      });
    }

    const plaintext = decryptCaesar(ciphertext.trim().toUpperCase(), k);

    // Caesar requirement
    if (ciphertext.toUpperCase() === "ILWGQX" && k === 3 && plaintext === "FITDNU") {
      if (session.currentLevel === 1) {
        session.currentLevel = 2;
        session.score += LEVEL_POINTS[1];
      }
      return res.json({
        status: "success",
        plaintext,
        message: "Crack! Bánh răng đá xoay tròn rầm rập. Cánh cửa Thư viện hé mở cùng một luồng khí lạnh toát tràn vào...",
        next_room: "/room2"
      });
    } else if (ciphertext.toUpperCase() === "KHOOR" && k === 3 && plaintext === "HELLO") {
      return res.json({
        status: "success",
        plaintext,
        message: "Ký tự 'HELLO' phát sáng trên vách đá rêu phong. Hãy ghi nhớ từ ngữ này cho câu đố cuối cùng!"
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: `Ký hiệu dịch chuyển ra '${plaintext}', nhưng cánh cửa vẫn im lìm kỳ quái. Có tiếng móng vuốt cào cấu khe cửa...`
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: `Hệ thống run rẩy: ${err.message}. Một bàn tay vô hình siết chặt lấy cổ họng bạn...`
    });
  }
});

app.post("/api/verify_vigenere", (req, res) => {
  const session = getSession(req);
  if (session.currentLevel < 2) {
    session.currentLevel = 2;
  }

  try {
    const { keyword, ciphertext } = req.body;

    if (!keyword) {
      return res.status(400).json({
        status: "error",
        message: "Ổ khóa xoay rỗng tuếch. Xin hãy nhập từ khóa để xoay các vòng chữ cái..."
      });
    }

    const cleanKey = keyword.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(cleanKey)) {
      return res.status(400).json({
        status: "error",
        message: "Bụi phấn rụng từ trần nhà. Từ khóa chữ cái không được chứa ký tự số hay biểu tượng tà thuật!"
      });
    }

    if (!ciphertext) {
      return res.status(400).json({
        status: "error",
        message: "Bản mã trống rỗng. Hãy kiểm tra lại thư tịch cổ tủ sách!"
      });
    }

    const plaintext = decryptVigenere(ciphertext.trim().toUpperCase(), cleanKey);
    const isCorrect = cleanKey === "DEATH" && (
      (ciphertext.toUpperCase().includes("CREEPY") && plaintext.includes("ZNELIV")) ||
      (ciphertext.toUpperCase().includes("YJR") && plaintext.includes("VFR"))
    );

    if (isCorrect) {
      if (session.currentLevel === 2) {
        session.currentLevel = 3;
        session.score += LEVEL_POINTS[2];
      }
      return res.json({
        status: "success",
        plaintext,
        message: "Tấm bản đồ da người trong sách sáng rực: Tọa độ tầng hầm bí ẩn được hé lộ. Chốt khóa lò luyện kim sập xuống xủng xoảng!",
        next_room: "/room3"
      });
    } else {
      console.log(`Vigenere Debug - Key: "${cleanKey}", Cipher: "${ciphertext}", Plain: "${plaintext}", isCorrect: ${isCorrect}`);
      return res.status(400).json({
        status: "error",
        message: `Ổ khóa kêu rắc rắc rùng rợn. (Key: ${cleanKey}, Cipher: ${ciphertext}, Plaintext: ${plaintext}). Kết quả không khớp.`
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: `Cỗ máy kẹt cứng, có tiếng bước chân lê lết đang tới gần... (${err.message})`
    });
  }
});

app.post("/api/verify_hash", (req, res) => {
  const session = getSession(req);
  if (session.currentLevel < 3) {
    session.currentLevel = 3;
  }

  try {
    const { password, flaw, defense } = req.body;

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Cơ sở dữ liệu trống rỗng. Bạn phải tìm được mật khẩu giải băm của admin!"
      });
    }

    const isCorrectPassword = password.trim().toLowerCase() === "hello";
    const isCorrectFlaw = flaw === "no_salt";
    const isCorrectDefense = defense === "bcrypt";

    if (!isCorrectPassword) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu giải mã không chính xác! Có tiếng cười lạnh lùng vang vọng từ hầm tối..."
      });
    }

    if (!isCorrectFlaw || !isCorrectDefense) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu đúng, nhưng bạn chưa chỉ ra lỗ hổng bảo mật mật mã và giải pháp của nó để vượt qua chốt chặn!"
      });
    }

    if (session.currentLevel === 3) {
      session.currentLevel = 4;
      session.score += LEVEL_POINTS[3];
    }
    return res.json({
      status: "success",
      message: "Rắc! Hộp băm bị bẻ khóa. Luồng khí ẩm mốc bốc lên từ bậc thềm dẫn xuống Lò luyện kim RSA...",
      next_room: "/room4"
    });
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: `Hầm ngầm rung chuyển: ${err.message}`
    });
  }
});

app.post("/api/verify_rsa", (req, res) => {
  const session = getSession(req);
  if (session.currentLevel < 4) {
    session.currentLevel = 4;
  }

  try {
    const { n: nRaw, d: dRaw, flaw } = req.body;

    if (!nRaw || !dRaw) {
      return res.status(400).json({
        status: "error",
        message: "Lò đúc nguội ngắt. Bạn phải tính toán n và d từ hai số nguyên tố bí truyền p=3, q=11!"
      });
    }

    const n = parseInt(nRaw, 10);
    const d = parseInt(dRaw, 10);

    if (isNaN(n) || isNaN(d)) {
      return res.status(400).json({
        status: "error",
        message: "Lẫn lộn số học! Giá trị n và d bắt buộc phải là số nguyên tinh khiết, nếu không lò đúc sẽ nổ tung!"
      });
    }

    if (n === 33 && d === 7) {
      if (flaw !== "small_primes") {
        return res.status(400).json({
          status: "error",
          message: "Khóa tính toán chính xác, nhưng lò đúc vẫn bị quá nhiệt do lỗ hổng bảo mật của khóa này chưa được chỉ ra!"
        });
      }

      if (session.currentLevel === 4) {
        session.currentLevel = 5;
        session.score += LEVEL_POINTS[4];
      }
      return res.json({
        status: "success",
        message: "Keng! Búa tạ rèn rập mạnh mẽ. Khóa RSA đúc xong và lỗ hổng khóa yếu đã được ghi nhận. Tiến vào phòng điều khiển Cryptex!",
        next_room: "/room5"
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "Khói đen độc tỏa ra khét lẹt. n hoặc d tính toán sai lệch khiến thép nguội đông cứng thành kim loại vụn rác..."
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: `Nửa đêm gió rít ghê rợn, xỉ than văng đầy mặt... Lỗi tính toán: ${err.message}`
    });
  }
});

app.post("/api/verify_aes", (req, res) => {
  const session = getSession(req);
  if (session.currentLevel < 5) {
    session.currentLevel = 5;
  }

  try {
    const { aes_key, flaw, defense } = req.body;

    if (!aes_key) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập mật mã tổng hợp cuối cùng để kích hoạt cỗ máy thời gian..."
      });
    }

    if (aes_key.trim().toUpperCase() === "HELLODEATH33") {
      if (flaw !== "ecb_mode" || defense !== "gcm_mode") {
        return res.status(400).json({
          status: "error",
          message: "Từ khóa chính xác! Tuy nhiên, lõi năng lượng của cỗ máy Cryptex vẫn chập điện vì chế độ mã hóa không an sau! Hãy chỉ ra lỗ hổng và đề xuất phòng vệ đúng."
        });
      }

      if (!session.completed) {
        session.score += LEVEL_POINTS[5];
        session.completed = true;
        session.currentLevel = 6;
      }
      const elapsed = Math.round((Date.now() - session.startTime) / 100) / 10;
      return res.json({
        status: "success",
        message: "BÙM! Luồng sáng neon lục phát nổ từ lõi Cryptex, bẻ gãy không gian và thời gian. Bạn đã thoát ly khỏi phòng giam mật mã thành công!",
        total_score: session.score,
        elapsed_time: elapsed,
        next_room: "/game_over"
      });
    } else {
      return res.status(400).json({
        status: "error",
        message: "TÍCH TẮC! Khối Cryptex kích hoạt cơ chế tự hủy, kim đồng hồ xoay ngược bấn loạn. Sai mật mã rồi! Có bóng đen đang hối hả lao tới..."
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      status: "error",
      message: `Màn sương chết chóc xâm chiếm bảng điều khiển... Lỗi: ${err.message}`
    });
  }
});

app.post("/api/save_room_configs", (req, res) => {
  try {
    const { configs } = req.body;
    if (!configs) {
      return res.status(400).json({ status: "error", message: "Missing configs data" });
    }

    const fileContent = `export interface RoomFurniture {
  type:   string;
  col:    number;
  row:    number;
  width:  number;
  height: number;
  image:  string;
  scale?:  number;
}

export interface RoomConfig {
  map:         number[][];
  spawnX:      number;
  spawnY:      number;
  puzzleX:     number;
  puzzleY:     number;
  puzzleName:  string;
  furniture:   RoomFurniture[];
  floorUrl:    string;
  wallUrl:     string;
  exitX:       number;
  exitY:       number;
  exitOnTop:   boolean;
}

export const ROOM_CONFIGS: Record<number, RoomConfig> = ${JSON.stringify(configs, null, 2)};
`;

    const targetPath = path.resolve(process.cwd(), "src/components/RoomConfigs.ts");
    fs.writeFileSync(targetPath, fileContent, "utf-8");
    res.json({ status: "success", message: "Room configurations updated successfully!" });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// --- Leaderboard functionality ---
const LEADERBOARD_FILE = path.resolve(process.cwd(), "leaderboard.json");

interface LeaderboardEntry {
  name: string;
  score: number;
  time: number; // in seconds
  date: string;
}

function getLeaderboard(): LeaderboardEntry[] {
  const defaultData: LeaderboardEntry[] = [
    { name: "Alan Turing", score: 1500, time: 200, date: new Date().toLocaleDateString() },
    { name: "Ada Lovelace", score: 1400, time: 250, date: new Date().toLocaleDateString() },
    { name: "Claude Shannon", score: 1200, time: 300, date: new Date().toLocaleDateString() },
    { name: "Satoshi", score: 1000, time: 350, date: new Date().toLocaleDateString() },
    { name: "Mage Mật Mã", score: 800, time: 400, date: new Date().toLocaleDateString() }
  ];

  if (!fs.existsSync(LEADERBOARD_FILE)) {
    try {
      const encrypted = encryptData(JSON.stringify(defaultData));
      fs.writeFileSync(LEADERBOARD_FILE, encrypted, "utf-8");
    } catch (err) {
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(defaultData), "utf-8");
    }
    return defaultData;
  }
  try {
    const content = fs.readFileSync(LEADERBOARD_FILE, "utf-8").trim();
    if (content.startsWith("[")) {
      const parsed = JSON.parse(content);
      const encrypted = encryptData(content);
      fs.writeFileSync(LEADERBOARD_FILE, encrypted, "utf-8");
      return parsed;
    }
    const decrypted = decryptData(content);
    return JSON.parse(decrypted);
  } catch (e) {
    try {
      const encrypted = encryptData(JSON.stringify(defaultData));
      fs.writeFileSync(LEADERBOARD_FILE, encrypted, "utf-8");
    } catch (err) {
      // ignore
    }
    return defaultData;
  }
}

app.get("/api/leaderboard", (req, res) => {
  const lb = getLeaderboard();
  res.json(lb.slice(0, 5));
});

app.post("/api/leaderboard/submit", (req, res) => {
  try {
    const { name, score, time } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ status: "error", message: "Name is required" });
    }
    const lb = getLeaderboard();
    const newEntry: LeaderboardEntry = {
      name: name.trim().substring(0, 20),
      score: parseInt(score, 10) || 0,
      time: parseFloat(time) || 0,
      date: new Date().toLocaleDateString()
    };
    lb.push(newEntry);
    // Sort: highest score first, then lowest time first
    lb.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time - b.time;
    });
    const topLb = lb.slice(0, 10);
    fs.writeFileSync(LEADERBOARD_FILE, encryptData(JSON.stringify(topLb)), "utf-8");
    res.json({ status: "success", leaderboard: topLb.slice(0, 5) });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e.message });
  }
});

// --- Vite & production assets handling ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);

    // Serve index.html as fallback in development
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(
          path.resolve(process.cwd(), "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
