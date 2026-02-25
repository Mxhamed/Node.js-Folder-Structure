import jwt from "jsonwebtoken";
import { BadRequestError } from "./AppError.js";
import { TOKEN_TYPES } from "../constants/index.js";
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} from "../../config/config.service.js";

/**
 * Get Token Configuration Based on Type
 * @param {string} type - Token Type from TOKEN_TYPES
 * @returns {Object} { secret, expiresIn }
 * @private
 */
const getTokenConfig = (type) => {
  switch (type) {
    case TOKEN_TYPES.ACCESS:
      return { secret: JWT_ACCESS_SECRET, expiresIn: JWT_ACCESS_EXPIRES_IN };
    case TOKEN_TYPES.REFRESH:
      return { secret: JWT_REFRESH_SECRET, expiresIn: JWT_REFRESH_EXPIRES_IN };
    default:
      throw new BadRequestError(`Invalid Token Type: ${type}`);
  }
};

/**
 * Generate JWT
 * @param {Object} payload - Data to Encode in Token
 * @param {string} type - Token Type (Default: ACCESS)
 * @returns {string} JWT
 *
 * @example
 * const accessToken = generateToken({ userId: 123, role: 'user' });
 * const refreshToken = generateToken({ userId: 123 }, TOKEN_TYPES.REFRESH);
 */
export const generateToken = (payload, type = TOKEN_TYPES.ACCESS) => {
  const { secret, expiresIn } = getTokenConfig(type);

  // Add Token Type to Payload for Verification
  const tokenPayload = {
    ...payload,
    type,
  };

  return jwt.sign(tokenPayload, secret, { expiresIn });
};

/**
 * Verify JWT
 * @param {string} token - JWT to Verify
 * @param {string} type - Expected Token Type (Default: ACCESS)
 * @returns {Object} Decoded Token Payload
 * @throws {Error} If Token is Invalid, Expired, or Wrong Type
 *
 * @example
 * const decoded = verifyToken(token); // Verifies Access token
 * const decoded = verifyToken(token, TOKEN_TYPES.REFRESH); // Verifies Refresh Token
 */
export const verifyToken = (token, type = TOKEN_TYPES.ACCESS) => {
  const { secret } = getTokenConfig(type);

  try {
    const decoded = jwt.verify(token, secret);

    // Verify Token Type Matches Expected Type
    if (decoded.type !== type)
      throw new BadRequestError(
        `Invalid Token Type. Expected ${type}, Got ${decoded.type}`,
      );

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      throw new Error("Token has Expired");

    if (error instanceof jwt.JsonWebTokenError)
      throw new Error("Invalid Token");

    throw error;
  }
};

/**
 * Decode JWT WITHOUT Verification
 * Useful for Reading Token Contents WITHOUT Validating
 * @param {string} token - JWT
 * @returns {Object} Decoded Token Payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
