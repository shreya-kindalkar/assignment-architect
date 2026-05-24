# VedaAI — AI Assessment Creator

A full-stack AI-powered exam paper generator. Teachers create assignments, the backend generates structured question papers using AI, and real-time progress is streamed to the frontend via WebSockets.

---

## Architecture Overview

```
assignment-architect/
├── src/                    # Frontend (React + TanStack Router + Zustand)
│   ├── components/         # UI components (layout, assignments, common, shadcn/ui)
│   ├── constants/          # App-wide constants (API URLs, WS events, defaults)
│   ├── hooks/              # React hooks (re-exports from store)
│   ├── routes/             # TanStack file-based routes (/, /create-assignment, /generated-paper)
│   ├── services/           # Typed API service layer (api.ts)
│   ├── sockets/            # Socket.IO client manager (socketManager.ts)
│   ├── store/              # Zustand store (assignmentStore.ts)
│   ├── types/              # Shared TypeScript types (assignment.ts, api.ts)
│   └── validators/         # Zod form validators (assignment.ts)
│
├── server/                 # Backend (Node.js + Express + TypeScript)
│   └── src/
│       ├── config/         # DB, Redis, env config with graceful fallbacks
│       ├── constants/      # Queue names, cache TTLs, progress values
│       ├── controllers/    # Route handlers
│       ├── middleware/     # Error handler, request logger, rate limiter
│       ├── models/         # Mongoose schemas (Assignment, GeneratedPaper)
│       ├── queues/         # BullMQ queues + MockQueue fallback
│       ├── routes/         # Express router
│       ├── services/       # AIService (Gemini + mock), PDFService (PDFKit)
│       ├── sockets/        # Socket.IO server + emitProgress
│       ├── types/          # Shared backend types
│       ├── utils/          # Helpers (sleep, safeJsonParse, asyncHandler)
│       ├── validators/     # Zod request validators
│       └── workers/        # BullMQ workers (generation + PDF)
│
└── public/pdfs/            # Generated PDF exam papers (served statically)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + TanStack Router v1 |
| State Management | Zustand v5 |
| Real-time | Socket.IO Client v4 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Form Validation | Zod |
| Backend Framework | Node.js + Express + TypeScript |
| Database | MongoDB (Mongoose) |
| Cache / Queue State | Redis (ioredis) |
| Job Queue | BullMQ |
| WebSocket Server | Socket.IO v4 |
| AI Generation | Google Gemini 2.5 Flash (+ smart mock fallback) |
| PDF Export | PDFKit |

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (optional — in-memory fallback available)
- Redis (optional — in-memory fallback available)

### 1. Install frontend dependencies
```bash
npm install
```

### 2. Install backend dependencies
```bash
cd server
npm install
```

### 3. Configure backend environment
```bash
# server/.env (already exists with defaults)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/veda-ai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_key_here   # optional — uses smart mock if absent
NODE_ENV=development
```

### 4. Start the backend
```bash
cd server
npm run dev        # development with hot reload
# or
npm run build && npm start   # production
```

### 5. Start the frontend
```bash
npm run dev        # from project root
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api  
WebSocket: ws://localhost:5000

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/assignments/create` | Create assignment + enqueue AI job |
| GET | `/api/assignments` | List all assignments (Redis cached, 60s TTL) |
| GET | `/api/assignments/:id` | Get single assignment |
| GET | `/api/generated-paper/:id` | Get generated paper (Redis cached, 5min TTL) |
| POST | `/api/generated-paper/:id/regenerate` | Re-queue generation job |

---

## WebSocket Flow

```
1. Frontend submits form → POST /api/assignments/create
2. Backend saves Assignment (MongoDB) → status: "pending"
3. Backend enqueues job in BullMQ generationQueue
4. Frontend connects Socket.IO → joins room "assignment:<id>"
5. Worker picks up job → emits progress events:
   job_started (10%) → validating (25%) → generating_sections (40%)
   → generating_questions (60%) → generating_answers (80%)
   → formatting_output (90%) → generating_pdf (95%) → completed (100%)
6. Frontend updates progress bar + checklist live
7. On "completed" → frontend navigates to /generated-paper?id=<id>
8. Frontend fetches paper via GET /api/generated-paper/:id
9. GeneratedPaper component renders structured exam paper
10. Download button opens /pdfs/exam_paper_<id>.pdf
```

---

## AI Generation Flow

```
AIService.generatePaper(params)
  ├── If GEMINI_API_KEY set:
  │   ├── Build structured prompt (sections, question types, marks)
  │   ├── Call Gemini 2.5 Flash REST API
  │   ├── Parse JSON response
  │   ├── Validate with Zod schema
  │   └── Return structured AIPaperResponse
  └── If no API key (or Gemini fails):
      └── generateSmartMockPaper() — topic-aware educational fallback
          ├── Detects topic (science/electricity/general)
          ├── Selects appropriate question pool
          ├── Distributes questions across sections A/B/C
          └── Generates matching answer key
```

Output structure (never raw LLM text):
```json
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Answer all questions. 1 mark each.",
      "questions": [
        { "number": 1, "text": "...", "difficulty": "Easy", "marks": 1 }
      ]
    }
  ],
  "answerKey": [
    { "number": 1, "text": "..." }
  ]
}
```

---

## Queue Architecture

```
BullMQ (Redis) or MockQueue (in-process EventEmitter fallback)

generationQueue
  └── generateAIQuestions job
        ├── Fetch assignment from MongoDB
        ├── Call AIService.generatePaper()
        ├── Save GeneratedPaper to MongoDB
        └── Enqueue → pdfQueue

pdfQueue
  └── compilePDF job
        ├── Fetch assignment + paper from MongoDB
        ├── Call PDFService.generateExamPaperPDF() (PDFKit)
        ├── Save PDF to public/pdfs/
        ├── Update paper.pdfUrl in MongoDB
        ├── Update assignment.status = "completed"
        └── Emit "completed" via Socket.IO
```

Job retry config: 3 attempts, exponential backoff (1s base delay).

---

## Resilience

The system runs fully without any external services:

| Service | Fallback |
|---------|---------|
| MongoDB | In-memory Map store |
| Redis | In-memory cache with TTL + in-process MockQueue |
| Gemini API | Smart educational mock paper generator |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGODB_URI` | `mongodb://localhost:27017/veda-ai` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini API key (optional) |
| `NODE_ENV` | `development` | Environment mode |

---

## Deployment

### Backend (Node.js)
```bash
cd server
npm run build    # compiles TypeScript → dist/
npm start        # runs dist/server.js
```

### Frontend (Static / Cloudflare Workers)
```bash
npm run build    # Vite build → dist/
npm run preview  # preview production build locally
```

The frontend is configured for Cloudflare Workers deployment via `wrangler.jsonc`.

---

## Assignment Compliance Checklist

- [x] Assignment creation form with validation
- [x] File upload dropzone (UI)
- [x] Due date field
- [x] Question types + counts + marks
- [x] Additional instructions
- [x] Zod validation (no empty fields, no negative values)
- [x] Zustand state management
- [x] WebSocket real-time progress
- [x] Node.js + Express + TypeScript backend
- [x] MongoDB (Mongoose schemas)
- [x] Redis (caching + BullMQ connection)
- [x] BullMQ job queues (generationQueue + pdfQueue)
- [x] Socket.IO real-time updates (8 progress events)
- [x] Structured AI prompt generation
- [x] JSON parsing + Zod validation of AI output
- [x] No raw LLM rendering
- [x] Sections (A/B/C) with titles + instructions
- [x] Difficulty labels (Easy/Moderate/Challenging)
- [x] Marks per question
- [x] Answer key generation
- [x] PDF export (PDFKit, downloadable)
- [x] Regenerate paper action
- [x] Health check endpoint
- [x] Rate limiting
- [x] Request logging
- [x] Graceful shutdown
- [x] Centralized error handling
- [x] Redis + MongoDB reconnection fallbacks
