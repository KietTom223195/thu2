const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING AUTOMATED CRYPTO QUEST V2 TESTS ===");
  
  const sessionId = "test_session_xyz_777";
  const headers = {
    "x-session-id": sessionId,
    "Content-Type": "application/json"
  };

  // Helper for requests
  const apiCall = async (path: string, method: string, body?: any) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    return { status: res.status, data: await res.json() };
  };

  console.log("\n[+] Resetting game session...");
  let { status, data } = await apiCall("/api/start", "POST");
  if (status !== 200) throw new Error("Failed to start session");
  if (data.level !== 1 || data.score !== 0) throw new Error("Start state mismatch");
  console.log("    Game session reset successfully!");

  // 2. Test Level 1: Caesar Cipher
  console.log("\n[+] Testing Level 1: Caesar...");
  // Test wrong answer
  let r = await apiCall("/api/verify_caesar", "POST", { ciphertext: "ILWGQX", k: 5 });
  if (r.status !== 400) throw new Error("Wrong answer check failed");
  console.log("    - Wrong answer check passed (Rejected as expected)");
  
  // Test correct answer
  r = await apiCall("/api/verify_caesar", "POST", { ciphertext: "ILWGQX", k: 3 });
  if (r.status !== 200 || r.data.status !== "success") throw new Error("Correct Caesar decryption failed");
  console.log("    - Correct Caesar decryption passed!");

  // Check state progression
  let state = await apiCall("/api/state", "GET");
  if (state.data.currentLevel !== 2 || state.data.score !== 100) throw new Error("State progression to L2 failed");
  console.log("    - Level 2 progression verified!");

  // 3. Test Level 2: Vigenère Cipher
  console.log("\n[+] Testing Level 2: Vigenère...");
  // Test wrong answer
  r = await apiCall("/api/verify_vigenere", "POST", { keyword: "WRONG", ciphertext: "YJR KVR" });
  if (r.status !== 400) throw new Error("Wrong keyword check failed");
  console.log("    - Wrong keyword check passed (Rejected as expected)");

  // Test correct answer
  r = await apiCall("/api/verify_vigenere", "POST", { keyword: "DEATH", ciphertext: "YJR KVR" });
  if (r.status !== 200 || r.data.status !== "success") throw new Error("Correct Vigenere decryption failed");
  console.log("    - Correct Vigenere decryption passed!");

  // Check state progression
  state = await apiCall("/api/state", "GET");
  if (state.data.currentLevel !== 3 || state.data.score !== 300) throw new Error("State progression to L3 failed");
  console.log("    - Level 3 progression verified!");

  // 4. Test Level 3: Hash & Integrity Check
  console.log("\n[+] Testing Level 3: Hash & Integrity...");
  // Test correct password but no flaw selection
  r = await apiCall("/api/verify_hash", "POST", { password: "hello" });
  if (r.status !== 400) throw new Error("Missing flaw/defense check failed");
  console.log("    - Correct password but missing flaw/defense check passed (Rejected as expected)");

  // Test correct password but wrong flaw
  r = await apiCall("/api/verify_hash", "POST", { password: "hello", flaw: "wrong_flaw", defense: "bcrypt" });
  if (r.status !== 400) throw new Error("Wrong flaw check failed");
  console.log("    - Correct password but wrong flaw check passed (Rejected as expected)");

  // Test correct password, correct flaw and defense
  r = await apiCall("/api/verify_hash", "POST", { password: "hello", flaw: "no_salt", defense: "bcrypt" });
  if (r.status !== 200 || r.data.status !== "success") throw new Error("Correct hash verification failed");
  console.log("    - Correct password + flaw/defense selection passed!");

  // Check state progression
  state = await apiCall("/api/state", "GET");
  if (state.data.currentLevel !== 4 || state.data.score !== 600) throw new Error("State progression to L4 failed");
  console.log("    - Level 4 progression verified!");

  // 5. Test Level 4: RSA
  console.log("\n[+] Testing Level 4: RSA...");
  // Test correct n and d but missing flaw selection
  r = await apiCall("/api/verify_rsa", "POST", { n: 33, d: 7 });
  if (r.status !== 400) throw new Error("Missing flaw check failed");
  console.log("    - Correct keys but missing flaw check passed (Rejected as expected)");

  // Test correct n, d and correct flaw selection
  r = await apiCall("/api/verify_rsa", "POST", { n: 33, d: 7, flaw: "small_primes" });
  if (r.status !== 200 || r.data.status !== "success") throw new Error("Correct RSA key verification failed");
  console.log("    - Correct keys + flaw selection passed!");

  // Check state progression
  state = await apiCall("/api/state", "GET");
  if (state.data.currentLevel !== 5 || state.data.score !== 1000) throw new Error("State progression to L5 failed");
  console.log("    - Level 5 progression verified!");

  // 6. Test Level 5: AES
  console.log("\n[+] Testing Level 5: AES...");
  // Test correct key but missing flaw
  r = await apiCall("/api/verify_aes", "POST", { aes_key: "HELLODEATH33" });
  if (r.status !== 400) throw new Error("Missing AES flaw check failed");
  console.log("    - Correct key but missing flaw/defense check passed (Rejected as expected)");

  // Test correct key + correct flaw + correct defense
  r = await apiCall("/api/verify_aes", "POST", { aes_key: "HELLODEATH33", flaw: "ecb_mode", defense: "gcm_mode" });
  if (r.status !== 200 || r.data.status !== "success") throw new Error("Correct AES key verification failed");
  console.log("    - Correct key + flaw/defense selection passed!");

  // Check final completion state
  state = await apiCall("/api/state", "GET");
  if (state.data.currentLevel !== 6 || state.data.completed !== true || state.data.score !== 1500) {
    throw new Error("Final completion state mismatch");
  }
  console.log("    - Game completion state and total score of 1500 verified!");

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("\n[!] TEST SUITE FAILED:", err.message);
  process.exit(1);
});
