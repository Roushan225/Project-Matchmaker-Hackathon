"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/dashboard"],
  ["Discover", "/discover"],
  ["Projects", "/projects"],
  ["Invitations", "/invitations"],
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace navigation" className="rounded-2xl border border-white/12 bg-white/[0.07] p-2 shadow-xl shadow-indigo-950/20 backdrop-blur-xl">
      <div className="flex gap-1 overflow-x-auto md:flex-col">
        {links.map(([label, href]) => {
          const isActive = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-white text-indigo-950 shadow-lg shadow-indigo-950/20" : "text-indigo-100/70 hover:bg-white/10 hover:text-white"}`}>{label}</Link>;
        })}
      </div>
    </nav>
  );
}
