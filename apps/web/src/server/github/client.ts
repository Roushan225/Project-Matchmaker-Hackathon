import { getDatabase } from "../db/client";

type GitHubProfile = { login: string; name: string | null; bio: string | null; location: string | null; blog: string | null; avatar_url: string; html_url: string };

export async function fetchGitHubProfile(userId: string) {
  const db = await getDatabase();
  const account = await db.collection<{ userId: string; provider: string; access_token?: string }>("accounts").findOne({ userId, provider: "github" });
  if (!account?.access_token) throw new Error("GitHub access token is not available. Sign in again to refresh it.");
  const response = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${account.access_token}`, Accept: "application/vnd.github+json" }, cache: "no-store" });
  if (!response.ok) throw new Error("Could not retrieve the GitHub profile.");
  return response.json() as Promise<GitHubProfile>;
}
