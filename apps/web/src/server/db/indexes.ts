import { getDatabase } from "./client";

let indexesReady: Promise<void> | undefined;

export function ensureIndexes() {
  indexesReady ??= (async () => {
    const db = await getDatabase();
    await Promise.all([
      db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
      db.collection("projects").createIndex({ status: 1, createdAt: -1 }),
      db
        .collection("applications")
        .createIndex({ projectId: 1, applicantId: 1 }, { unique: true }),
      db
        .collection("invitations")
        .createIndex({ projectId: 1, recipientId: 1 }, { unique: true }),
      db
        .collection("invitations")
        .createIndex({ recipientId: 1, createdAt: -1 }),
      db.collection("invitations").createIndex({ senderId: 1, createdAt: -1 }),
      db
        .collection("workspaceMemberships")
        .createIndex({ projectId: 1, userId: 1 }, { unique: true }),
      db
        .collection("chatMessages")
        .createIndex({ projectId: 1, createdAt: -1 }),
      db
        .collection("chatMessages")
        .createIndex({ projectId: 1, channel: 1, createdAt: -1 }),
      db
        .collection("workspaceTasks")
        .createIndex({ projectId: 1, updatedAt: -1 }),
      db
        .collection("workspaceResources")
        .createIndex({ projectId: 1, createdAt: -1 }),
      db
        .collection("workspaceExpenses")
        .createIndex({ projectId: 1, createdAt: -1 }),
      db
        .collection("projectFeedback")
        .createIndex({ projectId: 1, userId: 1 }, { unique: true }),
      db
        .collection("projectFeedback")
        .createIndex({ projectId: 1, createdAt: -1 }),
      db
        .collection("workspaceAiMessages")
        .createIndex({ projectId: 1, createdAt: -1 }),
      db
        .collection("personalAssistantMessages")
        .createIndex({ userId: 1, createdAt: -1 }),
      db
        .collection("smartNotifications")
        .createIndex({ userId: 1, createdAt: -1 }),
      db
        .collection("smartNotifications")
        .createIndex({ userId: 1, read: 1, createdAt: -1 }),
    ]);
  })();
  return indexesReady;
}
