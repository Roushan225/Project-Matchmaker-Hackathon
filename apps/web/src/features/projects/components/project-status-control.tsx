"use client";

import { useState } from "react";
import type { ProjectStatus } from "@project-matchmaker/shared";

const labels: Record<ProjectStatus, string> = { recruiting: "Recruiting", active: "Active", completed: "Completed", archived: "Archived" };

export function ProjectStatusControl({ projectId, initialStatus }: { projectId: string; initialStatus: ProjectStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function change(nextStatus: ProjectStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setStatus(previousStatus); setMessage(data.error ?? "Could not update project status."); }
    else setMessage("Status updated.");
    setSaving(false);
  }
  return <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-3"><label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100/55">Project status<select value={status} disabled={saving} onChange={(event) => void change(event.target.value as ProjectStatus)} className="rounded-lg border border-white/15 bg-[#120a44] px-3 py-2 text-sm font-semibold normal-case tracking-normal text-white outline-none disabled:opacity-60"><option value="recruiting">Recruiting</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>{message && <p className="mt-2 text-xs text-indigo-100/65">{message}</p>}<p className="mt-2 text-xs text-indigo-100/45">Current: {labels[status]}</p></div>;
}
