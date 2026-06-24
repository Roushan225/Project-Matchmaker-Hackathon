import type { WorkspaceResource } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { WorkspaceResourceDocument } from "./types";
import { withId } from "./types";

export async function createWorkspaceResource(document: Omit<WorkspaceResourceDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<WorkspaceResourceDocument>("workspaceResources").insertOne(document as WorkspaceResourceDocument);
  return { ...document, id: result.insertedId.toHexString() } as WorkspaceResource;
}

export async function listWorkspaceResources(projectId: string) {
  const db = await getDatabase();
  const documents = await db.collection<WorkspaceResourceDocument>("workspaceResources").find({ projectId }).sort({ createdAt: -1 }).toArray();
  return documents.map((document) => withId(document) as WorkspaceResource);
}
