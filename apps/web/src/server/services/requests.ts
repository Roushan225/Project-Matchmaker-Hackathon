import type { Application, Invitation } from "@project-matchmaker/shared";
import { applicationCreateSchema, invitationCreateSchema, requestDecisionSchema } from "@project-matchmaker/shared";
import { ensureIndexes } from "../db/indexes";
import { findProjectById, addProjectMember, listProjectsByIds, listProjectsOwnedByUser } from "../repositories/projects";
import { createApplication, createInvitation, createMembership, findApplication, findInvitation, getApplication, getInvitation, listApplicationsForProjects, listInvitationStatuses, listInvitationsForRecipient, listInvitationsForSender, updateApplication, updateInvitation } from "../repositories/requests";
import { listProfilesByIds } from "../repositories/users";
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
  if (await findInvitation(project.id, parsed.data.recipientId)) throw new AppError("This developer has already been invited to this project.", 409);
  await ensureIndexes();
  const now = new Date();
  return createInvitation({ projectId: project.id, recipientId: parsed.data.recipientId, senderId, note: parsed.data.note, status: "pending", createdAt: now, updatedAt: now });
}

export async function listInviteOptions(senderId: string, recipientId: string) {
  const projects = await listProjectsOwnedByUser(senderId);
  const invitationStatuses = await listInvitationStatuses(projects.map((project) => project.id), recipientId);
  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    status: project.status,
    memberCount: project.memberIds.length,
    maxTeamSize: project.maxTeamSize,
    invitationStatus: invitationStatuses.get(project.id) ?? "not-sent",
    canInvite: project.memberIds.length < project.maxTeamSize && !project.memberIds.includes(recipientId) && !invitationStatuses.has(project.id),
  }));
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

export async function decideInvitation(invitationId: string, input: unknown, recipientId: string) {
  const parsed = requestDecisionSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid decision.");
  const invitation = await getInvitation(invitationId);
  if (!invitation) throw new AppError("Invitation not found.", 404);
  if (invitation.recipientId !== recipientId) throw new AppError("Only the invited developer can respond.", 403);
  if (invitation.status !== "pending") throw new AppError("This invitation has already been decided.", 409);
  const project = await findProjectById(invitation.projectId);
  if (!project) throw new AppError("Project not found.", 404);
  if (parsed.data.status === "accepted") {
    if (project.memberIds.length >= project.maxTeamSize) throw new AppError("This team is already full.", 409);
    const added = await addProjectMember(project.id, recipientId);
    if (!added) throw new AppError("You are already a member of this project.", 409);
    await createMembership({ projectId: project.id, userId: recipientId, role: "member", joinedAt: new Date() });
  }
  await updateInvitation(invitationId, parsed.data.status, recipientId);
}

export async function getRequestInbox(userId: string) {
  const [ownedProjects, invitations, sentInvitations] = await Promise.all([listProjectsOwnedByUser(userId), listInvitationsForRecipient(userId), listInvitationsForSender(userId)]);
  const applications = await listApplicationsForProjects(ownedProjects.map((project) => project.id));
  const referencedProjectIds = [...new Set([...invitations.map((invitation) => invitation.projectId), ...sentInvitations.map((invitation) => invitation.projectId), ...applications.map((application) => application.projectId)])];
  const projects = [...ownedProjects, ...(await listProjectsByIds(referencedProjectIds.filter((projectId) => !ownedProjects.some((project) => project.id === projectId))))];
  const profiles = await listProfilesByIds([...new Set([...invitations.map((invitation) => invitation.senderId), ...sentInvitations.map((invitation) => invitation.recipientId), ...applications.map((application) => application.applicantId)])]);
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  return {
    invitations: invitations.map((invitation) => ({ ...invitation, projectTitle: projectById.get(invitation.projectId)?.title ?? "Unknown project", senderName: profileById.get(invitation.senderId)?.name ?? "Project owner" })),
    sentInvitations: sentInvitations.map((invitation) => ({ ...invitation, projectTitle: projectById.get(invitation.projectId)?.title ?? "Unknown project", recipientName: profileById.get(invitation.recipientId)?.name ?? "Developer", recipientUsername: profileById.get(invitation.recipientId)?.username ?? "developer" })),
    applications: applications.map((application) => ({ ...application, projectTitle: projectById.get(application.projectId)?.title ?? "Unknown project", applicantName: profileById.get(application.applicantId)?.name ?? "Developer", applicantUsername: profileById.get(application.applicantId)?.username ?? "developer" })),
  };
}
