import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { getWorkspaceResources } from "@/server/services/resources";
import { AppError } from "@/server/services/errors";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
    return NextResponse.json({ resources: await getWorkspaceResources(projectId, user.id) });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load resources." }, { status });
  }
}
