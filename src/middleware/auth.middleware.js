import { ERROR_MESSAGES, REDIS_KEYS, TOKEN_TYPES } from "../constants/index.js";
import { redis, User } from "../database/index.js";
import {
  UnauthorizedError,
  ForbiddenError,
  verifyToken,
  toUnixTimestamp,
} from "../utils/index.js";

/**
 * Authentication Middleware
 * Verifies the Access Token from the Authorization Header,
 * Checks Against Token Blacklist and Global Logout Timestamp,
 * then Attaches the Decoded Token and User to the Request Object
 *
 * @middleware
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 *
 * @throws {UnauthorizedError} If Token is Missing, Invalid, Expired, or Revoked
 *
 * @example
 * router.get("/profile", authenticate, getProfile);
 */
export const authenticate = async (req, res, next) => {
  // Check Authorization Header
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN);
  if (!authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_AUTH_HEADER);
  }

  // Extract Token
  const token = authHeader.split(" ")[1];
  if (!token) throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN);

  // Verify Token Signature & Expiry
  const decodedToken = verifyToken(token, TOKEN_TYPES.ACCESS);
  const { sub, iat, jti } = decodedToken;

  // Check If User Exists
  const user = await User.findById(sub).lean().exec();
  if (!user || user.deletedAt) {
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN);
  }

  // Check Global Logout
  if (user.globalLogoutAt) {
    const logoutTimestamp = toUnixTimestamp(user.globalLogoutAt);

    if (iat < logoutTimestamp) {
      throw new UnauthorizedError(ERROR_MESSAGES.REVOKED_TOKEN);
    }
  }

  // Check Individual Token Blacklist
  const blacklistKey = REDIS_KEYS.TOKEN_BLACKLIST(sub, jti);
  const isBlacklisted = await redis.get(blacklistKey);
  if (isBlacklisted) throw new UnauthorizedError(ERROR_MESSAGES.REVOKED_TOKEN);

  // Attach User and Token to Request
  req.token = decodedToken;
  req.user = user;

  next();
};

/**
 * Authorize User Based on Roles
 * @param {...string} roles - Allowed Roles
 * @returns {Function} Express Middleware
 *
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(ERROR_MESSAGES.FORBIDDEN);
    }

    next();
  };
};

/**
 * Optional Authentication
 * Attaches User If Token Exists, But DOESN'T Require It
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
      req.user = decoded;
    } catch (error) {
      // Token Invalid, But We DON'T Throw Error
      req.user = null;
    }
  }

  next();
};
