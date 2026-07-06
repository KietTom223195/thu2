import string

class CryptographyEngine:
    @staticmethod
    def caesar_decrypt(ciphertext: str, k: int) -> str:
        """
        Decrypt Caesar cipher by shifting left (backward) by k.
        """
        try:
            k = int(k)
        except ValueError:
            raise ValueError("Ký tự khóa k phải là một số nguyên!")
            
        decrypted = []
        for char in ciphertext:
            if char.isalpha():
                base = ord('A') if char.isupper() else ord('a')
                # Left shift: (code - base - k) % 26 + base
                decrypted_char = chr((ord(char) - base - k) % 26 + base)
                decrypted.append(decrypted_char)
            else:
                decrypted.append(char)
        return "".join(decrypted)

    @staticmethod
    def vigenere_decrypt(ciphertext: str, keyword: str) -> str:
        """
        Decrypt Vigenere cipher using a keyword.
        """
        if not keyword or not keyword.isalpha():
            raise ValueError("Từ khóa Vigenere chỉ được chứa các ký tự chữ cái!")
            
        keyword = keyword.upper()
        ciphertext = ciphertext.upper()
        decrypted = []
        
        keyword_index = 0
        for char in ciphertext:
            if char.isupper():
                c_val = ord(char) - ord('A')
                k_val = ord(keyword[keyword_index % len(keyword)]) - ord('A')
                p_val = (c_val - k_val + 26) % 26
                decrypted.append(chr(p_val + ord('A')))
                keyword_index += 1
            else:
                decrypted.append(char)
        return "".join(decrypted)

    @staticmethod
    def rsa_solve(p: int, q: int) -> tuple:
        """
        Perform RSA key generation given two primes.
        n = p * q
        totient_n = (p - 1) * (q - 1)
        Find d such that (d * e) % totient_n == 1.
        Here we define standard e = 3.
        """
        try:
            p = int(p)
            q = int(q)
        except ValueError:
            raise ValueError("Các số nguyên tố p và q phải là số nguyên!")
            
        n = p * q
        totient = (p - 1) * (q - 1)
        
        # Standard public exponent
        e = 3
        # Modulo inverse to find d
        d = None
        for i in range(1, totient):
            if (i * e) % totient == 1:
                d = i
                break
        if d is None:
            raise ValueError("Không tìm thấy khóa riêng d hợp lệ cho cặp số này!")
            
        return n, d

    @staticmethod
    def aes_mock_decrypt(ciphertext: str, key: str) -> bool:
        """
        Verifies if the submitted combined final key is correct.
        This represents the decrypted key of the Cryptex capsule.
        """
        # Expected combination is: HELLODEATH33
        return key.strip().upper() == "HELLODEATH33"
