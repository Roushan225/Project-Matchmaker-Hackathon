import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { TechPill } from "@/components/shared/tech-pill";
import { ScrollScale } from "@/components/shared/scroll-scale";
import { ProjectCard } from "@/features/projects/components/project-card";
import { featuredProjects } from "@/features/projects/data";

function HeroOrbitalScene() {
  return (
    <div aria-hidden="true" className="relative mx-auto mt-12 h-[340px] w-full max-w-5xl overflow-hidden md:mt-16 md:h-[430px]">
      <div className="absolute bottom-[-34%] left-1/2 h-[420px] w-[650px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,_#d9a7ff_0%,_#8b5cf6_30%,_#3730a3_58%,_transparent_72%)] opacity-90 blur-[2px] md:h-[560px] md:w-[940px]" />
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="hero-star hero-star-one">✦</div><div className="hero-star hero-star-two">✦</div><div className="hero-star hero-star-three">✦</div><div className="hero-star hero-star-four">✦</div>
      <div className="hero-float hero-float-left rounded-2xl border border-white/20 bg-indigo-950/75 p-3 shadow-2xl shadow-indigo-950/50 backdrop-blur"><div className="mb-2 flex gap-1"><i className="h-2 w-2 rounded-full bg-fuchsia-300" /><i className="h-2 w-2 rounded-full bg-violet-300" /><i className="h-2 w-2 rounded-full bg-indigo-300" /></div><span className="font-mono text-[11px] text-cyan-200">const team = match()</span></div>
      <div className="hero-float hero-float-right grid h-16 w-16 place-items-center rounded-[1.35rem] border border-white/25 bg-gradient-to-br from-fuchsia-400 to-violet-500 text-3xl shadow-2xl shadow-fuchsia-950/50">✦</div>
      <div className="hero-float hero-float-bottom flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Team matched</div>
      <div className="absolute bottom-4 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center rounded-[2rem] border border-white/40 bg-gradient-to-br from-amber-200 via-fuchsia-300 to-violet-500 text-4xl shadow-2xl shadow-violet-900/70">♟</div>
      <div className="absolute bottom-0 left-1/2 h-10 w-48 -translate-x-1/2 rounded-[50%] bg-violet-950/50 blur-xl" />
    </div>
  );
}

const featureDetails = [
  { id: "discover", number: "01", eyebrow: "Developer discovery", title: "See the skills behind the profile.", text: "Browse people by stack, role, availability, and real GitHub work. Spend less time guessing who can help and more time building.", chips: ["GitHub-backed", "Stack filters", "Availability"] },
  { id: "projects", number: "02", eyebrow: "Project matchmaker", title: "Turn a clear project brief into the right team.", text: "Publish exactly what you are building, the people you need, and how much room is left. Members can apply or receive an invite.", chips: ["Project briefs", "Applications", "Invitations"] },
  { id: "workspace", number: "03", eyebrow: "Private workspace", title: "Move from “let’s build” to real progress.", text: "Accepted teammates get a focused project hub for conversation, resources, and the next task. No crowded public server required.", chips: ["Team chat", "Task board", "Resource vault"] },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#09052a] text-white">
      <SiteHeader />
      <section className="landing-hero relative isolate min-h-[760px] overflow-hidden px-5 pt-36 md:min-h-[860px] md:px-10 md:pt-44">
        <div className="landing-grid absolute inset-0 -z-20 opacity-35" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_58%_at_50%_72%,rgba(113,72,255,.48),transparent_68%),radial-gradient(ellipse_75%_60%_at_50%_0%,rgba(23,10,108,.62),transparent_72%)]" />
        <div className="mx-auto max-w-5xl text-center">
          <p className="landing-reveal text-sm font-semibold uppercase tracking-[0.24em] text-violet-200">Project Matchmaker</p>
          <h1 className="landing-reveal mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl md:text-8xl">The best projects<br />start with the right people.</h1>
          <p className="landing-reveal mx-auto mt-7 max-w-2xl text-base leading-7 text-indigo-100/80 sm:text-lg md:text-xl">Find developers through the work they have done, build a team around a real idea, and give that team a calm place to ship.</p>
          <div className="landing-reveal mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/sign-in" className="rounded-lg bg-white px-5 py-3 font-semibold text-indigo-950 transition hover:-translate-y-0.5 hover:bg-violet-100">Find your teammates</Link><Link href="#projects" className="rounded-lg border border-white/40 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10">Explore projects</Link></div>
        </div>
        <HeroOrbitalScene />
      </section>

      <section className="border-y border-white/10 bg-[#0c0738] px-5 py-6 md:px-10"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-11 gap-y-3 text-sm font-medium text-indigo-100/65"><span>Built for hackathons</span><span className="hidden text-violet-400 sm:inline">✦</span><span>Open-source teams</span><span className="hidden text-violet-400 sm:inline">✦</span><span>Student builders</span><span className="hidden text-violet-400 sm:inline">✦</span><span>Side projects</span></div></section>

      <section className="bg-[#f8f7ff] px-5 py-24 text-slate-900 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl space-y-24 md:space-y-36">{featureDetails.map((feature, index) => <ScrollScale key={feature.id}><article id={feature.id} className="scroll-mt-24 grid items-center gap-10 md:grid-cols-2 md:gap-20"><div className={index % 2 ? "md:order-2" : ""}><p className="text-sm font-bold tracking-[0.18em] text-violet-600">{feature.number} · {feature.eyebrow}</p><h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em] text-indigo-950 md:text-5xl">{feature.title}</h2><p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">{feature.text}</p><div className="mt-7 flex flex-wrap gap-2">{feature.chips.map((chip) => <TechPill key={chip} label={chip} subtle />)}</div></div><div className={`${index % 2 ? "md:order-1" : ""} relative min-h-72 overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-600 p-7 shadow-2xl shadow-violet-200/60`}><div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-fuchsia-300/40 blur-2xl" />{index === 0 && <><div className="relative flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur"><span className="text-sm font-semibold">Find teammates</span><span className="rounded-full bg-emerald-300 px-2 py-1 text-xs font-bold text-emerald-950">Available</span></div><div className="relative mt-5 grid gap-3">{["Aisha · Frontend", "Rohan · Backend", "Mina · Product design"].map((person) => <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-sm text-white" key={person}><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-violet-200 to-fuchsia-300 font-bold text-indigo-950">{person[0]}</span>{person}<span className="ml-auto text-violet-200">→</span></div>)}</div></>}{index === 1 && <><div className="relative rounded-2xl border border-white/15 bg-white/10 p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-violet-200">Recruiting</p><p className="mt-2 text-xl font-semibold">Build an open-source onboarding kit</p><div className="mt-5 flex gap-2"><span className="rounded-full bg-white/15 px-3 py-1 text-xs">TypeScript</span><span className="rounded-full bg-white/15 px-3 py-1 text-xs">UI/UX</span></div></div><div className="relative mt-5 grid grid-cols-3 gap-3 text-center text-xs text-white"><div className="rounded-xl bg-white/10 p-4"><b className="block text-2xl">3</b>roles open</div><div className="rounded-xl bg-white/10 p-4"><b className="block text-2xl">8</b>applicants</div><div className="rounded-xl bg-white/10 p-4"><b className="block text-2xl">2</b>accepted</div></div></>}{index === 2 && <><div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 text-white"><p className="text-xs text-violet-200"># team-chat</p><p className="mt-3 rounded-xl bg-white/10 p-3 text-sm">I finished the profile flow. Can someone review it?</p><p className="mt-2 ml-8 rounded-xl bg-fuchsia-400/70 p-3 text-sm">I’ll take a look now ✦</p></div><div className="relative mt-5 flex gap-3"><div className="h-16 flex-1 rounded-xl border border-white/15 bg-white/10 p-3 text-xs text-violet-100">Task board<br /><b className="text-white">3 in progress</b></div><div className="h-16 flex-1 rounded-xl border border-white/15 bg-white/10 p-3 text-xs text-violet-100">Resources<br /><b className="text-white">6 saved links</b></div></div></>}</div></article></ScrollScale>)}</div>
      </section>

      <section id="featured-projects" className="bg-[#0a0630] px-5 py-24 md:px-10"><div className="mx-auto max-w-6xl"><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">Actively recruiting</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">Ideas waiting for teammates.</h2></div><Link href="/projects" className="text-sm font-semibold text-violet-200 hover:text-white">See all projects →</Link></div><div className="grid gap-5 md:grid-cols-3">{featuredProjects.map((project) => <ScrollScale key={project.id}><ProjectCard project={project} /></ScrollScale>)}</div></div></section>

      <section className="bg-gradient-to-b from-[#0a0630] to-[#160a51] px-5 py-24 text-center md:px-10"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-200">Ready to build?</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">Your next teammate might already be looking.</h2><Link href="/sign-in" className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-indigo-950 transition hover:bg-violet-100">Continue with GitHub</Link></section>
    </main>
  );
}
