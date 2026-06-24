import { ObjectId } from "mongodb";
import type { AvailabilityStatus, UserProfile } from "@project-matchmaker/shared";
import { getDatabase } from "../db/client";
import type { UserDocument } from "./types";
import { withId } from "./types";

export type OnboardingProfile = {
  name: string;
  email?: string;
  image?: string;
  headline?: string;
  techStack: string[];
  roles: string[];
  projectInterests: string[];
  weeklyAvailability: "1-3" | "4-7" | "8-12" | "12+";
  availability: AvailabilityStatus;
  discoverable: boolean;
  onboardingCompleted: boolean;
};

export async function findProfileById(userId: string) {
  if (!ObjectId.isValid(userId)) return null;
  const db = await getDatabase();
  const document = await db.collection<UserDocument>("users").findOne({ _id: new ObjectId(userId) });
  return document ? withId(document) as UserProfile : null;
}

export async function listDiscoverableProfiles(limit = 30) {
  const db = await getDatabase();
  const documents = await db.collection<UserDocument>("users").find({ discoverable: true, onboardingCompleted: true }).sort({ updatedAt: -1 }).limit(limit).toArray();
  return documents.map((document) => withId(document) as UserProfile);
}

export async function findProfileByUsername(username: string) {
  const db = await getDatabase();
  const document = await db.collection<UserDocument>("users").findOne(
    { username, onboardingCompleted: true },
    { collation: { locale: "en", strength: 2 } },
  );
  return document ? withId(document) as UserProfile : null;
}

export async function listProfilesByIds(userIds: string[]) {
  const ids = userIds.filter(ObjectId.isValid).map((userId) => new ObjectId(userId));
  if (!ids.length) return [];

  const db = await getDatabase();
  const documents = await db.collection<UserDocument>("users").find({ _id: { $in: ids } }).toArray();
  return documents.map((document) => withId(document) as UserProfile);
}

export async function getOnboardingProfile(userId: string): Promise<OnboardingProfile | null> {
  if (!ObjectId.isValid(userId)) return null;
  const db = await getDatabase();
  return db.collection<OnboardingProfile>("users").findOne(
    { _id: new ObjectId(userId) } as never,
    { projection: { name: 1, email: 1, image: 1, headline: 1, techStack: 1, roles: 1, projectInterests: 1, weeklyAvailability: 1, availability: 1, discoverable: 1, onboardingCompleted: 1 } },
  );
}

export async function completeOnboarding(userId: string, profile: Omit<OnboardingProfile, "name" | "email" | "image" | "onboardingCompleted">) {
  if (!ObjectId.isValid(userId)) return false;
  const db = await getDatabase();
  const result = await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...profile, onboardingCompleted: true, updatedAt: new Date() } },
  );
  return result.matchedCount === 1;
}

export async function updateAvailability(userId: string, availability: AvailabilityStatus) {
  if (!ObjectId.isValid(userId)) return false;
  const db = await getDatabase();
  const result = await db.collection<UserDocument>("users").updateOne({ _id: new ObjectId(userId) }, { $set: { availability, updatedAt: new Date() } });
  return result.matchedCount === 1;
}
