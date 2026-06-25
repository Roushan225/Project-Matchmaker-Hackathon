import { projectFeedbackSchema } from "@project-matchmaker/shared";
import { ensureIndexes } from "../db/indexes";
import {
  countProjectFeedback,
  findProjectFeedback,
  upsertProjectFeedback,
} from "../repositories/project-feedback";
import { requireWorkspaceMember } from "./authorization";
import { AppError } from "./errors";

export async function getProjectFeedbackState(projectId: string, userId: string) {
  const project = await requireWorkspaceMember(projectId, userId);
  const [feedback, feedbackCount] = await Promise.all([
    findProjectFeedback(projectId, userId),
    countProjectFeedback(projectId),
  ]);
  return { projectStatus: project.status, feedback, feedbackCount };
}

export async function submitProjectFeedback(input: unknown, userId: string) {
  const parsed = projectFeedbackSchema.safeParse(input);
  if (!parsed.success)
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid feedback.");
  const project = await requireWorkspaceMember(parsed.data.projectId, userId);
  if (project.status !== "completed") {
    throw new AppError("Feedback opens after the project is completed.", 409);
  }
  await ensureIndexes();
  return upsertProjectFeedback({
    projectId: project.id,
    userId,
    rating: parsed.data.rating,
    thoughts: parsed.data.thoughts,
    highlights: parsed.data.highlights,
    improvements: parsed.data.improvements,
    updatedAt: new Date(),
  });
}
