"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/shared/avatar";
import { TechPill } from "@/components/shared/tech-pill";

export type DirectoryPerson = {
  name: string;
  username: string;
  image?: string;
  role: string;
  availability: string;
  stack: string[];
};

const demoPeople: DirectoryPerson[] = [
  { name: "Aisha Khan", username: "aisha-khan", role: "Frontend engineer", availability: "Looking for team", stack: ["React", "TypeScript", "Figma"] },
  { name: "Rohan Patel", username: "rohan-patel", role: "Backend engineer", availability: "Available", stack: ["Node.js", "MongoDB", "Docker"] },
  { name: "Mina Park", username: "mina-park", role: "Product designer", availability: "Looking for projects", stack: ["UI/UX", "Research", "Design systems"] },
];

const availabilityOptions = ["All availability", "Available", "Engaged", "Looking for team", "Looking for projects"] as const;

export function DeveloperDirectory({ realPeople }: { realPeople: DirectoryPerson[] }) {
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<(typeof availabilityOptions)[number]>("All availability");
  const normalizedQuery = query.trim().toLowerCase();
  const people = useMemo(() => [...realPeople, ...demoPeople], [realPeople]);
  const filteredPeople = useMemo(() => people.filter((person) => {
    const matchesAvailability = availability === "All availability" || person.availability === availability;
    const searchableText = [person.name, person.role, ...person.stack].join(" ").toLowerCase();
    return matchesAvailability && (!normalizedQuery || searchableText.includes(normalizedQuery));
  }), [availability, normalizedQuery, people]);

  return <><div className="mt-7 flex flex-wrap gap-3 rounded-xl border border-white/12 bg-white/[0.07] p-4 shadow-xl shadow-indigo-950/15 backdrop-blur"><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-48 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-indigo-100/40" placeholder="Search people, skills, or roles" aria-label="Search developers" /><select value={availability} onChange={(event) => setAvailability(event.target.value as (typeof availabilityOptions)[number])} className="rounded-lg border border-white/10 bg-[#110a42] px-4 py-2 text-sm font-semibold text-indigo-100 outline-none">{availabilityOptions.map((option) => <option key={option}>{option}</option>)}</select></div><p className="mt-4 text-sm text-indigo-100/55">{filteredPeople.length} developer{filteredPeople.length === 1 ? "" : "s"} found</p><div className="mt-4 grid gap-4 md:grid-cols-3">{filteredPeople.map((person) => <article key={person.username} className="rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-xl shadow-indigo-950/15 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]"><div className="flex items-center gap-3"><Avatar name={person.name} image={person.image} size="lg" /><div><h2 className="font-semibold text-white">{person.name}</h2><p className="text-sm text-indigo-100/60">{person.role}</p></div></div><p className="mt-5 text-sm font-medium text-indigo-200">● {person.availability}</p><div className="mt-3 flex flex-wrap gap-2">{person.stack.map((tech) => <TechPill key={tech} label={tech} subtle />)}</div><Link href={`/profile/${person.username}`} className="mt-5 inline-flex rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">View profile <span className="ml-2 opacity-70">→</span></Link></article>)}</div>{filteredPeople.length === 0 && <div onPointerMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`); event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`); }} className="discovery-empty mt-4 overflow-hidden rounded-2xl border border-white/15 p-8 text-center md:p-12"><div className="discovery-radar mx-auto"><span className="discovery-radar-ring discovery-radar-ring-one" /><span className="discovery-radar-ring discovery-radar-ring-two" /><span className="discovery-radar-ring discovery-radar-ring-three" /><span className="discovery-radar-dot discovery-radar-dot-one" /><span className="discovery-radar-dot discovery-radar-dot-two" /><span className="discovery-radar-dot discovery-radar-dot-three" /><span className="discovery-search-icon" /></div><p className="mt-7 text-lg font-semibold text-white">Nothing on this frequency yet</p><p className="mt-2 text-sm text-indigo-100/60">Move around the radar, then broaden your search.</p><button type="button" onClick={() => { setQuery(""); setAvailability("All availability"); }} className="mt-6 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-indigo-950">Reset discovery</button></div>}</>;
}
