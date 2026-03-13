import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  SIGNUP_LIMIT_WINDOW_MS,
  SIGNUP_LIMIT_MAX_ATTEMPTS,
  LOGIN_LIMIT_MAX_ATTEMPTS,
  LOGIN_LIMIT_WINDOW_MS,
  EMAIL_VERIFICATION_LIMIT_MAX_ATTEMPTS,
  EMAIL_VERIFICATION_LIMIT_WINDOW_MS,
  PASSWORD_RESET_LIMIT_WINDOW_MS,
  PASSWORD_RESET_LIMIT_MAX_ATTEMPTS,
  VERIFY_PASSWORD_RESET_LIMIT_WINDOW_MS,
  VERIFY_PASSWORD_RESET_LIMIT_MAX_ATTEMPTS,
  APP_NAME,
} from "../../config/config.service.js";
import { ERROR_MESSAGES } from "./index.js";

/**
 * Rate Limiter Identifiers
 * Use these Constants to Reference Rate Limiters throughout the App
 */
export const RATE_LIMITER_NAMES = {
  API: "api",
  SIGNUP: "signup",
  LOGIN: "login",
  EMAIL_VERIFICATION: "email-verification",
  PASSWORD_RESET: "password-reset",
  VERIFY_PASSWORD_RESET: "verify-password-reset",
};

/**
 * Rate Limiter Configurations
 * Centralized Configuration for ALL Rate Limiters in the Application
 *
 * @typedef {Object} RateLimiterConfig
 * @property {number} windowMs - Time Window in Milliseconds
 * @property {number} limit - Maximum Requests Allowed in the Window
 * @property {string} prefix - Redis Key Prefix for this Limiter
 * @property {string} message - Error Message When Limit Exceeded
 * @property {boolean} skipSuccessfulRequests - Whether to Count Successful Requests
 */
export const RATE_LIMITER_CONFIGS = {
  /**
   * General API Rate Limiter
   * Applied to ALL "/api" Routes to Prevent Abuse
   * Counts ALL Requests Regardless of Success/Failure
   */
  [RATE_LIMITER_NAMES.API]: {
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    prefix: `${APP_NAME}:ratelimit:api:`,
    message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    skipSuccessfulRequests: false,
  },

  /**
   * Signup Rate Limiter
   * Prevents Spam Account Creation
   * Counts ALL Requests to Prevent Discovering Existing Emails
   */
  [RATE_LIMITER_NAMES.SIGNUP]: {
    windowMs: SIGNUP_LIMIT_WINDOW_MS,
    limit: SIGNUP_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:signup:`,
    message: "Too Many Signup Attempts - Please Try Again Later",
    skipSuccessfulRequests: false,
  },

  /**
   * Login Rate Limiter
   * Prevents Brute-Force Password Attacks
   * Only Counts Failed Login Attempts
   */
  [RATE_LIMITER_NAMES.LOGIN]: {
    windowMs: LOGIN_LIMIT_WINDOW_MS,
    limit: LOGIN_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:login:`,
    message: "Too Many Login Attempts - Please Try Again Later",
    skipSuccessfulRequests: true,
  },

  /**
   * Email Verification Rate Limiter
   * Prevents Email Spam (Sending Verification Emails Costs Money)
   * Counts ALL Requests Regardless of Success
   */
  [RATE_LIMITER_NAMES.EMAIL_VERIFICATION]: {
    windowMs: EMAIL_VERIFICATION_LIMIT_WINDOW_MS,
    limit: EMAIL_VERIFICATION_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:email-verification:`,
    message: "Too Many Verification Email Requests - Please Try Again Later",
    skipSuccessfulRequests: false,
  },

  /**
   * Password Reset Request Rate Limiter
   * Prevents Email Enumeration and Spam
   * Counts ALL Requests to Prevent Discovering Registered Emails
   * Applied to BOTH "/forgot-password" AND "/update-password" Endpoints
   */
  [RATE_LIMITER_NAMES.PASSWORD_RESET]: {
    windowMs: PASSWORD_RESET_LIMIT_WINDOW_MS,
    limit: PASSWORD_RESET_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:password-reset:`,
    message: "Too Many Password Reset Requests - Please Try Again Later",
    skipSuccessfulRequests: false,
  },

  /**
   * Password Reset Verification Rate Limiter
   * Prevents Brute-Force Token Guessing
   * Only Counts Failed Verification Attempts
   */
  [RATE_LIMITER_NAMES.VERIFY_PASSWORD_RESET]: {
    windowMs: VERIFY_PASSWORD_RESET_LIMIT_WINDOW_MS,
    limit: VERIFY_PASSWORD_RESET_LIMIT_MAX_ATTEMPTS,
    prefix: `${APP_NAME}:ratelimit:auth:verify-password-reset:`,
    message: "Too Many Password Reset Attempts - Please Try Again Later",
    skipSuccessfulRequests: true,
  },
};
