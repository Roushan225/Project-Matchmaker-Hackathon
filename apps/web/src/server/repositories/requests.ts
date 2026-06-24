import { ObjectId } from "mongodb";
import type { Application, Invitation, WorkspaceMembership } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { ApplicationDocument, InvitationDocument, WorkspaceMembershipDocument } from "./types";
import { withId } from "./types";

export async function findApplication(projectId: string, applicantId: string) {
  const db = await getDatabase();
  const document = await db.collection<ApplicationDocument>("applications").findOne({ projectId, applicantId });
  return document ? withId(document) as Application : null;
}

export async function findInvitation(projectId: string, recipientId: string) {
  const db = await getDatabase();
  const document = await db.collection<InvitationDocument>("invitations").findOne({ projectId, recipientId });
  return document ? withId(document) as Invitation : null;
}

export async function listInvitationStatuses(projectIds: string[], recipientId: string) {
  if (!projectIds.length) return new Map<string, Invitation["status"]>();
  const db = await getDatabase();
  const documents = await db.collection<InvitationDocument>("invitations").find({ projectId: { $in: projectIds }, recipientId }).toArray();
  return new Map(documents.map((document) => [document.projectId, document.status]));
}

export async function listInvitationsForRecipient(recipientId: string) {
  const db = await getDatabase();
  const documents = await db.collection<InvitationDocument>("invitations").find({ recipientId }).sort({ createdAt: -1 }).toArray();
  return documents.map((document) => withId(document) as Invitation);
}

export async function listInvitationsForSender(senderId: string) {
  const db = await getDatabase();
  const documents = await db.collection<InvitationDocument>("invitations").find({ senderId }).sort({ createdAt: -1 }).toArray();
  return documents.map((document) => withId(document) as Invitation);
}

export async function getInvitation(invitationId: string) {
  if (!ObjectId.isValid(invitationId)) return null;
  const db = await getDatabase();
  const document = await db.collection<InvitationDocument>("invitations").findOne({ _id: new ObjectId(invitationId) });
  return document ? withId(document) as Invitation : null;
}

export async function updateInvitation(invitationId: string, status: Invitation["status"], actedBy: string) {
  if (!ObjectId.isValid(invitationId)) return;
  const db = await getDatabase();
  await db.collection<InvitationDocument>("invitations").updateOne({ _id: new ObjectId(invitationId) }, { $set: { status, actedBy, updatedAt: new Date() } });
}

export async function listApplicationsForProjects(projectIds: string[]) {
  if (!projectIds.length) return [] as Application[];
  const db = await getDatabase();
  const documents = await db.collection<ApplicationDocument>("applications").find({ projectId: { $in: projectIds } }).sort({ createdAt: -1 }).toArray();
  return documents.map((document) => withId(document) as Application);
}

export async function createApplication(document: Omit<ApplicationDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<ApplicationDocument>("applications").insertOne(document as ApplicationDocument);
  return { ...document, id: result.insertedId.toHexString() } as Application;
}

export async function getApplication(applicationId: string) {
  if (!ObjectId.isValid(applicationId)) return null;
  const db = await getDatabase();
  const document = await db.collection<ApplicationDocument>("applications").findOne({ _id: new ObjectId(applicationId) });
  return document ? withId(document) as Application : null;
}

export async function updateApplication(applicationId: string, status: Application["status"], actedBy: string) {
  const db = await getDatabase();
  await db.collection<ApplicationDocument>("applications").updateOne({ _id: new ObjectId(applicationId) }, { $set: { status, actedBy, updatedAt: new Date() } });
}

export async function createInvitation(document: Omit<InvitationDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<InvitationDocument>("invitations").insertOne(document as InvitationDocument);
  return { ...document, id: result.insertedId.toHexString() } as Invitation;
}

export async function createMembership(document: Omit<WorkspaceMembershipDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<WorkspaceMembershipDocument>("workspaceMemberships").insertOne(document as WorkspaceMembershipDocument);
  return { ...document, id: result.insertedId.toHexString() } as WorkspaceMembership;
}

export async function hasMembership(projectId: string, userId: string) {
  const db = await getDatabase();
  return Boolean(await db.collection<WorkspaceMembershipDocument>("workspaceMemberships").findOne({ projectId, userId }));
}
