import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_ACTION_SECRET,
  JWT_ACTION_EXPIRES_IN,
} from "../../config/config.service.js";
import { ERROR_MESSAGES, TOKEN_TYPES, USER_ROLES } from "../constants/index.js";
import { BadRequestError, generateJTI, UnauthorizedError } from "./index.js";

/**
 * Get Token Configuration Based on Type
 * @param {string} type - Token Type from TOKEN_TYPES
 * @returns {Object} { secret, expiresIn }
 * @private
 */
function getTokenConfig(type) {
  switch (type) {
    case TOKEN_TYPES.ACCESS:
      return { secret: JWT_ACCESS_SECRET, expiresIn: JWT_ACCESS_EXPIRES_IN };
    case TOKEN_TYPES.REFRESH:
      return { secret: JWT_REFRESH_SECRET, expiresIn: JWT_REFRESH_EXPIRES_IN };
    case TOKEN_TYPES.EMAIL_VERIFICATION:
    case TOKEN_TYPES.PASSWORD_RESET:
      return { secret: JWT_ACTION_SECRET, expiresIn: JWT_ACTION_EXPIRES_IN };
    default:
      throw new BadRequestError(
        `${ERROR_MESSAGES.INVALID_TOKEN_TYPE}: ${type}`,
      );
  }
}

/**
 * Generate JWT
 * @param {Object} payload - Data to Encode in Token
 * @param {string} type - Token Type (Default: ACCESS)
 * @returns {string} JWT
 *
 * @example
 * const accessToken = generateToken({ sub: 123, role: USER_ROLES.USER });
 * const refreshToken = generateToken({ sub: 123 }, TOKEN_TYPES.REFRESH);
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
 * Generate Access AND Refresh Tokens for a User
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {Object} { accessToken, refreshToken, jti }
 */
export const generateAuthTokens = (userId, role = USER_ROLES.USER) => {
  const jti = generateJTI();

  const basePayload = {
    sub: userId,
    jti,
  };

  const accessToken = generateToken(
    { ...basePayload, role },
    TOKEN_TYPES.ACCESS,
  );

  const refreshToken = generateToken(basePayload, TOKEN_TYPES.REFRESH);

  return {
    accessToken,
    refreshToken,
    jti,
  };
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
    if (decoded.type !== type) {
      throw new BadRequestError(
        `${ERROR_MESSAGES.INVALID_TOKEN_TYPE}. Expected ${type}, Got ${decoded.type}`,
      );
    }

    return decoded;
  } catch (error) {
    // Handle JWT-Specific Errors
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError(ERROR_MESSAGES.EXPIRED_TOKEN);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Re-Throw If It's ALREADY Our Custom Error
    if (error instanceof BadRequestError) throw error;

    // Unknown Error
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
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
