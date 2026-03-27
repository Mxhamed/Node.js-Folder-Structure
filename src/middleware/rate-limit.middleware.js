import { RedisStore } from "rate-limit-redis";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { LIMIT_BY, RATE_LIMITER_CONFIGS } from "../constants/index.js";
import {
  InternalServerError,
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
      limiters[name] = createLimiter(config);
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
 * Key Generator Strategy Map
 * Maps Each LIMIT_BY Strategy to Its Corresponding Key Generation Function
 * Falls Back to IP if Email is Unavailable
 *
 * @private
 */
const keyGenerators = {
  [LIMIT_BY.IP]: (req, ip) => ip,

  [LIMIT_BY.EMAIL]: (req, ip) => {
    const email = req.validatedBody?.email || req.user?.email;
    return email ? `email:${email}` : ip;
  },

  [LIMIT_BY.IP_AND_EMAIL]: (req, ip) => {
    const email = req.validatedBody?.email || req.user?.email;
    return email ? `${ip}:email:${email}` : ip;
  },
};

/**
 * Create a Single Rate Limiter from Configuration
 * @private
 *
 * @param {Object} config - Rate Limiter Configuration
 * @returns {Function} Express Rate Limiter Middleware
 */
function createLimiter(config) {
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

    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip);
      const generator = keyGenerators[config.limitBy];
      return generator(req, ip);
    },

    handler: (req, res, next) => {
      throw new TooManyRequestsError(config.message);
    },
  });
}

/**
 * Get a Rate Limiter by Name
 * Use this in Route Handlers to Apply Specific Rate Limiting
 *
 * @param {string} name - Rate Limiter Name (from RATE_LIMITERS)
 * @returns {Function} Express Rate Limiter Middleware
 * @throws {Error} If Rate Limiter with Given Name DOESN'T Exist
 *
 * @example
 * router.post("/login", getLimiter(RATE_LIMITERS.LOGIN), loginController);
 */
export const getLimiter = (name) => {
  const limiter = limiters[name];

  if (!limiter) {
    throw new InternalServerError(
      `Rate Limiter "${name}" NOT Found. Available Limiters: ${Object.keys(limiters).join(", ")}`,
    );
  }

  return limiter;
};
