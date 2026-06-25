import type { ChatMessage, SmartNotification } from "../domain";

export interface ClientToServerEvents {
  "workspace:join": (projectId: string, acknowledgement: Ack) => void;
  "workspace:leave": (projectId: string) => void;
  "message:created": (message: ChatMessage) => void;
  "typing:start": (projectId: string) => void;
  "typing:stop": (projectId: string) => void;
}

export interface ServerToClientEvents {
  "workspace:joined": (projectId: string) => void;
  "message:created": (message: ChatMessage) => void;
  "notification:new": (notification: SmartNotification) => void;
  "typing:changed": (payload: { projectId: string; userId: string; isTyping: boolean }) => void;
  "socket:error": (message: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  allowedProjectId?: string;
  scope?: "workspace" | "notifications";
}

export type Ack = (response: { ok: boolean; error?: string }) => void;

export const workspaceRoom = (projectId: string) => `workspace:${projectId}`;
export const userRoom = (userId: string) => `user:${userId}`;
