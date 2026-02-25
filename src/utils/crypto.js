import crypto from "node:crypto";
import { CRYPTO_KEY } from "../../config/config.service.js";
import { InternalServerError, BadRequestError } from "./AppError.js";

const CRYPTO_ALGORITHM = "aes-256-gcm";

/**
 * Encrypts Plain Text Using AES-256-GCM
 * @param {string} plainData - Text to Encrypt
 * @returns {string} Hex Encoded: "iv:encrypted:authTag"
 */
export const encrypt = (plainData) => {
  if (!plainData) throw new BadRequestError("Data to Encrypt CANNOT be Empty");

  try {
    const iv = crypto.randomBytes(12); // 96 bits for GCM

    const cipher = crypto.createCipheriv(CRYPTO_ALGORITHM, CRYPTO_KEY, iv);

    let encrypted = cipher.update(plainData, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");
    const ivHex = iv.toString("hex");

    return `${ivHex}:${encrypted}:${authTag}`;
  } catch (error) {
    console.error("🔐  Encryption Error:", error.message);
    throw new InternalServerError("Encryption Failed");
  }
};

/**
 * Decrypts AES-256-GCM Encrypted Data
 * @param {string} encryptedData - Format: "iv:encrypted:authTag"
 * @returns {string} Original Plain Text
 */
export const decrypt = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== "string")
    throw new BadRequestError("Invalid Encrypted Data");

  const parts = encryptedData.split(":");

  if (parts.length !== 3)
    throw new BadRequestError("Invalid Encrypted Data Format");

  const [ivHex, encrypted, authTagHex] = parts;

  try {
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM, CRYPTO_KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("🔐  Decryption Error:", error.message);
    throw new InternalServerError("Decryption Failed - Data May be Corrupted");
  }
};
