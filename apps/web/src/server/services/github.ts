import { ObjectId } from "mongodb";
import { getDatabase } from "../db/client";
import { fetchGitHubSnapshot } from "../github/client";
import { AppError } from "./errors";

export async function syncGitHubData(userId: string) {
  if (!ObjectId.isValid(userId)) throw new AppError("Invalid account.", 400);
  const { profile, snapshot } = await fetchGitHubSnapshot(userId);
  const db = await getDatabase();
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { githubId: String(profile.id), username: profile.login, name: profile.name ?? profile.login, bio: profile.bio ?? "", location: profile.location ?? "", website: profile.blog ?? "", image: profile.avatar_url, githubProfileUrl: profile.html_url, github: snapshot, updatedAt: new Date() } },
  );
  if (!result.matchedCount) throw new AppError("Your account could not be found.", 404);
  return snapshot;
}
