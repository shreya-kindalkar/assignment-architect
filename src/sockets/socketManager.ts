/**
 * WebSocket manager — wraps socket.io-client with typed events.
 * Used by the Zustand store; never instantiated directly in components.
 */
import { io, type Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/constants";
import type { ProgressPayload } from "@/types/api";

type ProgressHandler = (payload: ProgressPayload) => void;
type DisconnectHandler = () => void;

class SocketManager {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;

  /** Connect and join an assignment room. */
  connect(
    assignmentId: string,
    onProgress: ProgressHandler,
    onDisconnect?: DisconnectHandler
  ): void {
    // Tear down any existing connection first
    this.disconnect();

    console.log(`[SocketManager] Connecting for assignment: ${assignmentId}`);
    this.socket = io(SOCKET_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log(`[SocketManager] Connected (${this.socket?.id}). Joining room.`);
      this.socket?.emit("join_assignment", assignmentId);
      this.currentRoomId = assignmentId;
    });

    this.socket.on("progress", (payload: ProgressPayload) => {
      if (payload.assignmentId !== assignmentId) return;
      console.log(`[SocketManager] Progress: [${payload.event}] ${payload.progress}%`);
      onProgress(payload);
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`[SocketManager] Disconnected: ${reason}`);
      onDisconnect?.();
    });

    this.socket.on("connect_error", (err) => {
      console.warn(`[SocketManager] Connection error: ${err.message}`);
    });
  }

  /** Leave the current room and disconnect. */
  disconnect(): void {
    if (this.socket) {
      if (this.currentRoomId) {
        this.socket.emit("leave_assignment", this.currentRoomId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
      console.log("[SocketManager] Disconnected and cleaned up.");
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton — one socket connection at a time across the app
export const socketManager = new SocketManager();
