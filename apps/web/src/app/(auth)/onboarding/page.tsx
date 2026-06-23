import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { requireUser } from "@/server/require-user";
import { getOnboardingProfile } from "@/server/repositories/users";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getOnboardingProfile(user.id);
  if (profile?.onboardingCompleted) redirect("/dashboard");

  const initialProfile = {
    headline: profile?.headline ?? "",
    techStack: profile?.techStack ?? [],
    roles: profile?.roles ?? [],
    projectInterests: profile?.projectInterests ?? [],
    weeklyAvailability: profile?.weeklyAvailability ?? "4-7" as const,
    availability: profile?.availability ?? "available" as const,
    discoverable: profile?.discoverable ?? true,
  };

  return <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#33257d_0%,_#09052a_54%)] px-5 py-12 text-white md:py-20"><section className="mx-auto max-w-2xl"><div className="mb-8 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-300 to-fuchsia-400 font-black text-indigo-950">M</span><div><p className="font-semibold">Welcome, {user.name?.split(" ")[0] ?? "builder"}</p><p className="text-sm text-indigo-200/65">Step 2 of 2 · Complete your Matchmaker profile</p></div></div><div className="rounded-[2rem] border border-white/15 bg-[#110a42]/75 p-6 shadow-2xl shadow-indigo-950/50 backdrop-blur md:p-9"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">Beyond GitHub</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">Tell teams how you want to build.</h1><p className="mt-3 max-w-xl leading-7 text-indigo-100/70">GitHub provides your account identity. These details help us match you to a project where your time and skills fit.</p><OnboardingForm initialProfile={initialProfile} /></div></section></main>;
}
