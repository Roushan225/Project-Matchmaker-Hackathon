import type { ChatMessage } from "@project-matchmaker/shared";
import { chatMessageSchema } from "@project-matchmaker/shared";
import { createMessage, listMessages } from "../repositories/messages";
import { requireWorkspaceMember } from "./authorization";
import { AppError } from "./errors";

export async function postChatMessage(input: unknown, senderId: string): Promise<ChatMessage> {
  const parsed = chatMessageSchema.safeParse(input);
  if (!parsed.success) throw new AppError("Message must be between 1 and 4,000 characters.");
  await requireWorkspaceMember(parsed.data.projectId, senderId);
  const createdAt = new Date();
  return createMessage({ projectId: parsed.data.projectId, senderId, content: parsed.data.content, createdAt });
}

export async function getChatMessages(projectId: string, userId: string) {
  if (!projectId.trim()) throw new AppError("Project is required.");
  await requireWorkspaceMember(projectId, userId);
  return listMessages(projectId);
}
