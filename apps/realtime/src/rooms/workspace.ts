import type { Socket } from "socket.io";
import { workspaceRoom, type ClientToServerEvents, type InterServerEvents, type ServerToClientEvents, type SocketData } from "@project-matchmaker/shared";

type MatchmakerSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function canAccessWorkspace(socket: MatchmakerSocket, projectId: string) {
  return socket.data.allowedProjectId === projectId;
}

export function joinWorkspace(socket: MatchmakerSocket, projectId: string) {
  socket.join(workspaceRoom(projectId));
}
