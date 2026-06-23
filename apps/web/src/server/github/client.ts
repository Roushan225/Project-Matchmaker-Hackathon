import type { GitHubRepository, GitHubSnapshot } from "@project-matchmaker/shared";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/client";

type GitHubProfileResponse = {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  company: string | null;
  twitter_username: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
};

type GitHubRepositoryResponse = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  fork: boolean;
  updated_at: string;
};

type GitHubOrganizationResponse = {
  login: string;
  description: string | null;
  avatar_url: string;
  url: string;
};

async function getAccessToken(userId: string) {
  if (!ObjectId.isValid(userId)) throw new Error("GitHub account ID is invalid.");
  const db = await getDatabase();
  const account = await db.collection<{ userId: ObjectId; provider: string; access_token?: string }>("accounts").findOne({ userId: new ObjectId(userId), provider: "github" });
  if (!account?.access_token) throw new Error("GitHub access token is not available. Sign in again to refresh it.");
  return account.access_token;
}

async function githubRequest<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GitHub API request failed (${response.status}).`);
  return response.json() as Promise<T>;
}

async function githubPages<T>(path: string, accessToken: string, maxPages = 10) {
  const items: T[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const response = await githubRequest<T[]>(`${path}${separator}per_page=100&page=${page}`, accessToken);
    items.push(...response);
    if (response.length < 100) break;
  }
  return items;
}

export async function fetchGitHubSnapshot(userId: string): Promise<{ profile: GitHubProfileResponse; snapshot: GitHubSnapshot }> {
  const accessToken = await getAccessToken(userId);
  const [profile, repositories] = await Promise.all([
    githubRequest<GitHubProfileResponse>("/user", accessToken),
    githubPages<GitHubRepositoryResponse>("/user/repos?visibility=public&affiliation=owner&sort=updated&direction=desc", accessToken),
  ]);
  const organizations = await githubPages<GitHubOrganizationResponse>(`/users/${encodeURIComponent(profile.login)}/orgs`, accessToken, 1).catch(() => []);

  const mappedRepositories: GitHubRepository[] = repositories.map((repository) => ({
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    url: repository.html_url,
    description: repository.description ?? undefined,
    primaryLanguage: repository.language ?? undefined,
    topics: repository.topics ?? [],
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    openIssues: repository.open_issues_count,
    isFork: repository.fork,
    updatedAt: new Date(repository.updated_at),
  }));

  return {
    profile,
    snapshot: {
      id: profile.id,
      login: profile.login,
      company: profile.company ?? undefined,
      location: profile.location ?? undefined,
      website: profile.blog ?? undefined,
      twitterUsername: profile.twitter_username ?? undefined,
      publicRepos: profile.public_repos,
      publicGists: profile.public_gists,
      followers: profile.followers,
      following: profile.following,
      joinedAt: new Date(profile.created_at),
      organizations: organizations.map((organization) => ({ login: organization.login, name: organization.description ?? undefined, avatarUrl: organization.avatar_url, url: organization.url })),
      languages: [...new Set(mappedRepositories.map((repository) => repository.primaryLanguage).filter((language): language is string => Boolean(language)))].sort(),
      repositories: mappedRepositories,
      syncedAt: new Date(),
    },
  };
}
