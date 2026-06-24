import { workspaceAiMessageSchema } from "@project-matchmaker/shared";
import { listMessages } from "../repositories/messages";
import { createWorkspaceAiMessage, listWorkspaceAiMessages } from "../repositories/ai-assist";
import { requireWorkspaceMember } from "./authorization";
import { AppError } from "./errors";

type ProviderResponse = { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

export async function getWorkspaceAiMessages(projectId: string, userId: string) {
  await requireWorkspaceMember(projectId, userId);
  return listWorkspaceAiMessages(projectId);
}

export async function askProjectAssistant(input: unknown, userId: string) {
  const parsed = workspaceAiMessageSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Invalid AI message.");
  const project = await requireWorkspaceMember(parsed.data.projectId, userId);
  const userMessage = await createWorkspaceAiMessage({ projectId: project.id, role: "user", content: parsed.data.content, authorId: userId, createdAt: new Date() });
  const [memory, teamMessages] = await Promise.all([listWorkspaceAiMessages(project.id, 24), listMessages(project.id, 12)]);
  const token = process.env.HF_TOKEN;
  if (!token) throw new AppError("AI Assist is not configured. Add HF_TOKEN to the web environment.", 503);

  const systemPrompt = `You are AI Assist for the project "${project.title}". Project aim: ${project.description}. Category: ${project.category}. Required skills: ${project.requiredSkills.join(", ") || "not specified"}. Required roles: ${project.requiredRoles.join(", ") || "not specified"}. Give practical, concise collaboration help. Use the project context and shared conversation below. Do not invent completed work or private information.`;
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.HF_MODEL ?? "meta-llama/Meta-Llama-3-8B-Instruct:fastest",
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        ...teamMessages.map((message) => ({ role: "system", content: `Recent workspace chat: ${message.content}` })),
        ...memory.map((message) => ({ role: message.role, content: message.content })),
      ],
    }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as ProviderResponse;
  if (!response.ok) throw new AppError(`AI Assist request failed: ${payload.error?.message ?? `Provider error (${response.status}).`}`, 502);
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AppError("AI Assist returned an empty response.", 502);
  const assistantMessage = await createWorkspaceAiMessage({ projectId: project.id, role: "assistant", content, createdAt: new Date() });
  return { userMessage, assistantMessage };
}
