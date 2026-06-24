"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type InviteProject = {
  id: string;
  title: string;
  status: string;
  memberCount: number;
  maxTeamSize: number;
  invitationStatus: "pending" | "accepted" | "rejected" | "not-sent";
  canInvite: boolean;
};

export function SendProjectInvite({ recipientId, recipientName }: { recipientId: string; recipientName: string }) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<InviteProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function loadProjects() {
      setLoading(true);
      setMessage("");
      try {
        const response = await fetch(`/api/invitations?recipientId=${encodeURIComponent(recipientId)}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) {
          setMessage(data.error ?? "Could not load your projects.");
        } else {
          const options = data.projects as InviteProject[];
          setProjects(options);
          setSelectedProjectId(options.find((project) => project.canInvite)?.id ?? "");
        }
      } catch {
        if (!cancelled) setMessage("Could not load your projects.");
      }
      if (!cancelled) setLoading(false);
    }
    void loadProjects();
    return () => { cancelled = true; };
  }, [open, recipientId]);

  async function sendInvite() {
    if (!selectedProjectId) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, recipientId, note: note.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? "Could not send the invitation.");
        setSubmitting(false);
        return;
      }
      setProjects((current) => current.map((project) => project.id === selectedProjectId ? { ...project, canInvite: false, invitationStatus: "pending" } : project));
      setMessage(`Invitation sent to ${recipientName}.`);
      setSubmitting(false);
    } catch {
      setMessage("Could not send the invitation.");
      setSubmitting(false);
    }
  }

  const dialog = open ? <div role="dialog" aria-modal="true" aria-labelledby="invite-title" className="fixed inset-0 z-[100] flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-[#07031d]/90 p-4 backdrop-blur-md md:p-8">
      <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-[#120a44] p-6 shadow-2xl shadow-black/40 md:p-7">
        <div className="flex items-start justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">Project invitation</p><h2 id="invite-title" className="mt-2 text-2xl font-semibold text-white">Invite {recipientName}</h2><p className="mt-2 text-sm leading-6 text-indigo-100/65">Choose one of your projects. The member count and request status are shown before you confirm.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-indigo-100/70 hover:bg-white/10 hover:text-white" aria-label="Close invitation dialog">Close</button></div>
        <div className="mt-6 space-y-3">
          {loading && <p className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-5 text-sm text-indigo-100/70">Loading your projects…</p>}
          {!loading && projects.length === 0 && <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-5 text-sm text-indigo-100/70">Create a project first, then you can invite teammates from their profiles.</p>}
          {!loading && projects.map((project) => <label key={project.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${selectedProjectId === project.id ? "border-violet-300/70 bg-violet-300/10" : "border-white/10 bg-white/[0.04]"} ${project.canInvite ? "hover:border-white/30" : "cursor-not-allowed opacity-55"}`}>
            <input type="radio" name="project" value={project.id} checked={selectedProjectId === project.id} onChange={() => setSelectedProjectId(project.id)} disabled={!project.canInvite} className="h-4 w-4 accent-violet-300" />
            <div className="min-w-0 flex-1"><p className="truncate font-semibold text-white">{project.title}</p><p className="mt-1 text-sm text-indigo-100/60">{project.memberCount}/{project.maxTeamSize} members · {project.status}</p></div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${project.invitationStatus === "not-sent" ? "bg-emerald-300/15 text-emerald-100" : "bg-amber-300/15 text-amber-100"}`}>{project.invitationStatus === "not-sent" ? "Ready" : project.invitationStatus}</span>
          </label>)}
        </div>
        <label className="mt-5 grid gap-2 text-sm font-medium text-indigo-100">Personal note <span className="font-normal text-indigo-100/45">Optional</span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={3} className="resize-none rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2.5 text-white outline-none focus:border-violet-300" placeholder="Tell them what you would like to build together…" /></label>
        {message && <p className={`mt-4 rounded-xl px-3 py-2 text-sm ${message.startsWith("Invitation sent") ? "bg-emerald-300/10 text-emerald-100" : "bg-rose-400/10 text-rose-100"}`}>{message}</p>}
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-indigo-100/70 hover:text-white">Cancel</button><button type="button" onClick={() => void sendInvite()} disabled={!selectedProject?.canInvite || submitting} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Sending…" : "Confirm invite"}</button></div>
      </div>
    </div> : null;

  return <>
    <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Send project invite</button>
    {dialog && createPortal(dialog, document.body)}
  </>;
}
