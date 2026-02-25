import { rateLimit } from "express-rate-limit";
import { TooManyRequestsError } from "../utils/index.js";
import { ERROR_MESSAGES } from "../constants/error-messages.js";
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  LOGIN_LIMIT_WINDOW_MS,
  LOGIN_LIMIT_MAX_ATTEMPTS,
} from "../../config/config.service.js";

/**
 * General API Rate Limiter
 * Applied to ALL "/api" Routes
 */
export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  limit: RATE_LIMIT_MAX_REQUESTS,
  legacyHeaders: false, // Disable Deprecated Headers
  standardHeaders: "draft-7", // Return Rate Limit Info in Headers
  handler: (req, res, next) => {
    throw new TooManyRequestsError(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
  },
});

/**
 * Strict Rate Limiter for Authentication Endpoints
 * ONLY Counts Failed Login Attempts
 */
export const authLimiter = rateLimit({
  windowMs: LOGIN_LIMIT_WINDOW_MS,
  limit: LOGIN_LIMIT_MAX_ATTEMPTS,
  legacyHeaders: false,
  standardHeaders: "draft-7",
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    throw new TooManyRequestsError(ERROR_MESSAGES.LOGIN_RATE_LIMIT_EXCEEDED);
  },
});
