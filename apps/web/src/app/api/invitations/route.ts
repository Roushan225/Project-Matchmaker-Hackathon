import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { getRequestInbox, inviteToProject, listInviteOptions } from "@/server/services/requests";
import { AppError } from "@/server/services/errors";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const recipientId = new URL(request.url).searchParams.get("recipientId") ?? "";
    if (!recipientId) return NextResponse.json(await getRequestInbox(user.id));
    return NextResponse.json({ projects: await listInviteOptions(user.id, recipientId) });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load invitation options." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const invitation = await inviteToProject(await request.json(), user.id);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send invitation." }, { status });
  }
}
