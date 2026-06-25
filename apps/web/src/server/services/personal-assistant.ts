import { personalAssistantMessageSchema } from "@project-matchmaker/shared";
import { listRecruitingProjects } from "../repositories/projects";
import { listDiscoverableProfiles } from "../repositories/users";
import { createPersonalAssistantMessage, listPersonalAssistantMessages } from "../repositories/personal-assistant";
import { AppError } from "./errors";

const ignoredTerms = new Set(["a", "an", "the", "for", "with", "and", "or", "to", "of", "in", "me", "find", "show", "search", "need", "looking", "project", "projects", "developer", "developers", "user", "users", "team"]);

function tokens(value: string) {
  return value.toLowerCase().match(/[a-z0-9+#.]+/g)?.filter((token) => token.length > 1 && !ignoredTerms.has(token)) ?? [];
}

function score(text: string, queryTokens: string[]) {
  const normalized = text.toLowerCase();
  return queryTokens.reduce((total, token) => total + (normalized.includes(token) ? 1 : 0), 0);
}

async function searchMatchmakerData(query: string) {
  const queryTokens = tokens(query);
  const [profiles, projects] = await Promise.all([listDiscoverableProfiles(60), listRecruitingProjects(60)]);
  const developers = profiles.map((profile) => ({ profile, score: score([profile.name, profile.username, profile.availability, ...profile.roles, ...profile.techStack, ...profile.projectInterests].join(" "), queryTokens) })).filter((item) => !queryTokens.length || item.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(({ profile }) => ({ id: profile.id, name: profile.name, username: profile.username, availability: profile.availability, roles: profile.roles, skills: profile.techStack }));
  const matchingProjects = projects.map((project) => ({ project, score: score([project.title, project.description, project.category, ...project.requiredRoles, ...project.requiredSkills].join(" "), queryTokens) })).filter((item) => !queryTokens.length || item.score > 0).sort((a, b) => b.score - a.score).slice(0, 6).map(({ project }) => ({ id: project.id, title: project.title, slug: project.slug, category: project.category, status: project.status, requiredRoles: project.requiredRoles, requiredSkills: project.requiredSkills, memberCount: project.memberIds.length, maxTeamSize: project.maxTeamSize }));
  return { developers, projects: matchingProjects };
}

export async function getPersonalAssistantMessages(userId: string) {
  return listPersonalAssistantMessages(userId);
}

export async function askPersonalAssistant(input: unknown, userId: string) {
  const parsed = personalAssistantMessageSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Invalid assistant message.");
  const userMessage = await createPersonalAssistantMessage({ userId, role: "user", content: parsed.data.content, createdAt: new Date() });
  const [memory, results] = await Promise.all([listPersonalAssistantMessages(userId, 20), searchMatchmakerData(parsed.data.content)]);
  const token = process.env.HF_TOKEN;
  if (!token) throw new AppError("Matchmaker Assistant is not configured. Add HF_TOKEN to the web environment.", 503);
  const dataContext = JSON.stringify(results);
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.HF_MODEL ?? "meta-llama/Meta-Llama-3-8B-Instruct:fastest", temperature: 0.3, max_tokens: 500, messages: [{ role: "system", content: "You are Matchmaker Assistant. Help one developer find projects and teammates. Use only the database results supplied for the current search; never invent people or projects. Be concise, explain why results match, and say when there are no matches." }, ...memory.map((message) => ({ role: message.role, content: message.content })), { role: "system", content: `Current verified MongoDB search results: ${dataContext}` }] }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) throw new AppError(`Matchmaker Assistant request failed: ${payload.error?.message ?? `Provider error (${response.status}).`}`, 502);
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new AppError("Matchmaker Assistant returned an empty response.", 502);
  const assistantMessage = await createPersonalAssistantMessage({ userId, role: "assistant", content, createdAt: new Date() });
  return { userMessage, assistantMessage, results };
}
