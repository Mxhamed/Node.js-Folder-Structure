import {
  APP_NAME,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  SIGNUP_LIMIT_WINDOW_MS,
  SIGNUP_LIMIT_MAX_ATTEMPTS,
  LOGIN_LIMIT_WINDOW_MS,
  LOGIN_LIMIT_MAX_ATTEMPTS,
  REFRESH_TOKEN_LIMIT_WINDOW_MS,
  REFRESH_TOKEN_LIMIT_MAX_ATTEMPTS,
  AUTH_ACTION_LIMIT_WINDOW_MS,
  AUTH_ACTION_LIMIT_MAX_ATTEMPTS,
  TOKEN_VERIFY_LIMIT_WINDOW_MS,
  TOKEN_VERIFY_LIMIT_MAX_ATTEMPTS,
} from "../../config/config.service.js";
import { ERROR_MESSAGES } from "./index.js";

/**
 * Rate Limiter Identifiers
 * Use these Constants to Reference Rate Limiters throughout the App
 *
 * @enum {string}
 */
export const RATE_LIMITERS = {
  API: "api",
  SIGNUP: "signup",
  LOGIN: "login",
  REFRESH_TOKEN: "refresh-token",
  REQUEST_EMAIL_VERIFICATION: "request-email-verification",
  VERIFY_EMAIL: "verify-email",
  FORGOT_PASSWORD: "forgot-password",
  VERIFY_PASSWORD_RESET: "verify-password-reset",
  UPDATE_PASSWORD: "update-password",
};

/**
 * Rate Limiter Key Generation Strategies
 * Determines How Clients are Identified for Rate Limiting
 *
 * @enum {string}
 */
export const LIMIT_BY = {
  IP: "ip",
  EMAIL: "email",
  IP_AND_EMAIL: "ip-and-email",
};

/**
 * Rate Limiter Configurations
 * Centralized Configuration for ALL Rate Limiters in the Application
 *
 * @typedef {Object} RateLimiterConfig
 * @property {number} windowMs                - Time Window in Milliseconds
 * @property {number} limit                   - Maximum Requests Allowed in the Window
 * @property {string} prefix                  - Redis Key Prefix for this Limiter
 * @property {string} message                 - Error Message When Limit is Exceeded
 * @property {boolean} skipSuccessfulRequests - Whether to Skip Counting Successful Requests
 * @property {string} limitBy                 - Key Generation Strategy from LIMIT_BY
 */
export const RATE_LIMITER_CONFIGS = {
  /**
   * General API Rate Limiter
   * Applied to ALL "/api" Routes to Prevent Abuse
   * Counts ALL Requests Regardless of Success/Failure
   */
  [RATE_LIMITERS.API]: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    prefix: `${APP_NAME}:ratelimit:api:`,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    skipSuccessfulRequests: false,
    limitBy: LIMIT_BY.IP,
  },

  /**
   * Signup Rate Limiter
   * Prevents Spam Account Creation
   * Counts ALL Requests to Prevent Email Enumeration
   */
  [RATE_LIMITERS.SIGNUP]: {
    windowMs: SIGNUP_LIMIT_WINDOW_MS,
    limit: SIGNUP_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:signup:`,
    message: "Too Many Signup Attempts from this IP. Please Try Again Later",
    skipSuccessfulRequests: false,
    limitBy: LIMIT_BY.IP,
  },

  /**
   * Login Rate Limiter
   * Prevents Brute-Force Password Attacks
   * Only Counts Failed Attempts to Avoid Locking Out Legitimate Users
   * IP + Email Catches Both Distributed and Targeted Attacks
   */
  [RATE_LIMITERS.LOGIN]: {
    windowMs: LOGIN_LIMIT_WINDOW_MS,
    limit: LOGIN_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:login:`,
    message: "Too Many Login Attempts. Please Wait Before Trying Again",
    skipSuccessfulRequests: true,
    limitBy: LIMIT_BY.IP_AND_EMAIL,
  },

  /**
   * Refresh Token Rate Limiter
   * Prevents Redis Flooding from Excessive Token Rotation
   * IP-Only — Token Itself is the Credential, No Email in Request
   * Counts ALL Requests
   */
  [RATE_LIMITERS.REFRESH_TOKEN]: {
    windowMs: REFRESH_TOKEN_LIMIT_WINDOW_MS,
    limit: REFRESH_TOKEN_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:refresh-token:`,
    message: "Too Many Token Refresh Attempts. Please Try Again Later",
    skipSuccessfulRequests: false,
    limitBy: LIMIT_BY.IP,
  },

  /**
   * Request Email Verification Rate Limiter
   * Prevents Verification Email Spam (Emails have a Cost)
   * Email-Only — Authenticated Endpoint, Email Available from req.user
   * Counts ALL Requests
   */
  [RATE_LIMITERS.REQUEST_EMAIL_VERIFICATION]: {
    windowMs: AUTH_ACTION_LIMIT_WINDOW_MS,
    limit: AUTH_ACTION_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:request-email-verification:`,
    message:
      "Too Many Verification Email Requests. Please Check Your Inbox or Wait",
    skipSuccessfulRequests: false,
    limitBy: LIMIT_BY.EMAIL,
  },

  /**
   * Verify Email Rate Limiter
   * Prevents Brute-Force JWT Guessing
   * IP-Only — Token is Already Short-Lived, Guessing is Impractical
   * Only Counts Failed Attempts
   */
  [RATE_LIMITERS.VERIFY_EMAIL]: {
    windowMs: TOKEN_VERIFY_LIMIT_WINDOW_MS,
    limit: TOKEN_VERIFY_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:verify-email:`,
    message: "Too Many Verification Attempts. Please Try Again Later",
    skipSuccessfulRequests: true,
    limitBy: LIMIT_BY.IP,
  },

  /**
   * Forgot Password Rate Limiter
   * Prevents Email Enumeration and Spam
   * Email-Only — Prevents Email Spam (Emails have a Cost)
   * Counts ALL Requests
   */
  [RATE_LIMITERS.FORGOT_PASSWORD]: {
    windowMs: AUTH_ACTION_LIMIT_WINDOW_MS,
    limit: AUTH_ACTION_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:forgot-password:`,
    message:
      "Too Many Password Reset Requests. Check Your Email or Try Again Later",
    skipSuccessfulRequests: false,
    limitBy: LIMIT_BY.EMAIL,
  },

  /**
   * Verify Password Reset Rate Limiter
   * Prevents Brute-Force JWT Guessing Attacks
   * Only Counts Failed Attempts
   * Email-Only — Locks Down the Specific Account Being Targeted
   */
  [RATE_LIMITERS.VERIFY_PASSWORD_RESET]: {
    windowMs: TOKEN_VERIFY_LIMIT_WINDOW_MS,
    limit: TOKEN_VERIFY_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:verify-password-reset:`,
    message: "Too Many Verification Attempts. Please Try Again Later",
    skipSuccessfulRequests: true,
    limitBy: LIMIT_BY.EMAIL,
  },

  /**
   * Update Password Rate Limiter
   * Prevents Brute-Force Against Authenticated Sessions
   * Email-Only — Authenticated Endpoint, Email Available from req.user
   * Counts ALL Requests
   */
  [RATE_LIMITERS.UPDATE_PASSWORD]: {
    windowMs: AUTH_ACTION_LIMIT_WINDOW_MS,
    limit: AUTH_ACTION_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:update-password:`,
    message: "Too Many Password Update Attempts. Please Try Again Later",
    skipSuccessfulRequests: false,
    limitBy: LIMIT_BY.EMAIL,
  },
};
