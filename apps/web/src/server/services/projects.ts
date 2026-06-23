import type { Project } from "@project-matchmaker/shared";
import { projectCreateSchema } from "@project-matchmaker/shared";
import { ensureIndexes } from "../db/indexes";
import { createProject } from "../repositories/projects";
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
