import { NextResponse } from "next/server";
import { listRecruitingProjects } from "@/server/repositories/projects";
import { createProjectForUser } from "@/server/services/projects";
import { AppError } from "@/server/services/errors";
import { requireUser } from "@/server/require-user";

export async function GET() {
  const projects = await listRecruitingProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const project = await createProjectForUser(await request.json(), user.id);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create project." }, { status });
  }
}
