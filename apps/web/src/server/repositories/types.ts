import type { ObjectId } from "mongodb";
import type { Application, ChatMessage, Invitation, Project, UserProfile, WorkspaceMembership } from "@project-matchmaker/shared";

export type Stored<T> = Omit<T, "id"> & { _id: ObjectId };
export type UserDocument = Stored<UserProfile>;
export type ProjectDocument = Stored<Project>;
export type ApplicationDocument = Stored<Application>;
export type InvitationDocument = Stored<Invitation>;
export type WorkspaceMembershipDocument = Stored<WorkspaceMembership>;
export type ChatMessageDocument = Stored<ChatMessage>;

export function withId<T extends { _id: ObjectId }>(document: T): Omit<T, "_id"> & { id: string } {
  const { _id, ...rest } = document;
  return { ...rest, id: _id.toHexString() };
}
