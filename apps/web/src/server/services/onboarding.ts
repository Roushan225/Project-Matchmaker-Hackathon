import { onboardingSchema } from "@project-matchmaker/shared";
import { completeOnboarding } from "../repositories/users";
import { AppError } from "./errors";

export async function completeUserOnboarding(input: unknown, userId: string) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Please check your profile details.");
  const updated = await completeOnboarding(userId, parsed.data);
  if (!updated) throw new AppError("Your account could not be found. Sign in again and retry.", 404);
}
