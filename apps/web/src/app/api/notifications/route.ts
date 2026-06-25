import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { getSmartNotificationInbox, markSmartNotification } from "@/server/services/notifications";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json(await getSmartNotificationInbox(user.id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load notifications." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await markSmartNotification(user.id, body.notificationId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update notifications." }, { status: 500 });
  }
}
