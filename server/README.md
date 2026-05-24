# VedaAI Backend — Production Server

Node.js + Express + TypeScript backend for the VedaAI assignment paper generator.

## Architecture

```
server/src/
├── config/          # DB, Redis, env config with graceful fallbacks
├── constants/       # Queue names, cache TTLs, rate limits, progress values
├── controllers/     # Route handlers (assignment + generated paper)
├── middleware/      # Error handler, request logger, rate limiter
├── models/          # Mongoose schemas: Assignment, GeneratedPaper
├── queues/          # BullMQ queues + in-process MockQueue fallback
├── routes/          # Express router
├── services/        # AIService (Gemini + smart mock), PDFService (PDFKit)
├── sockets/         # Socket.IO server, emitProgress helper
├── types/           # Shared TypeScript types
├── utils/           # asyncHandler, sleep, safeJsonParse helpers
├── validators/      # Zod schemas for request validation
├── workers/         # BullMQ workers: generation + PDF compilation
├── app.ts           # Express app setup
└── server.ts        # HTTP server bootstrap + graceful shutdown
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/assignments/create` | Create assignment + enqueue AI job |
| GET | `/api/assignments` | List all assignments (Redis cached) |
| GET | `/api/assignments/:id` | Get single assignment |
| GET | `/api/generated-paper/:id` | Get generated paper (Redis cached) |
| POST | `/api/generated-paper/:id/regenerate` | Re-queue generation job |

## WebSocket Events

Connect to `ws://localhost:5000`, emit `join_assignment <id>` to subscribe.

| Event | Progress | Description |
|-------|----------|-------------|
| `job_started` | 10% | Worker picked up the job |
| `validating` | 25% | Validating assignment data |
| `generating_sections` | 40% | Building section structure |
| `generating_questions` | 60% | AI generating questions |
| `generating_answers` | 80% | Generating answer key |
| `formatting_output` | 90% | Schema validation |
| `generating_pdf` | 95% | PDFKit compiling PDF |
| `completed` | 100% | Done — includes `pdfUrl` in data |
| `failed` | 0% | Error — includes message |

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set MONGODB_URI, REDIS_URL, GEMINI_API_KEY (optional)

# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/veda-ai` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini API key (optional — uses smart mock if absent) |
| `NODE_ENV` | `development` | Environment mode |

## Resilience

The server runs fully without any external services:
- **No MongoDB** → in-memory Map store
- **No Redis** → in-memory cache with TTL + in-process MockQueue workers
- **No Gemini API key** → smart educational mock paper generator

## PDF Output

Generated PDFs are saved to `public/pdfs/` and served statically at `/pdfs/<filename>`.
