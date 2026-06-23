import type { Application, Invitation } from "@project-matchmaker/shared";
import { applicationCreateSchema, invitationCreateSchema, requestDecisionSchema } from "@project-matchmaker/shared";
import { ensureIndexes } from "../db/indexes";
import { findProjectById, addProjectMember } from "../repositories/projects";
import { createApplication, createInvitation, createMembership, findApplication, getApplication, updateApplication } from "../repositories/requests";
import { requireProjectOwner } from "./authorization";
import { AppError } from "./errors";

export async function applyToProject(input: unknown, applicantId: string): Promise<Application> {
  const parsed = applicationCreateSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid application.");
  const project = await findProjectById(parsed.data.projectId);
  if (!project) throw new AppError("Project not found.", 404);
  if (project.ownerId === applicantId || project.memberIds.includes(applicantId)) throw new AppError("You are already a member of this project.", 409);
  if (project.status !== "recruiting" || project.memberIds.length >= project.maxTeamSize) throw new AppError("This project is not accepting new members.", 409);
  if (await findApplication(project.id, applicantId)) throw new AppError("You have already applied to this project.", 409);
  await ensureIndexes();
  const now = new Date();
  return createApplication({ projectId: project.id, applicantId, note: parsed.data.note, status: "pending", createdAt: now, updatedAt: now });
}

export async function inviteToProject(input: unknown, senderId: string): Promise<Invitation> {
  const parsed = invitationCreateSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid invitation.");
  const project = await requireProjectOwner(parsed.data.projectId, senderId);
  if (project.memberIds.length >= project.maxTeamSize) throw new AppError("This team is full.", 409);
  if (project.memberIds.includes(parsed.data.recipientId)) throw new AppError("This developer is already on the team.", 409);
  await ensureIndexes();
  const now = new Date();
  return createInvitation({ projectId: project.id, recipientId: parsed.data.recipientId, senderId, note: parsed.data.note, status: "pending", createdAt: now, updatedAt: now });
}

export async function decideApplication(applicationId: string, input: unknown, ownerId: string) {
  const parsed = requestDecisionSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid decision.");
  const application = await getApplication(applicationId);
  if (!application) throw new AppError("Application not found.", 404);
  const project = await requireProjectOwner(application.projectId, ownerId);
  if (application.status !== "pending") throw new AppError("This application has already been decided.", 409);
  if (parsed.data.status === "accepted") {
    if (project.memberIds.length >= project.maxTeamSize) throw new AppError("This team is already full.", 409);
    const added = await addProjectMember(project.id, application.applicantId);
    if (!added) throw new AppError("Applicant is already a member.", 409);
    await createMembership({ projectId: project.id, userId: application.applicantId, role: "member", joinedAt: new Date() });
  }
  await updateApplication(applicationId, parsed.data.status, ownerId);
}
