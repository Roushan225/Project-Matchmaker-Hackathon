import { ObjectId } from "mongodb";
import type { SmartNotification } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { SmartNotificationDocument } from "./types";
import { withId } from "./types";

export async function createSmartNotification(
  document: Omit<SmartNotificationDocument, "_id">,
) {
  const db = await getDatabase();
  const result = await db
    .collection<SmartNotificationDocument>("smartNotifications")
    .insertOne(document as SmartNotificationDocument);
  return { ...document, id: result.insertedId.toHexString() } as SmartNotification;
}

export async function listSmartNotifications(userId: string, limit = 20) {
  const db = await getDatabase();
  const documents = await db
    .collection<SmartNotificationDocument>("smartNotifications")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return documents.map((document) => withId(document) as SmartNotification);
}

export async function countUnreadSmartNotifications(userId: string) {
  const db = await getDatabase();
  return db.collection<SmartNotificationDocument>("smartNotifications").countDocuments({ userId, read: false });
}

export async function markSmartNotificationRead(notificationId: string, userId: string) {
  if (!ObjectId.isValid(notificationId)) return false;
  const db = await getDatabase();
  const result = await db
    .collection<SmartNotificationDocument>("smartNotifications")
    .updateOne({ _id: new ObjectId(notificationId), userId }, { $set: { read: true } });
  return result.matchedCount === 1;
}

export async function markAllSmartNotificationsRead(userId: string) {
  const db = await getDatabase();
  await db.collection<SmartNotificationDocument>("smartNotifications").updateMany({ userId, read: false }, { $set: { read: true } });
}
