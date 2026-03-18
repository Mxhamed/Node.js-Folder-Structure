/**
 *
 * Reusable Error Messages
 * Centralized for Consistency
 *
 * @enum {string}
 */
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  UNAUTHORIZED: "Authentication Required",
  INVALID_CREDENTIALS: "Invalid Email or Password",
  NO_TOKEN: "No Authentication Token Provided",
  INVALID_AUTH_HEADER:
    "Invalid Authorization Header Format. Use: Bearer <token>",
  REVOKED_TOKEN: "Token has been Revoked",
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
  RATE_LIMIT_EXCEEDED: "Too Many Requests. Please Try Again Later",
};
