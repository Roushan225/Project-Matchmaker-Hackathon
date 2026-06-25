import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { socketTicketRequestSchema } from "@project-matchmaker/shared";
import { requireUser } from "@/server/require-user";
import { requireWorkspaceMember } from "@/server/services/authorization";

const encoder = new TextEncoder();

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = socketTicketRequestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid real-time ticket request." }, { status: 400 });
    const scope = parsed.data.scope ?? (parsed.data.projectId ? "workspace" : "notifications");
    if (scope === "workspace") {
      if (!parsed.data.projectId) return NextResponse.json({ error: "A project is required." }, { status: 400 });
      await requireWorkspaceMember(parsed.data.projectId, user.id);
    }
    const secret = process.env.SOCKET_TOKEN_SECRET;
    if (!secret) return NextResponse.json({ error: "Real-time messaging is not configured." }, { status: 503 });
    const token = await new SignJWT({ projectId: parsed.data.projectId, scope }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("5m").sign(encoder.encode(secret));
    return NextResponse.json({ token });
  } catch (error) {
    const status = error instanceof Error && error.message.includes("access") ? 403 : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create real-time ticket." }, { status });
  }
}
