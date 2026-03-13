import { RedisStore } from "rate-limit-redis";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { RATE_LIMITER_CONFIGS } from "../constants/index.js";
import {
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  TooManyRequestsError,
} from "../utils/index.js";

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
    throw new InternalServerError(
      "Redis Client is Required to Initialize Rate Limiters",
    );
  }

  redis = redisClient;

  const configs = Object.entries(RATE_LIMITER_CONFIGS);
  const successful = [];
  const failed = [];

  // Create ALL Limiters from Configuration with Error Tracking
  configs.forEach(([name, config]) => {
    try {
      limiters[name] = createLimiter(name, config);
      successful.push(name);
    } catch (error) {
      failed.push({ name, error: error.message });
      console.error(
        `⛔  Failed to Initialize "${name}" Rate Limiter:`,
        error.message,
      );
    }
  });

  const total = configs.length;
  const successCount = successful.length;
  const failCount = failed.length;

  // Summary Message
  if (successCount === total) {
    console.log(
      `🚦  ALL Rate Limiters Initialized Successfully (${total} Limiter${total !== 1 ? "s" : ""})`,
    );
  } else if (successCount > 0 && failCount > 0) {
    console.log(
      `⚠️  Rate Limiters Initialized: ${successCount} Successful, ${failCount} Failed`,
    );
  } else if (failCount === total) {
    console.log(
      `⛔  ALL Rate Limiters Failed to Initialize (${total} Limiter${total !== 1 ? "s" : ""})`,
    );
    throw new ServiceUnavailableError(
      `Failed to Initialize ANY Rate Limiters: ${failed.map((f) => f.name).join(", ")}`,
    );
  }

  return limiters;
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
    throw new InternalServerError(
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
    throw new NotFoundError(
      `Rate Limiter "${name}" NOT Found. Available Limiters: ${Object.keys(limiters).join(", ")}`,
    );
  }

  return limiter;
};
