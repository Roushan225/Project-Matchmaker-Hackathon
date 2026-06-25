import { z } from "zod";
import {
  AVAILABILITY_STATUSES,
  PROJECT_STATUSES,
  REQUEST_STATUSES,
} from "../constants";

const normalizedText = z.string().trim().min(1);

export const profileUpdateSchema = z.object({
  bio: z.string().trim().max(280).optional(),
  location: z.string().trim().max(80).optional(),
  website: z.string().url().optional().or(z.literal("")),
  techStack: z.array(normalizedText.max(40)).max(20),
  roles: z.array(normalizedText.max(40)).max(10),
  availability: z.enum(AVAILABILITY_STATUSES),
  discoverable: z.boolean(),
});

export const onboardingSchema = z.object({
  headline: z.string().trim().max(100).optional(),
  techStack: z.array(normalizedText.max(40)).min(1, "Add at least one technical skill.").max(20),
  roles: z.array(normalizedText.max(40)).min(1, "Add at least one role.").max(10),
  projectInterests: z.array(normalizedText.max(40)).min(1, "Choose at least one project interest.").max(10),
  weeklyAvailability: z.enum(["1-3", "4-7", "8-12", "12+"]),
  availability: z.enum(AVAILABILITY_STATUSES),
  discoverable: z.boolean(),
});

export const projectCreateSchema = z.object({
  title: normalizedText.max(100),
  description: normalizedText.max(2000),
  category: normalizedText.max(50),
  requiredSkills: z.array(normalizedText.max(40)).min(1).max(20),
  requiredRoles: z.array(normalizedText.max(40)).min(1).max(10),
  maxTeamSize: z.coerce.number().int().min(2).max(20),
  status: z.enum(PROJECT_STATUSES).default("recruiting"),
});

export const projectStatusUpdateSchema = z.object({
  status: z.enum(PROJECT_STATUSES),
});

export const availabilityUpdateSchema = z.object({
  availability: z.enum(AVAILABILITY_STATUSES),
});

export const applicationCreateSchema = z.object({
  projectId: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

export const invitationCreateSchema = z.object({
  projectId: z.string().min(1),
  recipientId: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

export const requestDecisionSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export const chatMessageSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().trim().min(1).max(4000),
  channel: z.enum(["team", "discussion"]).default("discussion"),
});

export const socketTicketRequestSchema = z.object({
  projectId: z.string().min(1),
});

export const workspaceExpenseCreateSchema = z.object({
  projectId: z.string().min(1),
  title: normalizedText.max(120),
  description: z.string().trim().max(280).optional(),
  amount: z.coerce.number().positive().max(1_000_000),
  currency: z.string().trim().toUpperCase().length(3).default("USD"),
});

export const workspaceAiMessageSchema = z.object({
  projectId: z.string().min(1),
  content: z.string().trim().min(1).max(4000),
});

export const personalAssistantMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});
