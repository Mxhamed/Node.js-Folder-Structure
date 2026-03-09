import { resolve } from "node:path";
import { config } from "dotenv";

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENVIRONMENT SETUP
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_PRODUCTION = NODE_ENV === "production";
export const IS_DEVELOPMENT = NODE_ENV === "development";

// Load Environment-Specific .env File
const envPath = resolve(`./config/.env.${NODE_ENV}`);
const result = config({ path: envPath, quiet: true });

if (result.error) {
  console.warn(`⚠️  Warning: COULDN'T Load ${envPath}`);
  console.warn("Falling Back to Environment Variables");
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVER CONFIGURATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const APP_NAME = process.env.APP_NAME || "my_app";
export const PORT = parseInt(process.env.PORT, 10) || 3000;

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATABASE CONFIGURATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// MongoDB
export const DB_URI = process.env.DB_URI;

// Redis
export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Validate Critical Database Config
if (!DB_URI) throw new Error("DB_URI is Required in Environment Variables");
if (!REDIS_URL)
  throw new Error("REDIS_URL is Required in Environment Variables");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REQUEST CONFIGURATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const REQUEST_BODY_LIMIT = process.env.REQUEST_BODY_LIMIT || "10mb";

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CORS & SECURITY
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const corsOriginEnv = process.env.CORS_ORIGIN || "*";
export const CORS_ORIGIN = corsOriginEnv
  .split(",")
  .map((origin) => origin.trim());

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RATE LIMITING
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RATE_LIMIT_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1000 * 60 * 15;
export const RATE_LIMIT_MAX_REQUESTS =
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

export const LOGIN_LIMIT_WINDOW_MS =
  parseInt(process.env.LOGIN_LIMIT_WINDOW_MS, 10) || 1000 * 60 * 15;
export const LOGIN_LIMIT_MAX_ATTEMPTS =
  parseInt(process.env.LOGIN_LIMIT_MAX_ATTEMPTS, 10) || 5;

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ENCRYPTION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CRYPTO_KEY = process.env.CRYPTO_KEY
  ? Buffer.from(process.env.CRYPTO_KEY, "hex")
  : null;

// Validate Encryption Key
if (!CRYPTO_KEY || CRYPTO_KEY.length !== 32)
  throw new Error("CRYPTO_KEY MUST be a 32-Byte Hex String (64 Characters)");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PASSWORD HASHING
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// BCrypt
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

// Argon2
export const ARGON2_HASH_LENGTH =
  parseInt(process.env.ARGON2_HASH_LENGTH, 10) || 32;
export const ARGON2_TIME_COST = parseInt(process.env.ARGON2_TIME_COST, 10) || 3;
export const ARGON2_MEMORY_COST =
  parseInt(process.env.ARGON2_MEMORY_COST, 10) || 65536;
export const ARGON2_PARALLELISM =
  parseInt(process.env.ARGON2_PARALLELISM, 10) || 4;

// Validate Argon2 Config
if (ARGON2_TIME_COST < 2)
  console.warn("⚠️  ARGON2_TIME_COST is TOO Low! Minimum Recommended: 2");

if (ARGON2_MEMORY_COST < 32768)
  console.warn(
    "⚠️  ARGON2_MEMORY_COST is TOO Low! Minimum Recommended: 32MB (32,768)",
  );

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JWT CONFIGURATION
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Access Token
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

// Refresh Token
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Validate JWT Secrets
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET)
  throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are Required");

if (JWT_ACCESS_SECRET === JWT_REFRESH_SECRET)
  console.warn("⚠️  Warning: Access and Refresh Secrets SHOULD be Different!");

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGGING
//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LOG_LEVEL =
  process.env.LOG_LEVEL || (IS_DEVELOPMENT ? "debug" : "info");
