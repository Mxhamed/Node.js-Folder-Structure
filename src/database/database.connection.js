import mongoose from "mongoose";
import { ALL_MODELS } from "./models/index.js";
import { DB_URI, IS_DEVELOPMENT } from "../../config/config.service.js";

export const connectToMongoDB = async () => {
  // readyState:
  // 0 = Disconnected
  // 1 = Connected
  // 2 = Connecting
  // 3 = Disconnecting
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(DB_URI);
    console.log("🍃  Connected to MongoDB Successfully!");

    // Sync Indexes ONLY in Development
    if (IS_DEVELOPMENT) await syncIndexes();
  } catch (error) {
    console.error("⛔  Failed to Connect to MongoDB:", error.message);
    process.exit(1); // Exit Process If Connection Fails
  }
};

/**
 * Synchronizes Schema Indexes with the Database
 */
async function syncIndexes() {
  try {
    await Promise.all(
      ALL_MODELS.map(async (model) => {
        await model.syncIndexes(); // Ensures DB Indexes Match Schema Index Definitions
        console.log(`🔄  Indexes Synced for ${model.modelName}`);
      }),
    );
  } catch (error) {
    console.error("⛔  Index Sync Failed:", error.message);
  }
}
