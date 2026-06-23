import { z } from "zod";
import { ensureIndexes } from "../db/indexes";
import { getTask, listTasks, createTask, updateTask } from "../repositories/tasks";
import { requireWorkspaceMember } from "./authorization";
import { AppError } from "./errors";

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  assigneeId: z.string().min(1),
});

const updateTaskSchema = z.object({
  completed: z.boolean(),
});

export async function getWorkspaceTasks(projectId: string, userId: string) {
  await requireWorkspaceMember(projectId, userId);
  return listTasks(projectId);
}

export async function createWorkspaceTask(input: unknown, userId: string) {
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Task title and assignee are required.");
  const project = await requireWorkspaceMember(parsed.data.projectId, userId);
  if (!project.memberIds.includes(parsed.data.assigneeId)) throw new AppError("Assignee must be a team member.");
  await ensureIndexes();
  const now = new Date();
  return createTask({
    projectId: parsed.data.projectId,
    title: parsed.data.title,
    assigneeId: parsed.data.assigneeId,
    createdById: userId,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });
}

export async function toggleWorkspaceTask(taskId: string, input: unknown, userId: string) {
  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Task state is invalid.");
  const task = await getTask(taskId);
  if (!task) throw new AppError("Task not found.", 404);
  await requireWorkspaceMember(task.projectId, userId);
  return updateTask(taskId, {
    completed: parsed.data.completed,
    completedAt: parsed.data.completed ? new Date() : undefined,
  });
}
