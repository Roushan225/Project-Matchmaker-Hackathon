import { availabilityUpdateSchema } from "@project-matchmaker/shared";
import { updateAvailability } from "../repositories/users";
import { AppError } from "./errors";

export async function changeAvailability(input: unknown, userId: string) {
  const parsed = availabilityUpdateSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Invalid availability status.");
  if (!await updateAvailability(userId, parsed.data.availability)) throw new AppError("Your account could not be found.", 404);
  return parsed.data.availability;
}
