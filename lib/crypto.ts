import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const LEGACY_ALGORITHM = "aes-128-cbc";

// Derive a 32-byte key for AES-256 using SHA-256 so it works regardless of original env key length
const KEY = createHash("sha256")
  .update(process.env.ENCRYPTION_KEY || "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6")
  .digest();

// Legacy 16-byte key for backwards compatibility
const LEGACY_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "hex"
);

/**
 * Encrypt a plaintext string using AES-256-GCM (Authenticated Encryption).
 * Returns "iv:authTag:encrypted" in hex format.
 */
export function encrypt(text: string): string {
  const iv = randomBytes(12); // Standard GCM IV size is 12 bytes
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an "iv:authTag:encrypted" hex string back to plaintext.
 * Also supports decrypting legacy "iv:encrypted" AES-128-CBC format.
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(":");
  
  // Legacy fallback (AES-128-CBC)
  if (parts.length === 2) {
    const [ivHex, encrypted] = parts;
    if (!ivHex || !encrypted) throw new Error("Invalid legacy encrypted format");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(LEGACY_ALGORITHM, LEGACY_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  // Modern (AES-256-GCM)
  const [ivHex, authTagHex, encrypted] = parts;
  if (!ivHex || !authTagHex || !encrypted) throw new Error("Invalid encrypted format");
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
