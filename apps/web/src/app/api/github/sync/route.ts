import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireUser } from "@/server/require-user";
import { fetchGitHubProfile } from "@/server/github/client";
import { getDatabase } from "@/server/db/client";

export async function POST() {
  try {
    const user = await requireUser();
    const profile = await fetchGitHubProfile(user.id);
    const db = await getDatabase();
    await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { username: profile.login, name: profile.name ?? profile.login, bio: profile.bio ?? "", location: profile.location ?? "", website: profile.blog ?? "", image: profile.avatar_url, githubProfileUrl: profile.html_url, discoverable: true, availability: "available", techStack: [], roles: [], updatedAt: new Date() } });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sync GitHub profile." }, { status: 500 });
  }
}
