import Link from "next/link";
import { TechPill } from "@/components/shared/tech-pill";
import { featuredProjects } from "@/features/projects/data";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = featuredProjects.find((item) => item.slug === slug) ?? featuredProjects[0];
  return <div className="mx-auto max-w-4xl"><Link href="/projects" className="text-sm font-medium text-teal-300">← Project board</Link><section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-7"><p className="text-sm font-semibold uppercase tracking-wider text-teal-300">{project.category}</p><h1 className="mt-3 text-4xl font-semibold text-white">{project.title}</h1><p className="mt-5 max-w-2xl leading-7 text-slate-300">{project.description}</p><div className="mt-8 border-y border-slate-800 py-5"><p className="text-sm font-medium text-slate-400">Looking for</p><div className="mt-3 flex flex-wrap gap-2">{project.requiredSkills.map((skill) => <TechPill key={skill} label={skill} />)}</div></div><div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-400">{project.memberCount} of {project.maxTeamSize} teammates assembled</p><button className="rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-slate-950">Apply to join</button></div></section></div>;
}
