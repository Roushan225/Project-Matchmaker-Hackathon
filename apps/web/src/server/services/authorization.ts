import { AppError } from "./errors";
import { findProjectById } from "../repositories/projects";
import { hasMembership } from "../repositories/requests";

export async function requireProjectOwner(projectId: string, userId: string) {
  const project = await findProjectById(projectId);
  if (!project) throw new AppError("Project not found.", 404);
  if (project.ownerId !== userId) throw new AppError("Only the project owner can perform this action.", 403);
  return project;
}

export async function requireWorkspaceMember(projectId: string, userId: string) {
  const project = await findProjectById(projectId);
  if (!project) throw new AppError("Project not found.", 404);
  if (project.ownerId === userId || project.memberIds.includes(userId) || await hasMembership(projectId, userId)) return project;
  throw new AppError("You do not have access to this workspace.", 403);
}
