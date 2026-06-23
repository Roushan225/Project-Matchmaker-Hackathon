import { ObjectId, type UpdateFilter } from "mongodb";
import { getDatabase } from "../db/client";
import type { WorkspaceTask, WorkspaceTaskDocument } from "./types";
import { withId } from "./types";

export async function createTask(document: Omit<WorkspaceTaskDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<WorkspaceTaskDocument>("workspaceTasks").insertOne(document as WorkspaceTaskDocument);
  return { ...document, id: result.insertedId.toHexString() } as WorkspaceTask;
}

export async function listTasks(projectId: string) {
  const db = await getDatabase();
  const tasks = await db.collection<WorkspaceTaskDocument>("workspaceTasks").find({ projectId }).sort({ completed: 1, updatedAt: -1 }).toArray();
  return tasks.map((task) => withId(task) as WorkspaceTask);
}

export async function getTask(taskId: string) {
  if (!ObjectId.isValid(taskId)) return null;
  const db = await getDatabase();
  const task = await db.collection<WorkspaceTaskDocument>("workspaceTasks").findOne({ _id: new ObjectId(taskId) });
  return task ? withId(task) as WorkspaceTask : null;
}

export async function updateTask(taskId: string, updates: Partial<Omit<WorkspaceTask, "id" | "projectId" | "createdById" | "createdAt">>) {
  if (!ObjectId.isValid(taskId)) return null;
  const db = await getDatabase();
  const { completedAt, ...rest } = updates;
  const updatedAt = new Date();
  const updateDocument: UpdateFilter<WorkspaceTaskDocument> = completedAt
    ? { $set: { ...rest, updatedAt, completedAt } }
    : { $set: { ...rest, updatedAt }, $unset: { completedAt: "" } };
  await db.collection<WorkspaceTaskDocument>("workspaceTasks").updateOne(
    { _id: new ObjectId(taskId) },
    updateDocument,
  );
  return getTask(taskId);
}
