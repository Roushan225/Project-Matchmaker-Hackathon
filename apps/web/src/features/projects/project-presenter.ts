import type { Project, UserProfile } from "@project-matchmaker/shared";
import type { ProjectCardData, ProjectMember } from "./components/project-card";

export function toProjectCardData(project: Project, profiles: UserProfile[]): ProjectCardData {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const members: ProjectMember[] = project.memberIds.flatMap((memberId) => {
    const profile = profilesById.get(memberId);
    if (!profile) return [];

    return [{
      name: profile.name,
      username: profile.username,
      role: memberId === project.ownerId ? "Project owner" : profile.roles[0] || "Team member",
    }];
  });

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    category: project.category,
    requiredSkills: project.requiredSkills,
    memberCount: project.memberIds.length,
    maxTeamSize: project.maxTeamSize,
    members,
  };
}
