import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { changeAvailability } from "@/server/services/profile";
import { AppError } from "@/server/services/errors";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const availability = await changeAvailability(await request.json(), user.id);
    return NextResponse.json({ availability });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update availability." }, { status });
  }
}
