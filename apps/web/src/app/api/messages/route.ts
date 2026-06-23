import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { postChatMessage } from "@/server/services/chat";
import { AppError } from "@/server/services/errors";

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
