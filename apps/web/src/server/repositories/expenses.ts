import type { WorkspaceExpense } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { WorkspaceExpenseDocument } from "./types";
import { withId } from "./types";

export async function createWorkspaceExpense(document: Omit<WorkspaceExpenseDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<WorkspaceExpenseDocument>("workspaceExpenses").insertOne(document as WorkspaceExpenseDocument);
  return { ...document, id: result.insertedId.toHexString() } as WorkspaceExpense;
}

export async function listWorkspaceExpenses(projectId: string) {
  const db = await getDatabase();
  const documents = await db.collection<WorkspaceExpenseDocument>("workspaceExpenses").find({ projectId }).sort({ createdAt: -1 }).toArray();
  return documents.map((document) => withId(document) as WorkspaceExpense);
}
