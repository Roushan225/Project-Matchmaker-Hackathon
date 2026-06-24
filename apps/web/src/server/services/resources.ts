import type { WorkspaceResource } from "@project-matchmaker/shared";
import { createWorkspaceResource, listWorkspaceResources } from "../repositories/resources";
import { requireWorkspaceMember } from "./authorization";

export async function getWorkspaceResources(projectId: string, userId: string) {
  await requireWorkspaceMember(projectId, userId);
  return listWorkspaceResources(projectId);
}

export async function addWorkspaceResource(resource: Omit<WorkspaceResource, "id" | "createdAt">, userId: string) {
  await requireWorkspaceMember(resource.projectId, userId);
  return createWorkspaceResource({ ...resource, createdAt: new Date() });
}
