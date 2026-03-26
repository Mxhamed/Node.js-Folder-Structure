/**
 * Centralized Regex Patterns for Input Validation
 *
 * @enum {RegExp}
 */
export const PATTERNS = {
  // Two Words Separated by a Single Space, Unicode-Aware, Allows Hyphens/Apostrophes
  FULL_NAME:
    /^[\p{L}\p{M}]+([-'][\p{L}\p{M}]+)*\s[\p{L}\p{M}]+([-'][\p{L}\p{M}]+)*$/u,

  // E.164 Format (+201234567890)
  PHONE: /^\+?[1-9]\d{7,14}$/,

  // Min 8 Chars, Upper, Lower, Digit, Special Char
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,

  // Alphanumeric + Underscores, 3-20 Chars
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,

  // MongoDB ObjectId
  OBJECT_ID: /^[a-f\d]{24}$/i,
};
