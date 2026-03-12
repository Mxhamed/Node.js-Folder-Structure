import { ERROR_MESSAGES, TOKEN_TYPES } from "../constants/index.js";
import {
  UnauthorizedError,
  ForbiddenError,
  verifyToken,
} from "../utils/index.js";

/**
 * Authenticate User via JWT
 * Expects: Authorization: Bearer <token>
 * @param {string} tokenType - Type of Token to Verify (Default: ACCESS)
 * @returns {Function} Express Middleware
 */
export const authenticate = (tokenType = TOKEN_TYPES.ACCESS) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN);

    if (!authHeader.startsWith("Bearer "))
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_AUTH_HEADER);

    const token = authHeader.split(" ")[1];

    if (!token) throw new UnauthorizedError(ERROR_MESSAGES.NO_TOKEN);

    try {
      const decoded = verifyToken(token, tokenType);
      req.user = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedError(
        error.message || ERROR_MESSAGES.INVALID_TOKEN,
      );
    }
  };
};

/**
 * Authorize User Based on Roles
 * @param {...string} roles - Allowed Roles
 * @returns {Function} Express Middleware
 *
 * Usage: authorize("admin", "moderator")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);

    if (!roles.includes(req.user.role))
      throw new ForbiddenError(ERROR_MESSAGES.FORBIDDEN);

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
