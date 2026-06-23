import { describe, expect, it, vi } from "vitest";
import { registerWorkspaceHandlers } from "./workspace.js";

function createHarness() {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const broadcasts: Array<{ room: string; event: string; payload: unknown }> = [];
  const joined: string[] = [];
  const socket = {
    data: { userId: "user-1", allowedProjectId: "project-1" },
    on(event: string, handler: (...args: unknown[]) => void) { handlers.set(event, handler); return socket; },
    emit() { return true; },
    join(room: string) { joined.push(room); },
    leave() {},
    to() { return { emit() { return true; } }; },
  };
  const io = { to(room: string) { return { emit(event: string, payload: unknown) { broadcasts.push({ room, event, payload }); return true; } }; } };
  registerWorkspaceHandlers(io as never, socket as never);
  return { handlers, broadcasts, joined };
}

describe("workspace socket handlers", () => {
  it("joins only the project included in the signed ticket", () => {
    const { handlers, joined } = createHarness();
    const acknowledgement = vi.fn();
    handlers.get("workspace:join")?.("project-1", acknowledgement);
    expect(joined).toEqual(["workspace:project-1"]);
    expect(acknowledgement).toHaveBeenCalledWith({ ok: true });
  });

  it("does not broadcast a message for another project", () => {
    const { handlers, broadcasts } = createHarness();
    handlers.get("message:created")?.({ id: "m-1", projectId: "project-2", senderId: "user-1", content: "Nope", createdAt: new Date() });
    expect(broadcasts).toHaveLength(0);
  });
});
