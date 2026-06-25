"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectStatus } from "@project-matchmaker/shared";

const labels: Record<ProjectStatus, string> = {
  recruiting: "Recruiting",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export function ProjectStatusControl({
  projectId,
  initialStatus,
}: {
  projectId: string;
  initialStatus: ProjectStatus;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingCompletion, setConfirmingCompletion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function change(nextStatus: ProjectStatus) {
    if (nextStatus === "completed" && status !== "completed") {
      setConfirmingCompletion(true);
      return;
    }
    await persistStatus(nextStatus);
  }

  async function persistStatus(nextStatus: ProjectStatus) {
    const previousStatus = status;
    setStatus(nextStatus);
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(previousStatus);
      setMessage(data.error ?? "Could not update project status.");
    } else setMessage("Status updated.");
    setSaving(false);
  }

  const completionDialog =
    confirmingCompletion && mounted
      ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="complete-project-title"
          className="fixed inset-0 z-[120] flex min-h-dvh w-screen items-center justify-center bg-[#07031d]/90 p-4 backdrop-blur-md"
        >
          <section className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-[#130a48] p-6 shadow-2xl shadow-black/60 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              Confirm completion
            </p>
            <h2
              id="complete-project-title"
              className="mt-2 text-3xl font-semibold text-white"
            >
              Mark this project completed?
            </h2>
            <p className="mt-3 leading-7 text-indigo-100/65">
              This will notify every accepted member, open the final feedback
              sheet, and add this project to each member’s completed work on
              their profile.
            </p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingCompletion(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-indigo-100/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setConfirmingCompletion(false);
                  void persistStatus("completed");
                }}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Completing…" : "Confirm completion"}
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )
      : null;

  return (
    <>
      <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-3">
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-100/55">
          Project status
          <select
            value={status}
            disabled={saving}
            onChange={(event) => void change(event.target.value as ProjectStatus)}
            className="rounded-lg border border-white/15 bg-[#120a44] px-3 py-2 text-sm font-semibold normal-case tracking-normal text-white outline-none disabled:opacity-60"
          >
            <option value="recruiting">Recruiting</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        {message && <p className="mt-2 text-xs text-indigo-100/65">{message}</p>}
        <p className="mt-2 text-xs text-indigo-100/45">
          Current: {labels[status]}
        </p>
      </div>

      {completionDialog}
    </>
  );
}
