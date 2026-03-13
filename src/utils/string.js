/**
 * String Utility Functions
 * Helper Functions for String Manipulation, Masking, and Generation
 */

import crypto from "crypto";
import { APP_NAME } from "../../config/config.service.js";

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GENERATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate a Unique JWT ID (JTI)
 * Used for Token Blacklisting and Single-Device Logout
 * @returns {string} A Cryptographically Random UUID
 *
 * @example
 * generateJTI() // "550e8400-e29b-41d4-a716-446655440000"
 */
export const generateJTI = () => crypto.randomUUID();

/**
 * Generate a 6-Digit Numeric One-Time Password (OTP)
 * @returns {string} 6-Digit OTP String
 *
 * @example
 * generateOTP() // "482913"
 */
export const generateOTP = () =>
  crypto.randomInt(100_000, 1_000_000).toString();

/**
 * Generate a URL-Safe Slug from a String
 * Lowercases, Removes Special Characters, and Replaces Spaces with Hyphens
 * @param {string} str - Input String
 * @returns {string} URL-Safe Slug
 *
 * @example
 * generateSlug("Hello World!")      // "hello-world"
 * generateSlug("  My  Blog Post ")  // "my-blog-post"
 */
export const generateSlug = (str) => {
  if (!str || typeof str !== "string") throw new Error("String is Required");

  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CASE TRANSFORMATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Convert a String to snake_case
 * Handles camelCase, PascalCase, and Space-Separated Words
 * @param {string} str - Input String
 * @returns {string} snake_case String
 *
 * @example
 * toSnakeCase("helloWorld")    // "hello_world"
 * toSnakeCase("HelloWorld")    // "hello_world"
 * toSnakeCase("hello world")   // "hello_world"
 */
export const toSnakeCase = (str) => {
  if (!str || typeof str !== "string") throw new Error("String is Required");

  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
};

/**
 * Convert a String to camelCase
 * Handles snake_case, PascalCase, and Space-Separated Words
 * @param {string} str - Input String
 * @returns {string} camelCase String
 *
 * @example
 * toCamelCase("hello_world")   // "helloWorld"
 * toCamelCase("HelloWorld")    // "helloWorld"
 * toCamelCase("hello world")   // "helloWorld"
 */
export const toCamelCase = (str) => {
  if (!str || typeof str !== "string") throw new Error("String is Required");

  return str
    .trim()
    .replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (char) => char.toLowerCase());
};

/**
 * Capitalize the First Letter of Each Word (Title Case)
 * @param {string} str - Input String
 * @returns {string} Title-Cased String
 *
 * @example
 * toTitleCase("hello world")       // "Hello World"
 * toTitleCase("john doe smith")    // "John Doe Smith"
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== "string") throw new Error("String is Required");

  return str
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASKING
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Mask an Email Address for Safe Logging / Error Messages
 * Preserves the First Character and Domain
 * @param {string} email - Email Address to Mask
 * @returns {string} Masked Email String
 *
 * @example
 * maskEmail("john.doe@gmail.com")  // "j***@gmail.com"
 * maskEmail("a@example.com")       // "a***@example.com"
 */
export const maskEmail = (email) => {
  if (!email || typeof email !== "string") throw new Error("Email is Required");

  const [local, domain] = email.split("@");
  if (!domain) throw new Error("Invalid Email Format");

  return `${local[0]}***@${domain}`;
};

/**
 * Mask a Phone Number for Safe Logging / Error Messages
 * Preserves the Last 4 Digits Only
 * Useful When Phone is NOT Encrypted (e.g. Temp Storage, Logs)
 * @param {string} phone - Phone Number to Mask (Digits Only or Formatted)
 * @returns {string} Masked Phone String
 *
 * @example
 * maskPhone("01012345678")     // "*******5678"
 * maskPhone("+201012345678")   // "********5678"
 */
export const maskPhone = (phone) => {
  if (!phone || typeof phone !== "string") throw new Error("Phone is Required");

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) throw new Error("Phone Number Too Short to Mask");

  return "*".repeat(digits.length - 4) + digits.slice(-4);
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMATTING
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Truncate a String to a Maximum Length with an Ellipsis
 * @param {string} str - Input String
 * @param {number} [maxLength=100] - Maximum Allowed Length (Including Ellipsis)
 * @returns {string} Truncated String or Original if Within Limit
 *
 * @example
 * truncate("Hello World", 8)   // "Hello..."
 * truncate("Hi", 10)           // "Hi"
 */
export const truncate = (str, maxLength = 100) => {
  if (!str || typeof str !== "string") throw new Error("String is Required");
  if (maxLength < 4) throw new Error("maxLength MUST be at Least 4");

  if (str.length <= maxLength) return str;

  return str.slice(0, maxLength - 3) + "...";
};

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REDIS
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Build a Namespaced Redis Key
 * Ensures Consistent Key Patterns Across the App
 * Format: `{APP_NAME}:{namespace}:{parts...}`
 * @param {string} namespace - Key Namespace (e.g. "otp", "revoke_token", "rate_limit")
 * @param {...string} parts - Additional Key Segments (e.g. userId, jti)
 * @returns {string} Full Redis Key String
 *
 * @example
 * buildRedisKey("otp", "01012345678")                     // "myapp:otp:01012345678"
 * buildRedisKey("revoke_token", "userId123", "jti-abc")   // "myapp:revoke_token:userId123:jti-abc"
 * buildRedisKey("rate_limit", req.ip)                     // "myapp:rate_limit:192.168.1.1"
 */
export const buildRedisKey = (namespace, ...parts) => {
  if (!namespace || typeof namespace !== "string") {
    throw new Error("Namespace is Required");
  }

  const segments = [APP_NAME, namespace, ...parts].filter(Boolean);

  return segments.join(":");
};
