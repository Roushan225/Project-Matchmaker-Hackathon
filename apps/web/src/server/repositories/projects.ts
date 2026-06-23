import { ObjectId } from "mongodb";
import type { Project } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { ProjectDocument } from "./types";
import { withId } from "./types";

export type HubProjectLink = {
  id: string;
  title: string;
  slug: string;
};

export async function createProject(document: Omit<ProjectDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<ProjectDocument>("projects").insertOne(document as ProjectDocument);
  return { ...document, id: result.insertedId.toHexString() } as Project;
}

export async function findProjectById(projectId: string) {
  if (!ObjectId.isValid(projectId)) return null;
  const db = await getDatabase();
  const document = await db.collection<ProjectDocument>("projects").findOne({ _id: new ObjectId(projectId) });
  return document ? withId(document) as Project : null;
}

export async function findProjectBySlug(slug: string) {
  const db = await getDatabase();
  const document = await db.collection<ProjectDocument>("projects").findOne({ slug });
  return document ? withId(document) as Project : null;
}

export async function listRecruitingProjects(limit = 24) {
  const db = await getDatabase();
  const documents = await db.collection<ProjectDocument>("projects").find({ status: "recruiting" }).sort({ createdAt: -1 }).limit(limit).toArray();
  return documents.map((document) => withId(document) as Project);
}

export async function listWorkspaceProjectsForUser(userId: string, limit = 8) {
  const db = await getDatabase();
  const documents = await db.collection<ProjectDocument>("projects")
    .find({ memberIds: userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .project<Pick<ProjectDocument, "_id" | "title" | "slug">>({ title: 1, slug: 1 })
    .toArray();
  return documents.map((document) => ({ id: document._id.toHexString(), title: document.title, slug: document.slug })) as HubProjectLink[];
}

export async function addProjectMember(projectId: string, userId: string) {
  if (!ObjectId.isValid(projectId)) return false;
  const db = await getDatabase();
  const result = await db.collection<ProjectDocument>("projects").updateOne({ _id: new ObjectId(projectId), memberIds: { $ne: userId } }, { $addToSet: { memberIds: userId }, $set: { updatedAt: new Date() } });
  return result.modifiedCount === 1;
}
