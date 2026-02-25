import bcrypt from "bcrypt";
import { BadRequestError } from "./AppError.js";
import { BCRYPT_ROUNDS } from "../../config/config.service.js";

/**
 * Hash Password Using Bcrypt
 * @param {string} password - Plain Text Password
 * @returns {Promise<string>} Hashed Password
 */
export const hashPasswordBCrypt = async (password) => {
  if (!password) throw new BadRequestError("Password CANNOT be Empty");
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compare Password with Hash
 * @param {string} inputPassword - Plain Text Password
 * @param {string} storedHash - Hashed Password
 * @returns {Promise<boolean>} True If Password Matches
 */
export const comparePassword = async (inputPassword, storedHash) => {
  if (!password || !hash)
    throw new BadRequestError("Password and Hash are Required");
  return await bcrypt.compare(inputPassword, storedHash);
};
