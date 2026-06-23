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
