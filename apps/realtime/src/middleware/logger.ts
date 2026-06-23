import type { Socket } from "socket.io";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "@project-matchmaker/shared";

type MatchmakerSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function logConnection(socket: MatchmakerSocket) {
  console.info(`[realtime] connected user=${socket.data.userId} socket=${socket.id}`);
  socket.on("disconnect", (reason) => console.info(`[realtime] disconnected user=${socket.data.userId} reason=${reason}`));
}
