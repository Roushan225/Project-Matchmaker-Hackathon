import Link from "next/link";
import { signOut } from "@/server/auth";
import { SidebarNav } from "./sidebar-nav";

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="min-h-screen bg-[#09052a] md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-b border-white/10 bg-[#0e073d]/85 p-5 backdrop-blur md:min-h-screen md:border-b-0 md:border-r">
        <Link href="/dashboard" className="mb-9 flex items-center gap-2 font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-fuchsia-400 font-black text-indigo-950 shadow-lg shadow-violet-500/30">M</span> Matchmaker</Link>
        <SidebarNav />
        <div className="mt-8 border-t border-white/10 pt-5 md:absolute md:bottom-6">
          <p className="mb-3 text-sm font-medium text-white">{userName}</p>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="text-sm text-indigo-200/60 hover:text-white">Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(139,92,246,.34),transparent_44%),radial-gradient(ellipse_at_bottom_left,_rgba(192,132,252,.16),transparent_38%)] p-5 md:p-10">{children}</main>
    </div>
  );
}
