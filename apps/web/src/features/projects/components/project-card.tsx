import Link from "next/link";
import { TechPill } from "@/components/shared/tech-pill";

export type ProjectMember = { name: string; username: string; role: string };

export type ProjectCardData = { id: string; slug: string; title: string; description: string; category: string; requiredSkills: string[]; memberCount: number; maxTeamSize: number; members: ProjectMember[]; };

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return <article className="rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-indigo-950/15 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]">
    <div className="mb-4 flex items-start justify-between gap-3"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-200">{project.category}</p><h2 className="text-lg font-semibold text-white">{project.title}</h2></div><span className="rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-xs text-indigo-100/75">{project.memberCount}/{project.maxTeamSize}</span></div>
    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-indigo-100/60">{project.description}</p>
    <div className="mt-4 flex flex-wrap gap-2">{project.requiredSkills.slice(0, 4).map((skill) => <TechPill key={skill} label={skill} subtle />)}</div>
    <Link href={`/projects/${project.slug}`} className="mt-5 inline-flex rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">View project <span className="ml-2 opacity-70">→</span></Link>
  </article>;
}
