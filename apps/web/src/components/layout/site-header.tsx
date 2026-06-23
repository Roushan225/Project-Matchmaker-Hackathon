import Link from "next/link";
import { auth } from "@/server/auth";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="border-b border-slate-800 bg-[#07111f]/90 px-5 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-400 font-black text-slate-950">M</span>
          Matchmaker
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="/projects" className="hover:text-white">Explore projects</Link>
          <Link href="/discover" className="hover:text-white">Find developers</Link>
        </nav>
        <Link href={session?.user ? "/dashboard" : "/sign-in"} className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300">
          {session?.user ? "Open workspace" : "Join with GitHub"}
        </Link>
      </div>
    </header>
  );
}
