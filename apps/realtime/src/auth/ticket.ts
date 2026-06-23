import { jwtVerify } from "jose";
import type { SocketTicketClaims } from "@project-matchmaker/shared";

const encoder = new TextEncoder();

export async function verifySocketTicket(token: unknown): Promise<SocketTicketClaims> {
  if (typeof token !== "string" || !token) throw new Error("A real-time ticket is required.");
  const secret = process.env.SOCKET_TOKEN_SECRET;
  if (!secret) throw new Error("SOCKET_TOKEN_SECRET is not configured.");
  const { payload } = await jwtVerify(token, encoder.encode(secret));
  if (typeof payload.sub !== "string" || typeof payload.projectId !== "string") throw new Error("The real-time ticket is invalid.");
  return { sub: payload.sub, projectId: payload.projectId };
}
