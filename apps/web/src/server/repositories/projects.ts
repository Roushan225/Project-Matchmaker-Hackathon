import { ObjectId } from "mongodb";
import type { Project } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { ProjectDocument } from "./types";
import { withId } from "./types";

export type HubProjectLink = {
  id: string;
  title: string;
  slug: string;
  status: Project["status"];
  memberCount: number;
  maxTeamSize: number;
};

export async function createProject(document: Omit<ProjectDocument, "_id">) {
  const db = await getDatabase();
  const result = await db
    .collection<ProjectDocument>("projects")
    .insertOne(document as ProjectDocument);
  return { ...document, id: result.insertedId.toHexString() } as Project;
}

export async function findProjectById(projectId: string) {
  if (!ObjectId.isValid(projectId)) return null;
  const db = await getDatabase();
  const document = await db
    .collection<ProjectDocument>("projects")
    .findOne({ _id: new ObjectId(projectId) });
  return document ? (withId(document) as Project) : null;
}

export async function findProjectBySlug(slug: string) {
  const db = await getDatabase();
  const document = await db
    .collection<ProjectDocument>("projects")
    .findOne({ slug });
  return document ? (withId(document) as Project) : null;
}

export async function listRecruitingProjects(limit = 24) {
  const db = await getDatabase();
  const documents = await db
    .collection<ProjectDocument>("projects")
    .find({ status: "recruiting" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return documents.map((document) => withId(document) as Project);
}

export async function listWorkspaceProjectsForUser(userId: string, limit = 8) {
  const db = await getDatabase();
  const documents = await db
    .collection<ProjectDocument>("projects")
    .find({ memberIds: userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .project<
      Pick<
        ProjectDocument,
        "_id" | "title" | "slug" | "status" | "memberIds" | "maxTeamSize"
      >
    >({ title: 1, slug: 1, status: 1, memberIds: 1, maxTeamSize: 1 })
    .toArray();
  return documents.map((document) => ({
    id: document._id.toHexString(),
    title: document.title,
    slug: document.slug,
    status: document.status,
    memberCount: document.memberIds.length,
    maxTeamSize: document.maxTeamSize,
  })) as HubProjectLink[];
}

export async function listCompletedProjectsForUser(userId: string, limit = 12) {
  const db = await getDatabase();
  const documents = await db
    .collection<ProjectDocument>("projects")
    .find({ status: "completed", memberIds: userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
  return documents.map((document) => withId(document) as Project);
}

export async function listProjectsOwnedByUser(ownerId: string) {
  const db = await getDatabase();
  const documents = await db
    .collection<ProjectDocument>("projects")
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .toArray();
  return documents.map((document) => withId(document) as Project);
}

export async function listProjectsByIds(projectIds: string[]) {
  const ids = projectIds
    .filter(ObjectId.isValid)
    .map((projectId) => new ObjectId(projectId));
  if (!ids.length) return [] as Project[];
  const db = await getDatabase();
  const documents = await db
    .collection<ProjectDocument>("projects")
    .find({ _id: { $in: ids } })
    .toArray();
  return documents.map((document) => withId(document) as Project);
}

export async function addProjectMember(projectId: string, userId: string) {
  if (!ObjectId.isValid(projectId)) return false;
  const db = await getDatabase();
  const result = await db
    .collection<ProjectDocument>("projects")
    .updateOne(
      { _id: new ObjectId(projectId), memberIds: { $ne: userId } },
      { $addToSet: { memberIds: userId }, $set: { updatedAt: new Date() } },
    );
  return result.modifiedCount === 1;
}

export async function updateProjectStatus(
  projectId: string,
  ownerId: string,
  status: Project["status"],
) {
  if (!ObjectId.isValid(projectId)) return false;
  const db = await getDatabase();
  const result = await db
    .collection<ProjectDocument>("projects")
    .updateOne(
      { _id: new ObjectId(projectId), ownerId },
      { $set: { status, updatedAt: new Date() } },
    );
  return result.modifiedCount === 1;
}
