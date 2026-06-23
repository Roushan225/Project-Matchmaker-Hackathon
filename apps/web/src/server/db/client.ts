import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

const globalForMongo = globalThis as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };

const unavailableClient = {
  db() {
    throw new Error("MONGODB_URI is not configured.");
  },
} as unknown as MongoClient;

export const mongoClientPromise = globalForMongo._mongoClientPromise ?? (uri ? new MongoClient(uri).connect() : Promise.resolve(unavailableClient));

if (process.env.NODE_ENV !== "production") globalForMongo._mongoClientPromise = mongoClientPromise;

export async function getDatabase() {
  if (!uri) throw new Error("MONGODB_URI is not configured.");
  const client = await mongoClientPromise;
  return client.db();
}
