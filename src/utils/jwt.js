import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_ACTION_SECRET,
  JWT_EMAIL_VERIFICATION_EXPIRES_IN,
  JWT_PASSWORD_RESET_EXPIRES_IN,
} from "../../config/config.service.js";
import { ERROR_MESSAGES, TOKEN_TYPES, USER_ROLES } from "../constants/index.js";
import { BadRequestError, generateJTI, UnauthorizedError } from "./index.js";

/**
 * Get Token Configuration Based on Type
 * @private
 *
 * @param {string} type - Token Type from TOKEN_TYPES
 * @returns {Object} { secret, expiresIn }
 */
function getTokenConfig(type) {
  switch (type) {
    case TOKEN_TYPES.ACCESS:
      return { secret: JWT_ACCESS_SECRET, expiresIn: JWT_ACCESS_EXPIRES_IN };
    case TOKEN_TYPES.REFRESH:
      return { secret: JWT_REFRESH_SECRET, expiresIn: JWT_REFRESH_EXPIRES_IN };
    case TOKEN_TYPES.EMAIL_VERIFICATION:
      return {
        secret: JWT_ACTION_SECRET,
        expiresIn: JWT_EMAIL_VERIFICATION_EXPIRES_IN,
      };
    case TOKEN_TYPES.PASSWORD_RESET:
      return {
        secret: JWT_ACTION_SECRET,
        expiresIn: JWT_PASSWORD_RESET_EXPIRES_IN,
      };
    default:
      throw new BadRequestError(
        `${ERROR_MESSAGES.INVALID_TOKEN_TYPE}: ${type}`,
      );
  }
}

/**
 * Generate JWT
 * @param {Object} payload - Data to Encode in Token
 * @param {string} type - Token Type from TOKEN_TYPES
 * @param {number|string} [expiresIn] - Override Token Expiry
 *                                      Accepts Seconds (number) or a String like "15m", "7d"
 *                                      Defaults to the Configured Expiry for the Given Token Type
 * @returns {string} Signed JWT
 *
 * @example
 * const token = generateToken({ sub: "123" }, TOKEN_TYPES.ACCESS);
 * const token = generateToken({ sub: "123" }, TOKEN_TYPES.REFRESH, 3600); // 1hr Override
 */
export const generateToken = (payload, type, expiresIn) => {
  const { secret, expiresIn: defaultExpiresIn } = getTokenConfig(type);

  const tokenPayload = { ...payload, type };

  return jwt.sign(tokenPayload, secret, {
    expiresIn: expiresIn ?? defaultExpiresIn,
  });
};

/**
 * Generate Access AND Refresh Tokens for a User
 * @param {string} sub - User ID (JWT "sub" Claim)
 * @param {string} [role] - User Role (Default: USER_ROLES.USER)
 * @param {number} [refreshExpiresIn] - Override Refresh Token Expiry in Seconds
 *                                      Pass Remaining TTL from Old Token During Rotation
 *                                      to Prevent Infinite Token Renewal
 *                                      Omit on First Login to Use the Default 7d Expiry
 * @returns {{ accessToken: string, refreshToken: string, jti: string }}
 *
 * @example
 * // First Login — Uses Default Expiry
 * const tokens = generateAuthTokens(user._id, user.role);
 *
 * // Token Rotation — Preserves Original Expiry
 * const remainingTtl = decoded.exp - Math.floor(Date.now() / 1000);
 * const tokens = generateAuthTokens(sub, user.role, remainingTtl);
 */
export const generateAuthTokens = (
  sub,
  role = USER_ROLES.USER,
  refreshExpiresIn,
) => {
  const jti = generateJTI();

  const basePayload = { sub, jti };

  const accessToken = generateToken(
    { ...basePayload, role },
    TOKEN_TYPES.ACCESS,
  );

  const refreshToken = generateToken(
    basePayload,
    TOKEN_TYPES.REFRESH,
    refreshExpiresIn,
  );

  return { accessToken, refreshToken, jti };
};

/**
 * Verify JWT
 * @param {string} token - JWT to Verify
 * @param {string} type - Expected Token Type
 * @returns {Object} Decoded Token Payload
 * @throws {Error} If Token is Invalid, Expired, or Wrong Type
 *
 * @example
 * const decoded = verifyToken(token); // Verifies Access token
 * const decoded = verifyToken(token, TOKEN_TYPES.REFRESH); // Verifies Refresh Token
 */
export const verifyToken = (token, type) => {
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
