import crypto from "crypto";

// ============================================================================
// FIELD-LEVEL ENCRYPTION
// AES-256-GCM via Node's built-in crypto module — no extra dependency
// needed. Used to encrypt customer PII (name, phone, email, address,
// message) before it's ever written to MongoDB, so a database dump/leak
// alone doesn't expose anyone's personal details in plaintext.
//
// GCM is an authenticated cipher: decryption fails loudly if the
// ciphertext was tampered with, instead of silently returning garbage.
// Each field gets its own random IV (never reused), which is required for
// AES-GCM's security guarantees to hold.
// ============================================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV is the recommended size for GCM

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes (64 hex characters).");
  }
  return key;
}

// Returns a single string safe to store in a String schema field:
// "<iv-hex>:<authTag-hex>:<ciphertext-hex>"
export function encryptField(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptField(stored) {
  if (!stored) return "";
  const [ivHex, authTagHex, dataHex] = stored.split(":");
  if (!ivHex || !authTagHex || !dataHex) return "";

  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

// One-way hash of a normalized email — stored alongside the encrypted
// email so staff can look up an enquiry by email without decrypting
// every record in the collection. HMAC (keyed) rather than plain SHA-256
// so it can't be brute-forced against a list of common emails offline.
export function hashLookupValue(value) {
  if (!value) return null;
  const key = process.env.ENCRYPTION_KEY || "fallback-lookup-key";
  return crypto
    .createHmac("sha256", key)
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}
