import { NextResponse } from "next/server";
import { requireUser } from "@/server/require-user";
import { syncGitHubData } from "@/server/services/github";

export async function POST() {
  try {
    const user = await requireUser();
    const github = await syncGitHubData(user.id);
    return NextResponse.json({ github });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sync GitHub profile." }, { status: 500 });
  }
}
