import Link from "next/link";
import { Avatar } from "@/components/shared/avatar";
import { TechPill } from "@/components/shared/tech-pill";

const people = [
  { name: "Aisha Khan", role: "Frontend engineer", availability: "Looking for team", stack: ["React", "TypeScript", "Figma"] },
  { name: "Rohan Patel", role: "Backend engineer", availability: "Available", stack: ["Node.js", "MongoDB", "Docker"] },
  { name: "Mina Park", role: "Product designer", availability: "Looking for projects", stack: ["UI/UX", "Research", "Design systems"] },
];

export default function DiscoverPage() {
  return <div className="mx-auto max-w-6xl"><p className="text-sm font-medium text-indigo-200">Developer discovery</p><h1 className="mt-2 text-3xl font-semibold text-white">Find the missing skill on your team.</h1><div className="mt-7 flex flex-wrap gap-3 rounded-xl border border-white/12 bg-white/[0.07] p-4 shadow-xl shadow-indigo-950/15 backdrop-blur"><input className="min-w-48 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-indigo-100/40" placeholder="Search people, skills, or roles" /><button className="rounded-lg border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-indigo-100">All availability</button><button className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white hover:text-indigo-950">Search</button></div><div className="mt-7 grid gap-4 md:grid-cols-3">{people.map((person) => <article key={person.name} className="rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-indigo-950/15 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]"><div className="flex items-center gap-3"><Avatar name={person.name} size="lg" /><div><h2 className="font-semibold text-white">{person.name}</h2><p className="text-sm text-indigo-100/60">{person.role}</p></div></div><p className="mt-5 text-sm font-medium text-indigo-200">● {person.availability}</p><div className="mt-3 flex flex-wrap gap-2">{person.stack.map((tech) => <TechPill key={tech} label={tech} subtle />)}</div><Link href={`/profile/${person.name.toLowerCase().replaceAll(" ", "-")}`} className="mt-5 inline-block text-sm font-semibold text-indigo-200 hover:text-white">View profile →</Link></article>)}</div></div>;
}
