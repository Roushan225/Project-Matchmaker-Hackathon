import type { Server, Socket } from "socket.io";
import { workspaceRoom, type ClientToServerEvents, type InterServerEvents, type ServerToClientEvents, type SocketData } from "@project-matchmaker/shared";
import { canAccessWorkspace, joinWorkspace } from "../rooms/workspace.js";

type MatchmakerServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type MatchmakerSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerWorkspaceHandlers(io: MatchmakerServer, socket: MatchmakerSocket) {
  socket.on("workspace:join", (projectId, acknowledgement) => {
    if (!canAccessWorkspace(socket, projectId)) return acknowledgement({ ok: false, error: "You cannot access this workspace." });
    joinWorkspace(socket, projectId);
    socket.emit("workspace:joined", projectId);
    acknowledgement({ ok: true });
  });
  socket.on("workspace:leave", (projectId) => socket.leave(workspaceRoom(projectId)));
  socket.on("message:created", (message) => {
    if (!canAccessWorkspace(socket, message.projectId) || message.senderId !== socket.data.userId) return socket.emit("socket:error", "The message does not match your workspace access.");
    io.to(workspaceRoom(message.projectId)).emit("message:created", message);
  });
  socket.on("typing:start", (projectId) => {
    if (canAccessWorkspace(socket, projectId)) socket.to(workspaceRoom(projectId)).emit("typing:changed", { projectId, userId: socket.data.userId, isTyping: true });
  });
  socket.on("typing:stop", (projectId) => {
    if (canAccessWorkspace(socket, projectId)) socket.to(workspaceRoom(projectId)).emit("typing:changed", { projectId, userId: socket.data.userId, isTyping: false });
  });
}
