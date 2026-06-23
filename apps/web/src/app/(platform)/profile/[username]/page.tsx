import { Avatar } from "@/components/shared/avatar";
import { TechPill } from "@/components/shared/tech-pill";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const displayName = username.split("-").map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(" ");
  return <div className="mx-auto max-w-4xl"><section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><Avatar name={displayName} size="lg" /><div><p className="text-sm font-medium text-teal-300">● Available</p><h1 className="mt-1 text-3xl font-semibold text-white">{displayName}</h1><p className="mt-1 text-slate-400">Developer profile synced from GitHub</p></div></div><button className="rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950">Send project invite</button></div><p className="mt-8 max-w-2xl leading-7 text-slate-300">This is where a developer’s GitHub-backed profile, availability, technical focus, and completed project work will be presented.</p><div className="mt-6 flex flex-wrap gap-2">{["TypeScript", "Next.js", "MongoDB", "Product thinking"].map((skill) => <TechPill key={skill} label={skill} />)}</div></section></div>;
}
