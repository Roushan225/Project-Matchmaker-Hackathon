import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { completeUserOnboarding } from "@/server/services/onboarding";
import { AppError } from "@/server/services/errors";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    await completeUserOnboarding(await request.json(), user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save your profile." }, { status });
  }
}
