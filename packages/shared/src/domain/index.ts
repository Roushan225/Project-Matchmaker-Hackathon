import {
  AVAILABILITY_STATUSES,
  MEMBER_ROLES,
  PROJECT_STATUSES,
  REQUEST_STATUSES,
} from "../constants";

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
export type WorkspaceRole = (typeof MEMBER_ROLES)[number];

export interface UserProfile {
  id: string;
  githubId: string;
  username: string;
  name: string;
  email?: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  techStack: string[];
  roles: string[];
  headline?: string;
  projectInterests: string[];
  weeklyAvailability: "1-3" | "4-7" | "8-12" | "12+";
  availability: AvailabilityStatus;
  discoverable: boolean;
  onboardingCompleted: boolean;
  github?: GitHubSnapshot;
  githubProfileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description?: string;
  primaryLanguage?: string;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  isFork: boolean;
  recentCommitCount: number;
  updatedAt: Date;
}

export interface GitHubContributionDay {
  date: string;
  count: number;
  color: string;
}

export interface GitHubSnapshot {
  id: number;
  login: string;
  company?: string;
  location?: string;
  website?: string;
  twitterUsername?: string;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  joinedAt: Date;
  organizations: Array<{ login: string; name?: string; avatarUrl: string; url: string }>;
  languages: string[];
  repositories: GitHubRepository[];
  contributionCalendar: {
    totalContributions: number;
    days: GitHubContributionDay[];
  };
  syncedAt: Date;
}

export interface Project {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  requiredRoles: string[];
  maxTeamSize: number;
  status: ProjectStatus;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  projectId: string;
  applicantId: string;
  note?: string;
  status: RequestStatus;
  actedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: string;
  projectId: string;
  recipientId: string;
  senderId: string;
  note?: string;
  status: RequestStatus;
  actedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMembership {
  id: string;
  projectId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface WorkspaceResource {
  id: string;
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  bytes: number;
  uploadedById: string;
  createdAt: Date;
}

export interface WorkspaceExpense {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  paidById: string;
  createdAt: Date;
}

export interface WorkspaceAiMessage {
  id: string;
  projectId: string;
  role: "user" | "assistant";
  content: string;
  authorId?: string;
  createdAt: Date;
}

export interface PersonalAssistantMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  channel?: "team" | "discussion";
  createdAt: Date;
  attachment?: {
    name: string;
    url: string;
    mimeType: string;
  };
}

export interface SocketTicketClaims {
  sub: string;
  projectId: string;
}
