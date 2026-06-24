import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { changeProjectStatus } from "@/server/services/projects";
import { AppError } from "@/server/services/errors";

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireUser();
    const { projectId } = await context.params;
    const status = await changeProjectStatus(projectId, await request.json(), user.id);
    return NextResponse.json({ status });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update project status." }, { status });
  }
}
