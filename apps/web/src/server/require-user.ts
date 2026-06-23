import { redirect } from "next/navigation";
import { auth } from "./auth";
import { getOnboardingProfile } from "./repositories/users";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user;
}

export async function requireCompletedUser() {
  const user = await requireUser();
  const profile = await getOnboardingProfile(user.id);
  if (!profile?.onboardingCompleted) redirect("/onboarding");
  return user;
}
