import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { getChatMessages, postChatMessage } from "@/server/services/chat";
import { AppError } from "@/server/services/errors";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") ?? "";
    const channel = searchParams.get("channel") === "team" ? "team" : "discussion";
    const messages = await getChatMessages(projectId, user.id, channel);
    return NextResponse.json({ messages });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load messages." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const message = await postChatMessage(await request.json(), user.id);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save message." }, { status });
  }
}
