import Link from "next/link";
import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";
import { listProfilesByIds } from "@/server/repositories/users";
import { requireWorkspaceMember } from "@/server/services/authorization";
import { requireUser } from "@/server/require-user";

export default async function HubPage({ params }: { params: Promise<{ projectId: string }> }) {
  const [{ projectId }, user] = await Promise.all([params, requireUser()]);
  const project = await requireWorkspaceMember(projectId, user.id);
  const profiles = await listProfilesByIds(project.memberIds);
  const members = profiles.map((profile) => ({ id: profile.id, name: profile.name, username: profile.username }));
  return <div className="mx-auto w-full max-w-none"><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><Link href="/projects" className="text-sm font-medium text-violet-200">← Projects</Link><h1 className="mt-3 text-3xl font-semibold text-white">Team workspace</h1><p className="mt-2 text-slate-400">Private collaboration space for accepted members only.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-300"><span className="font-semibold text-white">{members.length}</span> active member{members.length === 1 ? "" : "s"}</div></div><WorkspaceShell projectId={projectId} projectTitle={project.title} projectStatus={project.status} currentUserId={user.id} members={members} /></div>;
}
