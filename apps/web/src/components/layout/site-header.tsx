import Link from "next/link";
import { auth } from "@/server/auth";
import { FeatureTabs } from "./feature-tabs";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-5 py-4 md:px-8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <div className="flex items-center gap-6 xl:gap-9">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-white">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-fuchsia-400 font-black text-indigo-950 shadow-lg shadow-violet-500/30">M</span>
          Matchmaker
        </Link>
        <FeatureTabs />
        </div>
        <div className="flex items-center gap-3">
        <Link href="/projects" className="hidden text-sm font-medium text-indigo-100/80 transition hover:text-white sm:block">Explore</Link>
        <Link href={session?.user ? "/dashboard" : "/sign-in"} className="rounded-lg border border-white/40 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-indigo-950">
          {session?.user ? "Open workspace" : "Join with GitHub"}
        </Link>
        </div>
      </div>
    </header>
  );
}
