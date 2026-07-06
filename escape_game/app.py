import os
import time
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from models.ciphers import CryptographyEngine

app = Flask(__name__)
# Secure secret key for Flask sessions
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "blood_saint_crypt_chamber_key_666")

# Maximum score per level
LEVEL_POINTS = {
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500
}

def init_game_session():
    if 'current_level' not in session:
        session['current_level'] = 1
    if 'score' not in session:
        session['score'] = 0
    if 'start_time' not in session:
        session['start_time'] = time.time()
    if 'completed' not in session:
        session['completed'] = False

@app.route('/')
def index():
    init_game_session()
    return redirect(url_for('room1'))

@app.route('/room1')
def room1():
    init_game_session()
    # Always allow room 1
    return render_template('room1_hall.html')

@app.route('/room2')
def room2():
    init_game_session()
    if session['current_level'] < 2:
        return redirect(url_for('room1'))
    return render_template('room2_library.html')

@app.route('/room3')
def room3():
    init_game_session()
    if session['current_level'] < 3:
        return redirect(url_for(f'room{session["current_level"]}'))
    return render_template('room3_hash.html')

@app.route('/room4')
def room4():
    init_game_session()
    if session['current_level'] < 4:
        return redirect(url_for(f'room{session["current_level"]}'))
    return render_template('room4_alchemy.html')

@app.route('/room5')
def room5():
    init_game_session()
    if session['current_level'] < 5:
        return redirect(url_for(f'room{session["current_level"]}'))
    return render_template('room5_cryptex.html')

@app.route('/reset', methods=['POST', 'GET'])
def reset_game():
    session.clear()
    session['current_level'] = 1
    session['score'] = 0
    session['start_time'] = time.time()
    session['completed'] = False
    return redirect(url_for('room1'))

# API - Caesar cipher
@app.route('/api/verify_caesar', methods=['POST'])
def verify_caesar():
    init_game_session()
    try:
        data = request.get_json() or {}
        ciphertext = data.get('ciphertext', '').strip().upper()
        key_raw = data.get('k', '')
        
        # Validate input format
        if not key_raw:
            return jsonify({
                "status": "error",
                "message": "Chiếc bánh xe đá kẹt cứng. Bạn chưa chọn số bước dịch (k) để căn chỉnh..."
            }), 400
            
        try:
            k = int(key_raw)
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Ký tự k lạ lùng làm ổ khóa rỉ máu. Số bước dịch (k) buộc phải là một con số nguyên dương!"
            }), 400
            
        if not ciphertext:
            return jsonify({
                "status": "error",
                "message": "Không tìm thấy văn bản mã hóa. Bạn đang định xoay bánh xe trong vô vọng sao?"
            }), 400

        # Run Caesar Decryption logic
        plaintext = CryptographyEngine.caesar_decrypt(ciphertext, k)
        
        # Level 1 requirement:
        # User shifts ILWGQX by k=3 to get FITDNU to unlock the transition to Library
        # Or key is 3 and ciphertext is KHOOR to get HELLO (to store for Level 4)
        if ciphertext == "ILWGQX" and k == 3 and plaintext == "FITDNU":
            if session['current_level'] == 1:
                session['current_level'] = 2
                session['score'] += LEVEL_POINTS[1]
                
            return jsonify({
                "status": "success",
                "plaintext": plaintext,
                "message": "Crack! Bánh răng đá xoay tròn rầm rập. Cánh cửa Thư viện hé mở cùng một luồng khí lạnh toát tràn vào...",
                "next_room": "/room2"
            })
        elif ciphertext == "KHOOR" and k == 3 and plaintext == "HELLO":
            return jsonify({
                "status": "success",
                "plaintext": plaintext,
                "message": "Ký tự 'HELLO' phát sáng trên vách đá rêu phong. Hãy ghi nhớ từ ngữ này cho câu đố cuối cùng!"
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Ký hiệu dịch chuyển ra '{plaintext}', nhưng cánh cửa vẫn im lìm kỳ quái. Có tiếng móng vuốt cào cấu khe cửa..."
            }), 400

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Hệ thống run rẩy: {str(e)}. Một bàn tay vô hình siết chặt lấy cổ họng bạn..."
        }), 500

# API - Vigenere cipher
@app.route('/api/verify_vigenere', methods=['POST'])
def verify_vigenere():
    init_game_session()
    if session['current_level'] < 2:
         return jsonify({"status": "error", "message": "Kẻ xâm nhập! Bạn chưa vượt qua căn sảnh rỉ máu!"}), 403
         
    try:
        data = request.get_json() or {}
        keyword = data.get('keyword', '').strip().upper()
        ciphertext = data.get('ciphertext', '').strip().upper()
        
        if not keyword:
            return jsonify({
                "status": "error",
                "message": "Ổ khóa xoay rỗng tuếch. Xin hãy nhập từ khóa để xoay các vòng chữ cái..."
            }), 400
            
        # Standard input validation
        if not keyword.isalpha():
            return jsonify({
                "status": "error",
                "message": "Bụi phấn rụng từ trần nhà. Từ khóa chữ cái không được chứa ký tự số hay biểu tượng tà thuật!"
            }), 400
            
        if not ciphertext:
            return jsonify({
                "status": "error",
                "message": "Bản mã trống rỗng. Hãy kiểm tra lại thư tịch cổ tủ sách!"
            }), 400

        plaintext = CryptographyEngine.vigenere_decrypt(ciphertext, keyword)
        
        # Success criteria: keyword = DEATH, ciphertext = YJR KVR (plaintext = VFR ROO or VFRROO)
        # We also accept YJRKVR -> VFRROO
        is_correct_death = (keyword == "DEATH" and ("YJR" in ciphertext) and ("VFR" in plaintext))
        
        if is_correct_death:
            if session['current_level'] == 2:
                session['current_level'] = 3
                session['score'] += LEVEL_POINTS[2]
                
            return jsonify({
                "status": "success",
                "plaintext": plaintext,
                "message": "Tấm bản đồ da người trong sách sáng rực: Tọa độ tầng hầm bí ẩn được hé lộ. Chốt khóa lò luyện kim sập xuống xủng xoảng!",
                "next_room": "/room3"
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Ổ khóa kêu rắc rắc rùng rợn. Kết quả '{plaintext}' không khớp. Đèn dầu chợt chập chờn..."
            }), 400

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Cỗ máy kẹt cứng, có tiếng bước chân lê lết đang tới gần... ({str(e)})"
        }), 500

# API - Hash
@app.route('/api/verify_hash', methods=['POST'])
def verify_hash():
    init_game_session()
    if session['current_level'] < 3:
         return jsonify({"status": "error", "message": "Kẻ xâm nhập! Hãy vượt qua thư viện chữ Vigenere trước!"}), 403
         
    try:
        data = request.get_json() or {}
        password = data.get('password', '').strip().lower()
        flaw = data.get('flaw', '')
        defense = data.get('defense', '')
        
        if not password:
            return jsonify({"status": "error", "message": "Hãy nhập mật khẩu giải băm!"}), 400
            
        if password == "hello" and flaw == "no_salt" and defense == "bcrypt":
            if session['current_level'] == 3:
                session['current_level'] = 4
                session['score'] += LEVEL_POINTS[3]
            return jsonify({
                "status": "success",
                "message": "Rắc! Hộp băm bị bẻ khóa. Luồng khí ẩm mốc dẫn xuống Lò luyện kim RSA...",
                "next_room": "/room4"
            })
        elif password == "hello":
            return jsonify({"status": "error", "message": "Mật khẩu đúng, nhưng bạn chưa chỉ ra lỗ hổng bảo mật mật mã và giải pháp của nó để vượt qua chốt chặn!"}), 400
        else:
            return jsonify({"status": "error", "message": "Mật khẩu giải mã không chính xác! Có tiếng cười lạnh lùng vang vọng..."}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"Hầm ngầm rung chuyển: {str(e)}"}), 500

# API - RSA
@app.route('/api/verify_rsa', methods=['POST'])
def verify_rsa():
    init_game_session()
    if session['current_level'] < 4:
         return jsonify({"status": "error", "message": "Bạn đang cố phá khóa sắt bằng tay không? Hãy đi tìm mảnh ghép kim thuật ở các phòng trước!"}), 403
         
    try:
        data = request.get_json() or {}
        n_raw = data.get('n', '')
        d_raw = data.get('d', '')
        flaw = data.get('flaw', '')
        
        if not n_raw or not d_raw:
            return jsonify({
                "status": "error",
                "message": "Lò đúc nguội ngắt. Bạn phải tính toán n và d từ hai số nguyên tố bí truyền p=3, q=11!"
            }), 400
            
        try:
            n = int(n_raw)
            d = int(d_raw)
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Lẫn lộn số học! Giá trị n và d bắt buộc phải là số nguyên tinh khiết, nếu không lò đúc sẽ nổ tung!"
            }), 400

        # Verify logic
        if n == 33 and d == 7:
            if flaw != "small_primes":
                return jsonify({
                    "status": "error",
                    "message": "Khóa tính toán chính xác, nhưng lò đúc vẫn bị quá nhiệt do lỗ hổng bảo mật của khóa này chưa được chỉ ra!"
                }), 400

            if session['current_level'] == 4:
                session['current_level'] = 5
                session['score'] += LEVEL_POINTS[4]
                
            return jsonify({
                "status": "success",
                "message": "Keng! Búa tạ rèn rập mạnh mẽ. Khóa RSA đúc xong và lỗ hổng khóa yếu đã được ghi nhận. Tiến vào phòng điều khiển Cryptex!",
                "next_room": "/room5"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Khói đen độc tỏa ra khét lẹt. n hoặc d tính toán sai lệc khiến thép nguội đông cứng thành kim loại vụn rác..."
            }), 400
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Nửa đêm gió rít ghê rợn, xỉ than văng đầy mặt... Lỗi tính toán: {str(e)}"
        }), 500

# API - AES final crypt_core
@app.route('/api/verify_aes', methods=['POST'])
def verify_aes():
    init_game_session()
    if session['current_level'] < 5:
         return jsonify({"status": "error", "message": "Khối Cryptex trung tâm phóng dòng điện cực mạnh đẩy lùi kẻ tò mò! Hãy tìm đủ các mảnh chìa khóa trước!"}), 403
         
    try:
        data = request.get_json() or {}
        aes_key = data.get('aes_key', '').strip().upper()
        flaw = data.get('flaw', '')
        defense = data.get('defense', '')
        
        if not aes_key:
            return jsonify({
                "status": "error",
                "message": "Vui lòng nhập mật mã tổng hợp cuối cùng để kích hoạt cỗ máy thời gian..."
            }), 400

        if CryptographyEngine.aes_mock_decrypt("", aes_key):
            if flaw != "ecb_mode" or defense != "gcm_mode":
                return jsonify({
                    "status": "error",
                    "message": "Từ khóa chính xác! Tuy nhiên, lõi năng lượng của cỗ máy Cryptex vẫn chập điện vì chế độ mã hóa không an toàn! Hãy chỉ ra lỗ hổng và đề xuất phòng vệ đúng."
                }), 400

            if not session['completed']:
                session['score'] += LEVEL_POINTS[5]
                session['completed'] = True
                
            elapsed_time = round(time.time() - session['start_time'], 1)
            
            return jsonify({
                "status": "success",
                "message": "BÙM! Luồng sáng neon lục phát nổ từ lõi Cryptex, bẻ gãy không gian và thời gian. Bạn đã thoát ly khỏi phòng giam mật mã thành công!",
                "total_score": session['score'],
                "elapsed_time": elapsed_time,
                "next_room": "/game_over"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "TÍCH TẮC! Khối Cryptex kích hoạt cơ chế tự hủy, kim đồng hồ xoay ngược bấn loạn. Sai mật mã rồi! Có bóng đen đang hối hả lao tới..."
            }), 400
            
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Màn sương chết chóc xâm chiếm bảng điều khiển... Lỗi: {str(e)}"
        }), 500

@app.route('/game_over')
def game_over():
    init_game_session()
    if not session.get('completed', False):
        return redirect(url_for('room1'))
    elapsed_time = round(time.time() - session['start_time'], 1)
    return render_template('layout.html', content=f"<h1>ESCAPE SUCCESS!</h1><p>Score: {session['score']}</p><p>Time: {elapsed_time}s</p>")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
