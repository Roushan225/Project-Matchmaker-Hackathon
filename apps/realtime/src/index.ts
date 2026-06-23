import { config } from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "@project-matchmaker/shared";
import { verifySocketTicket } from "./auth/ticket.js";
import { registerWorkspaceHandlers } from "./handlers/workspace.js";
import { logConnection } from "./middleware/logger.js";

config({ path: "../../.env.local" });

const port = Number(process.env.REALTIME_PORT ?? 4000);
const origin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, { cors: { origin, methods: ["GET", "POST"] } });

io.use(async (socket, next) => {
  try {
    const ticket = await verifySocketTicket(socket.handshake.auth.token);
    socket.data.userId = ticket.sub;
    socket.data.allowedProjectId = ticket.projectId;
    next();
  } catch (error) {
    next(new Error(error instanceof Error ? error.message : "Socket authentication failed."));
  }
});

io.on("connection", (socket) => { logConnection(socket); registerWorkspaceHandlers(io, socket); });
httpServer.listen(port, () => console.info(`[realtime] Socket.IO service listening on :${port}`));
