import Link from "next/link";
import { ProjectCard } from "@/features/projects/components/project-card";
import type { ProjectCardData } from "@/features/projects/components/project-card";
import { featuredProjects } from "@/features/projects/data";
import { toProjectCardData } from "@/features/projects/project-presenter";
import { listRecruitingProjects } from "@/server/repositories/projects";
import { listProfilesByIds } from "@/server/repositories/users";

export default async function ProjectsPage() {
  let publishedProjects: ProjectCardData[] = [];
  try {
    const projects = await listRecruitingProjects();
    const memberIds = [...new Set(projects.flatMap((project) => project.memberIds))];
    const profiles = await listProfilesByIds(memberIds);
    publishedProjects = projects.map((project) => toProjectCardData(project, profiles));
  } catch {
    // Keep the demo board available if MongoDB is temporarily unavailable.
  }

  const projects = [...publishedProjects, ...featuredProjects];

  return <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-indigo-200">Project board</p><h1 className="mt-2 text-3xl font-semibold text-white">Find a project that needs you.</h1><p className="mt-2 text-indigo-100/60">Live community projects appear first, followed by demo projects for testing.</p></div><Link href="/projects/new" className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Create project</Link></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></div>;
}
