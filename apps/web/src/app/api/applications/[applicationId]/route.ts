import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { decideApplication } from "@/server/services/requests";
import { AppError } from "@/server/services/errors";

export async function PATCH(request: Request, context: { params: Promise<{ applicationId: string }> }) {
  try {
    const user = await requireUser();
    const { applicationId } = await context.params;
    await decideApplication(applicationId, await request.json(), user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update application." }, { status });
  }
}
