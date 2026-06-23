import Link from "next/link";
import { ProjectCard } from "@/features/projects/components/project-card";
import { featuredProjects } from "@/features/projects/data";

export default function ProjectsPage() {
  return <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-indigo-200">Project board</p><h1 className="mt-2 text-3xl font-semibold text-white">Find a project that needs you.</h1><p className="mt-2 text-indigo-100/60">Every posting states the role, skills, and team capacity up front.</p></div><Link href="/projects/new" className="rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Create project</Link></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></div>;
}
