import type { PersonalAssistantMessage } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { PersonalAssistantMessageDocument } from "./types";
import { withId } from "./types";

export async function createPersonalAssistantMessage(document: Omit<PersonalAssistantMessageDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<PersonalAssistantMessageDocument>("personalAssistantMessages").insertOne(document as PersonalAssistantMessageDocument);
  return { ...document, id: result.insertedId.toHexString() } as PersonalAssistantMessage;
}

export async function listPersonalAssistantMessages(userId: string, limit = 30) {
  const db = await getDatabase();
  const documents = await db.collection<PersonalAssistantMessageDocument>("personalAssistantMessages").find({ userId }).sort({ createdAt: -1 }).limit(limit).toArray();
  return documents.reverse().map((document) => withId(document) as PersonalAssistantMessage);
}
