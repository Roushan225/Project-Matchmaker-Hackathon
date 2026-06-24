import type { WorkspaceAiMessage } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { WorkspaceAiMessageDocument } from "./types";
import { withId } from "./types";

export async function createWorkspaceAiMessage(document: Omit<WorkspaceAiMessageDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<WorkspaceAiMessageDocument>("workspaceAiMessages").insertOne(document as WorkspaceAiMessageDocument);
  return { ...document, id: result.insertedId.toHexString() } as WorkspaceAiMessage;
}

export async function listWorkspaceAiMessages(projectId: string, limit = 40) {
  const db = await getDatabase();
  const documents = await db.collection<WorkspaceAiMessageDocument>("workspaceAiMessages").find({ projectId }).sort({ createdAt: -1 }).limit(limit).toArray();
  return documents.reverse().map((document) => withId(document) as WorkspaceAiMessage);
}
