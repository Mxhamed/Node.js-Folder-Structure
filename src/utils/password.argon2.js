import argon2 from "argon2";
import {
  ARGON2_HASH_LENGTH,
  ARGON2_TIME_COST,
  ARGON2_MEMORY_COST,
  ARGON2_PARALLELISM,
} from "../../config/config.service.js";

/**
 * Centralized Configuration Object
 * Argon2id is Recommended by OWASP for Password Hashing
 * Argon2 Allows Tuning for Memory, Time, and Parallelism
 */
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  hashLength: ARGON2_HASH_LENGTH,
  timeCost: ARGON2_TIME_COST,
  memoryCost: ARGON2_MEMORY_COST,
  parallelism: ARGON2_PARALLELISM,
};

/**
 * Hash Password Using Argon2id
 * @param {string} password - Plain Text Password
 * @returns {Promise<string>} Hashed Password
 */
export const hashPasswordArgon2 = async (password) => {
  if (!password) throw new Error("Password CANNOT be Empty");
  return await argon2.hash(password, ARGON2_CONFIG);
};

/**
 * Verify Password against Hash
 * @param {string} password - Plain Text Password
 * @param {string} hash - Hashed Password
 * @returns {Promise<boolean>} True If Password Matches
 */
export const verifyPassword = async (password, hash) => {
  if (!password || !hash) throw new Error("Password and Hash are Required");

  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    // Invalid Hash Format or Verification Error
    return false;
  }
};
