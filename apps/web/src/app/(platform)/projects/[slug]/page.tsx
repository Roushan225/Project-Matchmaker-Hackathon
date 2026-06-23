import Link from "next/link";
import { Avatar } from "@/components/shared/avatar";
import { TechPill } from "@/components/shared/tech-pill";
import { featuredProjects } from "@/features/projects/data";
import { toProjectCardData } from "@/features/projects/project-presenter";
import { findProjectBySlug } from "@/server/repositories/projects";
import { listProfilesByIds } from "@/server/repositories/users";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let project = featuredProjects.find((item) => item.slug === slug);

  if (!project) {
    try {
      const publishedProject = await findProjectBySlug(slug);
      if (publishedProject) {
        const profiles = await listProfilesByIds(publishedProject.memberIds);
        project = toProjectCardData(publishedProject, profiles);
      }
    } catch {
      // The demo project fallback below keeps the page renderable during a database outage.
    }
  }

  project ??= featuredProjects[0];
  const openSlots = project.maxTeamSize - project.memberCount;

  return <div className="mx-auto w-full max-w-[1440px] space-y-5">
    <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(120deg,rgba(30,22,88,.86),rgba(16,11,61,.74))] p-6 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl md:p-8"><div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" /><div className="relative"><Link href="/projects" className="text-sm font-medium text-indigo-200 hover:text-white">← Project board</Link><div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"><div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-200">{project.category} · Recruiting</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">{project.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-indigo-100/70">{project.description}</p></div><button className="w-fit rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Apply to join</button></div></div></section>

    <section className="grid grid-cols-2 gap-3 md:grid-cols-4"><Metric label="Team members" value={`${project.memberCount}/${project.maxTeamSize}`} /><Metric label="Open roles" value={openSlots} /><Metric label="Required skills" value={project.requiredSkills.length} /><Metric label="Project status" value="Recruiting" /></section>

    <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]"><div className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-xl shadow-indigo-950/15 backdrop-blur"><div className="flex items-center justify-between gap-3"><div><p className="text-lg font-semibold text-white">Existing team</p><p className="mt-1 text-sm text-indigo-100/55">Click a member to see their profile.</p></div><span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-indigo-100/70">{project.members.length} members</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">{project.members.map((member) => <Link key={member.username} href={`/profile/${member.username}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-white/25 hover:bg-white/[0.1]"><Avatar name={member.name} size="md" /><div className="min-w-0"><p className="truncate font-medium text-white">{member.name}</p><p className="mt-0.5 text-sm text-indigo-100/55">{member.role}</p></div><span className="ml-auto text-indigo-100/50">→</span></Link>)}</div></div><div className="rounded-2xl border border-white/12 bg-white/[0.07] p-6 shadow-xl shadow-indigo-950/15 backdrop-blur"><p className="text-lg font-semibold text-white">What this project needs</p><p className="mt-1 text-sm text-indigo-100/55">Bring one of these strengths to the team.</p><div className="mt-5 flex flex-wrap gap-2">{project.requiredSkills.map((skill) => <TechPill key={skill} label={skill} />)}</div><div className="mt-7 border-t border-white/10 pt-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">Open space</p><p className="mt-2 text-3xl font-semibold text-white">{openSlots} role{openSlots === 1 ? "" : "s"}</p><p className="mt-1 text-sm text-indigo-100/60">The team is actively looking for contributors.</p></div></div></section>

    <section className="rounded-2xl border border-white/12 bg-white/[0.07] shadow-xl shadow-indigo-950/15 backdrop-blur"><div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0"><div className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">Step 1</p><p className="mt-2 font-medium text-white">Review the project brief</p><p className="mt-1 text-sm leading-6 text-indigo-100/60">Check whether your skills match the team’s current needs.</p></div><div className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">Step 2</p><p className="mt-2 font-medium text-white">Apply with context</p><p className="mt-1 text-sm leading-6 text-indigo-100/60">Explain what you can build and the role you want to own.</p></div><div className="p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-100/50">Step 3</p><p className="mt-2 font-medium text-white">Join the private hub</p><p className="mt-1 text-sm leading-6 text-indigo-100/60">Accepted members get a focused workspace for the project.</p></div></div></section>
  </div>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-4 shadow-lg shadow-indigo-950/10 backdrop-blur"><p className="text-xs font-medium text-indigo-100/55">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p></div>;
}
