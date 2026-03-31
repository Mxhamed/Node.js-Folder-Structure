import cors from "cors";
import helmet from "helmet";
import express from "express";
import {
  PORT,
  NODE_ENV,
  TRUST_PROXY,
  CORS_ORIGIN,
  IS_DEVELOPMENT,
  REQUEST_BODY_LIMIT,
} from "../config/config.service.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "./constants/index.js";
import { connectToMongoDB, connectToRedis, redis } from "./database/index.js";
import { initializeRateLimiters } from "./middleware/index.js";
import {
  connectToSMTP,
  NotFoundError,
  sendError,
  toTitleCase,
} from "./utils/index.js";

// CORS Configuration
const corsOptions = {
  origin: CORS_ORIGIN, // Which Domains Can Access
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP Methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed Request Headers
  credentials: true, // Allow Cookies/Auth Headers
  maxAge: 86400, // Cache Preflight Requests for 24 Hours
};

export default async function bootstrap() {
  const app = express();
  app.set("trust proxy", TRUST_PROXY);

  // Database & SMTP Server Connection
  await Promise.all([connectToMongoDB(), connectToRedis(), connectToSMTP()]);

  // Security Middleware
  app.use(helmet());
  app.use(cors(corsOptions));

  // Health Check
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Body Parsing Middleware
  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

  // Rate Limiting
  const { api: rateLimiter } = initializeRateLimiters(redis);
  app.use("/api", rateLimiter);

  // API Routes
  const { authRouter, usersRouter } = await import("./modules/index.js");
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);

  // 404 Catch-All Handler
  app.use((req, res, next) => {
    next(new NotFoundError(ERROR_MESSAGES.ROUTE_NOT_FOUND));
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;

    console.error({
      statusCode,
      message,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      stack: IS_DEVELOPMENT ? err.stack : undefined,
    });

    sendError(res, {
      message,
      statusCode,
      errors: err.errors,
      ...(IS_DEVELOPMENT && { stack: err.stack }),
    });
  });

  // Start Server
  const server = app.listen(PORT, () => {
    const protocol = IS_DEVELOPMENT ? "http" : "https";
    const host = formatServerHost(server.address());
    const baseUrl = `${protocol}://${host}:${PORT}`;

    console.log(`🚀  Server Running on Port ${PORT}`);
    console.log(`🌍  Environment: ${toTitleCase(NODE_ENV)}`);
    console.log(`🩺  Health Check: ${baseUrl}/health`);
  });

  return app;
}

/**
 * Formats a Server Address Object into a Human-Readable Host String
 * @param {object|string} address - The server.address() Result
 * @returns {string} Formatted Host String
 */
function formatServerHost(address) {
  // Default Fallback
  if (!address) return "localhost";

  // Handle Unix Domain Sockets or Pipes
  if (typeof address === "string") return address;

  // Handle TCP Server Addresses
  const { address: ipAddress } = address;

  // Listening on ALL Interfaces
  if (ipAddress === "::" || ipAddress === "0.0.0.0") return "localhost";

  // IPv6 Address - Wrap in Brackets for URL Compatibility
  if (ipAddress.includes(":")) return `[${ipAddress}]`;

  // IPv4 Address
  return ipAddress;
}
