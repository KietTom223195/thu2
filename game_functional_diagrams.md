# SƠ ĐỒ CHỨC NĂNG & QUAN HỆ HỆ THỐNG - GAME "HUYỀN THOẠI BẺ KHÓA"

Tài liệu này mô tả chi tiết kiến trúc chức năng, luồng hoạt động và mối quan hệ giữa các cấu phần trong trò chơi giải mã mật mã học "Huyền Thoại Bẻ Khóa" (thu2).

---

## 1. Sơ đồ Phân rã Chức năng (Functional Decomposition)

Sơ đồ thể hiện cấu trúc phân cấp các tính năng của trò chơi từ cấp độ tổng quan đến các chức năng chi tiết.

```mermaid
graph TD
    Root["🎮 HUYỀN THOẠI BẺ KHÓA"]
    
    %% Main Branches
    G1["🕹️ HỆ THỐNG GAMEPLAY"]
    G2["🏆 BẢNG VÀNG CAO THỦ"]
    G3["⚙️ BỘ MÁY BACKEND"]
    G4["📺 GIAO DIỆN & HIỆU ỨNG"]

    Root --> G1
    Root --> G2
    Root --> G3
    Root --> G4

    %% Gameplay details
    G1 --> GP1["Touch/Click Di chuyển"]
    G1 --> GP2["Khảo sát vật thể (Inspect)"]
    G1 --> GP3["Giải mã mật phòng (1-5)"]
    G1 --> GP4["Hệ thống Gợi ý (-50đ)"]
    G1 --> GP5["Dừng chơi & Tính điểm"]

    %% Leaderboard details
    G2 --> LB1["Tải bảng xếp hạng"]
    G2 --> LB2["Khắc tên & Nộp điểm"]
    G2 --> LB3["Sắp xếp thứ hạng (Score/Time)"]

    %% Backend details
    G3 --> BE1["Khởi tạo Session (/api/start)"]
    G3 --> BE2["Lưu vết & Đồng bộ (/api/state, /api/save)"]
    G3 --> BE3["Mã hóa bảo mật tệp (AES-256-GCM)"]
    G3 --> BE4["Kiểm thử chữ ký chống gian lận (Sign/Nonce)"]

    %% UI/UX details
    G4 --> UI1["Responsive co giãn thông minh (CSS Scale)"]
    G4 --> UI2["Hoạt ảnh chiến thắng (Rương vàng)"]
    G4 --> UI3["Hoạt ảnh gục ngã (Đầu lâu u ám)"]
    G4 --> UI4["Bộ tổng hợp âm thanh (Audio Synthesizer)"]
```

---

## 2. Sơ đồ Ca sử dụng (Use Case Diagram)

Mô tả sự tương tác của Người chơi (Actor) với các tính năng của hệ thống và luồng xử lý tương ứng trên Frontend/Backend.

```mermaid
graph LR
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px;
    Player((Hiệp sĩ bẻ khóa))

    subgraph Front ["Giao diện trò chơi (React client)"]
        UC_Play["Bắt đầu hành trình"]
        UC_Move["Chạm di chuyển nhân vật"]
        UC_Inspect["Khảo sát cơ quan / Nhận câu đố"]
        UC_Solve["Giải mã mật mật (1 -> 5)"]
        UC_Hint["Yêu cầu gợi ý (-50đ)"]
        UC_ForceQuit["Dừng chơi sớm (Tính điểm)"]
        UC_Submit["Đăng ký bảng vàng"]
    end

    subgraph Back ["Xử lý máy chủ (Express Server)"]
        API_Start["Khởi tạo Session mới"]
        API_State["Đồng bộ trạng thái / Thời gian"]
        API_Verify["Xác thực đáp án (Caesar, Vig, RSA...)"]
        API_LB["Lưu trữ & Sắp xếp bảng xếp hạng"]
    end

    %% Player interactions with frontend
    Player --> UC_Play
    Player --> UC_Move
    Player --> UC_Inspect
    Player --> UC_Solve
    Player --> UC_Hint
    Player --> UC_ForceQuit
    Player --> UC_Submit

    %% Frontend calls backend
    UC_Play -.-> |POST /api/start| API_Start
    UC_Inspect -.-> |GET /api/state| API_State
    UC_Solve -.-> |POST /api/verify_*| API_Verify
    UC_Hint -.-> |POST /api/save| API_State
    UC_ForceQuit -.-> |GET /api/state| API_State
    UC_Submit -.-> |POST /api/leaderboard/submit| API_LB
```

---

## 3. Sơ đồ Tuần tự Chức năng (Sequence Diagram)

Mô tả luồng đi của dữ liệu giữa Trình duyệt (Client), Bộ phát âm thanh (Audio Engine), Máy chủ (Backend), và File lưu trữ mã hóa (Database) cho hai trường hợp: **Giải câu đố** và **Dừng chơi sớm**.

### A. Luồng Khảo sát và Xác thực câu đố (Inspect & Verify)
```mermaid
sequenceDiagram
    autonumber
    actor Player as Người chơi
    participant Client as Trình duyệt (React)
    participant Sound as Công cụ Âm thanh
    participant Server as Máy chủ (Node/Express)

    Player->>Client: Chạm vào Hòm đồ/Máy tính
    Client->>Server: Gửi yêu cầu khảo sát vật thể
    Server-->>Client: Trả về câu hỏi & trạng thái mật mã
    Client->>Player: Hiển thị giao diện nhập mật mã
    Player->>Client: Nhập đáp án & Nhấn Nộp
    Client->>Server: POST /api/verify_* (gửi kèm SessionId & Đáp án)
    
    alt Đáp án ĐÚNG
        Server->>Server: Cộng điểm & Cập nhật phòng kế tiếp
        Server-->>Client: Trả về trạng thái SUCCESS & Thông tin phòng mới
        Client->>Sound: playSuccess()
        Client->>Player: Hiện thông báo chúc mừng & Mở cửa tiếp bước
    else Đáp án SAI
        Server-->>Client: Trả về trạng thái ERROR & Thông điệp cảnh báo
        Client->>Sound: playError()
        Client->>Player: Rung lắc màn hình & Báo sai mật mã
    end
```

### B. Luồng Dừng chơi sớm & Nộp điểm (Force Finish & Leaderboard Save)
```mermaid
sequenceDiagram
    autonumber
    actor Player as Người chơi
    participant Client as Trình duyệt (React)
    participant Sound as Công cụ Âm thanh
    participant Server as Máy chủ (Node/Express)
    participant Db as Tệp lưu trữ (leaderboard.json)

    Player->>Client: Click nút "Tính điểm 🏆"
    Client->>Player: Hiện bảng xác nhận kết thúc sớm
    Player->>Client: Xác nhận đồng ý nộp điểm
    
    Client->>Server: GET /api/state (Lấy điểm & thời gian chuẩn từ máy chủ)
    Server-->>Client: Trả về {score, elapsed_time}
    
    Client->>Sound: playDefeat() (Chạy âm thanh gục ngã trầm)
    Client->>Player: Hiển thị hoạt ảnh Đầu lâu 💀 (KIỆT SỨC & GỤC NGÃ)
    Player->>Client: Bấm nút xem kết quả & Nhập tên nộp bảng vàng
    
    Client->>Server: POST /api/leaderboard/submit {name, score, time}
    Server->>Db: Đọc tệp, giải mã AES-256-GCM
    Server->>Server: Lọc bỏ tên trùng, đẩy điểm mới, sắp xếp thứ tự
    Server->>Db: Mã hóa AES-256-GCM & Lưu lại file
    Server-->>Client: Trả về Top 5 Cao thủ mới nhất
    Client->>Sound: playSuccess()
    Client->>Player: Hiển thị bảng vàng thành tích màu đỏ máu, nổi bật dòng kỷ lục của người chơi
```

---

## 4. Sơ đồ Luồng hoạt động & Chuyển trạng thái (Activity/State Flow)

Mô tả chu kỳ trạng thái của Game từ lúc bắt đầu cho đến khi kết thúc (thắng cuộc hoặc gục ngã).

```mermaid
stateDiagram-v2
    [*] --> GuildHallEntrance : Bắt đầu game (Start Screen)
    
    GuildHallEntrance --> Room1 : Nhấn "Bước vào"
    
    state Gameplay_Rooms {
        Room1 --> Room2 : Giải mã Caesar thành công (Cửa 🔓)
        Room2 --> Room3 : Giải mã Vigenère thành công (Cửa 🔓)
        Room3 --> Room4 : Giải mã Hash & Salt thành công (Cửa 🔓)
        Room4 --> Room5 : Giải mã RSA thành công (Cửa 🔓)
        
        state Room_Interactions {
            [*] --> Di_Chuyen_Chạm : Chạm gạch để di chuyển NPC
            Di_Chuyen_Chạm --> Khảo_Sát_Cơ_Quan : Chạm Hòm đồ/Máy tính
            Khảo_Sát_Cơ_Quan --> Giải_Mật_Mã : Nhập key giải mã
            Giải_Mật_Mã --> Khảo_Sát_Cơ_Quan : Đáp án sai
            
            Khảo_Sát_Cơ_Quan --> Dùng_Gợi_Ý : Khó quá? Bấm xem Hint
            Dùng_Gợi_Ý --> Giải_Mật_Mã : Bị trừ 50 điểm
        }
    }

    Gameplay_Rooms --> SuccessOverlay_Victory : Vượt qua Room 5 (Mở rương báu 🎁)
    
    Gameplay_Rooms --> SuccessOverlay_Defeat : Nhấn "Tính điểm" (Nhân vật gục ngã 💀)
    
    state Leaderboard_Submission {
        SuccessOverlay_Victory --> Ghi_Danh_Bảng_Vàng
        SuccessOverlay_Defeat --> Ghi_Danh_Bảng_Vàng
        Ghi_Danh_Bảng_Vàng --> Hiển_Thị_Top_5
    }

    Hiển_Thị_Top_5 --> GuildHallEntrance : Chơi lại (Reset Game)
```
