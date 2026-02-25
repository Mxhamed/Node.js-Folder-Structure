/**
 * Reusable Error Messages
 * Centralized for Consistency
 */
export const ERROR_MESSAGES = {
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "Too Many Requests - Please Try Again Later",
  LOGIN_RATE_LIMIT_EXCEEDED: "Too Many Login Attempts - Please Try Again Later",

  // Authentication & Authorization
  UNAUTHORIZED: "Authentication Required",
  INVALID_CREDENTIALS: "Invalid Email or Password",
  NO_TOKEN: "NO Authentication Token Provided",
  INVALID_TOKEN: "Invalid or Expired Token",
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
