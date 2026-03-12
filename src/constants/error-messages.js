/**
 * Reusable Error Messages
 * Centralized for Consistency
 */
export const ERROR_MESSAGES = {
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Too Many Requests - Please Try Again Later",
  SIGNUP_LIMIT_EXCEEDED: "Too Many Signup Attempts - Please Try Again Later",
  LOGIN_LIMIT_EXCEEDED: "Too Many Login Attempts - Please Try Again Later",
  EMAIL_VERIFICATION_LIMIT_EXCEEDED:
    "Too Many Verification Email Requests - Please Try Again Later",
  PASSWORD_RESET_LIMIT_EXCEEDED:
    "Too Many Password Reset Attempts - Please Try Again Later",

  // Authentication & Authorization
  UNAUTHORIZED: "Authentication Required",
  INVALID_CREDENTIALS: "Invalid Email or Password",
  NO_TOKEN: "No Authentication Token Provided",
  INVALID_AUTH_HEADER:
    "Invalid Authorization Header Format. Use: Bearer <token>",
  INVALID_TOKEN: "Invalid Token",
  EXPIRED_TOKEN: "Token has Expired",
  INVALID_TOKEN_TYPE: "Invalid Token Type",
  FORBIDDEN: "You DON'T have Permission to Access this Resource",

  // Validation
  VALIDATION_FAILED: "Validation Failed",
  INVALID_INPUT: "Invalid Input Provided",

  // User Errors
  USER_NOT_FOUND: "User NOT Found",
  USER_ALREADY_EXISTS: "User with this Email ALREADY Exists",

  // General
  INTERNAL_ERROR: "Internal Server Error",
  SERVICE_UNAVAILABLE: "Service Temporarily Unavailable",
  ROUTE_NOT_FOUND: "Route NOT Found",
  RESOURCE_NOT_FOUND: "Resource NOT Found",
  RESOURCE_ALREADY_EXISTS: "Resource ALREADY Exists",
  PAYLOAD_TOO_LARGE: "Request Payload is TOO Large",
};
