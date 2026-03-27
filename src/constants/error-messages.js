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

  // Validation Patterns
  INVALID_FULL_NAME: "Full Name MUST be Two Words (First and Last Name)",
  INVALID_PHONE:
    "Phone Number MUST be in International Format (e.g., +201234567890 or 01234567890)",
  INVALID_PASSWORD:
    "Password MUST Contain Uppercase, Lowercase, Number & Special Character",
  INVALID_USERNAME:
    "Username MUST be 3-20 Characters (Letters, Numbers, Underscores Only)",
  INVALID_OBJECT_ID: "Invalid ID Format",

  // User Errors
  USER_NOT_FOUND: "User NOT Found",
  USER_ALREADY_EXISTS: "User with this Email ALREADY Exists",
  EMAIL_ALREADY_VERIFIED: "Email is Already Verified",
  PASSWORD_SAME_AS_OLD: "New Password MUST be Different from Current Password",

  // General
  INTERNAL_ERROR: "Internal Server Error",
  SERVICE_UNAVAILABLE: "Service Temporarily Unavailable",
  ROUTE_NOT_FOUND: "Route NOT Found",
  RESOURCE_NOT_FOUND: "Resource NOT Found",
  RESOURCE_ALREADY_EXISTS: "Resource ALREADY Exists",
  PAYLOAD_TOO_LARGE: "Request Payload is TOO Large",
  RATE_LIMIT_EXCEEDED: "Too Many Requests. Please Try Again Later",
};
