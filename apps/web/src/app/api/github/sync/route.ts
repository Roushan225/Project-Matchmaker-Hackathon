import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { syncGitHubData } from "@/server/services/github";
import { AppError } from "@/server/services/errors";

export async function POST() {
  try {
    const user = await requireUser();
    const github = await syncGitHubData(user.id);
    return NextResponse.json({ github });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sync GitHub profile." }, { status });
  }
}
