import { ObjectId } from "mongodb";
import type { UserProfile } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { UserDocument } from "./types";
import { withId } from "./types";

export async function findProfileById(userId: string) {
  if (!ObjectId.isValid(userId)) return null;
  const db = await getDatabase();
  const document = await db.collection<UserDocument>("users").findOne({ _id: new ObjectId(userId) });
  return document ? withId(document) as UserProfile : null;
}

export async function listDiscoverableProfiles(limit = 30) {
  const db = await getDatabase();
  const documents = await db.collection<UserDocument>("users").find({ discoverable: true }).sort({ updatedAt: -1 }).limit(limit).toArray();
  return documents.map((document) => withId(document) as UserProfile);
}
