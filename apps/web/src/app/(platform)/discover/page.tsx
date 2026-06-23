import Link from "next/link";
import { Avatar } from "@/components/shared/avatar";
import { TechPill } from "@/components/shared/tech-pill";

const people = [
  { name: "Aisha Khan", role: "Frontend engineer", availability: "Looking for team", stack: ["React", "TypeScript", "Figma"] },
  { name: "Rohan Patel", role: "Backend engineer", availability: "Available", stack: ["Node.js", "MongoDB", "Docker"] },
  { name: "Mina Park", role: "Product designer", availability: "Looking for projects", stack: ["UI/UX", "Research", "Design systems"] },
];

export default function DiscoverPage() {
  return <div className="mx-auto max-w-6xl"><p className="text-sm font-medium text-teal-300">Developer discovery</p><h1 className="mt-2 text-3xl font-semibold text-white">Find the missing skill on your team.</h1><div className="mt-7 flex flex-wrap gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"><input className="min-w-48 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Search people, skills, or roles" /><button className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">All availability</button><button className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950">Search</button></div><div className="mt-7 grid gap-4 md:grid-cols-3">{people.map((person) => <article key={person.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><div className="flex items-center gap-3"><Avatar name={person.name} size="lg" /><div><h2 className="font-semibold text-white">{person.name}</h2><p className="text-sm text-slate-400">{person.role}</p></div></div><p className="mt-5 text-sm font-medium text-teal-300">● {person.availability}</p><div className="mt-3 flex flex-wrap gap-2">{person.stack.map((tech) => <TechPill key={tech} label={tech} subtle />)}</div><Link href={`/profile/${person.name.toLowerCase().replaceAll(" ", "-")}`} className="mt-5 inline-block text-sm font-semibold text-teal-300">View profile →</Link></article>)}</div></div>;
}
