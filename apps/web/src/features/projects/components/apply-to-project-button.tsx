"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export function ApplyToProjectButton({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function apply() {
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error ?? "Could not submit your application.");
      } else {
        setMessage("Application sent. The project owner can now review it.");
      }
    } catch {
      setMessage("Could not submit your application.");
    }
    setSubmitting(false);
  }

  const dialog = open ? <div role="dialog" aria-modal="true" aria-labelledby="apply-title" className="fixed inset-0 z-[100] flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-[#07031d]/90 p-4 backdrop-blur-md md:p-8"><div className="w-full max-w-2xl rounded-[2rem] border border-white/15 bg-[#130a48] p-6 shadow-2xl shadow-black/60 md:p-9"><div className="flex items-start justify-between gap-5"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">Project application</p><h2 id="apply-title" className="mt-2 text-3xl font-semibold text-white">Join {projectTitle}</h2><p className="mt-3 max-w-xl leading-7 text-indigo-100/65">Tell the project owner how you would contribute. Your application will be submitted only after you confirm.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-indigo-100/70 transition hover:bg-white/10 hover:text-white">Close</button></div><label className="mt-7 grid gap-2 text-sm font-medium text-indigo-100">Application note <span className="font-normal text-indigo-100/45">Optional · up to 500 characters</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={6} maxLength={500} placeholder="I can help with the API, project setup, and documentation…" className="resize-none rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-white outline-none transition focus:border-violet-300" /></label>{message && <p className={`mt-5 rounded-xl px-4 py-3 text-sm ${message.startsWith("Application sent") ? "bg-emerald-300/10 text-emerald-100" : "bg-rose-400/10 text-rose-100"}`}>{message}</p>}<div className="mt-7 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-indigo-100/70 hover:text-white">Cancel</button><button type="button" disabled={submitting || message.startsWith("Application sent")} onClick={() => void apply()} className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Sending…" : "Confirm application"}</button></div></div></div> : null;

  return <><button type="button" onClick={() => setOpen(true)} className="w-fit rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Apply to join</button>{dialog && createPortal(dialog, document.body)}</>;
}
