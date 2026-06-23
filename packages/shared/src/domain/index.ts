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
  githubProfileUrl: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
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
