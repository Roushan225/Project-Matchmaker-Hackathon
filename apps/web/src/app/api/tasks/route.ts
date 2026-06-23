import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { AppError } from "@/server/services/errors";
import { createWorkspaceTask, getWorkspaceTasks } from "@/server/services/tasks";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") ?? "";
    const tasks = await getWorkspaceTasks(projectId, user.id);
    return NextResponse.json({ tasks });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load tasks." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const task = await createWorkspaceTask(await request.json(), user.id);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create task." }, { status });
  }
}
