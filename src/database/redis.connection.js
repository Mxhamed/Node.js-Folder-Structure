import { createClient } from "redis";
import { REDIS_URL, IS_DEVELOPMENT } from "../../config/config.service.js";

/**
 * Redis Client Instance
 * Shared Across the Application
 */
export const redis = createClient({
  url: REDIS_URL,
});

/**
 * Connect to Redis
 * Handles Connection State Checks and Error Handling
 */
export const connectToRedis = async () => {
  // Check If Already Connected
  if (redis.isReady) {
    console.log("🔌  Redis ALREADY Connected");
    return;
  }

  try {
    await redis.connect();
    console.log("🏮  Connected to Redis Successfully!");

    // Setup Event Listeners
    setupRedisListeners();
  } catch (error) {
    console.error("⛔  Failed to Connect to Redis:", error.message);
    process.exit(1); // Exit If Connection Fails
  }
};

/**
 * Setup Redis Event Listeners
 * Monitors Connection Health
 */
function setupRedisListeners() {
  redis.on("error", (err) => {
    console.error("⛔  Redis Connection Error:", err.message);
  });

  redis.on("reconnecting", () => {
    console.log("🔄  Redis Reconnecting...");
  });

  redis.on("ready", () => {
    console.log("✅  Redis Ready");
  });

  // Graceful Shutdown
  process.on("SIGINT", async () => {
    await redis.quit();
    console.log("🛑  Redis Connection Closed (App Termination)");
  });
}

/**
 * Disconnect from Redis
 * Useful for Tests or Graceful Shutdowns
 */
export const disconnectRedis = async () => {
  if (redis.isOpen) {
    await redis.quit();
    console.log("🛑  Redis Disconnected");
  }
};
