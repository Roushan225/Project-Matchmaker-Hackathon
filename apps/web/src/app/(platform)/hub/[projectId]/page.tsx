import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";
import { listProfilesByIds } from "@/server/repositories/users";
import { requireWorkspaceMember } from "@/server/services/authorization";
import { requireUser } from "@/server/require-user";

export default async function HubPage({ params }: { params: Promise<{ projectId: string }> }) {
  const [{ projectId }, user] = await Promise.all([params, requireUser()]);
  const project = await requireWorkspaceMember(projectId, user.id);
  const profiles = await listProfilesByIds(project.memberIds);
  const members = profiles.map((profile) => ({ id: profile.id, name: profile.name, username: profile.username }));
  return <div className="mx-auto w-full max-w-none"><WorkspaceShell projectId={projectId} projectTitle={project.title} projectStatus={project.status} currentUserId={user.id} members={members} /></div>;
}
