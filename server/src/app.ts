import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/assignment.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { generalRateLimiter } from "./middleware/rate-limit.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// CORS — allow localhost in dev, Vercel frontend in production
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = [
      "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:3000",
      // Production frontend — set ALLOWED_ORIGIN env var on Render
      process.env.ALLOWED_ORIGIN,
    ].filter(Boolean);

    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // permissive for now — tighten after deploy
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Request body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Structured request logging
app.use(requestLogger);

// General rate limiting on all API routes
app.use("/api", generalRateLimiter);

// ─── Static Files ─────────────────────────────────────────────────────────────

// Serve generated PDF exam papers as static files
const publicPdfsDir = path.join(__dirname, "../../public/pdfs");
app.use("/pdfs", express.static(publicPdfsDir));
console.log(`[App] Serving static PDFs from: ${publicPdfsDir}`);

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use("/api", routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────

app.use(errorMiddleware);

export default app;
