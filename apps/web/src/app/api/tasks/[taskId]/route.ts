import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { AppError } from "@/server/services/errors";
import { toggleWorkspaceTask } from "@/server/services/tasks";

export async function PATCH(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const user = await requireUser();
    const { taskId } = await params;
    const task = await toggleWorkspaceTask(taskId, await request.json(), user.id);
    return NextResponse.json({ task });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update task." }, { status });
  }
}
