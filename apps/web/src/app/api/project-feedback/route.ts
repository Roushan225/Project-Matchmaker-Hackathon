import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import {
  getProjectFeedbackState,
  submitProjectFeedback,
} from "@/server/services/project-feedback";
import { AppError } from "@/server/services/errors";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const projectId = new URL(request.url).searchParams.get("projectId") ?? "";
    return NextResponse.json(await getProjectFeedbackState(projectId, user.id));
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load feedback." },
      { status },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    return NextResponse.json(
      { feedback: await submitProjectFeedback(await request.json(), user.id) },
      { status: 201 },
    );
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save feedback." },
      { status },
    );
  }
}
