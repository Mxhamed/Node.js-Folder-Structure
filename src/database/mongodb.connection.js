import mongoose from "mongoose";
import {
  DB_URI,
  APP_NAME,
  IS_DEVELOPMENT,
} from "../../config/config.service.js";
import { ALL_MODELS } from "./index.js";

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
      dbName: APP_NAME,
    });

    console.log(`🍃  Connected to MongoDB Successfully`);

    // Sync Indexes Only in Development
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
 * Only Runs in Development to Avoid Production Slowdowns
 */
async function syncIndexes() {
  try {
    const results = await Promise.allSettled(
      ALL_MODELS.map(async (model) => {
        await model.syncIndexes();
        return model.modelName;
      }),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;
    const total = results.length;

    // Calculate Total Indexes Synced
    let totalIndexesSynced = 0;
    results.forEach((result) => {
      if (result.status === "fulfilled") totalIndexesSynced++;
    });

    // Summary Message
    if (successful === total) {
      console.log(
        `📇  ALL Indexes Synced Successfully (${total} Model${total !== 1 ? "s" : ""})`,
      );
    } else if (successful > 0 && failed > 0) {
      console.log(
        `⚠️  Indexes Synced: ${successful} Successful, ${failed} Failed`,
      );
    } else if (failed === total) {
      console.log(
        `⛔  ALL Index Syncs Failed (${total} Model${total !== 1 ? "s" : ""})`,
      );
    }
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
