import { describe, expect, it } from "vitest";
import { chatMessageSchema, projectCreateSchema, requestDecisionSchema } from "./index";

describe("shared validation schemas", () => {
  it("accepts a valid recruiting project", () => {
    const result = projectCreateSchema.safeParse({ title: "Accessibility audit", description: "Improve the keyboard and screen-reader support for an open-source product.", category: "Open source", requiredSkills: ["TypeScript"], requiredRoles: ["Frontend engineer"], maxTeamSize: 4 });
    expect(result.success).toBe(true);
  });

  it("rejects empty chat messages and invalid request decisions", () => {
    expect(chatMessageSchema.safeParse({ projectId: "project", content: "   " }).success).toBe(false);
    expect(requestDecisionSchema.safeParse({ status: "pending" }).success).toBe(false);
  });
});
