import { ObjectId } from "mongodb";
import type { ProjectFeedback } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { ProjectFeedbackDocument } from "./types";
import { withId } from "./types";

export async function findProjectFeedback(projectId: string, userId: string) {
  const db = await getDatabase();
  const document = await db
    .collection<ProjectFeedbackDocument>("projectFeedback")
    .findOne({ projectId, userId });
  return document ? (withId(document) as ProjectFeedback) : null;
}

export async function upsertProjectFeedback(
  document: Omit<ProjectFeedbackDocument, "_id" | "createdAt">,
) {
  const db = await getDatabase();
  const existing = await db
    .collection<ProjectFeedbackDocument>("projectFeedback")
    .findOne({ projectId: document.projectId, userId: document.userId });
  const now = new Date();

  if (existing) {
    await db.collection<ProjectFeedbackDocument>("projectFeedback").updateOne(
      { _id: existing._id },
      {
        $set: {
          rating: document.rating,
          thoughts: document.thoughts,
          highlights: document.highlights,
          improvements: document.improvements,
          updatedAt: now,
        },
      },
    );
    return {
      ...withId(existing),
      rating: document.rating,
      thoughts: document.thoughts,
      highlights: document.highlights,
      improvements: document.improvements,
      updatedAt: now,
    } as ProjectFeedback;
  }

  const feedback = {
    ...document,
    createdAt: now,
  } as Omit<ProjectFeedbackDocument, "_id">;
  const result = await db
    .collection<ProjectFeedbackDocument>("projectFeedback")
    .insertOne(feedback as ProjectFeedbackDocument);
  return { ...feedback, id: result.insertedId.toHexString() } as ProjectFeedback;
}

export async function countProjectFeedback(projectId: string) {
  if (!ObjectId.isValid(projectId)) return 0;
  const db = await getDatabase();
  return db
    .collection<ProjectFeedbackDocument>("projectFeedback")
    .countDocuments({ projectId });
}
