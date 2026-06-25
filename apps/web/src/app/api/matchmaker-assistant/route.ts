import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { askPersonalAssistant, getPersonalAssistantMessages } from "@/server/services/personal-assistant";
import { AppError } from "@/server/services/errors";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({ messages: await getPersonalAssistantMessages(user.id) });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load Matchmaker Assistant." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    return NextResponse.json(await askPersonalAssistant(await request.json(), user.id), { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not contact Matchmaker Assistant." }, { status });
  }
}
