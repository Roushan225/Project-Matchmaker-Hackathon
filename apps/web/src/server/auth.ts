import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { mongoClientPromise } from "./db/client";
import { getDatabase } from "./db/client";
import { ObjectId } from "mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(mongoClientPromise),
  secret: process.env.AUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      // New OAuth users have GitHub's provider ID here. Their MongoDB user is
      // created only after this callback completes, so Auth.js routes them via
      // `pages.newUser` below.
      if (!user.id || !ObjectId.isValid(user.id)) return true;
      const db = await getDatabase();
      const profile = await db.collection<{ onboardingCompleted?: boolean }>("users").findOne({ _id: new ObjectId(user.id) });
      return profile?.onboardingCompleted ? true : "/onboarding";
    },
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id || !ObjectId.isValid(user.id)) return;
      const now = new Date();
      const username = user.email?.split("@")[0] ?? user.id;
      const db = await getDatabase();
      await db.collection("users").updateOne(
        { _id: new ObjectId(user.id) },
        { $set: { username, githubId: "", techStack: [], roles: [], projectInterests: [], weeklyAvailability: "4-7", availability: "available", discoverable: true, onboardingCompleted: false, githubProfileUrl: "", createdAt: now, updatedAt: now } },
      );
    },
  },
  pages: { signIn: "/sign-in", newUser: "/onboarding" },
});
