import { getDatabase } from "./client";

let indexesReady: Promise<void> | undefined;

export function ensureIndexes() {
  indexesReady ??= (async () => {
    const db = await getDatabase();
    await Promise.all([
      db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
      db.collection("projects").createIndex({ status: 1, createdAt: -1 }),
      db.collection("applications").createIndex({ projectId: 1, applicantId: 1 }, { unique: true }),
      db.collection("invitations").createIndex({ projectId: 1, recipientId: 1 }, { unique: true }),
      db.collection("workspaceMemberships").createIndex({ projectId: 1, userId: 1 }, { unique: true }),
      db.collection("chatMessages").createIndex({ projectId: 1, createdAt: -1 }),
    ]);
  })();
  return indexesReady;
}
