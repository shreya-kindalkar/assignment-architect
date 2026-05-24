import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | null = null;

export type WebSocketEvent =
  | "job_started"
  | "validating"
  | "generating_sections"
  | "generating_questions"
  | "generating_answers"
  | "formatting_output"
  | "generating_pdf"
  | "completed"
  | "failed";

export interface ProgressPayload {
  assignmentId: string;
  event: WebSocketEvent;
  message: string;
  progress: number; // 0 to 100
  data?: any;
}

export function initSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust for specific production frontend origins
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Client joins a specific assignment room for live progress streaming
    socket.on("join_assignment", (assignmentId: string) => {
      console.log(`[Socket.IO] Client ${socket.id} joined room: assignment:${assignmentId}`);
      socket.join(`assignment:${assignmentId}`);
    });

    socket.on("leave_assignment", (assignmentId: string) => {
      console.log(`[Socket.IO] Client ${socket.id} left room: assignment:${assignmentId}`);
      socket.leave(`assignment:${assignmentId}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Emits a real-time progress update to the WebSocket clients connected to the assignment room.
 */
export function emitProgress(
  assignmentId: string,
  event: WebSocketEvent,
  message: string,
  progress: number,
  data?: any
): void {
  if (!io) {
    console.log(`[Socket.IO Mock] Local progress: [${event}] ${message} (${progress}%) for Assignment ${assignmentId}`);
    return;
  }
  
  const payload: ProgressPayload = {
    assignmentId,
    event,
    message,
    progress,
    data
  };

  console.log(`[Socket.IO Broadcast] Emitting [${event}] (${progress}%) to assignment:${assignmentId}`);
  io.to(`assignment:${assignmentId}`).emit("progress", payload);
}
