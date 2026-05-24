import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env is at server/.env — two levels up from src/config/
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/veda-ai",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  nodeEnv: process.env.NODE_ENV || "development",
};
