import { RedisStore } from "rate-limit-redis";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RATE_LIMITER_CONFIGS } from "../constants/index.js";
import { TooManyRequestsError } from "../utils/index.js";

let redis = null;
const limiters = {};

/**
 * Initialize ALL Rate Limiters with Redis Client
 * MUST be Called After Redis Connection is Established
 *
 * @param {Object} redisClient - Connected Redis Client Instance
 * @returns {Object} Object Containing ALL Initialized Rate Limiter Middleware
 *
 * @example
 * const { rateLimiter, login } = initializeRateLimiters(redis);
 * app.use("/api", rateLimiter);
 * app.use("/api/auth/login", login);
 */
export const initializeRateLimiters = (redisClient) => {
  if (!redisClient) {
    throw new Error("Redis Client is Required to Initialize Rate Limiters");
  }

  redis = redisClient;

  // Create ALL Limiters from Configuration
  Object.entries(RATE_LIMITER_CONFIGS).forEach(([name, config]) => {
    limiters[name] = createLimiter(name, config);
  });

  console.log(`🚦  ${Object.keys(limiters).length} Rate Limiters Initialized`);
  return limiters;
};

/**
 * Get a Rate Limiter by Name
 * Use this in Route Handlers to Apply Specific Rate Limiting
 *
 * @param {string} name - Rate Limiter Name (from RATE_LIMITER_NAMES)
 * @returns {Function} Express Rate Limiter Middleware
 * @throws {Error} If Rate Limiter with Given Name DOESN'T Exist
 *
 * @example
 * router.post("/login", getLimiter(RATE_LIMITER_NAMES.LOGIN), loginController);
 */
export const getLimiter = (name) => {
  const limiter = limiters[name];

  if (!limiter) {
    throw new Error(
      `Rate Limiter "${name}" NOT Found. Available Limiters: ${Object.keys(limiters).join(", ")}`,
    );
  }

  return limiter;
};

/**
 * Create a Single Rate Limiter from Configuration
 * @private
 *
 * @param {string} name - Limiter Name (for Error Messages)
 * @param {Object} config - Rate Limiter Configuration
 * @returns {Function} Express Rate Limiter Middleware
 */
function createLimiter(name, config) {
  if (!redis) {
    throw new Error(
      `Redis Client NOT Initialized! Cannot Create "${name}" Rate Limiter`,
    );
  }

  return rateLimit({
    windowMs: config.windowMs,
    limit: config.limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests,

    // Redis Store for Distributed Rate Limiting
    store: new RedisStore({
      // @ts-expect-error - Known Typing Issue with sendCommand
      sendCommand: (...args) => redis.sendCommand(args),
      prefix: config.prefix,
    }),

    keyGenerator: secureKeyGenerator,

    handler: (req, res, next) => {
      throw new TooManyRequestsError(config.message);
    },
  });
}

/**
 * Get Client's Real IP Address
 * Handles Various Proxy Scenarios (Nginx, Cloudflare, AWS ALB, etc.)
 * @private
 *
 * @param {Object} req - Express Request Object
 * @returns {string} Client IP Address
 */
function getClientIp(req) {
  // 1. Check X-Forwarded-For (Most Common with Proxies)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // Get Leftmost IP (Original Client)
    // Format: "client, proxy1, proxy2"
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  // 2. Check X-Real-IP (Nginx)
  const realIp = req.headers["x-real-ip"];
  if (realIp) return realIp;

  // 3. Check CF-Connecting-IP (Cloudflare)
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) return cfIp;

  // 4. Check X-Client-IP
  const clientIp = req.headers["x-client-ip"];
  if (clientIp) return clientIp;

  // 5. Fallback to req.ip (After Trust Proxy is Set)
  return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Secure Key Generator that Handles IPv6 Properly
 * Uses express-rate-limit's Built-In IPv6 Normalization
 * @private
 *
 * @param {Object} req - Express Request Object
 * @returns {string} Normalized IP Address for Rate Limiting
 */
function secureKeyGenerator(req) {
  const ip = getClientIp(req);
  return ipKeyGenerator(ip); // Handles IPv6 Normalization
}
