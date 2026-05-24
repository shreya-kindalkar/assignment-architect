import mongoose from "mongoose";
import { config } from "./env.js";

let isMongoAvailable = false;

// Simple in-memory storage fallback for Assignments and Papers
export const mockDatabase = {
  assignments: new Map<string, any>(),
  generatedPapers: new Map<string, any>()
};

export async function connectDB(): Promise<boolean> {
  try {
    console.log(`[DB Config] Connecting to MongoDB at: ${config.mongodbUri}`);
    
    // Set connection timeout options
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });

    console.log("[DB Config] Successfully connected to MongoDB database.");
    isMongoAvailable = true;
    return true;
  } catch (err: any) {
    console.warn(
      `[DB Config] MongoDB failed to connect: ${err.message}. Using high-fidelity in-memory mock database store.`
    );
    isMongoAvailable = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isMongoAvailable && mongoose.connection.readyState === 1;
}
