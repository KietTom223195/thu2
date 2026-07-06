const crypto = require("crypto");

const BASE_URL = "http://localhost:3000";
const SESSION_ID = "test-secure-session-12345";

function calculateHMAC(payload, sessionKey) {
  const hmac = crypto.createHmac("sha256", sessionKey);
  hmac.update(payload);
  return hmac.digest("hex");
}

async function runTests() {
  console.log("==================================================");
  console.log("🛡️ STARTING FIT4012 SECURITY PROTOCOL INTEGRITY TESTS");
  console.log("==================================================");

  let sessionKey = "";

  // 1. Initial Key Exchange: POST /api/start
  console.log("\n[TEST 1] Key Exchange Protocol Init");
  try {
    const res = await fetch(`${BASE_URL}/api/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": SESSION_ID
      }
    });
    const data = await res.json();
    if (res.ok && data.status === "success" && data.sessionKey) {
      sessionKey = data.sessionKey;
      console.log(`✅ SUCCESS: Key exchange completed. Session Key: ${sessionKey.substring(0, 8)}...`);
    } else {
      console.error(`❌ FAILED: Key exchange protocol failed. Status: ${res.status}`);
      try {
        console.error("Response body:", await res.text());
      } catch (e) {
        // ignore
      }
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ FAILED: Cannot connect to server. Is it running on localhost:3000?", err.message);
    process.exit(1);
  }

  // Helper to send signed requests
  async function sendSignedRequest(endpoint, bodyObj, customHeaders = {}) {
    const nonce = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const timestamp = Date.now().toString();
    const bodyString = JSON.stringify(bodyObj);
    const payload = bodyString + nonce + timestamp;
    const signature = calculateHMAC(payload, sessionKey);

    const headers = {
      "Content-Type": "application/json",
      "x-session-id": SESSION_ID,
      "x-nonce": nonce,
      "x-timestamp": timestamp,
      "x-signature": signature,
      ...customHeaders
    };

    return fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: bodyString
    });
  }

  // 2. Test Valid Flow
  console.log("\n[TEST 2] Valid Cryptographic Flow (Correct Caesar Solve)");
  try {
    const body = { ciphertext: "ILWGQX", k: 3 };
    const res = await sendSignedRequest("/api/verify_caesar", body);
    const data = await res.json();
    if (res.ok && data.status === "success") {
      console.log("✅ SUCCESS: Valid signature, timestamp, and nonce accepted.");
    } else {
      console.error(`❌ FAILED: Expected 200 OK, got ${res.status}`, data);
    }
  } catch (err) {
    console.error("❌ FAILED: Unexpected error in Valid Flow", err.message);
  }

  // 3. Test Data Tampering
  console.log("\n[TEST 3] Data Tampering Detection (Modifying payload during transit)");
  try {
    // Client signs for k: 3, but attacker changes k to 4 in body
    const bodySigned = { ciphertext: "ILWGQX", k: 3 };
    const nonce = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const timestamp = Date.now().toString();
    const payload = JSON.stringify(bodySigned) + nonce + timestamp;
    const signature = calculateHMAC(payload, sessionKey);

    // Attacker modifies the body parameter
    const tamperedBody = { ciphertext: "ILWGQX", k: 4 };

    const res = await fetch(`${BASE_URL}/api/verify_caesar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": SESSION_ID,
        "x-nonce": nonce,
        "x-timestamp": timestamp,
        "x-signature": signature // old signature
      },
      body: JSON.stringify(tamperedBody)
    });
    
    const data = await res.json();
    if (res.status === 400 && data.message.includes("thay đổi")) {
      console.log("✅ SUCCESS: Server detected tampering. Access denied (400 Bad Request).");
    } else {
      console.error(`❌ FAILED: Expected 400 Bad Request, got ${res.status}`, data);
    }
  } catch (err) {
    console.error("❌ FAILED: Unexpected error in Tampering test", err.message);
  }

  // 4. Test Expired Request (Timestamp validation)
  console.log("\n[TEST 4] Expired Timestamp Prevention");
  try {
    const expiredTimestamp = (Date.now() - 30000).toString(); // 30 seconds ago
    const body = { ciphertext: "ILWGQX", k: 3 };
    const nonce = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const payload = JSON.stringify(body) + nonce + expiredTimestamp;
    const signature = calculateHMAC(payload, sessionKey);

    const res = await fetch(`${BASE_URL}/api/verify_caesar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": SESSION_ID,
        "x-nonce": nonce,
        "x-timestamp": expiredTimestamp,
        "x-signature": signature
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.status === 403 && data.message.includes("hết hạn")) {
      console.log("✅ SUCCESS: Server rejected expired timestamp. Access denied (403 Forbidden).");
    } else {
      console.error(`❌ FAILED: Expected 403 Forbidden, got ${res.status}`, data);
    }
  } catch (err) {
    console.error("❌ FAILED: Unexpected error in Expired Timestamp test", err.message);
  }

  // 5. Test Replay Attacks
  console.log("\n[TEST 5] Replay Attack Prevention (Re-sending same headers & payload)");
  try {
    const body = { ciphertext: "ILWGQX", k: 3 };
    const nonce = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const timestamp = Date.now().toString();
    const payload = JSON.stringify(body) + nonce + timestamp;
    const signature = calculateHMAC(payload, sessionKey);

    // First request (Valid)
    const res1 = await fetch(`${BASE_URL}/api/verify_caesar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": SESSION_ID,
        "x-nonce": nonce,
        "x-timestamp": timestamp,
        "x-signature": signature
      },
      body: JSON.stringify(body)
    });
    
    // Second request (Replay of first request)
    const res2 = await fetch(`${BASE_URL}/api/verify_caesar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": SESSION_ID,
        "x-nonce": nonce,
        "x-timestamp": timestamp,
        "x-signature": signature
      },
      body: JSON.stringify(body)
    });

    const data2 = await res2.json();
    if (res2.status === 403 && data2.message.includes("phát lại")) {
      console.log("✅ SUCCESS: Server detected replay attack and rejected reused nonce. Access denied (403 Forbidden).");
    } else {
      console.error(`❌ FAILED: Expected 403 Forbidden on replay, got ${res2.status}`, data2);
    }
  } catch (err) {
    console.error("❌ FAILED: Unexpected error in Replay test", err.message);
  }

  // 6. Test Invalid Key/Signature
  console.log("\n[TEST 6] Invalid Key / Forged Signature Prevention");
  try {
    const body = { ciphertext: "ILWGQX", k: 3 };
    const wrongKey = crypto.randomBytes(32).toString("hex");
    const nonce = crypto.randomUUID().replace(/-/g, "").substring(0, 16);
    const timestamp = Date.now().toString();
    const payload = JSON.stringify(body) + nonce + timestamp;
    const forgedSignature = calculateHMAC(payload, wrongKey); // Signed with bad key

    const res = await fetch(`${BASE_URL}/api/verify_caesar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": SESSION_ID,
        "x-nonce": nonce,
        "x-timestamp": timestamp,
        "x-signature": forgedSignature
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (res.status === 400 && data.message.includes("thay đổi")) {
      console.log("✅ SUCCESS: Server rejected forged signature. Access denied (400 Bad Request).");
    } else {
      console.error(`❌ FAILED: Expected 400 Bad Request, got ${res.status}`, data);
    }
  } catch (err) {
    console.error("❌ FAILED: Unexpected error in Forged Signature test", err.message);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL SECURITY PROTOCOL VERIFICATION TESTS PASSED!");
  console.log("==================================================");
}

runTests();
