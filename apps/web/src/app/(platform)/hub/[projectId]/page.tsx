import Link from "next/link";
import { WorkspaceChat } from "@/features/chat/components/workspace-chat";
import { WorkspaceTaskBoard } from "@/features/tasks/components/workspace-task-board";
import { listProfilesByIds } from "@/server/repositories/users";
import { requireWorkspaceMember } from "@/server/services/authorization";
import { requireUser } from "@/server/require-user";

export default async function HubPage({ params }: { params: Promise<{ projectId: string }> }) {
  const [{ projectId }, user] = await Promise.all([params, requireUser()]);
  const project = await requireWorkspaceMember(projectId, user.id);
  const profiles = await listProfilesByIds(project.memberIds);
  const members = profiles.map((profile) => ({ id: profile.id, name: profile.name, username: profile.username }));
  return <div className="mx-auto max-w-[1440px]"><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><Link href="/projects" className="text-sm font-medium text-violet-200">← Projects</Link><h1 className="mt-3 text-3xl font-semibold text-white">Team workspace</h1><p className="mt-2 text-slate-400">Private collaboration space for accepted members only.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-300"><span className="font-semibold text-white">{members.length}</span> active member{members.length === 1 ? "" : "s"}</div></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.9fr)]"><WorkspaceChat projectId={projectId} currentUserId={user.id} members={members} /><div className="space-y-6"><WorkspaceTaskBoard projectId={projectId} members={members} /><aside className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur"><h2 className="font-semibold text-white">Workspace tools</h2><div className="mt-4 space-y-3 text-sm"><button className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-slate-200">Resource vault <span className="float-right text-slate-500">Soon</span></button><button className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-left text-slate-200">AI copilot <span className="float-right text-slate-500">Later</span></button></div></aside></div></div></div>;
}
