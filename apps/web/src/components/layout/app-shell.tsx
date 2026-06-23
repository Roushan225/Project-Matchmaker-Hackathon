import Link from "next/link";
import { signOut } from "@/server/auth";

const links = [
  ["Dashboard", "/dashboard"],
  ["Discover", "/discover"],
  ["Projects", "/projects"],
  ["Invitations", "/invitations"],
] as const;

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return (
    <div className="min-h-screen bg-[#07111f] md:grid md:grid-cols-[250px_1fr]">
      <aside className="border-b border-slate-800 bg-[#091728] p-5 md:min-h-screen md:border-b-0 md:border-r">
        <Link href="/dashboard" className="mb-9 flex items-center gap-2 font-semibold text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-400 font-black text-slate-950">M</span> Matchmaker</Link>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">{links.map(([label, href]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">{label}</Link>)}</nav>
        <div className="mt-8 border-t border-slate-800 pt-5 md:absolute md:bottom-6">
          <p className="mb-3 text-sm font-medium text-white">{userName}</p>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="text-sm text-slate-400 hover:text-white">Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10">{children}</main>
    </div>
  );
}
