import type { Project } from "@project-matchmaker/shared";
import { projectCreateSchema, projectStatusUpdateSchema } from "@project-matchmaker/shared";
import { ensureIndexes } from "../db/indexes";
import { createProject, updateProjectStatus } from "../repositories/projects";
import { AppError } from "./errors";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createProjectForUser(input: unknown, ownerId: string): Promise<Project> {
  const parsed = projectCreateSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Invalid project details.");
  await ensureIndexes();
  const now = new Date();
  const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 8)}`;
  return createProject({ ...parsed.data, ownerId, slug, memberIds: [ownerId], createdAt: now, updatedAt: now });
}

export async function changeProjectStatus(projectId: string, input: unknown, ownerId: string) {
  const parsed = projectStatusUpdateSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid project status.");
  const updated = await updateProjectStatus(projectId, ownerId, parsed.data.status);
  if (!updated) throw new AppError("Project not found or you do not own it.", 404);
  return parsed.data.status;
}
