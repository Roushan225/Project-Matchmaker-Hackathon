import Link from "next/link";
import { TechPill } from "@/components/shared/tech-pill";

export type ProjectCardData = { id: string; slug: string; title: string; description: string; category: string; requiredSkills: string[]; memberCount: number; maxTeamSize: number; };

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-0.5 hover:border-slate-600">
    <div className="mb-4 flex items-start justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-teal-300">{project.category}</p><h2 className="text-lg font-semibold text-white">{project.title}</h2></div><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{project.memberCount}/{project.maxTeamSize}</span></div>
    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{project.description}</p>
    <div className="mt-4 flex flex-wrap gap-2">{project.requiredSkills.slice(0, 4).map((skill) => <TechPill key={skill} label={skill} />)}</div>
    <Link href={`/projects/${project.slug}`} className="mt-5 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200">View project →</Link>
  </article>;
}
