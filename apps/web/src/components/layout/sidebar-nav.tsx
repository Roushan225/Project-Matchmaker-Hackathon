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
            return <Link key={href} href={href} className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-white text-indigo-950 shadow-lg shadow-indigo-950/20" : "text-indigo-100/70 hover:bg-white/10 hover:text-white"}`}>{label}</Link>;
          })}
        </div>
      </nav>

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
