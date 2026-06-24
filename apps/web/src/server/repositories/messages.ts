import type { ChatMessage } from "@project-matchmaker/shared";
import type { Filter } from "mongodb";
import { getDatabase } from "../db/client";
import type { ChatMessageDocument } from "./types";
import { withId } from "./types";

export async function createMessage(document: Omit<ChatMessageDocument, "_id">) {
  const db = await getDatabase();
  const result = await db.collection<ChatMessageDocument>("chatMessages").insertOne(document as ChatMessageDocument);
  return { ...document, id: result.insertedId.toHexString() } as ChatMessage;
}

export async function listMessages(projectId: string, limit = 50, channel: "team" | "discussion" = "discussion") {
  const db = await getDatabase();
  const filter: Filter<ChatMessageDocument> = channel === "discussion"
    ? { projectId, $or: [{ channel: "discussion" }, { channel: { $exists: false } }] }
    : { projectId, channel: "team" };
  const messages = await db.collection<ChatMessageDocument>("chatMessages").find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  return messages.reverse().map((message) => withId(message) as ChatMessage);
}
