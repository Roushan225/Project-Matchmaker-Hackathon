import type { WorkspaceExpense } from "@project-matchmaker/shared";
import { workspaceExpenseCreateSchema } from "@project-matchmaker/shared";
import { createWorkspaceExpense, listWorkspaceExpenses } from "../repositories/expenses";
import { requireWorkspaceMember } from "./authorization";
import { AppError } from "./errors";

export async function getWorkspaceExpenses(projectId: string, userId: string) {
  await requireWorkspaceMember(projectId, userId);
  return listWorkspaceExpenses(projectId);
}

export async function addWorkspaceExpense(input: unknown, userId: string): Promise<WorkspaceExpense> {
  const parsed = workspaceExpenseCreateSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Invalid expense.");
  await requireWorkspaceMember(parsed.data.projectId, userId);
  return createWorkspaceExpense({ ...parsed.data, paidById: userId, createdAt: new Date() });
}
