"use client";

import { useEffect, useState } from "react";

export type WorkspaceMember = {
  id: string;
  name: string;
  username: string;
};

type WorkspaceTask = {
  id: string;
  projectId: string;
  title: string;
  assigneeId: string;
  createdById: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export function WorkspaceTaskBoard({ projectId, members }: { projectId: string; members: WorkspaceMember[] }) {
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id ?? "");
  const [status, setStatus] = useState("Syncing tasks…");

  const memberMap = new Map(members.map((member) => [member.id, member]));

  async function loadTasks() {
    setStatus("Refreshing…");
    const response = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Could not load tasks.");
      return;
    }
    setTasks(data.tasks);
    setStatus("Up to date");
  }

  useEffect(() => {
    let cancelled = false;
    async function hydrateTasks() {
      try {
        setStatus("Syncing tasks…");
        const response = await fetch(`/api/tasks?projectId=${encodeURIComponent(projectId)}`, { cache: "no-store" });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setStatus(data.error ?? "Could not load tasks.");
          return;
        }
        setTasks(data.tasks);
        setStatus("Up to date");
      } catch {
        if (!cancelled) setStatus("Could not load tasks.");
      }
    }
    void hydrateTasks();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !assigneeId) return;
    setStatus("Adding task…");
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, title: trimmed, assigneeId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Could not add task.");
      return;
    }
    setTasks((current) => [data.task, ...current]);
    setTitle("");
    setStatus("Up to date");
  }

  async function toggleTask(taskId: string, completed: boolean) {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, completed } : task));
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Could not update task.");
      loadTasks().catch(() => setStatus("Could not load tasks."));
      return;
    }
    setTasks((current) => current.map((task) => task.id === taskId ? data.task : task));
    setStatus("Up to date");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Task board</h2>
          <p className="mt-1 text-sm text-slate-400">Small team todos with clear ownership.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{status}</span>
      </div>

      <form onSubmit={handleCreateTask} className="mt-5 grid gap-3 lg:grid-cols-[1fr_210px_120px]">
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Add a task for the team…" className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400" />
        <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400">
          {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select>
        <button className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Add task</button>
      </form>

      <div className="mt-5 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
            No tasks yet. Add the first todo for your team.
          </div>
        ) : tasks.map((task) => {
          const assignee = memberMap.get(task.assigneeId);
          const creator = memberMap.get(task.createdById);
          return (
            <label key={task.id} className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.06]">
              <input type="checkbox" checked={task.completed} onChange={(event) => toggleTask(task.id, event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-violet-400 focus:ring-violet-400" />
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${task.completed ? "text-slate-500 line-through" : "text-white"}`}>{task.title}</div>
                <div className="mt-1 text-xs text-slate-500">Assigned to @{assignee?.username ?? "member"}</div>
                <div className="mt-2 hidden rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 group-hover:block">
                  Assigned to {assignee?.name ?? "Unknown member"} by {creator?.name ?? "Unknown member"}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
