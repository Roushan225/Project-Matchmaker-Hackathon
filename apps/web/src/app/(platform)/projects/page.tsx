import Link from "next/link";
import { ProjectCard } from "@/features/projects/components/project-card";
import { featuredProjects } from "@/features/projects/data";

export default function ProjectsPage() {
  return <div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-teal-300">Project board</p><h1 className="mt-2 text-3xl font-semibold text-white">Find a project that needs you.</h1><p className="mt-2 text-slate-400">Every posting states the role, skills, and team capacity up front.</p></div><Link href="/projects/new" className="rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950">Create project</Link></div><div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{featuredProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></div>;
}
