import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { applyToProject } from "@/server/services/requests";
import { AppError } from "@/server/services/errors";

export async function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const user = await requireUser();
    const { projectId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const application = await applyToProject({ ...body, projectId }, user.id);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not apply to the project." }, { status });
  }
}
