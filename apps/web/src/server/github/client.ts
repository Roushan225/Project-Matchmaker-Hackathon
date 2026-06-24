import type { GitHubRepository, GitHubSnapshot } from "@project-matchmaker/shared";
import { ObjectId } from "mongodb";
import { getDatabase } from "../db/client";
import { AppError } from "../services/errors";

type GitHubProfileResponse = {
  id: number;
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  avatar_url: string;
  html_url: string;
};

type GraphQLResponse = {
  data?: {
    viewer?: {
      databaseId: number | null;
      login: string;
      name: string | null;
      bio: string | null;
      location: string | null;
      websiteUrl: string | null;
      company: string | null;
      twitterUsername: string | null;
      avatarUrl: string;
      url: string;
      createdAt: string;
      followers: { totalCount: number };
      following: { totalCount: number };
      gists: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number; color: string }> }>;
        };
      };
      repositories: {
        totalCount: number;
        nodes: Array<{
          databaseId: number | null;
          name: string;
          nameWithOwner: string;
          url: string;
          description: string | null;
          primaryLanguage: { name: string } | null;
          repositoryTopics: { nodes: Array<{ topic: { name: string } } | null> };
          stargazerCount: number;
          forkCount: number;
          issues: { totalCount: number };
          isFork: boolean;
          updatedAt: string;
          defaultBranchRef: { target: { history?: { totalCount: number } } | null } | null;
        } | null>;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

type GitHubOrganizationResponse = {
  login: string;
  description: string | null;
  avatar_url: string;
  url: string;
};

const profileQuery = `
  query GitHubProfile($from: DateTime!, $to: DateTime!, $recentFrom: GitTimestamp!) {
    viewer {
      databaseId
      login
      name
      bio
      location
      websiteUrl
      company
      twitterUsername
      avatarUrl
      url
      createdAt
      followers { totalCount }
      following { totalCount }
      gists(privacy: PUBLIC) { totalCount }
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount color } }
        }
      }
      repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC, orderBy: { field: UPDATED_AT, direction: DESC }) {
        totalCount
        nodes {
          databaseId
          name
          nameWithOwner
          url
          description
          primaryLanguage { name }
          repositoryTopics(first: 10) { nodes { topic { name } } }
          stargazerCount
          forkCount
          issues(states: OPEN) { totalCount }
          isFork
          updatedAt
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 1, since: $recentFrom) { totalCount }
              }
            }
          }
        }
      }
    }
  }
`;

async function getAccessToken(userId: string) {
  if (!ObjectId.isValid(userId)) throw new Error("GitHub account ID is invalid.");
  const db = await getDatabase();
  const account = await db.collection<{ userId: ObjectId; provider: string; access_token?: string }>("accounts").findOne({ userId: new ObjectId(userId), provider: "github" });
  if (!account?.access_token) throw new Error("GitHub access token is not available. Sign in again to refresh it.");
  return account.access_token;
}

async function githubGraphqlRequest(accessToken: string, from: Date, to: Date, recentFrom: Date): Promise<NonNullable<GraphQLResponse["data"]>> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ query: profileQuery, variables: { from: from.toISOString(), to: to.toISOString(), recentFrom: recentFrom.toISOString() } }),
    cache: "no-store",
  });

  if (response.status === 401) throw new AppError("GitHub access has expired. Sign in with GitHub again.", 401);
  if (!response.ok) throw new Error(`GitHub GraphQL request failed (${response.status}).`);
  const payload = await response.json() as GraphQLResponse;
  if (payload.errors?.length) throw new Error(`GitHub GraphQL request failed: ${payload.errors[0].message}`);
  const data = payload.data;
  if (!data?.viewer) throw new Error("GitHub did not return a profile.");
  return data;
}

async function fetchPublicOrganizations(login: string, accessToken: string) {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}/orgs?per_page=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) return [] as GitHubOrganizationResponse[];
  return response.json() as Promise<GitHubOrganizationResponse[]>;
}

export async function fetchGitHubSnapshot(userId: string): Promise<{ profile: GitHubProfileResponse; snapshot: GitHubSnapshot }> {
  const accessToken = await getAccessToken(userId);
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);
  const recentFrom = new Date(to);
  recentFrom.setUTCDate(recentFrom.getUTCDate() - 30);
  const data = await githubGraphqlRequest(accessToken, from, to, recentFrom);
  const viewer = data.viewer!;
  const organizations = await fetchPublicOrganizations(viewer.login, accessToken);

  const mappedRepositories: GitHubRepository[] = viewer.repositories.nodes.flatMap((repository) => repository?.databaseId == null ? [] : [{
    id: repository.databaseId,
    name: repository.name,
    fullName: repository.nameWithOwner,
    url: repository.url,
    description: repository.description ?? undefined,
    primaryLanguage: repository.primaryLanguage?.name,
    topics: repository.repositoryTopics.nodes.flatMap((topic) => topic ? [topic.topic.name] : []),
    stars: repository.stargazerCount,
    forks: repository.forkCount,
    openIssues: repository.issues.totalCount,
    isFork: repository.isFork,
    recentCommitCount: repository.defaultBranchRef?.target?.history?.totalCount ?? 0,
    updatedAt: new Date(repository.updatedAt),
  }]);

  return {
    profile: {
      id: viewer.databaseId ?? 0,
      login: viewer.login,
      name: viewer.name,
      bio: viewer.bio,
      location: viewer.location,
      blog: viewer.websiteUrl,
      avatar_url: viewer.avatarUrl,
      html_url: viewer.url,
    },
    snapshot: {
      id: viewer.databaseId ?? 0,
      login: viewer.login,
      company: viewer.company ?? undefined,
      location: viewer.location ?? undefined,
      website: viewer.websiteUrl ?? undefined,
      twitterUsername: viewer.twitterUsername ?? undefined,
      publicRepos: viewer.repositories.totalCount,
      publicGists: viewer.gists.totalCount,
      followers: viewer.followers.totalCount,
      following: viewer.following.totalCount,
      joinedAt: new Date(viewer.createdAt),
      organizations: organizations.map((organization) => ({ login: organization.login, name: organization.description ?? undefined, avatarUrl: organization.avatar_url, url: organization.url })),
      languages: [...new Set(mappedRepositories.map((repository) => repository.primaryLanguage).filter((language): language is string => Boolean(language)))].sort(),
      repositories: mappedRepositories,
      contributionCalendar: {
        totalContributions: viewer.contributionsCollection.contributionCalendar.totalContributions,
        days: viewer.contributionsCollection.contributionCalendar.weeks.flatMap((week) => week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount, color: day.color }))),
      },
      syncedAt: to,
    },
  };
}
