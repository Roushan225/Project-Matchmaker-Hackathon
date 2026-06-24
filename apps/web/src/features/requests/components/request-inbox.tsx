"use client";

import { useEffect, useState } from "react";

type Invitation = { id: string; projectTitle: string; senderName: string; note?: string; status: "pending" | "accepted" | "rejected"; createdAt: string };
type SentInvitation = { id: string; projectTitle: string; recipientName: string; recipientUsername: string; note?: string; status: "pending" | "accepted" | "rejected"; createdAt: string };
type Application = { id: string; projectTitle: string; applicantName: string; applicantUsername: string; note?: string; status: "pending" | "accepted" | "rejected"; createdAt: string };

type Inbox = { invitations: Invitation[]; sentInvitations: SentInvitation[]; applications: Application[] };

export function RequestInbox() {
  const [inbox, setInbox] = useState<Inbox>({ invitations: [], sentInvitations: [], applications: [] });
  const [status, setStatus] = useState("Loading requests…");
  const [updatingId, setUpdatingId] = useState("");

  async function refresh() {
    setStatus("Refreshing…");
    const response = await fetch("/api/invitations", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error ?? "Could not load requests.");
    setInbox({ invitations: data.invitations ?? [], sentInvitations: data.sentInvitations ?? [], applications: data.applications ?? [] });
    setStatus("Up to date");
  }

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const response = await fetch("/api/invitations", { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load requests.");
        setInbox({ invitations: data.invitations ?? [], sentInvitations: data.sentInvitations ?? [], applications: data.applications ?? [] });
        setStatus("Up to date");
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Could not load requests.");
      }
    }
    void hydrate();
    return () => { cancelled = true; };
  }, []);

  async function decide(kind: "invitation" | "application", id: string, decision: "accepted" | "rejected") {
    setUpdatingId(id);
    try {
      const endpoint = kind === "invitation" ? `/api/invitations/${id}` : `/api/applications/${id}`;
      const response = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: decision }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not update this request.");
      await refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update this request.");
    }
    setUpdatingId("");
  }

  const pendingInvitations = inbox.invitations.filter((invitation) => invitation.status === "pending");
  const pendingSentInvitations = inbox.sentInvitations.filter((invitation) => invitation.status === "pending");
  const pendingApplications = inbox.applications.filter((application) => application.status === "pending");
  return <div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-violet-200">Team requests</p><h1 className="mt-2 text-3xl font-semibold text-white">Invitations and applications</h1><p className="mt-2 text-indigo-100/60">This inbox reads directly from the project database. Refresh when you want the latest requests.</p></div><button type="button" onClick={() => void refresh().catch((error) => setStatus(error instanceof Error ? error.message : "Could not load requests."))} className="rounded-lg border border-white/20 bg-white/[0.07] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Refresh</button></div><div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm"><span className="text-indigo-100/65">{status}</span><span className="text-indigo-100/45">{pendingInvitations.length + pendingApplications.length} pending</span></div>
    <div className="mt-8 grid gap-6 xl:grid-cols-3"><section className="rounded-3xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-indigo-950/15 backdrop-blur"><div className="flex items-center justify-between"><div><p className="text-lg font-semibold text-white">Project invitations</p><p className="mt-1 text-sm text-indigo-100/55">Invites sent to you</p></div><span className="rounded-full bg-violet-300/15 px-3 py-1 text-xs font-semibold text-violet-100">{pendingInvitations.length} pending</span></div><div className="mt-5 space-y-3">{inbox.invitations.map((invitation) => <article key={invitation.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="font-semibold text-white">{invitation.projectTitle}</p><p className="mt-1 text-sm text-indigo-100/60">Invited by {invitation.senderName}</p>{invitation.note && <p className="mt-3 rounded-xl bg-slate-950/35 px-3 py-2 text-sm leading-6 text-slate-300">“{invitation.note}”</p>}<div className="mt-4 flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${invitation.status === "pending" ? "bg-amber-300/15 text-amber-100" : invitation.status === "accepted" ? "bg-emerald-300/15 text-emerald-100" : "bg-rose-300/15 text-rose-100"}`}>{invitation.status}</span>{invitation.status === "pending" && <div className="flex gap-2"><button type="button" disabled={updatingId === invitation.id} onClick={() => void decide("invitation", invitation.id, "rejected")} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-white/10">Decline</button><button type="button" disabled={updatingId === invitation.id} onClick={() => void decide("invitation", invitation.id, "accepted")} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-950 hover:bg-violet-100">Accept</button></div>}</div></article>)}{!inbox.invitations.length && <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-indigo-100/50">No project invitations yet.</p>}</div></section><section className="rounded-3xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-indigo-950/15 backdrop-blur"><div className="flex items-center justify-between"><div><p className="text-lg font-semibold text-white">Sent invitations</p><p className="mt-1 text-sm text-indigo-100/55">Waiting for a response</p></div><span className="rounded-full bg-violet-300/15 px-3 py-1 text-xs font-semibold text-violet-100">{pendingSentInvitations.length} pending</span></div><div className="mt-5 space-y-3">{inbox.sentInvitations.map((invitation) => <article key={invitation.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="font-semibold text-white">{invitation.projectTitle}</p><p className="mt-1 text-sm text-indigo-100/60">Sent to {invitation.recipientName} · @{invitation.recipientUsername}</p>{invitation.note && <p className="mt-3 rounded-xl bg-slate-950/35 px-3 py-2 text-sm leading-6 text-slate-300">“{invitation.note}”</p>}<span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${invitation.status === "pending" ? "bg-amber-300/15 text-amber-100" : invitation.status === "accepted" ? "bg-emerald-300/15 text-emerald-100" : "bg-rose-300/15 text-rose-100"}`}>{invitation.status}</span></article>)}{!inbox.sentInvitations.length && <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-indigo-100/50">No invitations sent yet.</p>}</div></section>
      <section className="rounded-3xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-indigo-950/15 backdrop-blur"><div className="flex items-center justify-between"><div><p className="text-lg font-semibold text-white">Applications to your projects</p><p className="mt-1 text-sm text-indigo-100/55">Review people who want to join</p></div><span className="rounded-full bg-violet-300/15 px-3 py-1 text-xs font-semibold text-violet-100">{pendingApplications.length} pending</span></div><div className="mt-5 space-y-3">{inbox.applications.map((application) => <article key={application.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="font-semibold text-white">{application.projectTitle}</p><p className="mt-1 text-sm text-indigo-100/60">{application.applicantName} · @{application.applicantUsername}</p>{application.note && <p className="mt-3 rounded-xl bg-slate-950/35 px-3 py-2 text-sm leading-6 text-slate-300">“{application.note}”</p>}<div className="mt-4 flex items-center justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${application.status === "pending" ? "bg-amber-300/15 text-amber-100" : application.status === "accepted" ? "bg-emerald-300/15 text-emerald-100" : "bg-rose-300/15 text-rose-100"}`}>{application.status}</span>{application.status === "pending" && <div className="flex gap-2"><button type="button" disabled={updatingId === application.id} onClick={() => void decide("application", application.id, "rejected")} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-white/10">Reject</button><button type="button" disabled={updatingId === application.id} onClick={() => void decide("application", application.id, "accepted")} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-950 hover:bg-violet-100">Accept</button></div>}</div></article>)}{!inbox.applications.length && <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-indigo-100/50">No applications to your projects yet.</p>}</div></section></div>
  </div>;
}
