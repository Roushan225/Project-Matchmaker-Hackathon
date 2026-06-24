"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HubProjectLink } from "@/server/repositories/projects";

const links = [
  ["Dashboard", "/dashboard"],
  ["Discover", "/discover"],
  ["Projects", "/projects"],
  ["Invitations", "/invitations"],
] as const;

export function SidebarNav({ hubProjects }: { hubProjects: HubProjectLink[] }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <nav aria-label="Workspace navigation" className="rounded-2xl border border-white/12 bg-white/[0.07] p-2 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
        <div className="flex gap-1 overflow-x-auto md:flex-col">
          {links.map(([label, href]) => {
            const isActive = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-white text-indigo-950 shadow-lg shadow-indigo-950/20" : "text-indigo-100/70 hover:bg-white/10 hover:text-white"}`}><NavIcon label={label} /><span>{label}</span></Link>;
          })}
        </div>
      </nav>

      <section className="rounded-2xl border border-white/12 bg-white/[0.07] p-3 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
        <div className="mb-3 flex items-start justify-between gap-3 px-1">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/45">Your projects</p><p className="mt-1 text-sm text-indigo-100/70">Team status</p></div>
          <Link href="/projects/new" className="rounded-lg border border-white/15 px-2 py-1 text-xs font-semibold text-indigo-100 hover:bg-white hover:text-indigo-950">Create</Link>
        </div>
        <div className="space-y-2">
          {hubProjects.length ? hubProjects.map((project) => <Link key={project.id} href={`/projects/${project.slug}`} className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-white/20 hover:bg-white/10"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-medium text-white">{project.title}</span><span className="rounded-full bg-emerald-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-100">{project.status}</span></div><p className="mt-1 text-xs text-indigo-100/55">{project.memberCount}/{project.maxTeamSize} members · access approved</p></Link>) : <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-indigo-100/55">Create or join a project to manage it here.</div>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/12 bg-white/[0.07] p-3 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
        <div className="mb-3 px-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/45">The Hub</p>
          <p className="mt-1 text-sm text-indigo-100/70">Project chats</p>
        </div>

        <div className="space-y-2">
          {hubProjects.length ? hubProjects.map((project) => {
            const href = `/hub/${project.id}`;
            const isActive = pathname === href;
            return (
              <Link
                key={project.id}
                href={href}
                className={`block rounded-xl border px-3 py-3 transition ${isActive ? "border-white/30 bg-white text-indigo-950 shadow-lg shadow-indigo-950/20" : "border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/10"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">{project.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${isActive ? "bg-indigo-950/10 text-indigo-950" : "bg-white/10 text-indigo-100/70"}`}>Chat</span>
                </div>
              </Link>
            );
          }) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-indigo-100/55">
              Join a project to open its chat here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NavIcon({ label }: { label: (typeof links)[number][0] }) {
  const paths = {
    Dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    Discover: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    Projects: <><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" /><path d="M6 10v5.5c0 1.5 2.7 3.5 6 3.5s6-2 6-3.5V10" /></>,
    Invitations: <><path d="M4 5h16v14H4z" /><path d="m4 7 8 6 8-6" /><path d="M8 3h8" /></>,
  } as const;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0 fill-none stroke-current stroke-[1.8]">{paths[label]}</svg>;
}
