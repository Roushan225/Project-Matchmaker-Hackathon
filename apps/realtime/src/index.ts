import { config } from "dotenv";
import { createServer, type IncomingMessage } from "node:http";
import { Server } from "socket.io";
import { userRoom, type ClientToServerEvents, type InterServerEvents, type ServerToClientEvents, type SmartNotification, type SocketData } from "@project-matchmaker/shared";
import { verifySocketTicket } from "./auth/ticket.js";
import { registerWorkspaceHandlers } from "./handlers/workspace.js";
import { logConnection } from "./middleware/logger.js";

config({ path: "../../.env.local" });

const port = Number(process.env.PORT ?? process.env.REALTIME_PORT ?? 4000);
const origins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}") as unknown;
}

let io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const httpServer = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/notify") {
    response.writeHead(404).end();
    return;
  }

  try {
    const authorization = request.headers.authorization ?? "";
    const expected = process.env.SOCKET_TOKEN_SECRET;
    if (!expected || authorization !== `Bearer ${expected}`) {
      response.writeHead(401, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Unauthorized." }));
      return;
    }

    const payload = await readJson(request) as { userId?: string; notification?: SmartNotification };
    if (!payload.userId || !payload.notification) {
      response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Invalid notification payload." }));
      return;
    }

    io.to(userRoom(payload.userId)).emit("notification:new", payload.notification);
    response.writeHead(202, { "Content-Type": "application/json" }).end(JSON.stringify({ ok: true }));
  } catch {
    response.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Invalid notification payload." }));
  }
});

io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, { cors: { origin: origins, methods: ["GET", "POST"] } });

io.use(async (socket, next) => {
  try {
    const ticket = await verifySocketTicket(socket.handshake.auth.token);
    socket.data.userId = ticket.sub;
    socket.data.allowedProjectId = ticket.projectId;
    socket.data.scope = ticket.scope;
    next();
  } catch (error) {
    next(new Error(error instanceof Error ? error.message : "Socket authentication failed."));
  }
});

io.on("connection", (socket) => { socket.join(userRoom(socket.data.userId)); logConnection(socket); registerWorkspaceHandlers(io, socket); });
httpServer.listen(port, () => console.info(`[realtime] Socket.IO service listening on :${port}`));
