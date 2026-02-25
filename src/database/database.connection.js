import mongoose from "mongoose";
import { ALL_MODELS } from "./models/index.js";
import {
  DB_URI,
  DB_NAME,
  IS_DEVELOPMENT,
} from "../../config/config.service.js";

/**
 * Connect to MongoDB Database
 * Handles Connection State Checks and Error Handling
 */
export const connectToMongoDB = async () => {
  // Check If Already Connected
  // readyState: 0=Disconnected, 1=Connected, 2=Connecting, 3=Disconnecting
  if (mongoose.connection.readyState >= 1) {
    console.log("🔌  MongoDB ALREADY Connected");
    return;
  }

  try {
    await mongoose.connect(DB_URI, {
      dbName: DB_NAME,
    });

    console.log(`🍃  Connected to MongoDB Successfully!`);
    console.log(
      `📦  Database: ${DB_NAME || mongoose.connection.db.databaseName}`,
    );

    // Sync Indexes ONLY in Development
    if (IS_DEVELOPMENT) await syncIndexes();

    // Setup Connection Event Listeners
    setupConnectionListeners();
  } catch (error) {
    console.error("⛔  Failed to Connect to MongoDB:", error.message);
    process.exit(1); // Exit If Connection Fails
  }
};

/**
 * Synchronizes Schema Indexes with the Database
 * ONLY Runs in Development to Avoid Production Slowdowns
 */
async function syncIndexes() {
  try {
    const results = await Promise.allSettled(
      ALL_MODELS.map(async (model) => {
        await model.syncIndexes();
        return model.modelName;
      }),
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        console.log(`🔄  Indexes Synced for ${result.value}`);
      } else {
        console.error(
          `⛔  Index Sync Failed for Model:`,
          result.reason.message,
        );
      }
    });
  } catch (error) {
    console.error("⛔  Index Sync Failed:", error.message);
  }
}

/**
 * Setup MongoDB Connection Event Listeners
 * Monitors Connection Health
 */
function setupConnectionListeners() {
  mongoose.connection.on("error", (err) => {
    console.error("⛔  MongoDB Connection Error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB Disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄  MongoDB Reconnected");
  });

  // Graceful Shutdown
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("🛑  MongoDB Connection Closed (App Termination)");
    process.exit(0);
  });
}
