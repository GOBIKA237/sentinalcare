const crypto = require("crypto");
const env = require("../config/env");

const ALGORITHM = "aes-256-gcm";
const key = Buffer.from(env.checkinEncryptionKey, "base64");

if (key.length !== 32) {
  throw new Error(
    "CHECKIN_ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded). " +
      "Generate one with: openssl rand -base64 32"
  );
}

/**
 * Encrypts free-text check-in notes before they touch the database.
 * Returns three separate buffers to store: ciphertext, iv, authTag.
 */
function encryptNote(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === "") {
    return { ciphertext: null, iv: null, authTag: null };
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return { ciphertext, iv, authTag };
}

/**
 * Decrypts a note. This should ONLY ever be called from the approved-escalation
 * code path — see services/escalation.service.js — and every call site must
 * write to audit_log.
 */
function decryptNote(ciphertext, iv, authTag) {
  if (!ciphertext) return null;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

module.exports = { encryptNote, decryptNote };
