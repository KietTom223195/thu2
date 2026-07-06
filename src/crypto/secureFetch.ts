// Web Crypto API helper to calculate HMAC-SHA256
async function calculateHMAC(message: string, keyHex: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  // Convert hex string key back to Uint8Array
  const keyBytes = new Uint8Array(
    keyHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    data
  );

  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Store the original fetch function
const originalFetch = window.fetch;

// Overwrite window.fetch to automatically secure all API requests
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

  // Only intercept local API endpoints
  if (!url.startsWith("/api/")) {
    return originalFetch(input, init);
  }

  // Generate unique nonce and current timestamp
  const nonce = window.crypto.randomUUID().replace(/-/g, "").substring(0, 16);
  const timestamp = Date.now().toString();

  const sessionKey = sessionStorage.getItem("session_crypto_key") || "";
  const sessionId = sessionStorage.getItem("session_id") || "default-session-id";

  const headers = new Headers(init?.headers || {});
  headers.set("x-session-id", sessionId);

  // Key Exchange intercept for start API
  if (url === "/api/start") {
    const response = await originalFetch(input, init);
    const clone = response.clone();
    try {
      const data = await clone.json();
      if (data.status === "success" && data.sessionKey) {
        sessionStorage.setItem("session_crypto_key", data.sessionKey);
      }
    } catch (e) {
      // ignore
    }
    return response;
  }

  headers.set("x-nonce", nonce);
  headers.set("x-timestamp", timestamp);

  let bodyString = "";
  if (init && init.body) {
    if (typeof init.body === "string") {
      bodyString = init.body;
    } else {
      bodyString = String(init.body);
    }
  }

  const payload = bodyString + nonce + timestamp;
  let signature = "";
  try {
    if (sessionKey) {
      signature = await calculateHMAC(payload, sessionKey);
    }
  } catch (err) {
    console.error("Secure fetch signing failed:", err);
  }

  if (signature) {
    headers.set("x-signature", signature);
  }

  const newInit: RequestInit = {
    ...init,
    headers
  };

  return originalFetch(input, newInit);
};

export {};
